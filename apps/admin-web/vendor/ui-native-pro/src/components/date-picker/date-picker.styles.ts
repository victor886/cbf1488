import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'date-picker__root',
});
/**
 * Trigger border: fixed 1.5px width so layout does not shift between valid and invalid.
 * Invalid state uses semantic danger border (pairs with `FormField` / `isInvalid` on `DatePicker.Trigger`).
 */
const trigger = tv({
  base: 'date-picker__trigger',
  variants: {
    isInvalid: {
      true: 'date-picker__trigger--is-invalid',
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
  base: 'date-picker__overlay',
});
export const datePickerClassNames = combineStyles({
  root,
  trigger,
  overlay,
});
