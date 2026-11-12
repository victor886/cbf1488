// @ts-nocheck
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'combo-box__root',
});
/**
 * Overlay behind the portaled popover content. Transparent by default so the
 * input group stays visible while the popover is open; it still dismisses
 * the popover when pressed.
 */
const overlay = tv({
  base: 'combo-box__overlay',
});
/**
 * Selected labels display (primarily used in multiple mode).
 */
const value = tv({
  base: 'combo-box__value',
});
/**
 * Clear button inside the input group suffix, before the trigger indicator.
 */
const clearButton = tv({
  base: 'combo-box__clear-button',
});
/**
 * Scrollable list container for items (max height set in CSS).
 */
const list = tv({
  base: 'combo-box__list',
});
const item = tv({
  base: 'combo-box__item',
});
/**
 * Empty fallback shown when no item matches the input text. Renders two
 * elements within one part: a centered container and a muted text.
 */
const empty = tv({
  slots: {
    container: 'combo-box__empty',
    text: 'combo-box__empty-text',
  },
});
export const comboBoxClassNames = combineStyles({
  root,
  overlay,
  value,
  clearButton,
  list,
  item,
  empty,
});
