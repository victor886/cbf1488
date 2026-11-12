import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (scale) - Animated for press feedback
 *
 * To customize scale behavior, use the `animation` prop on `ProgressButton`:
 * ```tsx
 * <ProgressButton
 *   animation={{
 *     scale: { value: 0.97, timingConfig: { duration: 200 } },
 *   }}
 * />
 * ```
 */
const root = tv({
  base: 'progress-button__root',
  variants: {
    variant: {
      default: 'progress-button__root--variant-default',
      accent: 'progress-button__root--variant-accent',
      success: 'progress-button__root--variant-success',
      danger: 'progress-button__root--variant-danger',
    },
    isDisabled: {
      true: 'progress-button__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    isDisabled: false,
  },
});
/**
 * Background style definition.
 * Absolute-fill container rendered behind the root surface, matching the
 * root's pill radius and clipping.
 */
const background = tv({
  base: 'progress-button__background',
});
/**
 * Overlay style definition.
 * Sweeps from left to right via translateX with a variant-colored background.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (translateX) - Animated for the left-to-right fill sweep
 */
const overlay = tv({
  base: 'progress-button__overlay',
  variants: {
    variant: {
      default: 'progress-button__overlay--variant-default',
      accent: 'progress-button__overlay--variant-accent',
      success: 'progress-button__overlay--variant-success',
      danger: 'progress-button__overlay--variant-danger',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
/**
 * Label style definition.
 * Base text layer always visible beneath the overlay.
 * Color matches the variant border for consistency.
 */
const label = tv({
  base: 'progress-button__label',
  variants: {
    variant: {
      default: 'progress-button__label--variant-default',
      accent: 'progress-button__label--variant-accent',
      success: 'progress-button__label--variant-success',
      danger: 'progress-button__label--variant-danger',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
/**
 * MaskLabel style definition.
 * Inverted-color text inside the overlay for the color-wipe effect.
 * Colors contrast with the overlay background.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (translateX) - Animated for counter-translation alignment with base Label
 */
const maskLabel = tv({
  base: 'progress-button__mask-label',
  variants: {
    variant: {
      default: 'progress-button__mask-label--variant-default',
      accent: 'progress-button__mask-label--variant-accent',
      success: 'progress-button__mask-label--variant-success',
      danger: 'progress-button__mask-label--variant-danger',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
export const progressButtonClassNames = combineStyles({
  root,
  background,
  overlay,
  label,
  maskLabel,
});
export const progressButtonStyleSheet = StyleSheet.create({
  root: {
    borderCurve: 'continuous',
  },
});
