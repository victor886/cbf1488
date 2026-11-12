// @ts-nocheck
import type { ReactElement, ReactNode, Ref } from 'react';
import type {
  FlatListProps,
  ScrollView,
  ScrollViewProps,
  TextProps,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native';
import type { WithTimingConfig } from 'react-native-reanimated';
import type { CheckboxProps } from 'heroui-native';
import type {
  Animation,
  AnimationRootDisableAll,
  AnimationValue,
  ElementSlots,
  ViewRef,
} from '../../helpers/internal/types/index.js';
import type * as TablePrimitivesTypes from '../../primitives/table/table.types.js';
import type { BodySlots, CellSlots, ColumnSlots } from './table.styles.js';
/**
 * Visual variant of the table.
 * - `"primary"`: gray shell with the body as an elevated white card inside.
 * - `"secondary"`: flat root with a rounded header band and transparent,
 *   border-separated body rows.
 */
export type TableVariant = 'primary' | 'secondary';
/**
 * Animation configuration for the {@link Table} root component.
 *
 * The table root owns no animated styles of its own; the prop only exists
 * so consumers can cascade `disable-all` to animated descendants (the sort
 * indicator, checkboxes, custom cell content).
 *
 * - `"disable-all"`: disable all animations including children (cascades
 *   to all descendants via `AnimationSettingsProvider`).
 * - `undefined`: use default animations.
 */
export type TableRootAnimation = AnimationRootDisableAll;
/**
 * Animation configuration for a {@link Table.Column}'s sort indicator.
 */
export type TableColumnAnimation = Animation<{
  /**
   * Rotation of the indicator chevron in degrees for
   * `[ascending, descending]`.
   */
  rotation?: AnimationValue<{
    /**
     * Rotation values `[ascending, descending]` in degrees.
     * @default [0, 180]
     */
    value?: [number, number];
    /** Animation timing configuration. */
    timingConfig?: WithTimingConfig;
  }>;
  /**
   * Opacity of the indicator for `[hidden, visible]` — the indicator is
   * visible only on the column driving the active sort.
   */
  opacity?: AnimationValue<{
    /**
     * Opacity values `[hidden, visible]`.
     * @default [0, 1]
     */
    value?: [number, number];
    /** Animation timing configuration. */
    timingConfig?: WithTimingConfig;
  }>;
}>;
/**
 * Shared context value provided by the {@link Table} root to all styled
 * compound parts.
 */
export interface TableContextValue {
  /** Active visual variant. */
  variant: TableVariant;
}
/**
 * Props for the {@link Table} root component.
 *
 * Owns the selection and sorting state (via the table primitives), the
 * visual variant, and the animation cascade. Compose
 * `Table.ScrollContainer` > `Table.Content` > `Table.Header` + `Table.Body`
 * inside, with an optional `Table.Footer` below.
 */
export interface TableRootProps extends Omit<TablePrimitivesTypes.RootProps, 'asChild'> {
  /** Compound parts rendered inside the table shell. */
  children?: ReactNode;
  /**
   * Visual variant of the table.
   * @default "primary"
   */
  variant?: TableVariant;
  /**
   * Additional CSS classes for the outer shell.
   */
  className?: string;
  /**
   * Animation configuration for the table root.
   * - `"disable-all"`: disable all animations including children (cascades
   *   down to all child components placed inside the table).
   * - `undefined`: use default animations.
   */
  animation?: TableRootAnimation;
  /**
   * Background layer rendered behind the table shell.
   * - `undefined` (default): renders `Table.Background` when the active
   *   library theme registers default background content (e.g. `glass`);
   *   otherwise no layer
   * - custom node: replaces the default layer entirely (wrap content in
   *   `Table.Background` to keep the absolute-fill and clipping)
   * - `null`: removes the background layer
   */
  background?: ReactNode;
}
/** Imperative ref type for the {@link Table} root element. */
export type TableRootRef = TablePrimitivesTypes.RootRef;
/**
 * Props for the {@link Table.Background} sub-component.
 * Generic absolute-fill container behind the table shell. When no
 * `children` are given, the active library theme decides the default
 * content (e.g. a frosted-glass blur layer when the theme is `glass`).
 */
export type TableBackgroundProps = ViewProps & {
  /** Additional CSS classes. */
  className?: string;
};
/** Imperative ref type for the {@link Table.Background} element. */
export type TableBackgroundRef = ViewRef;
/**
 * Props for the {@link Table.ScrollContainer} part.
 *
 * Horizontal `ScrollView` letting wide tables scroll while the shell and
 * footer keep the available width. The content container stretches to at
 * least the viewport width so flexible columns share the remaining space.
 */
export interface TableScrollContainerProps extends ScrollViewProps {
  /** Header and body content (typically `Table.Content`). */
  children?: ReactNode;
  /** Additional CSS classes for the scroll view. */
  className?: string;
  /** Additional CSS classes for the scroll content container. */
  contentContainerClassName?: string;
}
/** Imperative ref type for the {@link Table.ScrollContainer} element. */
export type TableScrollContainerRef = ScrollView;
/**
 * Props for the {@link Table.Content} part.
 *
 * Vertical column hosting the header row and the body. Grows to fill the
 * scroll container's content width.
 */
export interface TableContentProps extends ViewProps {
  /** Header and body parts. */
  children?: ReactNode;
  /** Additional CSS classes for the content column. */
  className?: string;
}
/** Imperative ref type for the {@link Table.Content} element. */
export type TableContentRef = ViewRef;
/**
 * Props for the {@link Table.Header} part.
 *
 * Horizontal row hosting `Table.Column` (and optionally
 * `Table.SelectAllCell`) parts. Injects column indices so cells align with
 * their columns.
 */
export interface TableHeaderProps extends Omit<
  TablePrimitivesTypes.HeaderProps,
  'skipInjectColumnIndices'
> {
  /** Column parts. */
  children?: ReactNode;
  /** Additional CSS classes for the header row. */
  className?: string;
}
/** Imperative ref type for the {@link Table.Header} element. */
export type TableHeaderRef = TablePrimitivesTypes.HeaderRef;
/**
 * Per-slot inline style overrides for {@link Table.Column}.
 *
 * Defined as an explicit object (rather than `Partial<Record<...>>`)
 * because the slots mix `View` (`container`, `indicator`, `separator`) and
 * `Text` (`label`), each requiring its own RN style type.
 */
export interface TableColumnStyles {
  /** Column pressable container. */
  container?: ViewStyle;
  /** Column label text. */
  label?: TextStyle;
  /** Sort indicator wrapper. */
  indicator?: ViewStyle;
  /** Trailing vertical separator line. */
  separator?: ViewStyle;
}
/**
 * Props for the {@link Table.Column} part.
 *
 * A header cell. Declares the column's width behavior (fixed `width` or
 * flexible `flex` + `minWidth`) — body cells resolve their width from it by
 * position. With `allowsSorting`, pressing the column toggles the sort
 * descriptor and a chevron indicator reflects the active direction.
 */
export interface TableColumnProps extends Omit<TablePrimitivesTypes.ColumnProps, 'children'> {
  /**
   * Column label. Plain string/number children are wrapped in a styled
   * `Text` automatically; ReactNodes render as-is.
   */
  children?: ReactNode;
  /** Additional CSS classes for the column container. */
  className?: string;
  /**
   * Additional CSS classes for individual slots of the column.
   *
   * @note The `indicator` slot has the following animated style properties
   * that cannot be set via className:
   * - `opacity` - Animated for indicator visibility
   * - `transform` (rotate) - Animated for the sort direction flip
   *
   * To customize, use the `animation` prop. To disable animated styles, set
   * `isAnimatedStyleActive={false}`.
   */
  classNames?: ElementSlots<ColumnSlots>;
  /** Inline style overrides for individual slots of the column. */
  styles?: TableColumnStyles;
  /**
   * Custom sort indicator node replacing the default chevron. Rendered only
   * on sortable columns; receives the animated wrapper (opacity/rotation).
   */
  indicator?: ReactNode;
  /**
   * Additional props forwarded to the inner label `Text` element (only when
   * children are plain strings/numbers).
   */
  textProps?: TextProps;
  /** Animation configuration for the sort indicator. */
  animation?: TableColumnAnimation;
  /**
   * When `false`, animated styles are not applied to the sort indicator.
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/** Imperative ref type for the {@link Table.Column} element. */
export type TableColumnRef = TablePrimitivesTypes.ColumnRef;
/**
 * Props for the {@link Table.Body} part.
 *
 * Hosts the body rows. Supports three input shapes:
 * - static `Table.Row` children (like the web default);
 * - dynamic collections: `items` plus a `children` render function;
 * - `virtualized`: `items` render through a `FlatList` (requires the render
 *   function form of `children` and a bounded height on the body).
 */
export interface TableBodyProps<TItem> extends Omit<ViewProps, 'children'> {
  /**
   * Ref to the body container. Declared as a regular prop because the body
   * is a generic function component (React 19 forwards `ref` as a prop).
   */
  ref?: Ref<TableBodyRef>;
  /**
   * Static `Table.Row` elements, or a render function `(item, index)`
   * producing a `Table.Row` when `items` is provided.
   */
  children?: ReactNode | ((item: TItem, index: number) => ReactElement);
  /** Dynamic collection rendered through the `children` render function. */
  items?: readonly TItem[];
  /**
   * Resolves the row key for an item. Should match the `id` passed to the
   * rendered `Table.Row`. Falls back to the row's `id` prop (non-virtualized)
   * or the item index.
   */
  keyExtractor?: (item: TItem, index: number) => TablePrimitivesTypes.TableKey;
  /**
   * When true, rows render through a vertical `FlatList` instead of plain
   * views. Requires `items` with the render function form of `children`,
   * and a bounded height (e.g. a `h-*` class) on the body.
   * @default false
   */
  virtualized?: boolean;
  /** Rendered centered inside the body when there are no rows. */
  renderEmptyState?: () => ReactNode;
  /** Additional CSS classes for the body container. */
  className?: string;
  /** Additional CSS classes for individual slots of the body. */
  classNames?: ElementSlots<BodySlots>;
  /** Inline style overrides for individual slots of the body. */
  styles?: Partial<Record<BodySlots, ViewStyle>>;
  /**
   * Additional props forwarded to the `FlatList` when `virtualized` is
   * enabled (e.g. `initialNumToRender`, `getItemLayout`).
   */
  flatListProps?: Omit<FlatListProps<TItem>, 'data' | 'renderItem' | 'keyExtractor'>;
}
/** Imperative ref type for the {@link Table.Body} element. */
export type TableBodyRef = ViewRef;
/**
 * Props for the {@link Table.Row} part.
 *
 * A body row. When the table's `selectionMode` is not `"none"`, pressing
 * the row toggles its selection; `disabledKeys` / `isDisabled` block
 * interaction and dim the row.
 */
export interface TableRowProps extends Omit<
  TablePrimitivesTypes.RowProps,
  'skipInjectCellIndices'
> {
  /** Cell parts. */
  children?: ReactNode;
  /** Additional CSS classes for the row. */
  className?: string;
}
/** Imperative ref type for the {@link Table.Row} element. */
export type TableRowRef = TablePrimitivesTypes.RowRef;
/**
 * Per-slot inline style overrides for {@link Table.Cell}.
 *
 * Defined as an explicit object (rather than `Partial<Record<...>>`)
 * because the slots mix `View` (`container`) and `Text` (`text`).
 */
export interface TableCellStyles {
  /** Cell container. */
  container?: ViewStyle;
  /** Cell text (only when children are plain strings/numbers). */
  text?: TextStyle;
}
/**
 * Props for the {@link Table.Cell} part.
 *
 * A body cell. Resolves its width from the header column at the same
 * position. Plain string/number children are wrapped in a styled `Text`.
 */
export interface TableCellProps extends Omit<TablePrimitivesTypes.CellProps, 'children'> {
  /**
   * Cell content. Plain string/number children are wrapped in a styled
   * `Text` automatically; ReactNodes render as-is.
   */
  children?: ReactNode;
  /** Additional CSS classes for the cell container. */
  className?: string;
  /** Additional CSS classes for individual slots of the cell. */
  classNames?: ElementSlots<CellSlots>;
  /** Inline style overrides for individual slots of the cell. */
  styles?: TableCellStyles;
  /**
   * Additional props forwarded to the inner `Text` element (only when
   * children are plain strings/numbers).
   */
  textProps?: TextProps;
}
/** Imperative ref type for the {@link Table.Cell} element. */
export type TableCellRef = TablePrimitivesTypes.CellRef;
/**
 * Props forwarded to the checkbox rendered by {@link Table.SelectAllCell}
 * and {@link Table.SelectionCell}. Selection state and change handling are
 * owned by the table.
 *
 * The table renders the checkboxes at a compact 20pt size with a reduced
 * corner radius and a proportionally smaller check icon. The header
 * select-all checkbox defaults to the `primary` variant, the row selection
 * checkboxes to `secondary` — all defaults can be overridden here via
 * `variant` / `className` / `children`.
 */
export type TableSelectionCheckboxProps = Omit<
  CheckboxProps,
  'isSelected' | 'onSelectedChange' | 'isDisabled'
>;
/**
 * Props for the {@link Table.SelectAllCell} part.
 *
 * Header cell rendering a select-all checkbox for `selectionMode="multiple"`
 * tables. Registers a fixed-width selection column; pair it with a
 * `Table.SelectionCell` at the same position in every row.
 */
export interface TableSelectAllCellProps extends ViewProps {
  /** Additional CSS classes for the cell container. */
  className?: string;
  /**
   * Fixed width of the selection column in pixels.
   * @default 48
   */
  width?: number;
  /** Additional props forwarded to the select-all checkbox. */
  checkboxProps?: TableSelectionCheckboxProps;
}
/** Imperative ref type for the {@link Table.SelectAllCell} element. */
export type TableSelectAllCellRef = TablePrimitivesTypes.ColumnRef;
/**
 * Props for the {@link Table.SelectionCell} part.
 *
 * Body cell rendering a checkbox bound to the row's selection state.
 */
export interface TableSelectionCellProps extends ViewProps {
  /** Additional CSS classes for the cell container. */
  className?: string;
  /** Additional props forwarded to the row selection checkbox. */
  checkboxProps?: TableSelectionCheckboxProps;
}
/** Imperative ref type for the {@link Table.SelectionCell} element. */
export type TableSelectionCellRef = TablePrimitivesTypes.CellRef;
/**
 * Props for the {@link Table.Footer} part.
 *
 * Row below the table content (outside the horizontal scroll area),
 * typically hosting load-more actions or summary text.
 */
export interface TableFooterProps extends ViewProps {
  /** Footer content. */
  children?: ReactNode;
  /** Additional CSS classes for the footer row. */
  className?: string;
}
/** Imperative ref type for the {@link Table.Footer} element. */
export type TableFooterRef = ViewRef;
export type {
  TableKey,
  TableSelectionMode,
  TableSortDescriptor,
  TableSortDirection,
} from '../../primitives/table/table.types.js';
