// @ts-nocheck
import type { ReactNode, RefObject } from 'react';
import type {
  FlatList,
  FlatListProps,
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  PressableProps,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native';
import type { SharedValue, WithTimingConfig } from 'react-native-reanimated';
import type {
  Animation,
  AnimationRootDisableAll,
  AnimationValue,
  ElementSlots,
  PressableRef,
  ViewRef,
} from '../../helpers/internal/types/index.js';
import type {
  CarouselContentSlots,
  CarouselDotsSlots,
  CarouselNavSlots,
  CarouselThumbnailSlots,
  CarouselThumbnailsSlots,
} from './carousel.styles.js';
/**
 * Layout type of the carousel, controlling where the navigation buttons sit.
 * - `"in-place"`: buttons overlaid inside the slide area, vertically centered.
 * - `"modal"`: buttons outside the slide area (leave horizontal room for them).
 * - `"miniatures"`: buttons render inline (typically in a row with `Carousel.Thumbnails`).
 */
export type CarouselType = 'in-place' | 'modal' | 'miniatures';
/**
 * Alignment of the selected slide within the viewport.
 * - `"start"`: the selected slide aligns to the leading edge.
 * - `"center"`: the selected slide is centered.
 * - `"end"`: the selected slide aligns to the trailing edge.
 */
export type CarouselAlign = 'start' | 'center' | 'end';
/**
 * Animation configuration for the {@link Carousel} root component.
 *
 * The carousel root owns no animated styles of its own; the prop only exists
 * so consumers can cascade `disable-all` to animated descendants (the dots,
 * thumbnails, and custom slide content).
 *
 * - `"disable-all"`: disable all animations including children (cascades to
 *   all descendants via `AnimationSettingsProvider`).
 * - `undefined`: use default animations.
 */
export type CarouselRootAnimation = AnimationRootDisableAll;
/**
 * Animation configuration for a default dot rendered by {@link Carousel.Dots}.
 *
 * Width and background color interpolate against the root `progress` shared
 * value (continuous snap index), so the selected pill follows the drag.
 */
export type CarouselDotAnimation = Animation<{
  /**
   * Dot width for `[unselected, selected]` — the selected dot stretches into
   * a pill. Interpolated from root `progress`.
   */
  width?: AnimationValue<{
    /**
     * Width values `[unselected, selected]` in pixels.
     * @default [8, 20]
     */
    value?: [number, number];
  }>;
  /**
   * Dot background color for `[unselected, selected]`. Interpolated from
   * root `progress`.
   */
  backgroundColor?: AnimationValue<{
    /**
     * Color values `[unselected, selected]`.
     * @default Theme `default` and `accent` colors
     */
    value?: [string, string];
  }>;
}>;
/**
 * Animation configuration for a {@link Carousel.Thumbnail}.
 */
export type CarouselThumbnailAnimation = Animation<{
  /**
   * Thumbnail scale for `[idle, pressed]`.
   */
  scale?: AnimationValue<{
    /**
     * Scale values `[idle, pressed]`.
     * @default [1, 0.95]
     */
    value?: [number, number];
    /** Animation timing configuration. */
    timingConfig?: WithTimingConfig;
  }>;
  /**
   * Opacity of the selection ring for `[unselected, selected]`.
   */
  ringOpacity?: AnimationValue<{
    /**
     * Opacity values `[unselected, selected]`.
     * @default [0, 1]
     */
    value?: [number, number];
    /** Animation timing configuration. */
    timingConfig?: WithTimingConfig;
  }>;
}>;
/**
 * Shared context value provided by the {@link Carousel} root to all compound
 * parts and exposed through `useCarousel()`.
 *
 * Carries the React state of the carousel (`selectedIndex` and values
 * derived from it), so consumers re-render when the selection changes.
 * Purely geometric / imperative values consumed by the slide strip live in
 * the internal engine context instead, keeping slide content out of
 * selection re-renders.
 */
export interface CarouselContextValue {
  /** Active layout type. */
  type: CarouselType;
  /** Alignment of the selected slide within the viewport. */
  align: CarouselAlign;
  /** Gap between adjacent slides in pixels. */
  gap: number;
  /** Breathing room at both ends of the slide strip in pixels. */
  sidePadding: number;
  /** Number of slides visible per view (fractional values peek the next slide). */
  itemsPerView: number;
  /** Computed slide width in pixels (`0` until the viewport is measured). */
  itemWidth: number;
  /** Measured width of the slide viewport (`0` until measured). */
  viewportWidth: number;
  /** Measured height of the slide viewport (`0` until measured). */
  viewportHeight: number;
  /**
   * Index of the currently selected snap point. Updated immediately by the
   * navigation controls, and while swiping as soon as the drag crosses the
   * halfway point between two snap points.
   */
  selectedIndex: number;
  /** Number of distinct snap points (drives the dots count). */
  snapCount: number;
  /** Whether a previous snap point exists. */
  canScrollPrev: boolean;
  /** Whether a next snap point exists. */
  canScrollNext: boolean;
  /** Scrolls to the given snap index. */
  scrollTo: (index: number, animated?: boolean) => void;
  /** Scrolls to the previous snap point. */
  scrollPrev: () => void;
  /** Scrolls to the next snap point. */
  scrollNext: () => void;
  /**
   * Physical scroll offset of the slide strip in pixels. Useful for building
   * custom scroll-driven effects (parallax slides, progress bars).
   *
   * @note The value is physical in every layout direction: it grows as the
   * strip scrolls toward its physical end, regardless of RTL.
   */
  scrollX: SharedValue<number>;
  /**
   * Continuous snap-index progress (`0` at the first snap, `snapCount - 1`
   * at the last). Interpolates while the strip is dragged, so consumers can
   * drive indicator position without waiting for the snap to settle.
   *
   * @note Logical, not physical: the same scale as `selectedIndex` in both
   * layout directions. Interpolating a physical `translateX` from it still
   * needs to be mirrored off `useIsRTL()`; interpolating `start` does not.
   */
  progress: SharedValue<number>;
}
/**
 * Internal engine context value provided by the {@link Carousel} root to
 * the slide strip parts (`Carousel.Content`, `Carousel.Item`).
 *
 * Deliberately excludes `selectedIndex` (and anything derived from it):
 * every value here is stable across selection changes, so a selection
 * commit — including the mid-swipe halfway update — never re-renders the
 * slide content.
 */
export interface CarouselEngineContextValue {
  /** Gap between adjacent slides in pixels. */
  gap: number;
  /** Breathing room at both ends of the slide strip in pixels. */
  sidePadding: number;
  /** Computed slide width in pixels (`0` until the viewport is measured). */
  itemWidth: number;
  /**
   * Snap offsets in physical scroll coordinates, indexed by snap index
   * (already mirrored for RTL).
   */
  snapOffsets: readonly number[];
  /** Physical scroll offset of the slide strip (see {@link CarouselContextValue.scrollX}). */
  scrollX: SharedValue<number>;
  /**
   * Physical target offset of the in-flight programmatic trip, or `-1`
   * when no trip is active. Written by the root (nav buttons, thumbnails,
   * autoplay, `scrollTo`); `Carousel.Content` drives the strip toward it
   * with a UI-thread spring (per-frame non-animated scrolls). Retargeting
   * the spring preserves its velocity, so rapid successive navigations
   * chain into one continuous motion.
   */
  tripTargetSV: SharedValue<number>;
  /** Notifies the root that the trip spring settled on its target. */
  handleTripSettled: () => void;
  /** Registers the content FlatList's imperative scroll function. */
  registerScrollToOffset: (fn: (offsetX: number, animated: boolean) => void) => void;
  /** Reports the measured slide viewport size. */
  setViewportSize: (width: number, height: number) => void;
  /** Reports the number of `Carousel.Item` children. */
  setItemCount: (count: number) => void;
  /**
   * Resolves the selected index after a scroll settles (`onMomentumEnd`,
   * or `onEndDrag` when the release has no follow-on momentum).
   */
  handleMomentumEnd: (offsetX: number) => void;
  /** Reacts to the start of a user drag (autoplay pause/stop). */
  handleInteractionStart: () => void;
  /** Reacts to the end of a user drag (releases drag ownership of the strip). */
  handleInteractionEnd: () => void;
  /**
   * Live scroll state of the thumbnail strip, written by
   * `Carousel.Thumbnails`. Lets `Carousel.Thumbnail` distinguish a press
   * cancelled by a real user drag (must not select) from a press cancelled
   * by catching the strip's own scroll (a tap that must select). The
   * drag-begin event alone cannot tell them apart — iOS fires it for the
   * catch too — but movement can: a real drag moves the offset with the
   * finger, a catch stops it dead.
   */
  thumbnailScrollStateRef: RefObject<{
    /** Latest content offset of the strip (physical px). */
    offsetX: number;
    /** Content offset when the last drag began (physical px). */
    dragStartOffsetX: number;
    /** Timestamp (`Date.now()`) of the last drag begin. */
    dragStartAt: number;
  }>;
}
/**
 * Props for the {@link Carousel} root component.
 *
 * Owns the snap engine state (selected index, snap offsets, autoplay) and
 * provides it to all compound parts via context.
 */
export interface CarouselRootProps extends ViewProps {
  /** Compound parts rendered inside the carousel. */
  children?: ReactNode;
  /**
   * Number of slides visible per view. Fractional values (e.g. `1.2`) peek
   * the next slide.
   *
   * @default 1
   */
  itemsPerView?: number;
  /**
   * Gap between adjacent slides in pixels.
   *
   * @default 16, or `sidePadding` when that is provided — so the space
   * between slides matches the breathing room at the ends.
   */
  gap?: number;
  /**
   * Breathing room at both ends of the slide strip in pixels, for
   * full-bleed carousels: the first and last slides rest inset by this
   * padding instead of flush against the viewport edge, while intermediate
   * slides keep their `align` position (e.g. centered) on screen. Owned by
   * the snap engine — slide width and snap offsets account for it, unlike
   * padding applied through `className` / `contentContainerStyle`.
   *
   * @default 0
   */
  sidePadding?: number;
  /**
   * Alignment of the selected slide within the viewport.
   *
   * @default "start"
   */
  align?: CarouselAlign;
  /**
   * Layout type controlling where the navigation buttons sit.
   *
   * @default "in-place"
   */
  type?: CarouselType;
  /**
   * Snap index the carousel starts on.
   *
   * @default 0
   */
  defaultIndex?: number;
  /**
   * Whether the carousel automatically advances to the next snap point.
   * At the last snap point it wraps back to the first.
   *
   * @default false
   */
  autoPlay?: boolean;
  /**
   * Interval between autoplay advances in milliseconds.
   *
   * @default 4000
   */
  autoPlayInterval?: number;
  /**
   * Whether autoplay stops permanently on the first user interaction
   * (drag, dot, thumbnail, or navigation button press). When `false`,
   * autoplay only pauses while the user is dragging.
   *
   * @default true
   */
  stopAutoPlayOnInteraction?: boolean;
  /**
   * Additional CSS classes for the root container.
   */
  className?: string;
  /**
   * Callback fired when the selected snap index changes (from a swipe,
   * autoplay, or any navigation control).
   */
  onSelectedIndexChange?: (index: number) => void;
  /**
   * Animation configuration for the carousel root.
   * - `"disable-all"`: disable all animations including children (cascades
   *   down to all child components placed inside the carousel).
   * - `undefined`: use default animations.
   */
  animation?: CarouselRootAnimation;
}
/**
 * Ref type for the {@link Carousel} root component.
 */
export type CarouselRootRef = ViewRef;
/**
 * Props for the {@link Carousel.Content} component.
 *
 * Renders the measured slide viewport and the horizontal snap FlatList
 * hosting the `Carousel.Item` children (passed as `children`, fed to the
 * list as data). Extra FlatList props are forwarded to the underlying list.
 *
 * @note The engine owns the following FlatList props and they cannot be
 * overridden: `horizontal`, `snapToOffsets`, `onScroll`, `contentOffset`,
 * `data`, `renderItem`, `keyExtractor`, `getItemLayout`, and
 * `contentContainerClassName` (the slide-row class is composed from the
 * component's base class merged with `className` / `classNames.content` —
 * use those instead). `CellRendererComponent` is reserved by Reanimated's
 * animated FlatList.
 */
export interface CarouselContentProps extends Omit<
  FlatListProps<ReactNode>,
  | 'children'
  | 'horizontal'
  | 'contentOffset'
  | 'onScroll'
  | 'snapToOffsets'
  | 'data'
  | 'renderItem'
  | 'keyExtractor'
  | 'getItemLayout'
  | 'CellRendererComponent'
  | 'contentContainerClassName'
> {
  /** `Carousel.Item` children, one per slide. */
  children?: ReactNode;
  /**
   * Additional CSS classes for the slide row (the scroll content container).
   * Merged into the underlying `contentContainerClassName` after the
   * component's base class.
   */
  className?: string;
  /**
   * Additional CSS classes for individual slots.
   */
  classNames?: ElementSlots<CarouselContentSlots>;
  /**
   * Styles for individual slots.
   */
  styles?: Partial<Record<CarouselContentSlots, ViewStyle>>;
}
/**
 * Ref type for the {@link Carousel.Content} component (the viewport wrapper).
 */
export type CarouselContentRef = ViewRef;
/**
 * Props for the {@link Carousel.Item} component — a single slide.
 *
 * @note The slide `width` is owned by the carousel engine (computed from the
 * measured viewport, `itemsPerView`, and `gap`) and cannot be set via
 * `className` or `style`.
 */
export interface CarouselItemProps extends ViewProps {
  /** Slide content. */
  children?: ReactNode;
  /**
   * Additional CSS classes for the slide container.
   */
  className?: string;
}
/**
 * Ref type for the {@link Carousel.Item} component.
 */
export type CarouselItemRef = ViewRef;
/**
 * Shared props for the {@link Carousel.Previous} and {@link Carousel.Next}
 * navigation buttons.
 */
export interface CarouselNavButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /**
   * Custom icon replacing the default chevron.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the button element.
   */
  className?: string;
  /**
   * Additional CSS classes for individual slots.
   */
  classNames?: ElementSlots<CarouselNavSlots>;
  /**
   * Styles for individual slots.
   */
  styles?: Partial<Record<CarouselNavSlots, ViewStyle>>;
  /**
   * Style applied to the button element.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Background layer rendered behind the button surface.
   * - `undefined` (default): renders `Carousel.NavButtonBackground` when the
   *   active library theme registers default background content (e.g.
   *   `glass`); otherwise no layer
   * - custom node: replaces the default layer entirely
   * - `null`: removes the background layer
   */
  background?: ReactNode;
}
/**
 * Props for the {@link Carousel.Previous} component.
 */
