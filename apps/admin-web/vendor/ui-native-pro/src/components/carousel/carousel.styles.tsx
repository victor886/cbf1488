// @ts-nocheck
import { Platform, StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Layout direction style. Native Yoga uses `direction`; react-native-web rejects
 * that key in StyleSheet and maps `writingDirection` → CSS `direction` instead.
 */
const layoutDirection = (dir: 'ltr' | 'rtl') =>
  Platform.OS === 'web' ? { writingDirection: dir } : { direction: dir };
/**
 * Root container. Hosts the viewport, navigation buttons, dots, and
 * thumbnails; the `type` variant controls the overall layout.
 */
const root = tv({
  base: 'carousel',
  variants: {
    type: {
      'in-place': '',
      'modal': 'carousel--type-modal',
      'miniatures': 'carousel--type-miniatures',
    },
  },
  defaultVariants: {
    type: 'in-place',
  },
});
/**
 * Slide area: `viewport` is the measured content-box wrapper hosting the
 * snap FlatList; `content` is the slide row inside the FlatList (gap is
 * applied inline at runtime).
 */
const content = tv({
  slots: {
    viewport: 'carousel__viewport',
    content: 'carousel__content',
  },
});
/**
 * One slide.
 *
 * @note The slide `width` is owned by the carousel engine (computed from the
 * measured viewport, `itemsPerView`, and `gap`) and applied inline — it
 * cannot be set via className.
 */
const item = tv({
  base: 'carousel__item',
});
/**
 * Navigation buttons: `container` is the positioning shell (absolute for the
 * `in-place` / `modal` types, inline for `miniatures`; its height is set
 * inline to the measured viewport height for vertical centering), `button`
 * is the pressable itself.
 *
 * @note The `disabled:` pseudo-class utilities stay here: pseudo-class
 * selectors are Tailwind variants and cannot be applied to custom CSS
 * classes. Plain base styles live in `styles/components/carousel.css`.
 */
const nav = tv({
  slots: {
    container: 'carousel__nav',
    button: 'carousel__nav-button disabled:opacity-disabled disabled:pointer-events-none',
  },
  variants: {
    slot: {
      previous: {},
      next: {},
    },
    type: {
      'in-place': {},
      'modal': {},
      'miniatures': {
        container: 'carousel__nav--type-miniatures',
      },
    },
  },
  compoundVariants: [
    {
      slot: 'previous',
      type: 'in-place',
      class: {
        container: 'carousel__nav--previous--type-in-place',
      },
    },
    {
      slot: 'next',
      type: 'in-place',
      class: {
        container: 'carousel__nav--next--type-in-place',
      },
    },
    {
      slot: 'previous',
      type: 'modal',
      class: {
        container: 'carousel__nav--previous--type-modal',
      },
    },
    {
      slot: 'next',
      type: 'modal',
      class: {
        container: 'carousel__nav--next--type-modal',
      },
    },
  ],
  defaultVariants: {
    slot: 'previous',
    type: 'in-place',
  },
});
/**
 * Nav-button background style definition.
 * Absolute-fill theme background layer behind a nav button's surface,
 * clipped to the button's radius.
 */
const navButtonBackground = tv({
  base: 'carousel__nav-button-background',
});
/**
 * Dot indicators: `container` is the row, `dot` one default dot.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The `dot` slot animates the following:
 * - `width` - Interpolated from root `progress` for the selected pill stretch
 * - `backgroundColor` - Interpolated from root `progress` for the selected color
 *
 * To customize, use the `animation` prop on `Carousel.Dots`:
 * ```tsx
 * <Carousel.Dots
 *   animation={{
 *     width: { value: [8, 28] },
 *   }}
 * />
 * ```
 *
 * To disable animated styles (the `--is-selected` modifier class takes over),
 * set `isAnimatedStyleActive={false}`.
 */
const dots = tv({
  slots: {
    container: 'carousel__dots',
    dot: 'carousel__dot',
  },
  variants: {
    isSelected: {
      true: {
        dot: 'carousel__dot--is-selected',
      },
      false: {},
    },
  },
  defaultVariants: {
    isSelected: false,
  },
});
/**
 * Thumbnail strip: `container` is the horizontal ScrollView, `content` its
 * content row.
 */
const thumbnails = tv({
  slots: {
    container: 'carousel__thumbnails',
    content: 'carousel__thumbnails-content',
  },
  variants: {
    type: {
      'in-place': {},
      'modal': {},
      'miniatures': {
        container: 'carousel__thumbnails--type-miniatures',
      },
    },
  },
  defaultVariants: {
    type: 'in-place',
  },
});
/**
 * One thumbnail: `container` is the pressable, `image` the default image,
 * `ring` the selection ring overlay.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The `container` slot animates the following:
 * - `transform` (scale) - Animated for press feedback
 *
 * The `ring` slot animates the following:
 * - `opacity` - Animated for the selection transition
 *
 * To customize, use the `animation` prop on `Carousel.Thumbnail`. To disable
 * animated styles (the `--is-selected` modifier class takes over), set
 * `isAnimatedStyleActive={false}`.
 */
const thumbnail = tv({
  slots: {
    container: 'carousel__thumbnail',
    image: 'carousel__thumbnail-image',
    ring: 'carousel__thumbnail-ring',
  },
  variants: {
    isSelected: {
      true: {
        ring: 'carousel__thumbnail-ring--is-selected',
      },
      false: {},
    },
  },
  defaultVariants: {
    isSelected: false,
  },
});
export const carouselClassNames = combineStyles({
  root,
  content,
  item,
  nav,
  navButtonBackground,
  dots,
  thumbnails,
  thumbnail,
});
export const carouselStyleSheet = StyleSheet.create({
  /**
   * Pins the slide strip's FlatList node to a physical left-to-right flow.
   * The snap engine (`snapToOffsets`, `scrollToOffset`) works in physical
   * offsets, so the RTL mirroring happens in the snap-offset math and in
   * the slide render order instead of in layout. On Android a horizontal
   * list whose node resolves to `rtl` mirrors its scroll offsets, so the
   * node and its content row must agree on the direction.
   */
  pagerList: layoutDirection('ltr'),
  /** Pins the slide row to the same physical flow as its FlatList node. */
  pagerContent: layoutDirection('ltr'),
  /**
   * Pins the thumbnail strip to a physical left-to-right flow for the same
   * reason: the auto-scroll-to-selected `scrollToIndex` works from the
   * list's physical cell layouts. RTL mirroring happens in the thumbnail
   * render order (and the mirrored data index) instead.
   */
  thumbnailsList: layoutDirection('ltr'),
  /** Pins the thumbnail row to the same physical flow as its ScrollView node. */
  thumbnailsContent: layoutDirection('ltr'),
  /** Restores the app layout direction inside an LTR-pinned strip. */
  restoreDirectionLTR: layoutDirection('ltr'),
  restoreDirectionRTL: layoutDirection('rtl'),
});
/** Slot type for the content style definition. */
/** Slot type for the navigation button style definition. */
/** Slot type for the dots style definition. */
/** Slot type for the thumbnails strip style definition. */
/** Slot type for the thumbnail style definition. */
export default carouselClassNames;
