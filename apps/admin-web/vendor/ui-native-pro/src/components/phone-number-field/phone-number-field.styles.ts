// @ts-nocheck
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'phone-number-field__root',
});
/**
 * Prefix container hosting the country picker trigger next to the phone input.
 */
const prefix = tv({
  base: 'phone-number-field__prefix',
});
/**
 * Country picker trigger — flag emoji and dial code laid out in a row.
 */
const trigger = tv({
  slots: {
    base: 'phone-number-field__trigger',
    flag: 'phone-number-field__trigger-flag',
    dialCode: 'phone-number-field__trigger-dial-code',
  },
});
/**
 * Select overlay backdrop behind the portaled country picker dialog.
 */
const overlay = tv({
  base: 'phone-number-field__overlay',
});
/**
 * Wrapper filling the portal behind the picker surface. Overrides the
 * centering of the `Select` dialog wrapper so the surface starts at the top,
 * clear of the keyboard the focused search input brings up.
 */
const contentWrapper = tv({
  base: 'phone-number-field__content-wrapper',
});
/**
 * Drag handle bar signaling that the dialog content is swipeable to dismiss.
 */
const contentHandle = tv({
  base: 'phone-number-field__content-handle',
});
/**
 * Container for the `SearchField` filtering the country list inside the picker surface.
 */
const searchInput = tv({
  base: 'phone-number-field__search-input',
});
/**
 * Country list container plus its empty fallback — a centered container and a
 * muted text rendered when the search query matches no countries.
 */
const countryList = tv({
  slots: {
    base: 'phone-number-field__country-list',
    empty: 'phone-number-field__country-list-empty',
    emptyText: 'phone-number-field__country-list-empty-text',
  },
});
/**
 * A single country row — flag, dial code, and country name.
 */
const countryItem = tv({
  slots: {
    flag: 'phone-number-field__country-item-flag',
    dialCode: 'phone-number-field__country-item-dial-code',
    name: 'phone-number-field__country-item-name',
  },
});
export const phoneNumberFieldClassNames = combineStyles({
  root,
  prefix,
  trigger,
  overlay,
  contentWrapper,
  contentHandle,
  searchInput,
  countryList,
  countryItem,
});
