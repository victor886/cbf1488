import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: '',
  variants: {
    isDisabled: {
      true: 'segment__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
const group = tv({
  base: '',
  variants: {
    size: {
      sm: 'segment__group--size-sm',
      md: 'segment__group--size-md',
      lg: 'segment__group--size-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
const scrollView = tv({
  base: '',
  variants: {
    size: {
      sm: 'segment__scroll-view--size-sm',
      md: 'segment__scroll-view--size-md',
      lg: 'segment__scroll-view--size-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
const scrollViewContentContainer = tv({
  base: '',
  variants: {
    size: {
      sm: 'segment__scroll-view-content-container--size-sm',
      md: 'segment__scroll-view-content-container--size-md',
      lg: 'segment__scroll-view-content-container--size-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
const item = tv({
  base: 'segment__item',
  variants: {
    size: {
      sm: 'segment__item--size-sm',
      md: 'segment__item--size-md',
      lg: 'segment__item--size-lg',
    },
    isDisabled: {
      true: 'disabled:opacity-disabled disabled:pointer-events-none',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    isDisabled: false,
  },
});
const label = tv({
  variants: {
    size: {
      sm: 'segment__label--size-sm',
      md: 'segment__label--size-md',
      lg: 'segment__label--size-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
/**
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `width` - Animated for indicator width transitions when switching segments
 * - `height` - Animated for indicator height transitions when switching segments
 * - `translateX` - Animated for indicator position transitions when switching segments (uses translateX for GPU-accelerated performance)
 * - `opacity` - Animated for indicator visibility transitions (0 when no active segment, 1 when active segment is selected)
 *
 * To customize these properties, use the `animation` prop on `Segment.Indicator`:
 * ```tsx
 * <Segment.Indicator
 *   animation={{
 *     width: { type: "spring", config: { stiffness: 1200, damping: 120 } },
 *     height: { type: "spring", config: { stiffness: 1200, damping: 120 } },
 *     translateX: { type: "timing", config: { duration: 200 } },
 *   }}
 * />
 * ```
 *
 * To disable animated styles and supply your own via `className`/`style`, set
 * `isAnimatedStyleActive={false}` on `Segment.Indicator`.
 */
const indicator = tv({
  base: '',
  variants: {
    size: {
      sm: 'segment__indicator--size-sm',
      md: 'segment__indicator--size-md',
      lg: 'segment__indicator--size-lg',
    },
    isScrollView: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      size: 'sm',
      isScrollView: true,
      className: 'segment__indicator--size-sm--is-scroll-view',
    },
    {
      size: 'md',
      isScrollView: true,
      className: 'segment__indicator--size-md--is-scroll-view',
    },
    {
      size: 'lg',
      isScrollView: true,
      className: 'segment__indicator--size-lg--is-scroll-view',
    },
  ],
  defaultVariants: {
    size: 'md',
    isScrollView: false,
  },
});
export const segmentClassNames = combineStyles({
  root,
  group,
  scrollView,
  scrollViewContentContainer,
  item,
  label,
  indicator,
});
