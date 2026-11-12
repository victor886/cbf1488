import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition for {@link WheelDateTimePicker} — the group container.
 * The indicator, mask, and period column own their own styling via the
 * corresponding subcomponents / underlying primitives.
 */
const root = tv({
  base: 'wheel-date-time-picker__root',
});
/**
 * Date column style. The `container` slot claims a `2`-unit flex weight so the
 * day track occupies 40% of the row against the `1`-unit time tracks
 * (2:1:1:1 → 40% / 20% / 20% / 20%). The `itemLabel` slot keeps the label
 * compact so longer day labels (e.g. `"Wed, Jun 3"`) stay legible while
 * scrolling.
 */
const date = tv({
  slots: {
    container: 'wheel-date-time-picker__date-container',
    itemLabel: 'wheel-date-time-picker__date-item-label',
  },
});
/**
 * Hour column style. The `container` slot claims a single flex unit (20% of
 * the row). The `itemLabel` slot keeps the numerals tabular so digits occupy a
 * constant width while scrolling.
 */
const hour = tv({
  slots: {
    container: 'wheel-date-time-picker__hour-container',
    itemLabel: 'wheel-date-time-picker__hour-item-label',
  },
});
/**
 * Minute column style. The `container` slot claims a single flex unit (20% of
 * the row). The `itemLabel` slot keeps the numerals tabular so digits occupy a
 * constant width while scrolling.
 */
const minute = tv({
  slots: {
    container: 'wheel-date-time-picker__minute-container',
    itemLabel: 'wheel-date-time-picker__minute-item-label',
  },
});
/**
 * Period (AM/PM) column style. The `container` slot claims a single flex unit
 * (20% of the row) so it lines up with the hour and minute tracks.
 */
const period = tv({
  slots: {
    container: 'wheel-date-time-picker__period-container',
  },
});
/**
 * Combined class name definitions for every {@link WheelDateTimePicker} part.
 */
export const wheelDateTimePickerClassNames = combineStyles({
  root,
  date,
  hour,
  minute,
  period,
});
/** Slot type for the {@link WheelDateTimePicker.Date} style definition. */
/** Slot type for the {@link WheelDateTimePicker.Hour} style definition. */
/** Slot type for the {@link WheelDateTimePicker.Minute} style definition. */
/** Slot type for the {@link WheelDateTimePicker.Period} style definition. */

/** Slot type for the {@link WheelDateTimePicker.Date} style definition. */
export type WheelDateTimePickerDateSlots = keyof ReturnType<typeof date>;

/** Slot type for the {@link WheelDateTimePicker.Hour} style definition. */
export type WheelDateTimePickerHourSlots = keyof ReturnType<typeof hour>;

/** Slot type for the {@link WheelDateTimePicker.Minute} style definition. */
export type WheelDateTimePickerMinuteSlots = keyof ReturnType<typeof minute>;

/** Slot type for the {@link WheelDateTimePicker.Period} style definition. */
export type WheelDateTimePickerPeriodSlots = keyof ReturnType<typeof period>;
