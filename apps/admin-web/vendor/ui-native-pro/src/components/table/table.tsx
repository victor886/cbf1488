// @ts-nocheck
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Checkbox, ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { useThemeColor } from 'heroui-native/hooks';
import { HeroText } from '../../helpers/internal/components/index';
import { childrenToString, createContext } from '../../helpers/internal/utils/index';
import * as TablePrimitives from '../../primitives/table/index';
import { useTableRootAnimation, useTableSortIndicatorAnimation } from './table.animation';
import {
  DISPLAY_NAME,
  SELECTION_CHECKBOX_ICON_SIZE,
  SELECTION_COLUMN_WIDTH,
  SORT_INDICATOR_SIZE,
  SORTABLE_COLUMN_HIT_SLOP,
} from './table.constants';
import { tableClassNames, tableStyleSheet } from './table.styles';
const [TableProvider, useTable] = createContext({
  name: 'TableContext',
});
/**
 * Measured viewport width of the enclosing `Table.ScrollContainer`.
 *
 * A horizontal `ScrollView` gives its content unlimited width, so anything
 * without an explicit width (cell text, the body's empty state) would grow
 * to its intrinsic width and force needless horizontal scrolling.
 * `Table.Content` pins its width to `max(viewport, fixed + min column
 * widths)` instead, so the table only scrolls when columns genuinely
 * require more space.
 *
 * Non-strict: the context itself is `undefined` when used without a scroll
 * container; `width` is `undefined` before the first layout pass (the
 * content hides itself for that single frame to avoid painting the
 * unpinned flex layout).
 */
const [TableViewportProvider, useTableViewport] = createContext({
  name: 'TableViewportContext',
  strict: false,
});
/** Access to the table's selection/sorting state (primitive root context). */
const useTableState = TablePrimitives.useRootContext;
/** Access to the enclosing column's sort state (primitive column context). */
const useTableColumn = TablePrimitives.useColumnContext;
/** Access to the enclosing row's state (primitive row context). */
const useTableRow = TablePrimitives.useRowContext;
// --------------------------------------------------
/**
 * Default sort indicator glyph: an up-pointing chevron (ascending). The
 * descending flip is a 180° rotation applied by the animated wrapper.
 */
