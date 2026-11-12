import type { StyleProp, ViewStyle } from 'react-native';
import type {
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from '../../helpers/internal/types/index.js';
/**
 * Unique identifier for a table row or column.
 */
type TableKey = string | number;
/**
 * Direction of an active column sort.
 */
type TableSortDirection = 'ascending' | 'descending';
/**
 * Describes the current sort state of the table: which column drives the
 * order and in which direction. The table never reorders data itself —
 * consumers sort their items and feed them back (controlled sorting, same
 * contract as the web Table / react-stately).
 */
type TableSortDescriptor = {
  /** Key of the column the table is sorted by. */
  column: TableKey;
  /** Direction the column is sorted in. */
  direction: TableSortDirection;
};
/**
 * Row selection behavior for the table.
 */
type TableSelectionMode = 'none' | 'single' | 'multiple';
/**
 * Registered layout/behavior definition of a header column. Cells resolve
 * their width from this registry (by column index) so header and body
 * columns stay aligned across separate flex rows.
 */
type TableColumnDef = {
  /** Column key (explicit `id` or the column index as fallback). */
  key: TableKey;
  /** Fixed column width in pixels. Wins over `flex`. */
  width?: number;
  /** Minimum column width in pixels (used with flexible columns). */
  minWidth?: number;
  /** Flex grow factor when no fixed `width` is set. @default 1 */
  flex?: number;
  /** Whether pressing the column header toggles sorting. */
  allowsSorting?: boolean;
};
/**
 * Root context value shared by every table primitive part.
 */
type TableRootContextValue = {
  /** Row selection behavior. */
  selectionMode: TableSelectionMode;
  /** Currently selected row keys. */
  selectedKeys: Set<TableKey>;
  /** Row keys that cannot be interacted with. */
  disabledKeys: Set<TableKey>;
  /** Whether the last selected row can be deselected. */
  disallowEmptySelection: boolean;
  /** Whether the given row key is currently selected. */
  isRowSelected: (key: TableKey) => boolean;
  /** Toggles selection of a row key according to the selection mode. */
  toggleRowSelection: (key: TableKey) => void;
  /** Selects all selectable rows, or clears the selection when all are selected. */
  toggleSelectAll: () => void;
  /** Whether every selectable row is selected (and at least one row exists). */
  isAllSelected: boolean;
  /** Whether at least one (but not every) selectable row is selected. */
  isSomeSelected: boolean;
  /** Active sort descriptor, if any. */
  sortDescriptor: TableSortDescriptor | undefined;
  /**
   * Toggles sorting by the given column key: same column flips direction,
   * a new column starts ascending.
   */
  sortByColumn: (columnKey: TableKey) => void;
  /** Registered column definitions, keyed by column index. */
  columns: Record<number, TableColumnDef>;
  /** Registers a header column definition at the given index. */
  registerColumn: (index: number, def: TableColumnDef) => void;
  /** Removes the header column definition at the given index. */
  unregisterColumn: (index: number) => void;
  /**
   * Replaces the full list of body row keys. Called by the body (which
   * knows every row, including virtualized ones that are not mounted) so
   * select-all can address rows that are currently off-screen.
   */
  setRowKeys: (keys: TableKey[]) => void;
};
/**
 * Per-column context (each `Column` provides this to its content).
 */
type TableColumnContextValue = {
  /** Column key (explicit `id` or the column index as fallback). */
  key: TableKey;
  /** Zero-based column position within the header row. */
  index: number;
  /** Whether this is the first column of the header row. */
  isFirst: boolean;
  /** Whether this is the last column of the header row. */
  isLast: boolean;
  /** Whether pressing this column toggles sorting. */
  allowsSorting: boolean;
  /** Whether this column drives the active sort. */
  isSorted: boolean;
  /** Direction of the active sort when `isSorted` is true. */
  sortDirection: TableSortDirection | undefined;
};
/**
 * Per-row context (each `Row` provides this to its cells).
 */
type TableRowContextValue = {
  /** Row key (explicit `id` or the row index as fallback). */
  key: TableKey;
  /** Zero-based row position within the body. */
  index: number;
  /** Whether this is the first body row. */
  isFirst: boolean;
  /** Whether this is the last body row. */
  isLast: boolean;
  /** Whether the row is currently selected. */
  isSelected: boolean;
  /** Whether the row is disabled (own prop or `disabledKeys`). */
  isDisabled: boolean;
  /** Whether the row is currently pressed. */
  isPressed: boolean;
};
type RootProps = SlottableViewProps & {
  children?: React.ReactNode;
  /**
   * Row selection behavior.
   * @default 'none'
   */
  selectionMode?: TableSelectionMode;
  /** Controlled selected row keys. */
  selectedKeys?: Iterable<TableKey>;
  /** Initially selected row keys (uncontrolled). */
  defaultSelectedKeys?: Iterable<TableKey>;
  /** Called with the new set of selected keys whenever selection changes. */
  onSelectionChange?: (keys: Set<TableKey>) => void;
  /** Row keys that cannot be selected or pressed. */
  disabledKeys?: Iterable<TableKey>;
  /**
   * When true, the last selected row cannot be deselected.
   * @default false
   */
  disallowEmptySelection?: boolean;
  /** Controlled sort descriptor. */
  sortDescriptor?: TableSortDescriptor;
  /** Initial sort descriptor (uncontrolled). */
  defaultSortDescriptor?: TableSortDescriptor;
  /** Called with the next descriptor when a sortable column is pressed. */
  onSortChange?: (descriptor: TableSortDescriptor) => void;
};
type RootRef = ViewRef;
/** Injected by the header when mapping `Column` children. */
type ColumnInjectedProps = {
  _columnIndex?: number;
  _isFirst?: boolean;
  _isLast?: boolean;
};
type HeaderProps = SlottableViewProps & {
  children?: React.ReactNode;
  /**
   * When true, Header does not clone children to inject column indices.
   * Use when a parent layer (e.g. the styled Table.Header) already injected
   * them for its own column part types.
   * @default false
   */
  skipInjectColumnIndices?: boolean;
};
type HeaderRef = ViewRef;
type ColumnProps = Omit<SlottablePressableProps, 'style'> & {
  children?: React.ReactNode;
  /**
   * Plain style object only (no Pressable style function): the column merges
   * its computed width style with the consumer style in an array.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Column key used by the sort descriptor and the width registry.
   * Falls back to the column index when omitted.
   */
  id?: TableKey;
  /** Fixed column width in pixels. Wins over `flex`. */
  width?: number;
  /** Minimum column width in pixels (used with flexible columns). */
  minWidth?: number;
  /**
   * Flex grow factor when no fixed `width` is set.
   * @default 1
   */
  flex?: number;
  /**
   * Whether pressing the column header toggles sorting.
   * @default false
   */
  allowsSorting?: boolean;
};
type ColumnRef = ViewRef;
/** Injected by the body when mapping `Row` children. */
type RowInjectedProps = {
  _index?: number;
  _isFirst?: boolean;
  _isLast?: boolean;
};
type RowProps = SlottablePressableProps & {
  children?: React.ReactNode;
  /**
   * Row key used by selection and `disabledKeys`.
   * Falls back to the row index when omitted.
   */
  id?: TableKey;
  /**
   * Whether the row is disabled regardless of `disabledKeys`.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * When true, Row does not clone children to inject cell column indices.
   * Use when a parent layer (e.g. the styled Table.Row) already injected
   * them for its own cell part types.
   * @default false
   */
  skipInjectCellIndices?: boolean;
};
type RowRef = ViewRef;
/** Injected by the row when mapping `Cell` children. */
type CellInjectedProps = {
  _columnIndex?: number;
  _isFirst?: boolean;
  _isLast?: boolean;
};
type CellProps = SlottableViewProps & {
  children?: React.ReactNode;
};
type CellRef = ViewRef;
export type {
  CellInjectedProps,
  CellProps,
  CellRef,
  ColumnInjectedProps,
  ColumnProps,
  ColumnRef,
  HeaderProps,
  HeaderRef,
  RootProps,
  RootRef,
  RowInjectedProps,
  RowProps,
  RowRef,
  TableColumnContextValue,
  TableColumnDef,
  TableKey,
  TableRootContextValue,
  TableRowContextValue,
  TableSelectionMode,
  TableSortDescriptor,
  TableSortDirection,
};