export type CarouselPreviousProps = CarouselNavButtonProps;
/**
 * Props for the {@link Carousel.Next} component.
 */
export type CarouselNextProps = CarouselNavButtonProps;
/**
 * Ref type for the {@link Carousel.Previous} and {@link Carousel.Next}
 * components.
 */
export type CarouselNavButtonRef = PressableRef;
/**
 * Props for the {@link Carousel.NavButtonBackground} component.
 * Absolute-fill container rendered behind a nav button's surface. With no
 * children, the active library theme decides the default content (e.g. a
 * glass blur layer); pass children to host custom content with the same
 * positioning and clipping.
 */
export interface CarouselNavButtonBackgroundProps extends ViewProps {
  /**
   * Custom content to render inside the background container.
   * When omitted, the active library theme's default background content is
   * rendered.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the background container.
   */
  className?: string;
}
/**
 * Ref type for the {@link Carousel.NavButtonBackground} component.
 */
export type CarouselNavButtonBackgroundRef = ViewRef;
/**
 * Render props passed to a custom {@link CarouselDotsProps.renderDot}
 * function.
 */
export interface CarouselDotRenderProps {
  /** Snap index this dot navigates to. */
  index: number;
  /** Whether this dot's snap point is currently selected. */
  isSelected: boolean;
  /**
   * Continuous snap-index progress (same numeric scale as `index`).
   * Interpolate against it inside `useAnimatedStyle` to slide or morph
   * a custom indicator as the strip is dragged.
   */
  progress: SharedValue<number>;
}
/**
 * Props for the {@link Carousel.Dots} component.
 *
 * Renders one indicator dot per snap point; hidden when there is at most
 * one snap point. Dots are indication-only (not pressable) — navigation
 * happens through swiping, the nav buttons, or the thumbnails.
 */
