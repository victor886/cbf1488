import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition.
 * Wraps the label row and track in a vertical layout.
 */
const root = tv({
  base: 'progress-bar__root',
  variants: {
    isDisabled: {
      true: 'progress-bar__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * Label row style definition.
 * Horizontal container for the label and value label.
 */
const labelRow = tv({
  base: 'progress-bar__label-row',
});
/**
 * Track style definition.
 * Background container that holds the fill element.
 */
const track = tv({
  base: 'progress-bar__track',
  variants: {
    size: {
      sm: 'progress-bar__track--size-sm',
      md: 'progress-bar__track--size-md',
      lg: 'progress-bar__track--size-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
/**
 * Track background style definition.
 * Absolute-fill container rendered behind the track surface, matching its
 * border radius and clipping.
 */
const trackBackground = tv({
  base: 'progress-bar__track-background',
});
/**
 * Fill style definition.
 * Represents the filled portion of the track.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `width` - Animated for determinate fill progress
 * - `transform` (translateX) - Animated for indeterminate sweep
 *
 * To customize these properties, use the `animation` prop on `ProgressBar.Fill`.
 *
 * To completely disable animated styles and apply your own via `className` or
 * `style` prop, set `isAnimatedStyleActive={false}` on `ProgressBar.Fill`.
 */
const fill = tv({
  base: 'progress-bar__fill',
  variants: {
    color: {
      default: 'progress-bar__fill--color-default',
      accent: 'progress-bar__fill--color-accent',
      success: 'progress-bar__fill--color-success',
      warning: 'progress-bar__fill--color-warning',
      danger: 'progress-bar__fill--color-danger',
    },
  },
  defaultVariants: {
    color: 'accent',
  },
});
/**
 * Label style definition.
 * Text describing the progress operation.
 */
const label = tv({
  base: 'progress-bar__label',
});
/**
 * ValueLabel style definition.
 * Displays the formatted progress value.
 */
const valueLabel = tv({
  base: 'progress-bar__value-label',
});
export const progressBarClassNames = combineStyles({
  root,
  labelRow,
  track,
  trackBackground,
  fill,
  label,
  valueLabel,
});
/**
 * StyleSheet for native-only properties that cannot be expressed via Tailwind.
 */
export const progressBarStyleSheet = StyleSheet.create({
  track: {
    borderCurve: 'continuous',
  },
});
