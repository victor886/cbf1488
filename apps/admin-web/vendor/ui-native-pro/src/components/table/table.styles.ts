// @ts-nocheck
import { StyleSheet } from 'react-native';
import { cn } from 'heroui-native/utils';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'table__root',
  variants: {
    variant: {
      primary: 'table__root--variant-primary',
      secondary: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
/**
 * Background style definition — absolute-fill container behind the table
 * shell, hosting theme-specific layers (e.g. glass blur) or custom content.
 */
const background = tv({
  base: 'table__background',
});
const scrollContainer = tv({
  slots: {
    container: 'table__scroll-container',
    contentContainer: 'table__scroll-content',
  },
});
const content = tv({
  base: 'table__content',
});
const header = tv({
  base: 'table__header',
});
/**
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The `indicator` slot animates the following:
 * - `opacity` - Animated for indicator visibility (visible only on the
 *   column driving the active sort)
 * - `transform` (rotate) - Animated for the ascending/descending flip
 *
 * To customize, use the `animation` prop on `Table.Column`. To disable
 * animated styles, set `isAnimatedStyleActive={false}`.
 *
 * @note The `data-[...]:` prefixed utilities on the secondary container stay
 * here: data selectors are Tailwind variants and cannot be applied to custom
 * CSS classes. Plain base styles live in `styles/components/table.css`.
 *
 * @note The secondary header band rounds its outer corners on the first/last
 * column. The corners are direction-aware (rows flip in RTL), written as
 * arbitrary `border-{top,bottom}-{start,end}-radius` properties (React
 * Native's older logical corner set) because the alternatives break on
 * Android: physical `rounded-l/r-*` with `rtl:` overrides double-flip there,
 * and the W3C `border-start-start-radius` family hits an Android
 * `BorderRadiusStyle.resolve` bug that drops two corners.
 */
const column = tv({
  slots: {
    container: 'table__column',
    label: 'table__column-label',
    indicator: 'table__sort-indicator',
    separator: 'table__column-separator',
  },
  variants: {
    variant: {
      primary: {},
      secondary: {
        container: cn(
          'table__column--variant-secondary',
          'data-[first=true]:[border-top-start-radius:var(--radius-2xl)]',
          'data-[first=true]:[border-bottom-start-radius:var(--radius-2xl)]',
          'data-[last=true]:[border-top-end-radius:var(--radius-2xl)]',
          'data-[last=true]:[border-bottom-end-radius:var(--radius-2xl)]'
        ),
      },
    },
    isSorted: {
      true: {
        label: 'table__column-label--is-sorted',
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'primary',
    isSorted: false,
  },
});
const body = tv({
  slots: {
    container: 'table__body',
    empty: 'table__empty',
  },
  variants: {
    variant: {
      primary: {
        container: 'table__body--variant-primary',
      },
      secondary: {},
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
const row = tv({
  base: 'table__row',
  variants: {
    variant: {
      primary: 'table__row--variant-primary',
      secondary: 'table__row--variant-secondary',
    },
    isSelected: {
      true: '',
      false: '',
    },
    isPressed: {
      true: '',
      false: '',
    },
    isDisabled: {
      true: 'table__row--is-disabled',
      false: '',
    },
    isLast: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'primary',
      isLast: true,
      className: 'table__row--variant-primary--is-last',
    },
    {
      variant: 'primary',
      isPressed: true,
      className: 'table__row--variant-primary--is-pressed',
    },
    {
      variant: 'primary',
      isSelected: true,
      className: 'table__row--variant-primary--is-selected',
    },
    {
      variant: 'secondary',
      isPressed: true,
      className: 'table__row--variant-secondary--is-pressed',
    },
    {
      variant: 'secondary',
      isSelected: true,
      className: 'table__row--variant-secondary--is-selected',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    isSelected: false,
    isPressed: false,
    isDisabled: false,
    isLast: false,
  },
});
const cell = tv({
  slots: {
    container: 'table__cell',
    text: 'table__cell-text',
  },
});
/**
 * Modifier composed on top of the `column` container (select-all header
 * cell) or the `cell` container (row selection cell) — centers the checkbox
 * inside the fixed-width selection column.
 */
const selectionCell = tv({
  base: 'table__selection-cell',
});
/**
 * Preset applied to the underlying heroui-native `Checkbox` root — shrinks
 * it to the table's compact 20pt size.
 */
const selectionCheckbox = tv({
  base: 'table__selection-checkbox',
});
const footer = tv({
  base: 'table__footer',
});
export const tableClassNames = combineStyles({
  root,
  background,
  scrollContainer,
  content,
  header,
  column,
  body,
  row,
  cell,
  selectionCell,
  selectionCheckbox,
  footer,
});
/** Slot keys for the {@link Table.ScrollContainer} part. */
/** Slot keys for the {@link Table.Column} part. */
/** Slot keys for the {@link Table.Body} part. */
/** Slot keys for the {@link Table.Cell} part. */
/**
 * Native-only style sheet for properties Tailwind cannot express. The
 * `borderCurve` entries apply iOS continuous (squircle) corner curves to
 * the outer shell and the elevated body card.
 */
export const tableStyleSheet = StyleSheet.create({
  root: {
    borderCurve: 'continuous',
  },
  body: {
    borderCurve: 'continuous',
  },
  /**
   * Applied by `Table.Content` for the single frame before the scroll
   * viewport measurement arrives, so the unpinned flex layout (cell content
   * at content-driven positions) is never painted.
   */
  contentAwaitingViewport: {
    opacity: 0,
  },
});
export default tableClassNames;
