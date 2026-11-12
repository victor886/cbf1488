import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'date-range-picker__root',
});
/**
 * Trigger border: fixed 1.5px width so layout does not shift between valid and invalid.
 * Invalid state uses semantic danger border (pairs with `FormField` / `isInvalid` on `DateRangePicker.Trigger`).
 */
const trigger = tv({
  base: 'date-range-picker__trigger',
  variants: {
    isInvalid: {
      true: 'date-range-picker__trigger--is-invalid',
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
  base: 'date-range-picker__overlay',
});
export const dateRangePickerClassNames = combineStyles({
  root,
  trigger,
  overlay,
});
