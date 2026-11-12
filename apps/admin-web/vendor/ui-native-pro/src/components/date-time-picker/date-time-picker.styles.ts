import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root field container; spaces the label, trigger, and helper text.
 */
const root = tv({
  base: 'date-time-picker__root',
});
/**
 * Trigger border: fixed 1.5px width so layout does not shift between valid and invalid.
 * Invalid state uses semantic danger border (pairs with `FormField` / `isInvalid` on `DateTimePicker.Trigger`).
 */
const trigger = tv({
  base: 'date-time-picker__trigger',
  variants: {
    isInvalid: {
      true: 'date-time-picker__trigger--is-invalid',
      false: '',
    },
  },
  defaultVariants: {
    isInvalid: false,
  },
});
/**
 * Select overlay backdrop behind portaled content (dialog, bottom sheet, popover).
 */
const overlay = tv({
  base: 'date-time-picker__overlay',
});
/**
 * Wheel sizing inside the overlay surface: full width up to a 320px cap (wider
 * than the time picker to fit the date column), centered within the
 * `Select.Content` padding.
 */
const wheel = tv({
  base: 'date-time-picker__wheel',
});
/**
 * Combined class names for the `DateTimePicker` parts.
 */
export const dateTimePickerClassNames = combineStyles({
  root,
  trigger,
  overlay,
  wheel,
});
