import { StyleSheet } from 'react-native';
import { cn } from 'heroui-native/utils';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/** Non-clipping root container hosting the rails and the content card. */
const root = tv({
  base: 'swipeable-row__root',
  variants: {
    variant: {
      standalone: 'swipeable-row__root--variant-standalone',
      inline: 'swipeable-row__root--variant-inline',
    },
    isDisabled: {
      true: 'swipeable-row__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'standalone',
    isDisabled: false,
  },
});
/**
 * Internal static rail container anchored to one logical edge, resting behind
 * the content card.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `opacity` hides the rail until measured and while fully covered.
 */
const actionsMask = tv({
  base: 'swipeable-row__actions-mask',
  variants: {
    side: {
      start: 'swipeable-row__actions-mask--side-start',
      end: 'swipeable-row__actions-mask--side-end',
    },
  },
  defaultVariants: {
    side: 'end',
  },
});
/**
 * Action rail laid out inside the rail container. Its vertical padding keeps
 * actions shorter than the row, so stacked rows' actions never touch.
 */
const actions = tv({
  base: 'swipeable-row__actions',
  variants: {
    side: {
      start: 'swipeable-row__actions--side-start',
      end: 'swipeable-row__actions--side-end',
    },
  },
  defaultVariants: {
    side: 'end',
  },
});
/**
 * Draggable content card.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (`translateX`) tracks the swipe gesture.
 * - `borderRadius` (`inline` variant) follows the drag distance.
 */
const content = tv({
  base: 'swipeable-row__content',
  variants: {
    variant: {
      standalone: 'swipeable-row__content--variant-standalone',
      inline: 'swipeable-row__content--variant-inline',
    },
  },
  defaultVariants: {
    variant: 'standalone',
  },
});
/** Absolute-fill theme background layer behind the content card. */
const contentBackground = tv({
  base: 'swipeable-row__content-background',
  variants: {
    variant: {
      standalone: 'swipeable-row__content-background--variant-standalone',
      inline: 'swipeable-row__content-background--variant-inline',
    },
  },
  defaultVariants: {
    variant: 'standalone',
  },
});
/**
 * Individual action button.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (`scale`) scales the button down subtly while pressed.
 */
const action = tv({
  base: cn('swipeable-row__action', 'active:opacity-80 disabled:opacity-disabled'),
  variants: {
    variant: {
      default: 'swipeable-row__action--variant-default',
      accent: 'swipeable-row__action--variant-accent',
      success: 'swipeable-row__action--variant-success',
      danger: 'swipeable-row__action--variant-danger',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
/**
 * Internal wrapper around the action's children.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (`translateX`, `scale`) and `opacity` follow the action's
 *   own reveal progress.
 */
const actionContent = tv({
  base: 'swipeable-row__action-content',
});
/** Action text inheriting the action's visual variant. */
const actionLabel = tv({
  base: 'swipeable-row__action-label',
  variants: {
    variant: {
      default: 'swipeable-row__action-label--variant-default',
      accent: 'swipeable-row__action-label--variant-accent',
      success: 'swipeable-row__action-label--variant-success',
      danger: 'swipeable-row__action-label--variant-danger',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
export const swipeableRowClassNames = combineStyles({
  root,
  actionsMask,
  actions,
  content,
  contentBackground,
  action,
  actionContent,
  actionLabel,
});
export const swipeableRowStyleSheet = StyleSheet.create({
  borderCurve: {
    borderCurve: 'continuous',
  },
  /**
   * Hides the action row during its first, measuring-only mount under a
   * translucent card, so it never shows through at rest.
   */
  measuringActions: {
    opacity: 0,
  },
});
