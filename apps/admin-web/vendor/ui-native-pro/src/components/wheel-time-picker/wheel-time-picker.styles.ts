import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition for {@link WheelTimePicker} — the group container.
 * The indicator, mask, and period column own their own styling via the
 * corresponding subcomponents / underlying primitives.
 */
const root = tv({
  base: '',
});
/**
 * Hour column style. The `itemLabel` slot keeps the numerals tabular so digits
 * occupy a constant width while scrolling.
 */
const hour = tv({
  slots: {
    itemLabel: 'wheel-time-picker__hour-item-label',
  },
});
/**
 * Minute column style. The `itemLabel` slot keeps the numerals tabular so
 * digits occupy a constant width while scrolling.
 */
const minute = tv({
  slots: {
    itemLabel: 'wheel-time-picker__minute-item-label',
  },
});
/**
 * Combined class name definitions for every {@link WheelTimePicker} part.
 */
export const wheelTimePickerClassNames = combineStyles({
  root,
  hour,
  minute,
});
/** Slot type for the {@link WheelTimePicker.Hour} style definition. */
/** Slot type for the {@link WheelTimePicker.Minute} style definition. */

/** Slot type for the {@link WheelTimePicker.Hour} style definition. */
export type WheelTimePickerHourSlots = keyof ReturnType<typeof hour>;

/** Slot type for the {@link WheelTimePicker.Minute} style definition. */
export type WheelTimePickerMinuteSlots = keyof ReturnType<typeof minute>;
