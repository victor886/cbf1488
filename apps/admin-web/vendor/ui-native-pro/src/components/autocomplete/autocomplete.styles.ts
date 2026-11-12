// @ts-nocheck
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'autocomplete__root',
});
/**
 * Trigger border: fixed 1.5px width so layout does not shift between valid and
 * invalid states. Invalid state uses the semantic danger border (pairs with
 * `FormField` / `isInvalid` on `Autocomplete.Trigger`).
 */
const trigger = tv({
  base: 'autocomplete__trigger',
  variants: {
    isInvalid: {
      true: 'autocomplete__trigger--is-invalid',
      false: '',
    },
  },
  defaultVariants: {
    isInvalid: false,
  },
});
/**
 * Select overlay backdrop behind portaled content. Tinted for the dialog and
 * bottom-sheet presentations; transparent for popovers (kept mounted for
 * tap-outside dismissal only).
 */
const overlay = tv({
  base: 'autocomplete__overlay',
  variants: {
    presentation: {
      'popover': 'autocomplete__overlay--presentation-popover',
      'bottom-sheet': '',
      'dialog': '',
    },
  },
  defaultVariants: {
    presentation: 'popover',
  },
});
/**
 * Clear button inside the trigger row, between the value and the indicator.
 */
const clearButton = tv({
  base: 'autocomplete__clear-button',
});
/**
 * Search field rendered at the top of the content, above the item list.
 */
const searchField = tv({
  base: 'autocomplete__search-field',
});
/**
 * Scrollable list container for items (max height set in CSS).
 */
const list = tv({
  base: 'autocomplete__list',
});
const item = tv({
  base: 'autocomplete__item',
});
/**
 * Empty fallback shown when no item matches the search text. Renders two
 * elements within one part: a centered container and a muted text.
 */
const empty = tv({
  slots: {
    container: 'autocomplete__empty',
    text: 'autocomplete__empty-text',
  },
});
export const autocompleteClassNames = combineStyles({
  root,
  trigger,
  overlay,
  clearButton,
  searchField,
  list,
  item,
  empty,
});
