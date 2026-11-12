import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition (with slots for container and inner wrapper).
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `opacity` - Animated for disabled state transitions (applied to container)
 */
const root = tv({
  slots: {
    container: 'slide-button__container',
    contentContainer: 'slide-button__content-container',
  },
  variants: {
    isDisabled: {
      true: {
        container: 'slide-button__container--is-disabled',
      },
      false: {},
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * UnderlayContent style definition.
 * Right-anchored clip wrapper that hides content to the left of the thumb.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `width` - Animated to clip content at the thumb's leading edge (applied to container and content container)
 */
const underlayContent = tv({
  slots: {
    container: 'slide-button__underlay-content-container',
    contentContainer: 'slide-button__underlay-content-content-container',
  },
});
/**
 * OverlayContent style definition.
 * Uses overflow-hidden clip wrapper to reveal content from left to right.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `width` - Animated to clip content at the thumb's trailing edge (applied to container and content container)
 */
const overlayContent = tv({
  slots: {
    container: 'slide-button__overlay-content-container',
    contentContainer: 'slide-button__overlay-content-content-container',
  },
  variants: {
    variant: {
      default: {
        contentContainer: 'slide-button__overlay-content-content-container--variant-default',
      },
      accent: {
        contentContainer: 'slide-button__overlay-content-content-container--variant-accent',
      },
      success: {
        contentContainer: 'slide-button__overlay-content-content-container--variant-success',
      },
      danger: {
        contentContainer: 'slide-button__overlay-content-content-container--variant-danger',
      },
    },
  },
  defaultVariants: {
    variant: 'accent',
  },
});
/**
 * Thumb style definition.
 * The draggable handle positioned absolutely within the root.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (translateX) - Animated for gesture tracking
 *
 * To customize spring behavior, use the `animation` prop on `SlideButton.Thumb`:
 * ```tsx
 * <SlideButton.Thumb
 *   animation={{
 *     springConfig: { damping: 25, stiffness: 400 },
 *   }}
 * />
 * ``
 *
 * To completely disable animated styles and apply your own via className or style prop,
 * set `isAnimatedStyleActive={false}` on `SlideButton.Thumb`.
 */
const thumb = tv({
  base: 'slide-button__thumb',
});
/**
 * Thumb background style definition — absolute-fill container behind the
 * thumb surface, hosting theme-specific layers (e.g. glass blur) or custom
 * content (gradients, images).
 */
const thumbBackground = tv({
  base: 'slide-button__thumb-background',
});
/**
 * Container background style definition — absolute-fill container behind
 * the container surface, hosting theme-specific layers (e.g. glass blur) or
 * custom content (gradients, images).
 */
const containerBackground = tv({
  base: 'slide-button__container-background',
});
/**
 * Label style definition.
 * Text label used within underlay or overlay content parts.
 */
const label = tv({
  base: 'slide-button__label',
  variants: {
    variant: {
      default: 'slide-button__label--variant-default',
      accent: 'slide-button__label--variant-accent',
      success: 'slide-button__label--variant-success',
      danger: 'slide-button__label--variant-danger',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
export const slideButtonClassNames = combineStyles({
  root,
  underlayContent,
  overlayContent,
  thumb,
  thumbBackground,
  containerBackground,
  label,
});
export const slideButtonStyleSheet = StyleSheet.create({
  root: {
    borderCurve: 'continuous',
  },
});
/** Slot type for the root style definition. */
/** Slot type for the underlay content style definition. */
/** Slot type for the overlay content style definition. */

/** Slot type for the root style definition. */
export type SlideButtonRootSlots = keyof ReturnType<typeof root>;

/** Slot type for the underlay content style definition. */
export type SlideButtonUnderlayContentSlots = keyof ReturnType<typeof underlayContent>;

/** Slot type for the overlay content style definition. */
export type SlideButtonOverlayContentSlots = keyof ReturnType<typeof overlayContent>;
