import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'date-field__root',
});
/**
 * Calendar trigger icon slot — default surface behind the icon in the suffix.
 */
const triggerIndicator = tv({
  base: 'date-field__trigger-indicator',
});
/**
 * Select overlay backdrop behind portaled calendar content (dialog, bottom sheet, popover).
 */
const overlay = tv({
  base: 'date-field__overlay',
});
export const dateFieldClassNames = combineStyles({
  root,
  triggerIndicator,
  overlay,
});