export interface CarouselDotsProps extends ViewProps {
  /**
   * Additional CSS classes for the dots container.
   */
  className?: string;
  /**
   * Additional CSS classes for individual slots.
   *
   * @note The `dot` slot has the following animated style properties that
   * cannot be set via className:
   * - `width` - Interpolated from root `progress` for the selected pill stretch
   * - `backgroundColor` - Interpolated from root `progress` for the selected color
   *
   * To customize, use the `animation` prop. To disable animated styles, set
   * `isAnimatedStyleActive={false}`.
   */
  classNames?: ElementSlots<CarouselDotsSlots>;
  /**
   * Styles for individual slots.
   */
  styles?: Partial<Record<CarouselDotsSlots, ViewStyle>>;
  /**
   * Render function replacing each default dot. Receives the dot's snap
   * index, selected state, and the root `progress` shared value to build
   * custom progress-driven indicators.
   */
  renderDot?: (props: CarouselDotRenderProps) => ReactNode;
  /**
   * Animation configuration applied to each default dot.
   */
  animation?: CarouselDotAnimation;
  /**
   * Whether animated styles (react-native-reanimated) are active on the
   * default dots. When `false`, the selected state is styled through the
   * `--is-selected` modifier class instead.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Ref type for the {@link Carousel.Dots} component.
 */
export type CarouselDotsRef = ViewRef;
/**
 * Props for the {@link Carousel.Thumbnails} component — a horizontal
 * FlatList strip of `Carousel.Thumbnail` children (passed as `children`,
 * fed to the list as data) that auto-scrolls the selected thumbnail toward
 * its center.
 *
 * @note The strip owns the following FlatList props and they cannot be
 * overridden: `horizontal`, `data`, `renderItem`, `keyExtractor`,
 * `onScrollToIndexFailed`, and `contentContainerClassName` (style the
 * content row through `classNames.content` instead).
 */
export interface CarouselThumbnailsProps extends Omit<
  FlatListProps<ReactNode>,
  | 'children'
  | 'horizontal'
  | 'data'
  | 'renderItem'
  | 'keyExtractor'
  | 'onScrollToIndexFailed'
  | 'contentContainerClassName'
> {
  /** `Carousel.Thumbnail` children. */
  children?: ReactNode;
  /**
   * Additional CSS classes for the strip container.
   */
  className?: string;
  /**
   * Additional CSS classes for individual slots.
   */
  classNames?: ElementSlots<CarouselThumbnailsSlots>;
  /**
   * Styles for individual slots.
   */
  styles?: Partial<Record<CarouselThumbnailsSlots, ViewStyle>>;
}
/**
 * Ref type for the {@link Carousel.Thumbnails} component.
 */
export type CarouselThumbnailsRef = FlatList<ReactNode>;
/**
 * Props for the {@link Carousel.Thumbnail} component — a pressable thumbnail
 * navigating to a slide.
 */
export interface CarouselThumbnailProps extends Omit<PressableProps, 'children' | 'style'> {
  /**
   * Custom thumbnail content, replacing the default image.
   */
  children?: ReactNode;
  /**
   * Snap index this thumbnail navigates to (0-based).
   */
  index: number;
  /**
   * Image source rendered when no custom `children` are provided.
   */
  source?: ImageSourcePropType;
  /**
   * Additional CSS classes for the thumbnail container.
   *
   * @note The container has the following animated style properties that
   * cannot be set via className:
   * - `transform` (scale) - Animated for press feedback
   *
   * The `ring` slot animates `opacity` for the selection transition. To
   * customize, use the `animation` prop. To disable animated styles, set
   * `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Additional CSS classes for individual slots.
   */
  classNames?: ElementSlots<CarouselThumbnailSlots>;
  /**
   * Styles for individual slots.
   */
  styles?: {
    container?: ViewStyle;
    image?: ImageStyle;
    ring?: ViewStyle;
  };
  /**
   * Style applied to the thumbnail container.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Props forwarded to the default image element. Ignored when custom
   * `children` are provided.
   */
  imageProps?: Omit<ImageProps, 'source'>;
  /**
   * Animation configuration for the thumbnail.
   */
  animation?: CarouselThumbnailAnimation;
  /**
   * Whether animated styles (react-native-reanimated) are active. When
   * `false`, the selection ring is styled through the `--is-selected`
   * modifier class and press feedback is removed.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Ref type for the {@link Carousel.Thumbnail} component.
 */
export type CarouselThumbnailRef = PressableRef;
