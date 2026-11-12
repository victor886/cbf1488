import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition.
 *
 * Slots:
 * - `container` — outer viewport wrapping the FlatList and overlays.
 * - `contentContainer` — FlatList `contentContainerStyle` carrier; receives
 *   the vertical centering padding (computed at runtime from
 *   `itemHeight` and `visibleCount`).
 * - `item` — per-row animated container.
 * - `itemLabel` — default label text inside a row.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The `item` slot animates:
 * - `opacity` - Distance-based fade
 * - `transform` (scale) - Distance-based scale
 *
 * The `itemLabel` slot animates `color` via `interpolateColor`. Defaults
 * to theme `[foreground, accent-soft-foreground]`; override with
 * `animation.labelColor` on the root.
 *
 * To customize the animation ranges, use the `animation` prop on `WheelPicker`:
 * ```tsx
 * <WheelPicker
 *   animation={{
 *     opacity: { value: [0.1, 1] },
 *     scale: { value: [0.7, 1] },
 *     labelColor: { value: ['#888', '#000'] },
 *   }}
 * />
 * ```
 *
 * To disable animated styles entirely, set `animation="disabled"` on the root.
 */
const root = tv({
  slots: {
    container: 'wheel-picker__container',
    contentContainer: '',
    item: 'wheel-picker__item',
    itemLabel: 'wheel-picker__item-label',
  },
  variants: {
    isDisabled: {
      true: {
        container: 'wheel-picker__container--is-disabled',
      },
      false: {},
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
 * - `wrapper` — absolutely-positioned band centered on the wheel viewport.
 * - `highlight` — filled rectangle rendered inside the wrapper.
 */
const indicator = tv({
  slots: {
    wrapper: 'wheel-picker__indicator-wrapper',
    highlight: 'wheel-picker__indicator-highlight',
  },
});
/**
 * Indicator background style definition.
 * Absolute-fill container rendered behind the highlight band's surface,
 * matching its border radius and clipping.
 */
const indicatorBackground = tv({
  base: 'wheel-picker__indicator-background',
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
    top: 'wheel-picker__mask-top',
    bottom: 'wheel-picker__mask-bottom',
  },
});
/**
 * Combined `tailwind-variants` slots for the wheel picker root, indicator, and mask.
 */
export const wheelPickerClassNames = combineStyles({
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
/** Slot type for the root style definition. */
/** Slot type for the indicator style definition. */
/** Slot type for the mask style definition. */

/** Slot type for the root style definition. */
export type WheelPickerRootSlots = keyof ReturnType<typeof root>;

/** Slot type for the indicator style definition. */
export type WheelPickerIndicatorSlots = keyof ReturnType<typeof indicator>;

/** Slot type for the mask style definition. */
export type WheelPickerMaskSlots = keyof ReturnType<typeof mask>;
