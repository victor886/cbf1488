// @ts-nocheck
import {
  Children,
  forwardRef,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, Pressable, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  scrollTo as scrollToWorklet,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { useIsRTL, useThemeColor } from 'heroui-native/hooks';
import { ChevronLeftIcon, ChevronRightIcon } from '../../helpers/internal/icons/index';
import { createContext } from '../../helpers/internal/utils/index';
import {
  useCarouselDotAnimation,
  useCarouselRootAnimation,
  useCarouselThumbnailAnimation,
} from './carousel.animation';
import {
  DEFAULT_AUTO_PLAY_INTERVAL,
  DEFAULT_GAP,
  DEFAULT_ITEMS_PER_VIEW,
  DEFAULT_SIDE_PADDING,
  DISPLAY_NAME,
  NAV_ICON_SIZE,
  NO_MOMENTUM_VELOCITY_THRESHOLD,
  TAP_RESCUE_MAX_DURATION_MS,
  THUMBNAIL_DRAG_CANCEL_WINDOW_MS,
  THUMBNAIL_DRAG_MOVE_THRESHOLD,
  TRIP_SPRING_CONFIG,
} from './carousel.constants';
import { carouselClassNames, carouselStyleSheet } from './carousel.styles';
import {
  clampSnapIndex,
  findNearestSnapIndex,
  getCarouselItemWidth,
  getCarouselProgress,
  getCarouselSnapOffsets,
} from './carousel.utils';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/**
 * Component type of the animated slide-strip list, declared against this
 * file's own `react-native` types: props are `AnimatedProps<FlatListProps>`
 * and the ref is the standard `FlatList`. Deliberately NOT
 * `typeof Animated.FlatList` — that would type the ref against the
 * `FlatList` copy reanimated resolves internally, which in this workspace
 * (library root vs example app node_modules) can be a different nominal
 * type than the one this file imports, making the ref unassignable.
 */
/**
 * Animated gesture-handler `FlatList` powering the slide strip, so nested
 * scroll gestures (e.g. inside a bottom sheet / dialog) compose correctly
 * while still driving the Reanimated `scrollX` shared value via `onScroll`.
 * Asserted because `createAnimatedComponent` erases the `ItemT` generic on
 * gesture-handler's `FlatList` (see {@link AnimatedFlatListComponent}).
 */
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
/**
 * Pass-through `renderItem` shared by the slide strip and the thumbnail
 * strip: the compound children are the items.
 */
function renderChildItem({ item }) {
  return <Fragment>{item}</Fragment>;
}
/**
 * `Children.toArray` assigns every child a stable string key (derived from
 * the consumer's `key` where present), so items keep identity across
 * reorders; the index fallback only covers non-element nodes.
 */
function extractChildKey(item, index) {
  if (isValidElement(item) && item.key !== null) {
    return String(item.key);
  }
  return String(index);
}
const [CarouselProvider, useCarousel] = createContext({
  name: 'CarouselContext',
});
/**
 * Internal engine context. Everything in it is stable across selection
 * changes, so `Carousel.Content` / `Carousel.Item` (which only consume this
 * context) never re-render when `selectedIndex` commits — including the
 * mid-swipe halfway update.
 */
const [CarouselEngineProvider, useCarouselEngine] = createContext({
  name: 'CarouselEngineContext',
});
// --------------------------------------------------
const CarouselRoot = forwardRef((props, ref) => {
  const {
    children,
    itemsPerView = DEFAULT_ITEMS_PER_VIEW,
    gap: gapProp,
    sidePadding: sidePaddingProp,
    align = 'start',
    type = 'in-place',
    defaultIndex = 0,
    autoPlay = false,
    autoPlayInterval = DEFAULT_AUTO_PLAY_INTERVAL,
    stopAutoPlayOnInteraction = true,
    className,
    style,
    onSelectedIndexChange,
    animation,
    ...restProps
  } = props;
  const sidePadding = sidePaddingProp ?? DEFAULT_SIDE_PADDING;
  /**
   * Without an explicit `gap`, a provided `sidePadding` doubles as the
   * gap so the space between slides matches the breathing room at the
   * ends — one uniform rhythm across the strip.
   */
  const gap = gapProp ?? sidePaddingProp ?? DEFAULT_GAP;
  const isRTL = useIsRTL();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [isAutoPlayStopped, setIsAutoPlayStopped] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  /**
   * Physical scroll offset of the slide strip, written by the content's
   * scroll handler on the UI thread. Exposed via context for custom
   * scroll-driven effects.
   */
  const scrollX = useSharedValue(0);
  /**
   * Snap offsets copied onto the UI thread so the derived `progress`
   * value can interpolate against them while the strip is dragged.
   */
  const snapOffsetsSV = useSharedValue([]);
  /**
   * Continuous snap-index progress derived from `scrollX` and the
   * current snap offsets. Same numeric scale as `selectedIndex`.
   */
  const progress = useDerivedValue(() => {
    return getCarouselProgress(scrollX.get(), snapOffsetsSV.get());
  });
  /**
   * Latest committed selection. Refreshed synchronously at every commit
   * point (not just on render), so rapid nav presses that land before the
   * re-render still chain from the freshest index — each press advances
   * exactly one step and fires exactly one change.
   */
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;
  const scrollToOffsetRef = useRef(() => {});
  /**
   * JS-side mirror of "a programmatic trip owns the selection". While a
   * trip is active, momentum ends are ignored (the only native momentum
   * events during a spring-driven trip are stale — e.g. a user fling the
   * trip's first frame killed) and progress-derived selection commits
   * are suppressed (the trip already committed its target).
   */
  const isTripActiveRef = useRef(false);
  /**
   * Physical target of the in-flight programmatic trip (`-1` = none).
   * `Carousel.Content` drives the strip toward it with a UI-thread
   * spring; see the engine context type.
   */
  const tripTargetSV = useSharedValue(-1);
  /**
   * Whether the user's finger currently owns the strip. A momentum end
   * arriving while this is set belongs to a previous, interrupted
   * momentum (e.g. an iOS edge bounce caught by a new swipe) and must be
   * ignored — settling or realigning against its stray offset while the
   * finger is down yanks the strip and flickers.
   */
  const isDraggingRef = useRef(false);
  /**
   * Live scroll state of the thumbnail strip. Written by
   * `Carousel.Thumbnails`, read by `Carousel.Thumbnail` to tell a
   * drag-cancelled press apart from a tap that caught the strip's own
   * scroll (see the engine context type).
   */
  const thumbnailScrollStateRef = useRef({
    offsetX: 0,
    dragStartOffsetX: 0,
    dragStartAt: 0,
  });
  const itemWidth = useMemo(
    () =>
      getCarouselItemWidth({
        viewportWidth,
        itemsPerView,
        gap,
        sidePadding,
      }),
    [viewportWidth, itemsPerView, gap, sidePadding]
  );
  const snapOffsets = useMemo(
    () =>
      getCarouselSnapOffsets({
        viewportWidth,
        itemWidth,
        itemCount,
        gap,
        sidePadding,
        align,
        isRTL,
      }),
    [viewportWidth, itemWidth, itemCount, gap, sidePadding, align, isRTL]
  );
  const snapCount = snapOffsets.length;
  const rootClassName = carouselClassNames.root({
    type,
    className,
  });
  const { isAllAnimationsDisabled } = useCarouselRootAnimation({
    animation,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  /**
   * Re-align the strip whenever the snap geometry changes (viewport
   * measurement, rotation, item count, gap/itemsPerView props, or an RTL
   * flip) so the selected slide stays in place under the new offsets.
   * `scrollX` is written here as well: a non-animated `scrollTo` does
   * not always fire `onScroll`, and the derived `progress` would stall
   * at the previous offset.
   */
  useEffect(() => {
    snapOffsetsSV.set(snapOffsets.slice());
    if (snapOffsets.length === 0) {
      return;
    }
    const index = clampSnapIndex(selectedIndexRef.current, snapOffsets.length);
    if (index !== selectedIndexRef.current) {
      selectedIndexRef.current = index;
      setSelectedIndex(index);
    }
    const offset = snapOffsets[index];
    if (offset !== undefined) {
      // Non-animated jump lands exactly — no momentum event follows, so
      // any in-flight trip from a previous geometry is dropped.
      isTripActiveRef.current = false;
      tripTargetSV.set(-1);
      scrollX.set(offset);
      scrollToOffsetRef.current(offset, false);
    }
  }, [scrollX, snapOffsets, snapOffsetsSV, tripTargetSV]);
  /**
   * Commits the selection driven by the animated `progress` crossing the
   * halfway point between two snap points during a user swipe.
   *
   * Programmatic trips (nav buttons, thumbnails, autoplay) already set
   * their target index synchronously — mid-flight crossings on those
   * trips must not flicker it. Suppression happens twice: on the UI
   * thread at schedule time (`tripTargetSV`, closes the race where a
   * crossing is scheduled before the trip settles on the JS thread) and
   * here at execution time (`isTripActiveRef`, closes the race where a
   * nav press lands between scheduling and execution).
   */
  const syncSelectedIndexFromProgress = useCallback((index) => {
    if (isTripActiveRef.current) {
      return;
    }
    selectedIndexRef.current = index;
    setSelectedIndex(index);
  }, []);
  /**
   * Selection follows the swipe as soon as more than half of the next
   * slide is visible (`progress` rounds to a new integer), instead of
   * waiting for the momentum to settle. The initial `null` fire is
   * skipped: before the geometry is measured, `progress` is a meaningless
   * `0` that must not clobber a non-zero `defaultIndex`.
   */
  useAnimatedReaction(
    () => Math.round(progress.get()),
    (current, previous) => {
      if (previous !== null && current !== previous && tripTargetSV.get() < 0) {
        scheduleOnRN(syncSelectedIndexFromProgress, current);
      }
    },
    [syncSelectedIndexFromProgress]
  );
  const onSelectedIndexChangeRef = useRef(onSelectedIndexChange);
  onSelectedIndexChangeRef.current = onSelectedIndexChange;
  const lastReportedIndexRef = useRef(defaultIndex);
  useEffect(() => {
    if (selectedIndex === lastReportedIndexRef.current) {
      return;
    }
    lastReportedIndexRef.current = selectedIndex;
    onSelectedIndexChangeRef.current?.(selectedIndex);
  }, [selectedIndex]);
  const registerScrollToOffset = useCallback((fn) => {
    scrollToOffsetRef.current = fn;
  }, []);
  const setViewportSize = useCallback((width, height) => {
    setViewportWidth(width);
    setViewportHeight(height);
  }, []);
  /**
   * Marks a spring-driven trip as settled (called from the UI thread
   * when the trip spring completes; see the driver in
   * `Carousel.Content`).
   */
  const handleTripSettled = useCallback(() => {
    isTripActiveRef.current = false;
  }, []);
  const scrollToIndex = useCallback(
    (index, animated) => {
      const clamped = clampSnapIndex(index, snapOffsets.length);
      const offset = snapOffsets[clamped];
      if (offset !== undefined) {
        if (animated) {
          /*
           * Setting the target (re)aims the UI-thread trip spring in
           * `Carousel.Content`. A retargeted spring keeps its velocity,
           * so rapid successive navigations chain into one continuous
           * motion instead of restarting an easing curve per press.
           */
          isTripActiveRef.current = true;
          tripTargetSV.set(offset);
        } else {
          isTripActiveRef.current = false;
          tripTargetSV.set(-1);
          // A non-animated jump does not always fire `onScroll`; sync
          // the shared value so `progress` (dots) lands with the strip.
          scrollX.set(offset);
          scrollToOffsetRef.current(offset, false);
        }
      }
      // Commit before the re-render so an immediately following press
      // (scrollPrev / scrollNext read this ref) chains from this index.
      selectedIndexRef.current = clamped;
      setSelectedIndex(clamped);
    },
    [scrollX, snapOffsets, tripTargetSV]
  );
  const stopAutoPlayForInteraction = useCallback(() => {
    if (autoPlay && stopAutoPlayOnInteraction) {
      setIsAutoPlayStopped(true);
    }
  }, [autoPlay, stopAutoPlayOnInteraction]);
  const scrollTo = useCallback(
    (index, animated = true) => {
      stopAutoPlayForInteraction();
      scrollToIndex(index, animated);
    },
    [stopAutoPlayForInteraction, scrollToIndex]
  );
  const scrollPrev = useCallback(() => {
    scrollTo(selectedIndexRef.current - 1);
  }, [scrollTo]);
  const scrollNext = useCallback(() => {
    scrollTo(selectedIndexRef.current + 1);
  }, [scrollTo]);
  const handleInteractionStart = useCallback(() => {
    // The user's drag takes over any in-flight programmatic scroll; the
    // halfway-crossing reaction drives the selection from here on.
    isDraggingRef.current = true;
    isTripActiveRef.current = false;
    tripTargetSV.set(-1);
    // Mid-drag commits are safe for the strip itself (the engine context
    // is selection-free, so the FlatList's props never change), but this
    // handler still avoids gratuitous state churn unless autoplay is on.
    if (!autoPlay) {
      return;
    }
    if (stopAutoPlayOnInteraction) {
      setIsAutoPlayStopped(true);
    } else {
      setIsInteracting(true);
    }
  }, [autoPlay, stopAutoPlayOnInteraction, tripTargetSV]);
  const handleInteractionEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);
  const handleMomentumEnd = useCallback(
    (offsetX) => {
      if (isDraggingRef.current) {
        // The interrupted previous momentum reporting its stray offset
        // mid-drag. The active drag owns the strip; its own momentum end
        // will settle the selection.
        return;
      }
      setIsInteracting(false);
      if (snapOffsets.length === 0) {
        return;
      }
      if (isTripActiveRef.current) {
        /*
         * A spring-driven trip issues no native animated scrolls, so any
         * momentum end arriving while it runs is stale — e.g. a user
         * fling whose deceleration the trip's first frame killed. The
         * trip settles through its own spring completion instead.
         */
        return;
      }
      const nearestIndex = findNearestSnapIndex(offsetX, snapOffsets);
      selectedIndexRef.current = nearestIndex;
      setSelectedIndex(nearestIndex);
      /*
       * Re-align a stray settle: a user catch-and-release can park the
       * strip between snap points (`snapToOffsets` only governs full
       * deceleration), leaving `progress` stuck at an intermediate
       * value. The spring trip pulls it onto the nearest snap.
       *
       * Only offsets inside the snap range qualify: an out-of-range
       * offset is an edge overscroll whose return trip the native
       * rubber band still owns — scrolling against it flickers.
       */
      const nearestOffset = snapOffsets[nearestIndex];
      const firstOffset = snapOffsets[0];
      const lastOffset = snapOffsets[snapOffsets.length - 1];
      const isWithinSnapRange =
        firstOffset !== undefined &&
        lastOffset !== undefined &&
        offsetX >= Math.min(firstOffset, lastOffset) - 1 &&
        offsetX <= Math.max(firstOffset, lastOffset) + 1;
      if (
        isWithinSnapRange &&
        nearestOffset !== undefined &&
        Math.abs(offsetX - nearestOffset) > 1
      ) {
        isTripActiveRef.current = true;
        tripTargetSV.set(nearestOffset);
      }
    },
    [snapOffsets, tripTargetSV]
  );
  /**
   * Autoplay: advances to the next snap point on an interval, wrapping to
   * the first one at the end. Pauses while the user drags and (by default)
   * stops permanently on the first interaction.
   */
  useEffect(() => {
    if (!autoPlay || isAutoPlayStopped || isInteracting || snapCount <= 1) {
      return;
    }
    const intervalId = setInterval(() => {
      const next = selectedIndexRef.current + 1;
      scrollToIndex(next >= snapCount ? 0 : next, true);
    }, autoPlayInterval);
    return () => clearInterval(intervalId);
  }, [autoPlay, isAutoPlayStopped, isInteracting, snapCount, autoPlayInterval, scrollToIndex]);
  const contextValue = useMemo(
    () => ({
      type,
      align,
      gap,
      sidePadding,
      itemsPerView,
      itemWidth,
      viewportWidth,
      viewportHeight,
      selectedIndex,
      snapCount,
      canScrollPrev: snapCount > 1 && selectedIndex > 0,
      canScrollNext: snapCount > 1 && selectedIndex < snapCount - 1,
      scrollTo,
      scrollPrev,
      scrollNext,
      scrollX,
      progress,
    }),
    [
      type,
      align,
      gap,
      sidePadding,
      itemsPerView,
      itemWidth,
      viewportWidth,
      viewportHeight,
      selectedIndex,
      snapCount,
      scrollTo,
      scrollPrev,
      scrollNext,
      scrollX,
      progress,
    ]
  );
  /**
   * Selection-free engine value: it only changes on geometry (measure,
   * rotation, item count, gap / itemsPerView / align props), so the slide
   * strip never re-renders when `selectedIndex` commits.
   */
  const engineContextValue = useMemo(
    () => ({
      gap,
      sidePadding,
      itemWidth,
      snapOffsets,
      scrollX,
      tripTargetSV,
      handleTripSettled,
      registerScrollToOffset,
      setViewportSize,
      setItemCount,
      handleMomentumEnd,
      handleInteractionStart,
      handleInteractionEnd,
      thumbnailScrollStateRef,
    }),
    [
      gap,
      sidePadding,
      itemWidth,
      snapOffsets,
      scrollX,
      tripTargetSV,
      handleTripSettled,
      registerScrollToOffset,
      setViewportSize,
      handleMomentumEnd,
      handleInteractionStart,
      handleInteractionEnd,
    ]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <CarouselEngineProvider value={engineContextValue}>
        <CarouselProvider value={contextValue}>
          <View ref={ref} className={rootClassName} style={style} {...restProps}>
            {children}
          </View>
        </CarouselProvider>
      </CarouselEngineProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const CarouselContent = forwardRef((props, ref) => {
  const {
    children,
    className,
    classNames,
    styles: stylesProp,
    style,
    contentContainerStyle,
    ...restProps
  } = props;
  const {
    gap,
    sidePadding,
    itemWidth,
    snapOffsets,
    scrollX,
    tripTargetSV,
    handleTripSettled,
    registerScrollToOffset,
    setViewportSize,
    setItemCount,
    handleMomentumEnd,
    handleInteractionStart,
    handleInteractionEnd,
  } = useCarouselEngine();
  const isRTL = useIsRTL();
  const listRef = useAnimatedRef();
  const { viewport, content } = carouselClassNames.content();
  const viewportClassName = viewport({
    className: classNames?.viewport,
  });
  const contentClassName = content({
    className: [className, classNames?.content],
  });
  const childArray = Children.toArray(children);
  const childCount = childArray.length;
  /**
   * In RTL the slides render in reversed physical order inside the
   * LTR-pinned strip, so the first slide sits at the physical right edge
   * and paging advances toward the reading direction. The snap offsets are
   * mirrored to match (see `getCarouselSnapOffsets`).
   *
   * Annotated as `ReactNode[]` so the list's `ItemT` infers exactly
   * `ReactNode`, matching the `RNFlatList<ReactNode>` ref.
   */
  const orderedChildren = isRTL ? [...childArray].reverse() : childArray;
  useEffect(() => {
    setItemCount(childCount);
  }, [childCount, setItemCount]);
  useEffect(() => {
    registerScrollToOffset((offsetX, animated) => {
      listRef.current?.scrollToOffset({
        offset: offsetX,
        animated,
      });
    });
  }, [listRef, registerScrollToOffset]);
  /**
   * Current offset of the spring-driven programmatic trip (see the
   * engine context's `tripTargetSV`).
   */
  const tripDriverSV = useSharedValue(0);
  /**
   * (Re)aims the trip spring whenever the root sets a new target. The
   * spring is seeded from the live offset only when starting from idle;
   * retargeting an active spring keeps its velocity, so rapid successive
   * navigations chain into one continuous motion.
   */
  useAnimatedReaction(
    () => tripTargetSV.get(),
    (target, previous) => {
      if (target < 0) {
        cancelAnimation(tripDriverSV);
        return;
      }
      if (previous !== null && target === previous) {
        return;
      }
      if (previous === null || previous < 0) {
        tripDriverSV.set(scrollX.get());
      }
      tripDriverSV.set(
        withSpring(target, TRIP_SPRING_CONFIG, (finished) => {
          if (finished === true) {
            tripTargetSV.set(-1);
            scrollX.set(target);
            scrollToWorklet(listRef, target, 0, false);
            scheduleOnRN(handleTripSettled);
          }
        })
      );
    },
    [handleTripSettled]
  );
  /**
   * Applies the trip spring to the strip frame by frame with non-animated
   * scrolls. No native animated scroll is ever issued for programmatic
   * trips, so there are no black-box easing curves to fight and no
   * momentum events to go stray.
   */
  useDerivedValue(() => {
    const target = tripTargetSV.get();
    const offset = tripDriverSV.get();
    if (target >= 0) {
      scrollToWorklet(listRef, offset, 0, false);
    }
  });
  /**
   * Every slide is `itemWidth` wide, cells are separated by the content
   * container's `gap`, and the row starts after `sidePadding`, so cell
   * offsets are analytic — this keeps far `scrollToOffset` jumps exact
   * without measuring intermediate cells.
   */
  const getItemLayout = useCallback(
    (_, index) => ({
      length: itemWidth,
      offset: sidePadding + index * (itemWidth + gap),
      index,
    }),
    [itemWidth, gap, sidePadding]
  );
  const handleViewportLayout = useCallback(
    (event) => {
      const { width, height } = event.nativeEvent.layout;
      setViewportSize(width, height);
    },
    [setViewportSize]
  );
  /**
   * No-momentum `onEndDrag`: release drag ownership and settle in one
   * JS hop so `handleMomentumEnd` does not early-return on `isDraggingRef`.
   */
  const handleNoMomentumEnd = useCallback(
    (offsetX) => {
      handleInteractionEnd();
      handleMomentumEnd(offsetX);
    },
    [handleInteractionEnd, handleMomentumEnd]
  );
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.set(event.contentOffset.x);
    },
    onBeginDrag: () => {
      // Release the strip to the finger on the UI thread immediately —
      // waiting for the JS-side handler would leave the trip spring
      // scrolling against the drag for a few frames.
      tripTargetSV.set(-1);
      cancelAnimation(tripDriverSV);
      scheduleOnRN(handleInteractionStart);
    },
    onEndDrag: (event) => {
      /**
       * A no-momentum release (`|velocity| ≈ 0`) settles here without
       * firing `onMomentumEnd`. Settle now so `isInteracting` clears
       * (autoplay can resume) and a between-snap rest can realign.
       */
      const velocityX = event.velocity?.x ?? 0;
      if (Math.abs(velocityX) < NO_MOMENTUM_VELOCITY_THRESHOLD) {
        scheduleOnRN(handleNoMomentumEnd, event.contentOffset.x);
      } else {
        scheduleOnRN(handleInteractionEnd);
      }
    },
    onMomentumEnd: (event) => {
      scheduleOnRN(handleMomentumEnd, event.contentOffset.x);
    },
  });
  /**
   * `snapToOffsets` requires an ascending list; the directed offsets are
   * descending in RTL, so they are sorted for the native prop while the
   * index-addressed `snapOffsets` array keeps the snap-index order.
   */
  const sortedSnapOffsets = useMemo(() => [...snapOffsets].sort((a, b) => a - b), [snapOffsets]);
  return (
    <View
      ref={ref}
      className={viewportClassName}
      style={stylesProp?.viewport}
      onLayout={handleViewportLayout}
    >
      {itemWidth > 0 && snapOffsets.length > 0 ? (
        <AnimatedFlatList
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          scrollEventThrottle={16}
          {...restProps}
          ref={listRef}
          horizontal
          data={orderedChildren}
          renderItem={renderChildItem}
          keyExtractor={extractChildKey}
          getItemLayout={getItemLayout}
          snapToOffsets={sortedSnapOffsets}
          onScroll={scrollHandler}
          style={[style, carouselStyleSheet.pagerList]}
          contentContainerClassName={contentClassName}
          contentContainerStyle={[
            carouselStyleSheet.pagerContent,
            // Physical and symmetric, so it holds in RTL where the strip
            // is LTR-pinned and mirrored through render order instead.
            {
              gap,
              paddingHorizontal: sidePadding,
            },
            stylesProp?.content,
            contentContainerStyle,
          ]}
        />
      ) : null}
    </View>
  );
});
// --------------------------------------------------
const CarouselItem = forwardRef((props, ref) => {
  const { children, className, style, ...restProps } = props;
  const { itemWidth } = useCarouselEngine();
  const isRTL = useIsRTL();
  const itemClassName = carouselClassNames.item({
    className,
  });
  return (
    <View
      ref={ref}
      className={itemClassName}
      style={[
        style,
        // Restore the app layout direction inside the LTR-pinned strip so
        // the slide's own layout mirrors; the engine-owned width comes
        // last so consumer styles cannot desync it from the snap offsets.
        isRTL ? carouselStyleSheet.restoreDirectionRTL : carouselStyleSheet.restoreDirectionLTR,
        {
          width: itemWidth,
        },
      ]}
      {...restProps}
    >
      {children}
    </View>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind a nav button's
 * surface. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const CarouselNavButtonBackground = forwardRef((props, ref) => {
  const { className, ...restProps } = props;
  const backgroundClassName = carouselClassNames.navButtonBackground({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={backgroundClassName}
      fallbackColor="default"
      {...restProps}
    />
  );
});
// --------------------------------------------------
const CarouselNavButton = forwardRef((props, ref) => {
  const {
    slot,
    children,
    className,
    classNames,
    styles: stylesProp,
    style,
    accessibilityLabel,
    onPress,
    onPressIn,
    onPressOut,
    background,
    ...restProps
  } = props;
  const {
    type,
    sidePadding,
    viewportHeight,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
  } = useCarousel();
  const isRTL = useIsRTL();
  const themeDefaultForeground = useThemeColor('default-foreground');
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const isPrevious = slot === 'previous';
  const isDisabled = isPrevious ? !canScrollPrev : !canScrollNext;
  const isOverlaid = type !== 'miniatures';
  const { container, button } = carouselClassNames.nav({
    slot,
    type,
  });
  const containerClassName = container({
    className: classNames?.container,
  });
  const buttonClassName = button({
    className: [className, classNames?.button],
  });
  /** Whether the current gesture already navigated at press-in. */
  const pressInHandledRef = useRef(false);
  const commitNavigation = useCallback(() => {
    if (isPrevious) {
      scrollPrev();
    } else {
      scrollNext();
    }
  }, [isPrevious, scrollPrev, scrollNext]);
  /**
   * Navigates on press-in rather than press: while the slide strip animates
   * (e.g. from the previous press), iOS cancels a new press on the overlaid
   * button right after `onPressIn`, so waiting for `onPress` swallows rapid
   * taps and waiting for a press-out rescue adds a full press of latency.
   * A pager button has no drag ambiguity — touch-down is unambiguous
   * intent — so committing immediately is both safe and the most
   * responsive option.
   */
  const handlePressIn = useCallback(
    (event) => {
      pressInHandledRef.current = true;
      commitNavigation();
      onPressIn?.(event);
    },
    [commitNavigation, onPressIn]
  );
  /**
   * Fallback for activations that produce no press-in (e.g. screen-reader
   * double-tap); a touch gesture already navigated at press-in.
   */
  const handlePress = useCallback(
    (event) => {
      if (!pressInHandledRef.current) {
        commitNavigation();
      }
      pressInHandledRef.current = false;
      onPress?.(event);
    },
    [commitNavigation, onPress]
  );
  /**
   * Every touch gesture ends with press-out (including cancelled ones,
   * which never fire `onPress`), so the press-in flag is cleared here —
   * otherwise a stale flag would skip a later press-in-less activation.
   */
  const handlePressOut = useCallback(
    (event) => {
      pressInHandledRef.current = false;
      onPressOut?.(event);
    },
    [onPressOut]
  );
  // "Previous" points toward the past side of the reading direction — left
  // in LTR, right in RTL (matches `Calendar.NavButton`). The icon components
  // draw fixed physical glyphs, so the pair is swapped instead of
  // scale-flipping each icon.
  const pointsLeft = isPrevious !== isRTL;
  const defaultIcon = pointsLeft ? (
    <ChevronLeftIcon size={NAV_ICON_SIZE} color={themeDefaultForeground} />
  ) : (
    <ChevronRightIcon size={NAV_ICON_SIZE} color={themeDefaultForeground} />
  );
  /**
   * Background layer rendered behind the button surface.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content (the button paints the translucent
   *   `--color-default` under glass)
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <CarouselNavButtonBackground />
    ) : null;
  return (
    <View
      className={containerClassName}
      style={[
        isOverlaid
          ? {
              height: viewportHeight,
              ...(isPrevious
                ? {
                    marginStart: sidePadding,
                  }
                : {
                    marginEnd: sidePadding,
                  }),
            }
          : undefined,
        stylesProp?.container,
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? (isPrevious ? 'Previous slide' : 'Next slide')}
        disabled={isDisabled}
        className={buttonClassName}
        style={[stylesProp?.button, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...restProps}
      >
        {backgroundElement}
        {children ?? defaultIcon}
      </Pressable>
    </View>
  );
});
// --------------------------------------------------
const CarouselPrevious = forwardRef((props, ref) => {
  return <CarouselNavButton ref={ref} slot="previous" {...props} />;
});
// --------------------------------------------------
const CarouselNext = forwardRef((props, ref) => {
  return <CarouselNavButton ref={ref} slot="next" {...props} />;
});
// --------------------------------------------------
/**
 * Default indicator dot rendered by `Carousel.Dots`. Indication-only (not
 * pressable). Internal — replace it through the `renderDot` prop.
 */
const CarouselDot = (props) => {
  const { index, isSelected, animation, isAnimatedStyleActive, dotClassName, dotStyle, progress } =
    props;
  const { dot } = carouselClassNames.dots({
    isSelected,
  });
  const resolvedDotClassName = dot({
    className: dotClassName,
  });
  const { rDotStyle } = useCarouselDotAnimation({
    animation,
    index,
    isSelected,
    progress,
  });
  return (
    <Animated.View
      className={resolvedDotClassName}
      style={isAnimatedStyleActive ? [rDotStyle, dotStyle] : dotStyle}
    />
  );
};
// --------------------------------------------------
const CarouselDots = forwardRef((props, ref) => {
  const {
    className,
    classNames,
    styles: stylesProp,
    renderDot,
    animation,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const { snapCount, selectedIndex, progress } = useCarousel();
  const { container } = carouselClassNames.dots();
  const containerClassName = container({
    className: [className, classNames?.container],
  });
  if (snapCount <= 1) {
    return null;
  }
  return (
    <View ref={ref} className={containerClassName} style={stylesProp?.container} {...restProps}>
      {Array.from(
        {
          length: snapCount,
        },
        (_, index) => {
          const isSelected = index === selectedIndex;
          if (renderDot !== undefined) {
            return (
              <Fragment key={index}>
                {renderDot({
                  index,
                  isSelected,
                  progress,
                })}
              </Fragment>
            );
          }
          return (
            <CarouselDot
              key={index}
              index={index}
              isSelected={isSelected}
              animation={animation}
              isAnimatedStyleActive={isAnimatedStyleActive}
              dotClassName={classNames?.dot}
              dotStyle={stylesProp?.dot}
              progress={progress}
            />
          );
        }
      )}
    </View>
  );
});
// --------------------------------------------------
const CarouselThumbnails = forwardRef((props, ref) => {
  const {
    children,
    className,
    classNames,
    styles: stylesProp,
    style,
    contentContainerStyle,
    onScroll,
    onScrollBeginDrag,
    ...restProps
  } = props;
  const { type, selectedIndex } = useCarousel();
  const { thumbnailScrollStateRef } = useCarouselEngine();
  const isRTL = useIsRTL();
  const listRef = useRef(null);
  /** Tracks the live offset so thumbnails can measure drag movement. */
  const handleScroll = useCallback(
    (event) => {
      thumbnailScrollStateRef.current.offsetX = event.nativeEvent.contentOffset.x;
      onScroll?.(event);
    },
    [thumbnailScrollStateRef, onScroll]
  );
  /** Marks drag begins so thumbnails can tell drags apart from tap cancels. */
  const handleScrollBeginDrag = useCallback(
    (event) => {
      const state = thumbnailScrollStateRef.current;
      state.dragStartAt = Date.now();
      state.dragStartOffsetX = event.nativeEvent.contentOffset.x;
      state.offsetX = event.nativeEvent.contentOffset.x;
      onScrollBeginDrag?.(event);
    },
    [thumbnailScrollStateRef, onScrollBeginDrag]
  );
  const { container, content } = carouselClassNames.thumbnails({
    type,
  });
  const containerClassName = container({
    className: [className, classNames?.container],
  });
  const contentClassName = content({
    className: classNames?.content,
  });
  const setRefs = useCallback(
    (node) => {
      listRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref !== null) {
        ref.current = node;
      }
    },
    [ref]
  );
  const childArray = Children.toArray(children);
  const childCount = childArray.length;
  /**
   * In RTL the thumbnails render in reversed physical order inside the
   * LTR-pinned strip, mirroring the slide flow (thumbnail 0 sits at the
   * physical right edge).
   */
  const orderedChildren = isRTL ? [...childArray].reverse() : childArray;
  /**
   * Data position of the selected thumbnail (the RTL reversal above maps
   * thumbnail index `i` to data index `count - 1 - i`).
   */
  const selectedDataIndex = isRTL ? childCount - 1 - selectedIndex : selectedIndex;
  /**
   * Auto-scroll the selected thumbnail toward the strip's center.
   * `viewPosition: 0.5` centers the cell from the list's own measured
   * layouts, replacing the manual per-thumbnail measurement registry the
   * ScrollView implementation needed.
   */
  useEffect(() => {
    if (selectedDataIndex < 0 || selectedDataIndex >= childCount) {
      return;
    }
    listRef.current?.scrollToIndex({
      index: selectedDataIndex,
      viewPosition: 0.5,
      animated: true,
    });
  }, [selectedDataIndex, childCount]);
  /**
   * Far unmeasured cells (large strips right after mount): approximate the
   * offset from the average cell length; the next selection change lands
   * exactly once the cells are measured.
   */
  const handleScrollToIndexFailed = useCallback((info) => {
    listRef.current?.scrollToOffset({
      offset: info.averageItemLength * info.index,
      animated: true,
    });
  }, []);
  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      {...restProps}
      ref={setRefs}
      horizontal
      accessibilityRole="tablist"
      data={orderedChildren}
      renderItem={renderChildItem}
      keyExtractor={extractChildKey}
      onScrollToIndexFailed={handleScrollToIndexFailed}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onScrollBeginDrag={handleScrollBeginDrag}
      className={containerClassName}
      style={[style, stylesProp?.container, carouselStyleSheet.thumbnailsList]}
      contentContainerClassName={contentClassName}
      contentContainerStyle={[
        carouselStyleSheet.thumbnailsContent,
        stylesProp?.content,
        contentContainerStyle,
      ]}
    />
  );
});
// --------------------------------------------------
const CarouselThumbnail = forwardRef((props, ref) => {
  const {
    children,
    index,
    source,
    className,
    classNames,
    styles: stylesProp,
    style,
    imageProps,
    animation,
    isAnimatedStyleActive = true,
    accessibilityLabel,
    onPress,
    onPressIn,
    onPressOut,
    ...restProps
  } = props;
  const { selectedIndex, scrollTo } = useCarousel();
  const { thumbnailScrollStateRef } = useCarouselEngine();
  const isRTL = useIsRTL();
  const [isPressed, setIsPressed] = useState(false);
  const isSelected = index === selectedIndex;
  const { container, image, ring } = carouselClassNames.thumbnail({
    isSelected,
  });
  const containerClassName = container({
    className: [className, classNames?.container],
  });
  const imageClassName = image({
    className: classNames?.image,
  });
  const ringClassName = ring({
    className: classNames?.ring,
  });
  const { rContainerStyle, rRingStyle } = useCarouselThumbnailAnimation({
    animation,
    isSelected,
    isPressed,
  });
  /** When the current gesture's press-in fired; `0` = press already handled. */
  const pressStartedAtRef = useRef(0);
  /** Pending queued selection commit — also the dedup flag for `onPress`. */
  const tapCommitTimerRef = useRef(null);
  useEffect(() => {
    return () => {
      if (tapCommitTimerRef.current !== null) {
        clearTimeout(tapCommitTimerRef.current);
      }
    };
  }, []);
  /**
   * Queues the selection commit as a macrotask instead of running it inside
   * the touch event: committing synchronously kicks off the strip's
   * auto-centering scroll mid-gesture, destabilizing the very touch that
   * triggered it. Also the dedup point between the `onPress` path and the
   * rescued-tap path.
   */
  const queueSelectionCommit = useCallback(() => {
    if (tapCommitTimerRef.current !== null) {
      return;
    }
    tapCommitTimerRef.current = setTimeout(() => {
      tapCommitTimerRef.current = null;
      scrollTo(index);
    }, 0);
  }, [scrollTo, index]);
  const handlePress = useCallback(
    (event) => {
      pressStartedAtRef.current = 0;
      queueSelectionCommit();
      onPress?.(event);
    },
    [queueSelectionCommit, onPress]
  );
  const handlePressIn = useCallback(
    (event) => {
      setIsPressed(true);
      pressStartedAtRef.current = Date.now();
      onPressIn?.(event);
    },
    [onPressIn]
  );
  /**
   * Rescues taps whose press got cancelled: a tap landing while the strip
   * is still auto-centering from the previous selection is used by iOS to
   * stop that scroll — `onPress` never fires, but press-out always does,
   * with `NaN` coordinates as the cancellation signature (a finger released
   * outside the thumbnail reports real coordinates and must not select).
   * Catching the strip fires a drag-begin event just like a real drag, so
   * drags are told apart by movement instead: a real drag has moved the
   * strip with the finger by cancel time, a catch stops it dead.
   */
  const handlePressOut = useCallback(
    (event) => {
      setIsPressed(false);
      const startedAt = pressStartedAtRef.current;
      pressStartedAtRef.current = 0;
      // Cancelled presses carry no coordinates — `pageX` is `undefined` (not
      // NaN, so `Number.isNaN` misses it) while real releases report finite
      // numbers.
      const isCancelled = !Number.isFinite(event.nativeEvent.pageX);
      const isShortPress = startedAt !== 0 && Date.now() - startedAt <= TAP_RESCUE_MAX_DURATION_MS;
      const scrollState = thumbnailScrollStateRef.current;
      const isRealDrag =
        Date.now() - scrollState.dragStartAt <= THUMBNAIL_DRAG_CANCEL_WINDOW_MS &&
        Math.abs(scrollState.offsetX - scrollState.dragStartOffsetX) >
          THUMBNAIL_DRAG_MOVE_THRESHOLD;
      if (isCancelled && isShortPress && !isRealDrag) {
        queueSelectionCommit();
      }
      onPressOut?.(event);
    },
    [thumbnailScrollStateRef, queueSelectionCommit, onPressOut]
  );
  return (
    <AnimatedPressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityState={{
        selected: isSelected,
      }}
      accessibilityLabel={accessibilityLabel ?? `Go to slide ${index + 1}`}
      className={containerClassName}
      style={[
        isAnimatedStyleActive ? rContainerStyle : undefined,
        // Restore the app layout direction inside the LTR-pinned strip so
        // custom thumbnail content mirrors.
        isRTL ? carouselStyleSheet.restoreDirectionRTL : carouselStyleSheet.restoreDirectionLTR,
        stylesProp?.container,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...restProps}
    >
      {children ??
        (source !== undefined ? (
          <Image
            source={source}
            className={imageClassName}
            style={stylesProp?.image}
            {...imageProps}
          />
        ) : null)}
      <Animated.View
        pointerEvents="none"
        className={ringClassName}
        style={isAnimatedStyleActive ? [rRingStyle, stylesProp?.ring] : stylesProp?.ring}
      />
    </AnimatedPressable>
  );
});
// --------------------------------------------------
CarouselRoot.displayName = DISPLAY_NAME.ROOT;
CarouselContent.displayName = DISPLAY_NAME.CONTENT;
CarouselItem.displayName = DISPLAY_NAME.ITEM;
CarouselPrevious.displayName = DISPLAY_NAME.PREVIOUS;
CarouselNext.displayName = DISPLAY_NAME.NEXT;
CarouselNavButtonBackground.displayName = DISPLAY_NAME.NAV_BUTTON_BACKGROUND;
CarouselDots.displayName = DISPLAY_NAME.DOTS;
CarouselThumbnails.displayName = DISPLAY_NAME.THUMBNAILS;
CarouselThumbnail.displayName = DISPLAY_NAME.THUMBNAIL;
/**
 * Carousel compound component — a horizontal snap pager with navigation
 * buttons, dot indicators, and a thumbnail strip.
 *
 * @component Carousel - Root container. Owns the snap engine (selected
 * index, snap offsets computed from the measured viewport, autoplay) and
 * provides it to all parts via context (also exposed through
 * `useCarousel()`). Selection state lives in the public context only;
 * the slide strip consumes a selection-free engine context, so selection
 * commits (nav presses, the mid-swipe halfway update) never re-render
 * slide content.
 *
 * @component Carousel.Content - Measured slide viewport hosting the
 * horizontal snap FlatList with the `Carousel.Item` children.
 *
 * @component Carousel.Item - One slide. Its width is computed by the engine
 * from `itemsPerView` and `gap`.
 *
 * @component Carousel.Previous / Carousel.Next - @optional Navigation
 * buttons. Overlaid on the slide area (`in-place`), outside it (`modal`), or
 * inline (`miniatures`); disabled at the ends.
 *
 * @component Carousel.NavButtonBackground - @optional Absolute-fill
 * background container behind a nav button's surface. With no children, the
 * active library theme decides the default content (e.g. a glass blur
 * layer); pass children to host custom content with the same positioning
 * and clipping.
 *
 * @component Carousel.Dots - @optional Indication-only dots (not
 * pressable), one per snap point; the selected pill interpolates against
 * root `progress` as the strip is dragged. Customizable via `renderDot`.
 * Hidden with a single snap point.
 *
 * @component Carousel.Thumbnails - @optional Horizontal FlatList strip of
 * `Carousel.Thumbnail` parts that auto-scrolls the selection toward its
 * center (`scrollToIndex` with `viewPosition: 0.5`).
 *
 * @component Carousel.Thumbnail - @optional Pressable thumbnail navigating
 * to a slide (`index` required; renders `source` or custom children) with a
 * selection ring.
 *
 * State flows from Carousel to sub-components via context.
 *
 * @note RTL: the slide strip and the thumbnail strip are physically-paged
 * lists, so both stay pinned left-to-right (`snapToOffsets` and the
 * thumbnail `scrollToIndex` cell layouts are physical) while the mirroring
 * happens in the render order (slides and thumbnails reverse, and the
 * thumbnail data index mirrors accordingly) and in the snap-offset mapping. Slides and thumbnails restore the app direction on
 * their own roots. The nav chevrons swap glyphs off `useIsRTL()`; dots and
 * containers mirror through Yoga row ordering and logical insets. Root
 * `progress` is a logical snap index — interpolating a physical
 * `translateX` from it still needs to be mirrored off `useIsRTL()`.
 *
 * @note The carousel paints no surface card of its own (slides own their
 * backgrounds), so the root deliberately ships no glass `Background` part.
 * The nav buttons do paint `--color-default`, so they mount
 * `Carousel.NavButtonBackground` behind their surface (replaceable via the
 * `background` prop on `Carousel.Previous` / `Carousel.Next`).
 */
const Carousel = Object.assign(CarouselRoot, {
  /** Measured slide viewport hosting the horizontal snap FlatList. */
  Content: CarouselContent,
  /** One slide (width owned by the engine). */
  Item: CarouselItem,
  /** @optional Previous-slide navigation button. */
  Previous: CarouselPrevious,
  /** @optional Next-slide navigation button. */
  Next: CarouselNext,
  /** @optional Theme-aware background container behind a nav button surface. */
  NavButtonBackground: CarouselNavButtonBackground,
  /** @optional Indication-only dots, one per snap point. */
  Dots: CarouselDots,
  /** @optional Horizontal thumbnail strip. */
  Thumbnails: CarouselThumbnails,
  /** @optional Pressable thumbnail navigating to a slide. */
  Thumbnail: CarouselThumbnail,
});
export default Carousel;
export { useCarousel };
