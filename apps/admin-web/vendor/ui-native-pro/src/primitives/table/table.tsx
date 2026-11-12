// @ts-nocheck
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Pressable, View } from 'react-native';
import { useControllableState } from '../../helpers/internal/hooks/index';
import * as Slot from '../slot/index';
// --------------------------------------------------
const TableRootContext = createContext(null);
const TableColumnContext = createContext(null);
const TableRowContext = createContext(null);
/**
 * Border-box width of the enclosing header/body row. Cells and columns
 * derive their explicit widths from it (see {@link getColumnWidthStyle});
 * `undefined` until known.
 *
 * A parent layer (the styled `Table.Content`) can seed this with its own
 * computed width via {@link RowLayoutProvider} so every row lays out
 * correctly in the same commit, before its own `onLayout` fires — the
 * per-row measurement then only refines the value when a theme border
 * actually changes the row's geometry. Without the seed, rows would settle
 * one by one as their measurements arrive, visibly shifting cell content.
 */
const TableRowLayoutContext = createContext(undefined);
/**
 * Provider used by parent layers to seed {@link TableRowLayoutContext} with
 * a computed row width (see the context JSDoc above).
 */
const RowLayoutProvider = TableRowLayoutContext.Provider;
function useRootContext() {
  const ctx = useContext(TableRootContext);
  if (!ctx) {
    throw new Error('Table primitive compound components must be used within Table.Root');
  }
  return ctx;
}
function useColumnContext() {
  const ctx = useContext(TableColumnContext);
  if (!ctx) {
    throw new Error('Table primitive column subcomponents must be used within Table.Column');
  }
  return ctx;
}
function useRowContext() {
  const ctx = useContext(TableRowContext);
  if (!ctx) {
    throw new Error('Table primitive cell subcomponents must be used within Table.Row');
  }
  return ctx;
}
// --------------------------------------------------
/**
 * Normalizes an optional iterable of keys into a stable `Set`, preserving
 * `undefined` so `useControllableState` can distinguish controlled from
 * uncontrolled usage.
 */
function useKeySet(keys) {
  return useMemo(() => (keys === undefined ? undefined : new Set(keys)), [keys]);
}
/**
 * Resolves the inline width style for a header column or body cell.
 *
 * Fixed columns get their explicit `width`. Flexible columns split the row
 * width remaining after fixed columns proportionally to their `flex`
 * factors, computed from the measured row width — flex-based distribution
 * is deliberately avoided because it drifts with content width (auto flex
 * basis), which would desync body cells from their header columns. Until
 * the first row layout pass, flexible columns fall back to `flexGrow` as an
 * approximation.
 */
