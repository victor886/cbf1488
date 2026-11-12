import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root field container; spaces the label, trigger, and helper text.
 */
const root = tv({
  base: 'time-picker__root',
});
/**
 * Trigger border: fixed 1.5px width so layout does not shift between valid and invalid.
 * Invalid state uses semantic danger border (pairs with `FormField` / `isInvalid` on `TimePicker.Trigger`).
 */
const trigger = tv({
  base: 'time-picker__trigger',
  variants: {
    isInvalid: {
      true: 'time-picker__trigger--is-invalid',
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
  base: 'time-picker__overlay',
});
/**
 * Wheel sizing inside the overlay surface: full width up to a 240px cap,
 * centered within the `Select.Content` padding.
 */
const wheel = tv({
  base: 'time-picker__wheel',
});
/**
 * Combined class names for the `TimePicker` parts.
 */
export const timePickerClassNames = combineStyles({
  root,
  trigger,
  overlay,
  wheel,
});
