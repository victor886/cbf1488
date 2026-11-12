// @ts-nocheck
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useIsRTL } from 'heroui-native/hooks';
import ReactNativePagerViewPackage from '../../../optional/react-native-pager-view';
import { useTabsPagerScrollHandler } from '../hooks/index';
import {
  collectContentElements,
  getMissingPagerViewError,
  getNeighbourIndices,
} from '../utils/index';
const AnimatedPagerView = ReactNativePagerViewPackage
  ? Animated.createAnimatedComponent(ReactNativePagerViewPackage.default)
  : undefined;
/**
 * Props for {@link TabsPager}: the public pager props plus the owning
 * component's state and identity.
 */
/**
 * Props for {@link TabsPagerContent}: the public page props plus the owning
 * component's state.
 */
// --------------------------------------------------
/**
 * Native swipeable pager shared by tab components (`MorphTabs`,
 * `SwipeableTabs`). Registers its `Content` pages with the root state,
 * writes the continuous pager position on the UI thread, keeps the native
 * page in sync with the selected value, and lazily mounts neighbours when a
 * drag starts. `className` is expected to be pre-resolved by the owner.
 */
export const TabsPager = forwardRef((props: any, ref: any) => {
  const {
    children,
    state,
    contentDisplayName,
    componentName,
    swipeEnabled = true,
    isPageAnimationEnabled = true,
    className,
    style,
    onSwipeStart,
    onSwipeEnd,
    ...restProps
  } = props;
  const {
    value: selectedValue,
    selectedIndex,
    progress,
    pendingAnimatedRef,
    goTo,
    mountValues,
    setValues,
  } = state;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const isRTL = useIsRTL();
  const pages = useMemo(
    () =>
      collectContentElements({
        children,
        contentDisplayName,
        componentName,
      }),
    [children, componentName, contentDisplayName]
  );
  const pageValues = useMemo(() => pages.map((page) => page.props.value), [pages]);
  /** Page shown on mount; later changes go through `setPage`. */
  const [initialPage] = useState(() =>
    selectedValue !== undefined ? Math.max(0, pageValues.indexOf(selectedValue)) : 0
  );
  const pagerRef = useRef<any>(null);
  /** Page the native pager rests on or is sliding toward. */
  const pagerIndexRef = useRef<any>(initialPage);
  /**
   * Target of an in-flight programmatic slide. `onPageSelected` events for
   * other pages (e.g. from an earlier, superseded tap) are ignored until
   * the target reports, so rapid taps never bounce the selection back.
   */
  const pendingTargetRef = useRef<any>(null);
  const isDraggingRef = useRef<any>(false);
  /** Registers pages before paint so header parts resolve their index at once. */
  useLayoutEffect(() => {
    setValues(pageValues);
  }, [pageValues, setValues]);
  useLayoutEffect(() => {
    progress.set(initialPage);
  }, [initialPage, progress]);
  /**
   * Drives the native pager toward the selected page when the selection
   * changes from outside the pager (trigger press, controlled `value`,
   * `goTo`). Selections reported by the pager itself already match
   * `pagerIndexRef`, so they never echo back into `setPage`.
   */
  useEffect(() => {
    const requestedAnimated = pendingAnimatedRef.current;
    pendingAnimatedRef.current = undefined;
    const pager = pagerRef.current;
    if (!pager || selectedIndex < 0) {
      return;
    }
    if (selectedIndex === pagerIndexRef.current) {
      return;
    }
    pagerIndexRef.current = selectedIndex;
    const isAnimated = (requestedAnimated ?? isPageAnimationEnabled) && !isAllAnimationsDisabled;
    if (isAnimated) {
      pendingTargetRef.current = selectedIndex;
      pager.setPage(selectedIndex);
      return;
    }
    pendingTargetRef.current = null;
    pager.setPageWithoutAnimation(selectedIndex);
    progress.set(selectedIndex);
  }, [
    isAllAnimationsDisabled,
    isPageAnimationEnabled,
    pendingAnimatedRef,
    progress,
    selectedIndex,
  ]);
  const scrollHandler = useTabsPagerScrollHandler({
    progress,
    pageCount: pageValues.length,
    isPositionMirrored: Platform.OS === 'ios' && isRTL,
  });
  const setPagerRef = useCallback(
    (instance: any) => {
      pagerRef.current = instance;
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
    },
    [ref]
  );
  const handlePageSelected = useCallback(
    (event: any) => {
      const index = event.nativeEvent.position;
      const pendingTarget = pendingTargetRef.current;
      if (pendingTarget !== null && index !== pendingTarget) {
        return;
      }
      pendingTargetRef.current = null;
      pagerIndexRef.current = index;
      const nextValue = pageValues[index];
      if (nextValue !== undefined) {
        goTo(nextValue);
      }
    },
    [goTo, pageValues]
  );
  /**
   * Mounts both neighbours as soon as a drag starts, so a lazy page never
   * slides in blank, and maps native drag states to the swipe callbacks.
   */
  const handlePageScrollStateChanged = useCallback(
    (event: any) => {
      const { pageScrollState } = event.nativeEvent;
      if (pageScrollState === 'dragging') {
        pendingTargetRef.current = null;
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          onSwipeStart?.();
        }
        const neighbourValues = getNeighbourIndices(
          pagerIndexRef.current,
          pageValues.length
        ).flatMap((neighbourIndex) => {
          const neighbourValue = pageValues[neighbourIndex];
          return neighbourValue !== undefined ? [neighbourValue] : [];
        });
        mountValues(neighbourValues);
        return;
      }
      if (pageScrollState === 'idle') {
        pendingTargetRef.current = null;
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          onSwipeEnd?.();
        }
      }
    },
    [mountValues, onSwipeEnd, onSwipeStart, pageValues]
  );
  if (!AnimatedPagerView) {
    throw new Error(getMissingPagerViewError(componentName));
  }
  return (
    <View className={className} style={style}>
      <AnimatedPagerView
        ref={setPagerRef}
        style={styleSheet.pagerView}
        initialPage={initialPage}
        layoutDirection={isRTL ? 'rtl' : 'ltr'}
        scrollEnabled={swipeEnabled}
        onPageScroll={scrollHandler}
        onPageSelected={handlePageSelected}
        onPageScrollStateChanged={handlePageScrollStateChanged}
        {...restProps}
      >
        {pages}
      </AnimatedPagerView>
    </View>
  );
});
// --------------------------------------------------
/**
 * One page of a {@link TabsPager}. Hidden from screen readers while not
 * selected, and renders the lazy placeholder until the page first mounts.
 * `className` is expected to be pre-resolved by the owner.
 */
export const TabsPagerContent = forwardRef((props: any, ref: any) => {
  const { children, value, state, className, ...restProps } = props;
  const { value: selectedValue, isMounted, renderLazyPlaceholder } = state;
  const isSelected = selectedValue === value;
  return (
    <View
      ref={ref}
      className={className}
      accessibilityElementsHidden={!isSelected}
      importantForAccessibility={isSelected ? 'auto' : 'no-hide-descendants'}
      {...restProps}
    >
      {isMounted(value) ? children : (renderLazyPlaceholder?.(value) ?? null)}
    </View>
  );
});
// --------------------------------------------------
const styleSheet = StyleSheet.create({
  /**
   * The native pager fills the owner's themable pager container, so borders
   * or padding a theme adds to the container never change the page size the
   * pager lays out.
   */
  pagerView: {
    flex: 1,
  },
});
TabsPager.displayName = 'HeroUINative.Internal.TabsPager';
TabsPagerContent.displayName = 'HeroUINative.Internal.TabsPagerContent';