const SortIndicatorIcon = ({ size }) => {
  const mutedColor = useThemeColor('muted');
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        fill={mutedColor}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.97 10.53a.75.75 0 0 0 1.06 0L8 6.56l3.97 3.97a.75.75 0 1 0 1.06-1.06l-4.5-4.5a.75.75 0 0 0-1.06 0l-4.5 4.5a.75.75 0 0 0 0 1.06"
      />
    </Svg>
  );
};
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the table
 * shell. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const TableBackground = forwardRef(({ className, ...props }, ref) => {
  const backgroundClassName = tableClassNames.background({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={backgroundClassName}
      fallbackColor="surface-secondary"
      {...props}
    />
  );
});
// --------------------------------------------------
const TableRoot = forwardRef((props, ref) => {
  const {
    children,
    variant = 'primary',
    className,
    style,
    animation,
    background,
    ...restProps
  } = props;
  const rootClassName = tableClassNames.root({
    variant,
    className,
  });
  const { isAllAnimationsDisabled } = useTableRootAnimation({
    animation,
  });
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const tableContextValue = useMemo(
    () => ({
      variant,
    }),
    [variant]
  );
  /**
   * Background layer rendered behind the table shell. Only the primary
   * variant paints a surface token on the root (the secondary root is
   * transparent), so the theme-default layer mounts for primary only.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : variant === 'primary' && hasDefaultThemeBackground ? (
      <TableBackground />
    ) : null;
  return (
    <TablePrimitives.Root
      ref={ref}
      className={rootClassName}
      style={[tableStyleSheet.root, style]}
      {...restProps}
    >
      <TableProvider value={tableContextValue}>
        <AnimationSettingsProvider value={animationSettingsContextValue}>
          {backgroundElement}
          {children}
        </AnimationSettingsProvider>
      </TableProvider>
    </TablePrimitives.Root>
  );
});
// --------------------------------------------------
const TableScrollContainer = forwardRef((props, ref) => {
  const {
    children,
    className,
    contentContainerClassName,
    onLayout: onLayoutProp,
    ...restProps
  } = props;
  const [viewportWidth, setViewportWidth] = useState(undefined);
  const { container, contentContainer } = tableClassNames.scrollContainer();
  const containerClassName = container({
    className,
  });
  const contentClassName = contentContainer({
    className: contentContainerClassName,
  });
  const handleLayout = useCallback(
    (event) => {
      setViewportWidth(event.nativeEvent.layout.width);
      onLayoutProp?.(event);
    },
    [onLayoutProp]
  );
  const viewportContextValue = useMemo(
    () => ({
      width: viewportWidth,
    }),
    [viewportWidth]
  );
  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      className={containerClassName}
      contentContainerClassName={contentClassName}
      onLayout={handleLayout}
      {...restProps}
    >
      <TableViewportProvider value={viewportContextValue}>{children}</TableViewportProvider>
    </ScrollView>
  );
});
// --------------------------------------------------
const TableContent = forwardRef((props, ref) => {
  const { children, className, style, ...restProps } = props;
  const { columns } = TablePrimitives.useRootContext();
  const viewport = useTableViewport();
  const contentClassName = tableClassNames.content({
    className,
  });
  /**
   * Pins the content width to `max(viewport, fixed + min column widths)`.
   * Inside the horizontal scroll container, content-driven sizing would
   * otherwise latch onto intrinsic text widths (unwrapped labels, the
   * empty state) and force needless horizontal scrolling. Runtime value,
   * so it must be an inline style; falls back to the CSS `flex-grow`
   * before the first layout pass or without a scroll container.
   */
  const contentWidth = useMemo(() => {
    if (viewport?.width === undefined) {
      return undefined;
    }
    const defs = Object.values(columns);
    const fixedSum = defs.reduce((acc, def) => acc + (def.width ?? 0), 0);
    const minSum = defs.reduce(
      (acc, def) => acc + (def.width !== undefined ? 0 : (def.minWidth ?? 0)),
      0
    );
    return Math.max(viewport.width, fixedSum + minSum);
  }, [viewport, columns]);
  /**
   * Inside a scroll container, the frame before the viewport measurement
   * arrives would paint the unpinned flex layout (cell content sitting at
   * content-driven positions that visibly shift once widths resolve), so
   * the content stays invisible for that single frame. Standalone usage
   * (no scroll container) never hides.
   */
  const isAwaitingViewport = viewport !== undefined && viewport.width === undefined;
  return (
    <View
      ref={ref}
      className={contentClassName}
      style={[
        contentWidth !== undefined
          ? {
              width: contentWidth,
            }
          : undefined,
        isAwaitingViewport ? tableStyleSheet.contentAwaitingViewport : undefined,
        style,
      ]}
      {...restProps}
    >
      <TablePrimitives.RowLayoutProvider value={contentWidth}>
        {children}
      </TablePrimitives.RowLayoutProvider>
    </View>
  );
});
// --------------------------------------------------
const TableHeader = forwardRef((props, ref) => {
  const { children, className, ...restProps } = props;
  const headerClassName = tableClassNames.header({
    className,
  });
  const enhancedChildren = useMemo(() => {
    const childArray = Children.toArray(children);
    const isColumnElement = (child) =>
      isValidElement(child) && (child.type === TableColumn || child.type === TableSelectAllCell);
    const totalColumns = childArray.filter(isColumnElement).length;
    let columnCounter = 0;
    return childArray.map((child) => {
      if (isColumnElement(child)) {
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
  }, [children]);
  return (
    <TablePrimitives.Header
      ref={ref}
      className={headerClassName}
      skipInjectColumnIndices
      {...restProps}
    >
      {enhancedChildren}
    </TablePrimitives.Header>
  );
});
// --------------------------------------------------
const TableColumn = forwardRef((props, ref) => {
  const {
    children,
    id,
    allowsSorting = false,
    className,
    classNames,
    styles,
    style,
    indicator,
    textProps,
    animation,
    isAnimatedStyleActive = true,
    hitSlop,
    ...restProps
  } = props;
  const { variant } = useTable();
  const { sortDescriptor } = TablePrimitives.useRootContext();
  const injectedIndex = restProps._columnIndex ?? 0;
  const isLast = restProps._isLast ?? false;
  const columnKey = id ?? injectedIndex;
  const isSorted = allowsSorting && sortDescriptor?.column === columnKey;
  const sortDirection = isSorted ? sortDescriptor?.direction : undefined;
  const {
    container,
    label,
    indicator: indicatorSlot,
    separator,
  } = tableClassNames.column({
    variant,
    isSorted,
  });
  const containerClassName = container({
    className: [className, classNames?.container],
  });
  const labelClassName = label({
    className: classNames?.label,
  });
  const indicatorClassName = indicatorSlot({
    className: classNames?.indicator,
  });
  const separatorClassName = separator({
    className: classNames?.separator,
  });
  const { rIndicatorStyle } = useTableSortIndicatorAnimation({
    animation,
    isSorted,
    sortDirection,
  });
  const stringifiedChildren = childrenToString(children);
  const labelElement =
    stringifiedChildren !== null ? (
      <HeroText {...textProps} className={labelClassName} style={[styles?.label, textProps?.style]}>
        {stringifiedChildren}
      </HeroText>
    ) : (
      children
    );
  const indicatorElement = allowsSorting ? (
    <Animated.View
      className={indicatorClassName}
      style={isAnimatedStyleActive ? [rIndicatorStyle, styles?.indicator] : styles?.indicator}
    >
      {indicator ?? <SortIndicatorIcon size={SORT_INDICATOR_SIZE} />}
    </Animated.View>
  ) : null;
  const separatorElement = !isLast ? (
    <View className={separatorClassName} style={styles?.separator} />
  ) : null;
  return (
    <TablePrimitives.Column
      ref={ref}
      id={id}
      allowsSorting={allowsSorting}
      className={containerClassName}
      style={[styles?.container, style]}
      hitSlop={hitSlop ?? (allowsSorting ? SORTABLE_COLUMN_HIT_SLOP : undefined)}
      {...restProps}
    >
      {labelElement}
      {indicatorElement}
      {separatorElement}
    </TablePrimitives.Column>
  );
});
// --------------------------------------------------
/**
 * Header cell rendering a select-all checkbox for `selectionMode="multiple"`
 * tables. Registers a fixed-width selection column so the row selection
 * cells below align with it.
 */
const TableSelectAllCell = forwardRef((props, ref) => {
  const { className, width = SELECTION_COLUMN_WIDTH, checkboxProps, ...restProps } = props;
  const { variant } = useTable();
  const { selectionMode, isAllSelected, toggleSelectAll } = TablePrimitives.useRootContext();
  const { container } = tableClassNames.column({
    variant,
  });
  const containerClassName = container({
    className: [tableClassNames.selectionCell(), className],
  });
  const checkboxClassName = tableClassNames.selectionCheckbox({
    className: checkboxProps?.className,
  });
  return (
    <TablePrimitives.Column ref={ref} width={width} className={containerClassName} {...restProps}>
      {selectionMode === 'multiple' ? (
        <Checkbox
          variant="primary"
          isSelected={isAllSelected}
          onSelectedChange={toggleSelectAll}
          className={checkboxClassName}
          {...checkboxProps}
        >
          {checkboxProps?.children ?? (
            <Checkbox.Indicator
              iconProps={{
                size: SELECTION_CHECKBOX_ICON_SIZE,
              }}
            />
          )}
        </Checkbox>
      ) : null}
    </TablePrimitives.Column>
  );
});
// --------------------------------------------------
/**
 * Generic body part. Uses a plain function component (rather than
 * `forwardRef`) so the `TItem` generic survives — React 19 forwards `ref`
 * as a regular prop to function components.
 */
function TableBodyImpl(props) {
  const {
    ref,
    children,
    items,
    keyExtractor,
    virtualized = false,
    renderEmptyState,
    className,
    classNames,
    styles: stylesProp,
    style,
    flatListProps,
    ...restProps
  } = props;
  const { variant } = useTable();
  const { setRowKeys } = TablePrimitives.useRootContext();
  const { container, empty } = tableClassNames.body({
    variant,
  });
  const containerClassName = container({
    className: [className, classNames?.container],
  });
  const emptyClassName = empty({
    className: classNames?.empty,
  });
  const isRenderFunction = typeof children === 'function';
  /**
   * Row elements for the non-virtualized paths: either the static children
   * or the `items` collection mapped through the render function.
   */
  const rowElements = useMemo(() => {
    if (virtualized) {
      return [];
    }
    if (items !== undefined && isRenderFunction) {
      return items.map((item, index) => children(item, index));
    }
    if (!isRenderFunction) {
      return Children.toArray(children).filter(
        (child) => isValidElement(child) && child.type === TableRow
      );
    }
    return [];
  }, [children, items, virtualized, isRenderFunction]);
  const rowCount = virtualized ? (items?.length ?? 0) : rowElements.length;
  /**
   * Full list of row keys, including virtualized rows that are not
   * mounted, so select-all can address off-screen rows.
   */
  const rowKeys = useMemo(() => {
    if (virtualized) {
      return (items ?? []).map((item, index) => keyExtractor?.(item, index) ?? index);
    }
    return rowElements.map((element, index) => {
      const rowProps = element.props;
      if (rowProps.id !== undefined) {
        return rowProps.id;
      }
      const item = items?.[index];
      if (item !== undefined && keyExtractor !== undefined) {
        return keyExtractor(item, index);
      }
      return index;
    });
  }, [virtualized, items, keyExtractor, rowElements]);
  useEffect(() => {
    setRowKeys(rowKeys);
    return () => setRowKeys([]);
  }, [rowKeys, setRowKeys]);
  const enhancedRows = useMemo(
    () =>
      rowElements.map((element, index) =>
        cloneElement(element, {
          _index: index,
          _isFirst: index === 0,
          _isLast: index === rowElements.length - 1,
          key: element.key ?? `table-row-${index}`,
        })
      ),
    [rowElements]
  );
  const renderVirtualizedItem = useCallback(
    ({ item, index }) => {
      if (!isRenderFunction) {
        return null;
      }
      const element = children(item, index);
      if (isValidElement(element) && element.type === TableRow) {
        return cloneElement(element, {
          _index: index,
          _isFirst: index === 0,
          _isLast: index === rowCount - 1,
        });
      }
      return element;
    },
    [children, isRenderFunction, rowCount]
  );
  const virtualizedKeyExtractor = useCallback(
    (item, index) => String(keyExtractor?.(item, index) ?? index),
    [keyExtractor]
  );
  const emptyElement =
    rowCount === 0 && renderEmptyState !== undefined ? (
      <View className={emptyClassName} style={stylesProp?.empty}>
        {renderEmptyState()}
      </View>
    ) : null;
  return (
    <View
      ref={ref}
      className={containerClassName}
      style={[tableStyleSheet.body, stylesProp?.container, style]}
      {...restProps}
    >
      {emptyElement}
      {emptyElement === null &&
        (virtualized ? (
          <FlatList
            data={items}
            renderItem={renderVirtualizedItem}
            keyExtractor={virtualizedKeyExtractor}
            {...flatListProps}
          />
        ) : (
          enhancedRows
        ))}
    </View>
  );
}
/**
 * `Object.assign` (rather than `forwardRef`) keeps the `TItem` generic on
 * the public component while still carrying a `displayName`.
 */
const TableBody = Object.assign(TableBodyImpl, {
  displayName: DISPLAY_NAME.BODY,
});
// --------------------------------------------------
const TableRow = forwardRef((props, ref) => {
  const {
    children,
    className,
    id,
    isDisabled = false,
    onPressIn: onPressInProp,
    onPressOut: onPressOutProp,
    ...restProps
  } = props;
  const { variant } = useTable();
  const { disabledKeys, isRowSelected } = TablePrimitives.useRootContext();
  const [isPressed, setIsPressed] = useState(false);
  const injectedIndex = restProps._index ?? 0;
  const isLast = restProps._isLast ?? false;
  const rowKey = id ?? injectedIndex;
  const isSelected = isRowSelected(rowKey);
  const isRowDisabled = isDisabled || disabledKeys.has(rowKey);
  const rowClassName = tableClassNames.row({
    variant,
    isSelected,
    isPressed,
    isDisabled: isRowDisabled,
    isLast,
    className,
  });
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
    const childArray = Children.toArray(children);
    const isCellElement = (child) =>
      isValidElement(child) && (child.type === TableCell || child.type === TableSelectionCell);
    const totalCells = childArray.filter(isCellElement).length;
    let cellCounter = 0;
    return childArray.map((child) => {
      if (isCellElement(child)) {
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
  }, [children]);
  return (
    <TablePrimitives.Row
      ref={ref}
      id={id}
      isDisabled={isDisabled}
      className={rowClassName}
      skipInjectCellIndices
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...restProps}
    >
      {enhancedChildren}
    </TablePrimitives.Row>
  );
});
// --------------------------------------------------
const TableCell = forwardRef((props, ref) => {
  const { children, className, classNames, styles, style, textProps, ...restProps } = props;
  const { container, text } = tableClassNames.cell();
  const containerClassName = container({
    className: [className, classNames?.container],
  });
  const textClassName = text({
    className: classNames?.text,
  });
  const stringifiedChildren = childrenToString(children);
  return (
    <TablePrimitives.Cell
      ref={ref}
      className={containerClassName}
      style={[styles?.container, style]}
      {...restProps}
    >
      {stringifiedChildren !== null ? (
        <HeroText {...textProps} className={textClassName} style={[styles?.text, textProps?.style]}>
          {stringifiedChildren}
        </HeroText>
      ) : (
        children
      )}
    </TablePrimitives.Cell>
  );
});
// --------------------------------------------------
/**
 * Body cell rendering a checkbox bound to the enclosing row's selection
 * state. Place it at the same position as the header's `SelectAllCell`.
 */
const TableSelectionCell = forwardRef((props, ref) => {
  const { className, checkboxProps, ...restProps } = props;
  const { toggleRowSelection } = TablePrimitives.useRootContext();
  const { key: rowKey, isSelected, isDisabled } = TablePrimitives.useRowContext();
  const { container } = tableClassNames.cell();
  const containerClassName = container({
    className: [tableClassNames.selectionCell(), className],
  });
  const checkboxClassName = tableClassNames.selectionCheckbox({
    className: checkboxProps?.className,
  });
  const handleSelectedChange = useCallback(() => {
    toggleRowSelection(rowKey);
  }, [toggleRowSelection, rowKey]);
  return (
    <TablePrimitives.Cell ref={ref} className={containerClassName} {...restProps}>
      <Checkbox
        variant="secondary"
        isSelected={isSelected}
        isDisabled={isDisabled}
        onSelectedChange={handleSelectedChange}
        {...checkboxProps}
        className={checkboxClassName}
      >
        {checkboxProps?.children ?? (
          <Checkbox.Indicator
            iconProps={{
              size: SELECTION_CHECKBOX_ICON_SIZE,
            }}
          />
        )}
      </Checkbox>
    </TablePrimitives.Cell>
  );
});
// --------------------------------------------------
const TableFooter = forwardRef((props, ref) => {
  const { children, className, ...restProps } = props;
  const footerClassName = tableClassNames.footer({
    className,
  });
  return (
    <View ref={ref} className={footerClassName} {...restProps}>
      {children}
    </View>
  );
});
// --------------------------------------------------
TableRoot.displayName = DISPLAY_NAME.ROOT;
TableBackground.displayName = DISPLAY_NAME.BACKGROUND;
TableScrollContainer.displayName = DISPLAY_NAME.SCROLL_CONTAINER;
TableContent.displayName = DISPLAY_NAME.CONTENT;
TableHeader.displayName = DISPLAY_NAME.HEADER;
TableColumn.displayName = DISPLAY_NAME.COLUMN;
TableRow.displayName = DISPLAY_NAME.ROW;
TableCell.displayName = DISPLAY_NAME.CELL;
TableSelectAllCell.displayName = DISPLAY_NAME.SELECT_ALL_CELL;
TableSelectionCell.displayName = DISPLAY_NAME.SELECTION_CELL;
TableFooter.displayName = DISPLAY_NAME.FOOTER;
// --------------------------------------------------
/**
 * Compound `Table` component with sub-components, ported from the HeroUI
 * web Table and adapted to mobile.
 *
 * @component Table - Root shell. Owns the visual variant, the selection
 * state (`selectionMode`, `selectedKeys`, `disabledKeys`), and the
 * controlled sort descriptor (`sortDescriptor` / `onSortChange`). The table
 * never reorders data itself — consumers sort their items.
 *
 * @component Table.Background - Absolute-fill background container behind
 * the table shell. With no children, the active library theme decides the
 * content (glass theme renders a blur layer with a surface-secondary-matched
 * fallback). Mounted for the primary variant only, replaceable via the
 * `background` prop on Table.
 *
 * @component Table.ScrollContainer - Horizontal `ScrollView` letting wide
 * tables scroll while the shell and footer keep the available width.
 *
 * @component Table.Content - Vertical column hosting the header row and the
 * body; grows to fill the scroll content width.
 *
 * @component Table.Header - Header row hosting `Table.Column` /
 * `Table.SelectAllCell` parts. Injects column positions so body cells align
 * with their columns.
 *
 * @component Table.Column - Header cell. Declares the column width behavior
 * (`width`, or `flex` + `minWidth`); with `allowsSorting`, pressing it
 * toggles the sort descriptor and an animated chevron reflects the active
 * direction.
 *
 * @component Table.Body - Body container. Renders static `Table.Row`
 * children, an `items` collection through a render function, or a
 * virtualized `FlatList` (`virtualized` + `items` + render function with a
 * bounded height). `renderEmptyState` shows centered content when there are
 * no rows.
 *
 * @component Table.Row - Body row. Pressing it toggles selection when
 * `selectionMode` is not `"none"`; `disabledKeys` / `isDisabled` block
 * interaction and dim the row.
 *
 * @component Table.Cell - Body cell. Resolves its width from the header
 * column at the same position; plain string children are wrapped in a
 * styled `Text`.
 *
 * @component Table.SelectAllCell - Header checkbox cell (select-all) for
 * multiple selection tables.
 *
 * @component Table.SelectionCell - Row checkbox cell bound to the row's
 * selection state.
 *
 * @component Table.Footer - Row below the table content (outside the
 * horizontal scroll area), typically hosting load-more actions or summary
 * text.
 *
 * Variant state flows from Table to sub-components via context; selection
 * and sorting state flow through the table primitives.
 *
 * @note RTL: fully handled by logical properties and Yoga flex ordering —
 * columns, cells, separators (`inset-inline-end`), and the secondary header
 * corner radii (`border-top-start-radius` family) all mirror. The sort
 * indicator is a rotation between up/down chevrons (direction-neutral
 * glyphs), so it is deliberately not mirrored.
 */
const Table = Object.assign(TableRoot, {
  /** @optional Theme-aware background container behind the table shell. */
  Background: TableBackground,
  /** Horizontal scroll container for the header + body. */
  ScrollContainer: TableScrollContainer,
  /** Vertical column hosting the header row and the body. */
  Content: TableContent,
  /** Header row hosting the column parts. */
  Header: TableHeader,
  /** Header cell declaring width/sorting behavior for its column. */
  Column: TableColumn,
  /** Body container (static rows, dynamic items, or virtualized). */
  Body: TableBody,
  /** Body row with press-to-select behavior. */
  Row: TableRow,
  /** Body cell resolving its width from the matching header column. */
  Cell: TableCell,
  /** @optional Header select-all checkbox cell (multiple selection). */
  SelectAllCell: TableSelectAllCell,
  /** @optional Row selection checkbox cell. */
  SelectionCell: TableSelectionCell,
  /** @optional Footer row below the table content. */
  Footer: TableFooter,
});
export default Table;
export { useTable, useTableColumn, useTableRow, useTableState };
