import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'widget__root',
});
/**
 * Background style definition — absolute-fill container behind the widget
 * shell, hosting theme-specific layers (e.g. glass blur) or custom content
 * (gradients, images).
 */
const background = tv({
  base: 'widget__background',
});
const header = tv({
  base: 'widget__header',
});
const title = tv({
  base: 'widget__title',
});
const description = tv({
  base: 'widget__description',
});
const content = tv({
  base: 'widget__content',
});
const footer = tv({
  base: 'widget__footer',
});
const legend = tv({
  base: 'widget__legend',
});
/**
 * `LegendItem` is the only compound part that renders multiple elements
 * itself (wrapper > dot + label), so it owns a slotted `tv()` instance and
 * its props expose `classNames` / `styles` typed against these slots.
 */
const legendItem = tv({
  slots: {
    wrapper: 'widget__legend-item-wrapper',
    dot: 'widget__legend-item-dot',
    label: 'widget__legend-item-label',
  },
});
export const widgetClassNames = combineStyles({
  root,
  background,
  header,
  title,
  description,
  content,
  footer,
  legend,
  legendItem,
});
/** Slot keys for the {@link Widget.LegendItem} part. */
/**
 * Native-only style sheet for properties Tailwind cannot express. The
 * `borderCurve` entries apply iOS continuous (squircle) corner curves to
 * the outer shell and the elevated content card.
 */
export const widgetStyleSheet = StyleSheet.create({
  root: {
    borderCurve: 'continuous',
  },
  content: {
    borderCurve: 'continuous',
  },
});
export default widgetClassNames;

/** Slot keys for the {@link Widget.LegendItem} part. */
export type LegendItemSlots = keyof ReturnType<typeof legendItem>;
