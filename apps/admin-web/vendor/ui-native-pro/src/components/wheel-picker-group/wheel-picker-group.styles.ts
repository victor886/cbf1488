import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition. Outer viewport that lays out wheel columns
 * horizontally and clips the absolute overlays (indicator / mask) to its
 * bounds.
 */
const root = tv({
  base: 'wheel-picker-group__root',
  variants: {
    isDisabled: {
      true: 'wheel-picker-group__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * Indicator style definition.
 *
 * Slots:
 * - `wrapper` — absolutely-positioned band centered on the group viewport.
 * - `highlight` — filled rectangle rendered inside the wrapper.
 */
const indicator = tv({
  slots: {
    wrapper: 'wheel-picker-group__indicator-wrapper',
    highlight: 'wheel-picker-group__indicator-highlight',
  },
});
/**
 * Indicator background style definition.
 * Absolute-fill container rendered behind the highlight band's surface,
 * matching its border radius and clipping.
 */
const indicatorBackground = tv({
  base: 'wheel-picker-group__indicator-background',
});
/**
 * Mask style definition.
 *
 * Slots:
 * - `top` — top fade overlay.
 * - `bottom` — bottom fade overlay.
 */
const mask = tv({
  slots: {
    top: 'wheel-picker-group__mask-top',
    bottom: 'wheel-picker-group__mask-bottom',
  },
});
/**
 * Combined `tailwind-variants` slots for the wheel picker group root,
 * indicator, and mask.
 */
export const wheelPickerGroupClassNames = combineStyles({
  root,
  indicator,
  indicatorBackground,
  mask,
});
export const styleSheet = StyleSheet.create({
  indicatorHighlight: {
    borderCurve: 'continuous',
  },
});
/** Slot type for the indicator style definition. */
/** Slot type for the mask style definition. */

/** Slot type for the indicator style definition. */
export type WheelPickerGroupIndicatorSlots = keyof ReturnType<typeof indicator>;

/** Slot type for the mask style definition. */
export type WheelPickerGroupMaskSlots = keyof ReturnType<typeof mask>;