function getColumnWidthStyle(options) {
  const { columns, columnDef, rowWidth } = options;
  if (columnDef?.width !== undefined) {
    return {
      width: columnDef.width,
    };
  }
  const flex = columnDef?.flex ?? 1;
  const minWidth = columnDef?.minWidth ?? 0;
  if (rowWidth === undefined) {
    return {
      flexGrow: flex,
      flexShrink: 1,
      minWidth,
    };
  }
  const defs = Object.values(columns);
  const fixedSum = defs.reduce((acc, def) => acc + (def.width ?? 0), 0);
  const flexSum = defs.reduce(
    (acc, def) => acc + (def.width !== undefined ? 0 : (def.flex ?? 1)),
    0
  );
  const available = Math.max(rowWidth - fixedSum, 0);
  const width = (available * flex) / Math.max(flexSum, 1);
  return {
    width: Math.max(width, minWidth),
  };
}
// --------------------------------------------------
const Root = forwardRef(
  (
    {
      asChild,
      children,
      selectionMode = 'none',
      selectedKeys: selectedKeysProp,
      defaultSelectedKeys,
      onSelectionChange,
      disabledKeys: disabledKeysProp,
      disallowEmptySelection = false,
      sortDescriptor: sortDescriptorProp,
      defaultSortDescriptor,
      onSortChange,
      ...viewProps
    },
    ref
  ) => {
    const controlledSelectedKeys = useKeySet(selectedKeysProp);
    const initialSelectedKeys = useKeySet(defaultSelectedKeys);
    const [selectedKeysState, setSelectedKeys] = useControllableState({
      prop: controlledSelectedKeys,
      defaultProp: initialSelectedKeys,
      onChange: onSelectionChange,
    });
    const [sortDescriptorState, setSortDescriptor] = useControllableState({
      prop: sortDescriptorProp,
      defaultProp: defaultSortDescriptor,
      onChange: onSortChange,
    });
    const [columns, setColumns] = useState({});
    const [rowKeys, setRowKeysState] = useState([]);
    const selectedKeys = useMemo(() => selectedKeysState ?? new Set(), [selectedKeysState]);
    const disabledKeys = useMemo(() => new Set(disabledKeysProp ?? []), [disabledKeysProp]);
    const isRowSelected = useCallback((key) => selectedKeys.has(key), [selectedKeys]);
    const toggleRowSelection = useCallback(
      (key) => {
        if (selectionMode === 'none') {
          return;
        }
        setSelectedKeys((prev) => {
          const current = prev ?? new Set();
          const isSelected = current.has(key);
          if (selectionMode === 'single') {
            if (isSelected) {
              return disallowEmptySelection ? current : new Set();
            }
            return new Set([key]);
          }
          if (isSelected) {
            if (disallowEmptySelection && current.size === 1) {
              return current;
            }
            const next = new Set(current);
            next.delete(key);
            return next;
          }
          const next = new Set(current);
          next.add(key);
          return next;
        });
      },
      [selectionMode, disallowEmptySelection, setSelectedKeys]
    );
    const selectableKeys = useMemo(
      () => rowKeys.filter((key) => !disabledKeys.has(key)),
      [rowKeys, disabledKeys]
    );
    const isAllSelected = useMemo(
      () => selectableKeys.length > 0 && selectableKeys.every((key) => selectedKeys.has(key)),
      [selectableKeys, selectedKeys]
    );
    const isSomeSelected = useMemo(
      () => !isAllSelected && selectableKeys.some((key) => selectedKeys.has(key)),
      [isAllSelected, selectableKeys, selectedKeys]
    );
    const toggleSelectAll = useCallback(() => {
      if (selectionMode !== 'multiple') {
        return;
      }
      setSelectedKeys((prev) => {
        const current = prev ?? new Set();
        const allSelected =
          selectableKeys.length > 0 && selectableKeys.every((key) => current.has(key));
        if (allSelected) {
          return disallowEmptySelection ? current : new Set();
        }
        return new Set(selectableKeys);
      });
    }, [selectionMode, selectableKeys, disallowEmptySelection, setSelectedKeys]);
    const sortByColumn = useCallback(
      (columnKey) => {
        setSortDescriptor((prev) => {
          if (prev !== undefined && prev.column === columnKey) {
            return {
              column: columnKey,
              direction: prev.direction === 'ascending' ? 'descending' : 'ascending',
            };
          }
          return {
            column: columnKey,
            direction: 'ascending',
          };
        });
      },
      [setSortDescriptor]
    );
    const registerColumn = useCallback((index, def) => {
      setColumns((prev) => {
        const existing = prev[index];
        if (
          existing !== undefined &&
          existing.key === def.key &&
          existing.width === def.width &&
          existing.minWidth === def.minWidth &&
          existing.flex === def.flex &&
          existing.allowsSorting === def.allowsSorting
        ) {
          return prev;
        }
        return {
          ...prev,
          [index]: def,
        };
      });
    }, []);
    const unregisterColumn = useCallback((index) => {
      setColumns((prev) => {
        if (!(index in prev)) {
          return prev;
        }
        const next = {
          ...prev,
        };
        delete next[index];
        return next;
      });
    }, []);
    const setRowKeys = useCallback((keys) => {
      setRowKeysState((prev) => {
        if (prev.length === keys.length && prev.every((key, i) => key === keys[i])) {
          return prev;
        }
        return keys;
      });
    }, []);
    const contextValue = useMemo(
      () => ({
        selectionMode,
        selectedKeys,
        disabledKeys,
        disallowEmptySelection,
        isRowSelected,
        toggleRowSelection,
        toggleSelectAll,
        isAllSelected,
        isSomeSelected,
        sortDescriptor: sortDescriptorState,
        sortByColumn,
        columns,
        registerColumn,
        unregisterColumn,
        setRowKeys,
      }),
      [
        selectionMode,
        selectedKeys,
        disabledKeys,
        disallowEmptySelection,
        isRowSelected,
        toggleRowSelection,
        toggleSelectAll,
        isAllSelected,
        isSomeSelected,
        sortDescriptorState,
        sortByColumn,
        columns,
        registerColumn,
        unregisterColumn,
        setRowKeys,
      ]
    );
    const Component = asChild ? Slot.View : View;
    return (
      <TableRootContext.Provider value={contextValue}>
        <Component ref={ref} {...viewProps}>
          {children}
        </Component>
      </TableRootContext.Provider>
    );
  }
);
Root.displayName = 'HeroUINative.Primitive.Table.Root';
// --------------------------------------------------
const Header = forwardRef(
  (
    { asChild, children, skipInjectColumnIndices = false, onLayout: onLayoutProp, ...viewProps },
    ref
  ) => {
    const seededRowWidth = useContext(TableRowLayoutContext);
    const [measuredRowWidth, setMeasuredRowWidth] = useState(undefined);
    /**
     * The seed (computed by the styled `Table.Content` from the viewport)
     * lets columns lay out correctly before the header's own measurement
     * arrives; the measurement then only refines theme-driven differences.
     */
    const rowWidth = measuredRowWidth ?? seededRowWidth;
    const handleLayout = useCallback(
      (event) => {
        setMeasuredRowWidth(event.nativeEvent.layout.width);
        onLayoutProp?.(event);
      },
      [onLayoutProp]
    );
    const enhancedChildren = useMemo(() => {
      if (skipInjectColumnIndices) {
        return children;
      }
      const childArray = Children.toArray(children);
      const columnElements = childArray.filter(
        (child) => isValidElement(child) && child.type === Column
      );
      const totalColumns = columnElements.length;
      let columnCounter = 0;
      return childArray.map((child) => {
        if (isValidElement(child) && child.type === Column) {
          const idx = columnCounter;
          columnCounter += 1;
          return cloneElement(child, {
            _columnIndex: idx,
            _isFirst: idx === 0,
            _isLast: idx === totalColumns - 1,
            key: child.key ?? `table-column-${idx}`,
          });
        }
        return child;
      });
    }, [children, skipInjectColumnIndices]);
    const Component = asChild ? Slot.View : View;
    return (
      <TableRowLayoutContext.Provider value={rowWidth}>
        <Component ref={ref} accessibilityRole="header" onLayout={handleLayout} {...viewProps}>
          {enhancedChildren}
        </Component>
      </TableRowLayoutContext.Provider>
    );
  }
);
Header.displayName = 'HeroUINative.Primitive.Table.Header';
// --------------------------------------------------
const Column = forwardRef(
  (
    {
      asChild,
      children,
      id,
      width,
      minWidth,
      flex,
      allowsSorting = false,
      onPress: onPressProp,
      disabled,
      style,
      _columnIndex: injectedIndex = 0,
      _isFirst: injectedIsFirst = false,
      _isLast: injectedIsLast = false,
      ...restProps
    },
    ref
  ) => {
    const { columns, sortDescriptor, sortByColumn, registerColumn, unregisterColumn } =
      useRootContext();
    const rowWidth = useContext(TableRowLayoutContext);
    const columnKey = id ?? injectedIndex;
    useEffect(() => {
      registerColumn(injectedIndex, {
        key: columnKey,
        width,
        minWidth,
        flex,
        allowsSorting,
      });
      return () => unregisterColumn(injectedIndex);
    }, [
      injectedIndex,
      columnKey,
      width,
      minWidth,
      flex,
      allowsSorting,
      registerColumn,
      unregisterColumn,
    ]);
    const isSorted = sortDescriptor?.column === columnKey;
    const sortDirection = isSorted ? sortDescriptor?.direction : undefined;
    /**
     * Column widths are runtime values shared with body cells through the
     * root registry, so they must live in an inline style (see
     * {@link getColumnWidthStyle} for the distribution rules).
     */
    const widthStyle = useMemo(
      () =>
        getColumnWidthStyle({
          columns,
          columnDef: {
            key: columnKey,
            width,
            minWidth,
            flex,
            allowsSorting,
          },
          rowWidth,
        }),
      [columns, columnKey, width, minWidth, flex, allowsSorting, rowWidth]
    );
    const handlePress = useCallback(
      (event) => {
        if (allowsSorting) {
          sortByColumn(columnKey);
        }
        onPressProp?.(event);
      },
      [allowsSorting, sortByColumn, columnKey, onPressProp]
    );
    const isInteractive = allowsSorting || onPressProp !== undefined;
    const contextValue = useMemo(
      () => ({
        key: columnKey,
        index: injectedIndex,
        isFirst: injectedIsFirst,
        isLast: injectedIsLast,
        allowsSorting,
        isSorted,
        sortDirection,
      }),
      [
        columnKey,
        injectedIndex,
        injectedIsFirst,
        injectedIsLast,
        allowsSorting,
        isSorted,
        sortDirection,
      ]
    );
    const Component = asChild ? Slot.Pressable : Pressable;
    return (
      <TableColumnContext.Provider value={contextValue}>
        <Component
          ref={ref}
          onPress={isInteractive ? handlePress : undefined}
          disabled={disabled}
          accessibilityRole={isInteractive ? 'button' : undefined}
          accessibilityState={
            allowsSorting
              ? {
                  selected: isSorted,
                }
              : undefined
          }
          style={[widthStyle, style]}
          {...restProps}
          data-first={injectedIsFirst || undefined}
          data-last={injectedIsLast || undefined}
          data-allows-sorting={allowsSorting || undefined}
          data-sorted={isSorted || undefined}
        >
          {children}
        </Component>
      </TableColumnContext.Provider>
    );
  }
);
Column.displayName = 'HeroUINative.Primitive.Table.Column';
// --------------------------------------------------
const Row = forwardRef(
  (
    {
      asChild,
      children,
      id,
      isDisabled = false,
      skipInjectCellIndices = false,
      onPress: onPressProp,
      onLongPress: onLongPressProp,
      onPressIn: onPressInProp,
      onPressOut: onPressOutProp,
      onLayout: onLayoutProp,
      disabled,
      accessibilityState,
      _index: injectedIndex = 0,
      _isFirst: injectedIsFirst = false,
      _isLast: injectedIsLast = false,
      ...restProps
    },
    ref
  ) => {
    const { selectionMode, disabledKeys, isRowSelected, toggleRowSelection } = useRootContext();
    const [isPressed, setIsPressed] = useState(false);
    const seededRowWidth = useContext(TableRowLayoutContext);
    const [measuredRowWidth, setMeasuredRowWidth] = useState(undefined);
    /**
     * The seed (computed by the styled `Table.Content` from the viewport)
     * lets every row lay out correctly in the same commit — otherwise rows
     * would settle one by one as their own measurements arrive, visibly
     * shifting cell content. The measurement then only refines the value
     * when a theme border actually changes the row's geometry.
     */
    const rowWidth = measuredRowWidth ?? seededRowWidth;
    const handleLayout = useCallback(
      (event) => {
        setMeasuredRowWidth(event.nativeEvent.layout.width);
        onLayoutProp?.(event);
      },
      [onLayoutProp]
    );
    const rowKey = id ?? injectedIndex;
    const isRowDisabled = isDisabled || disabledKeys.has(rowKey);
    const isSelected = isRowSelected(rowKey);
    const isInteractive =
      selectionMode !== 'none' || onPressProp !== undefined || onLongPressProp !== undefined;
    const handlePress = useCallback(
      (event) => {
        if (selectionMode !== 'none') {
          toggleRowSelection(rowKey);
        }
        onPressProp?.(event);
      },
      [selectionMode, toggleRowSelection, rowKey, onPressProp]
    );
    const handlePressIn = useCallback(
      (event) => {
        setIsPressed(true);
        onPressInProp?.(event);
      },
      [onPressInProp]
    );
    const handlePressOut = useCallback(
      (event) => {
        setIsPressed(false);
        onPressOutProp?.(event);
      },
      [onPressOutProp]
    );
    const enhancedChildren = useMemo(() => {
      if (skipInjectCellIndices) {
        return children;
      }
      const childArray = Children.toArray(children);
      const cellElements = childArray.filter(
        (child) => isValidElement(child) && child.type === Cell
      );
      const totalCells = cellElements.length;
      let cellCounter = 0;
      return childArray.map((child) => {
        if (isValidElement(child) && child.type === Cell) {
          const idx = cellCounter;
          cellCounter += 1;
          return cloneElement(child, {
            _columnIndex: idx,
            _isFirst: idx === 0,
            _isLast: idx === totalCells - 1,
            key: child.key ?? `table-cell-${idx}`,
          });
        }
        return child;
      });
    }, [children, skipInjectCellIndices]);
    const contextValue = useMemo(
      () => ({
        key: rowKey,
        index: injectedIndex,
        isFirst: injectedIsFirst,
        isLast: injectedIsLast,
        isSelected,
        isDisabled: isRowDisabled,
        isPressed,
      }),
      [rowKey, injectedIndex, injectedIsFirst, injectedIsLast, isSelected, isRowDisabled, isPressed]
    );
    const Component = asChild ? Slot.Pressable : Pressable;
    return (
      <TableRowContext.Provider value={contextValue}>
        <Component
          ref={ref}
          onPress={isInteractive ? handlePress : undefined}
          onPressIn={isInteractive ? handlePressIn : onPressInProp}
          onPressOut={isInteractive ? handlePressOut : onPressOutProp}
          onLayout={handleLayout}
          disabled={disabled ?? (isInteractive ? isRowDisabled : undefined)}
          accessibilityRole={isInteractive ? 'button' : undefined}
          accessibilityState={
            accessibilityState ??
            (isInteractive
              ? {
                  selected: isSelected,
                  disabled: isRowDisabled,
                }
              : undefined)
          }
          {...restProps}
          data-selected={isSelected || undefined}
          data-disabled={isRowDisabled || undefined}
          data-pressed={isPressed || undefined}
          data-first={injectedIsFirst || undefined}
          data-last={injectedIsLast || undefined}
        >
          <TableRowLayoutContext.Provider value={rowWidth}>
            {enhancedChildren}
          </TableRowLayoutContext.Provider>
        </Component>
      </TableRowContext.Provider>
    );
  }
);
Row.displayName = 'HeroUINative.Primitive.Table.Row';
// --------------------------------------------------
const Cell = forwardRef(
  (
    {
      asChild,
      children,
      style,
      _columnIndex: injectedIndex = 0,
      _isFirst: injectedIsFirst = false,
      _isLast: injectedIsLast = false,
      ...restProps
    },
    ref
  ) => {
    const { columns } = useRootContext();
    const { isSelected, isDisabled, isPressed } = useRowContext();
    const rowWidth = useContext(TableRowLayoutContext);
    const columnDef = columns[injectedIndex];
    /**
     * Cell widths resolve from the header column registry (runtime values),
     * so they must live in an inline style (see {@link getColumnWidthStyle}
     * for the distribution rules that keep cells aligned with their header
     * columns).
     */
    const widthStyle = useMemo(
      () =>
        getColumnWidthStyle({
          columns,
          columnDef,
          rowWidth,
        }),
      [columns, columnDef, rowWidth]
    );
    const Component = asChild ? Slot.View : View;
    return (
      <Component
        ref={ref}
        style={[widthStyle, style]}
        {...restProps}
        data-selected={isSelected || undefined}
        data-disabled={isDisabled || undefined}
        data-pressed={isPressed || undefined}
        data-first={injectedIsFirst || undefined}
        data-last={injectedIsLast || undefined}
      >
        {children}
      </Component>
    );
  }
);
Cell.displayName = 'HeroUINative.Primitive.Table.Cell';
export {
  Cell,
  Column,
  Header,
  Root,
  Row,
  RowLayoutProvider,
  useColumnContext,
  useRootContext,
  useRowContext,
};
