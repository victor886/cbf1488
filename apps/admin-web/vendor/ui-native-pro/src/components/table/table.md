# Table

A data table for structured tabular content with row selection, controlled sorting, and an opt-in virtualized body.

## Import

```tsx
import { Table } from 'heroui-native-pro';
```

## Anatomy

```tsx
<Table>
  <Table.ScrollContainer>
    <Table.Content>
      <Table.Header>
        <Table.Column>...</Table.Column>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>...</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Content>
  </Table.ScrollContainer>
  <Table.Footer>...</Table.Footer>
</Table>
```

- **Table**: Root shell. Owns the visual variant, selection state, and sort descriptor. Cascades `disable-all` to animated descendants. The table never reorders data itself.
- **Table.Background**: Absolute-fill layer behind the shell. With no children, the active library theme decides the content (glass renders a blur layer). Mounted for the primary variant only; replaceable via the `background` prop on Table.
- **Table.ScrollContainer**: Horizontal `ScrollView` so wide tables scroll while the shell and footer keep the available width.
- **Table.Content**: Vertical column hosting the header row and the body. Grows to fill the scroll content width.
- **Table.Header**: Header row hosting `Table.Column` and optionally `Table.SelectAllCell` parts. Injects column positions so body cells align with their columns.
- **Table.Column**: Header cell. Declares the column width behavior (`width`, or `flex` + `minWidth`). With `allowsSorting`, pressing it toggles the sort descriptor and an animated chevron reflects the direction.
- **Table.Body**: Body container. Renders static `Table.Row` children, an `items` collection through a render function, or a virtualized `FlatList`. Shows `renderEmptyState` when there are no rows.
- **Table.Row**: Body row. Pressing it toggles selection when `selectionMode` is not `"none"`. `disabledKeys` and `isDisabled` block interaction and dim the row.
- **Table.Cell**: Body cell. Resolves its width from the header column at the same position. Plain string/number children are wrapped in a styled `Text`.
- **Table.SelectAllCell**: Header checkbox cell for `selectionMode="multiple"` tables. Registers a fixed-width selection column.
- **Table.SelectionCell**: Row checkbox cell bound to the row's selection state. Place it at the same position as `Table.SelectAllCell`.
- **Table.Footer**: Row below the table content, outside the horizontal scroll area, for load-more actions or summaries.

## Usage

### Basic usage

Compose a header of columns and a body of rows. Wrap the content in `Table.ScrollContainer` so wide tables can scroll horizontally.

```tsx
<Table>
  <Table.ScrollContainer>
    <Table.Content>
      <Table.Header>
        <Table.Column>Name</Table.Column>
        <Table.Column>Role</Table.Column>
        <Table.Column>Status</Table.Column>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Ava Thompson</Table.Cell>
          <Table.Cell>Design</Table.Cell>
          <Table.Cell>Active</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Liam Nguyen</Table.Cell>
          <Table.Cell>Engineering</Table.Cell>
          <Table.Cell>Paused</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Content>
  </Table.ScrollContainer>
</Table>
```

### Secondary variant

Set `variant="secondary"` for a flat root with a rounded header band and border-separated body rows.

```tsx
<Table variant="secondary">...</Table>
```

### Sorting

Sorting is controlled. The table never reorders data itself. Mark columns with `allowsSorting`, give each an `id`, and sort your items from `sortDescriptor`.

```tsx
const [sortDescriptor, setSortDescriptor] = useState<TableSortDescriptor>({
  column: 'name',
  direction: 'ascending',
});

const sortedItems = useMemo(() => {
  const sorted = [...items].sort((a, b) => {
    const comparison =
      sortDescriptor.column === 'tasks' ? a.tasks - b.tasks : a.name.localeCompare(b.name);
    return sortDescriptor.direction === 'descending' ? -comparison : comparison;
  });
  return sorted;
}, [items, sortDescriptor]);

<Table sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
  ...
  <Table.Header>
    <Table.Column id="name" allowsSorting>
      Name
    </Table.Column>
    <Table.Column id="tasks" allowsSorting>
      Open tasks
    </Table.Column>
  </Table.Header>
  <Table.Body items={sortedItems}>
    {(item) => (
      <Table.Row id={item.id}>
        <Table.Cell>{item.name}</Table.Cell>
        <Table.Cell>{item.tasks}</Table.Cell>
      </Table.Row>
    )}
  </Table.Body>
  ...
</Table>;
```

### Multiple selection

Enable `selectionMode="multiple"` and add the checkbox cells. Rows also toggle on press.

```tsx
<Table
  selectionMode="multiple"
  defaultSelectedKeys={['1']}
  onSelectionChange={(keys) => console.log([...keys])}
  disabledKeys={['3']}
>
  ...
  <Table.Header>
    <Table.SelectAllCell />
    <Table.Column>Name</Table.Column>
  </Table.Header>
  <Table.Body items={items}>
    {(item) => (
      <Table.Row id={item.id}>
        <Table.SelectionCell />
        <Table.Cell>{item.name}</Table.Cell>
      </Table.Row>
    )}
  </Table.Body>
  ...
</Table>
```

### Single selection

Set `selectionMode="single"`. Pressing a row selects it. Checkbox cells are not required.

```tsx
<Table selectionMode="single" defaultSelectedKeys={['2']}>
  ...
</Table>
```

### Column widths

Columns are flexible (`flex: 1`) by default. Fixed and minimum widths push wide tables into horizontal scrolling.

```tsx
<Table.Header>
  <Table.Column width={220}>Name</Table.Column>
  <Table.Column minWidth={140}>Role</Table.Column>
  <Table.Column flex={2}>Notes</Table.Column>
</Table.Header>
```

### Empty state

Pass `renderEmptyState` to show centered content when the body has no rows.

```tsx
<Table.Body renderEmptyState={() => <EmptyState>...</EmptyState>} />
```

### Virtualized body

For large collections, render rows through a `FlatList`. Requires `items` with the render function form of `children` and a bounded height on the body.

```tsx
<Table.Body virtualized className="h-96" items={manyItems} keyExtractor={(item) => item.id}>
  {(item) => (
    <Table.Row id={item.id}>
      <Table.Cell>{item.name}</Table.Cell>
    </Table.Row>
  )}
</Table.Body>
```

### Footer

`Table.Footer` sits outside the horizontal scroll area. Compose load-more actions or summary content inside it.

```tsx
<Table>
  <Table.ScrollContainer>...</Table.ScrollContainer>
  <Table.Footer>...</Table.Footer>
</Table>
```

## Example

```tsx
import { Chip } from 'heroui-native';
import { Table } from 'heroui-native-pro';
import { View } from 'react-native';

const MEMBERS = [
  {
    id: '1',
    name: 'Ava Thompson',
    role: 'Design',
    status: 'Active',
    statusColor: 'success' as const,
  },
  {
    id: '2',
    name: 'Liam Nguyen',
    role: 'Engineering',
    status: 'Paused',
    statusColor: 'warning' as const,
  },
  {
    id: '3',
    name: 'Maya Patel',
    role: 'Product',
    status: 'Active',
    statusColor: 'success' as const,
  },
];

export default function TableExample() {
  return (
    <View className="flex-1 justify-center px-5">
      <Table>
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Column flex={1.3}>Name</Table.Column>
              <Table.Column>Role</Table.Column>
              <Table.Column width={110}>Status</Table.Column>
            </Table.Header>
            <Table.Body>
              {MEMBERS.map((member) => (
                <Table.Row key={member.id} id={member.id}>
                  <Table.Cell>{member.name}</Table.Cell>
                  <Table.Cell textProps={{ numberOfLines: 1 }}>{member.role}</Table.Cell>
                  <Table.Cell>
                    <Chip color={member.statusColor} size="sm" variant="soft">
                      {member.status}
                    </Chip>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </View>
  );
}
```

## API Reference

### Table

| prop                     | type                                        | default     | description                                                                                  |
| ------------------------ | ------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `children`               | `React.ReactNode`                           | -           | Compound parts rendered inside the table shell                                               |
| `variant`                | `TableVariant`                              | `'primary'` | Visual variant                                                                               |
| `selectionMode`          | `TableSelectionMode`                        | `'none'`    | Row selection behavior                                                                       |
| `selectedKeys`           | `Iterable<TableKey>`                        | -           | Controlled selected row keys                                                                 |
| `defaultSelectedKeys`    | `Iterable<TableKey>`                        | -           | Initially selected row keys (uncontrolled)                                                   |
| `disabledKeys`           | `Iterable<TableKey>`                        | -           | Row keys that cannot be selected or pressed                                                  |
| `disallowEmptySelection` | `boolean`                                   | `false`     | Prevents deselecting the last selected row                                                   |
| `sortDescriptor`         | `TableSortDescriptor`                       | -           | Controlled sort descriptor                                                                   |
| `defaultSortDescriptor`  | `TableSortDescriptor`                       | -           | Initial sort descriptor (uncontrolled)                                                       |
| `className`              | `string`                                    | -           | Additional CSS classes for the outer shell                                                   |
| `background`             | `React.ReactNode`                           | -           | Background layer behind the shell (`undefined` theme default, node replaces, `null` removes) |
| `onSelectionChange`      | `(keys: Set<TableKey>) => void`             | -           | Called with the new set of selected keys                                                     |
| `onSortChange`           | `(descriptor: TableSortDescriptor) => void` | -           | Called with the next descriptor when a sortable column is pressed                            |
| `animation`              | `TableRootAnimation`                        | -           | `"disable-all"` cascades to animated descendants                                             |
| `...ViewProps`           | `ViewProps`                                 | -           | All standard React Native View props are supported                                           |

#### TableVariant

| type                       | description                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `'primary' \| 'secondary'` | `primary` is a gray shell with the body as an elevated card. `secondary` is a flat root with a rounded header band |

#### TableKey

| type               | description                           |
| ------------------ | ------------------------------------- |
| `string \| number` | Unique identifier for a row or column |

#### TableSelectionMode

| type                               | description            |
| ---------------------------------- | ---------------------- |
| `'none' \| 'single' \| 'multiple'` | Row selection behavior |

#### TableSortDescriptor

| prop        | type                 | description                        |
| ----------- | -------------------- | ---------------------------------- |
| `column`    | `TableKey`           | Key of the column driving the sort |
| `direction` | `TableSortDirection` | Direction the column is sorted in  |

#### TableSortDirection

| type                          | description                        |
| ----------------------------- | ---------------------------------- |
| `'ascending' \| 'descending'` | Direction of an active column sort |

#### TableRootAnimation

Animation configuration for the Table root. Can be:

- `"disable-all"`: Disable all animations including children (cascades down through `AnimationSettingsProvider`)
- `undefined`: Use default animations

### Table.Background

Absolute-fill container rendered behind the table shell. With no children, the active library theme decides the default content (e.g. a glass blur layer); pass children to host custom content with the same positioning and clipping.

| prop           | type              | default | description                                                       |
| -------------- | ----------------- | ------- | ----------------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Custom background content; theme decides the default when omitted |
| `className`    | `string`          | -       | Additional CSS classes                                            |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported                |

### Table.ScrollContainer

| prop                        | type              | default | description                                              |
| --------------------------- | ----------------- | ------- | -------------------------------------------------------- |
| `children`                  | `React.ReactNode` | -       | Header and body content (typically `Table.Content`)      |
| `className`                 | `string`          | -       | Additional CSS classes for the scroll view               |
| `contentContainerClassName` | `string`          | -       | Additional CSS classes for the scroll content container  |
| `...ScrollViewProps`        | `ScrollViewProps` | -       | All standard React Native ScrollView props are supported |

### Table.Content

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Header and body parts                              |
| `className`    | `string`          | -       | Additional CSS classes for the content column      |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Table.Header

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Column parts                                       |
| `className`    | `string`          | -       | Additional CSS classes for the header row          |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Table.Column

| prop                    | type                        | default | description                                                         |
| ----------------------- | --------------------------- | ------- | ------------------------------------------------------------------- |
| `children`              | `React.ReactNode`           | -       | Column label; plain strings are wrapped in a styled `Text`          |
| `id`                    | `TableKey`                  | index   | Column key used by the sort descriptor                              |
| `width`                 | `number`                    | -       | Fixed column width in pixels (wins over `flex`)                     |
| `minWidth`              | `number`                    | -       | Minimum column width in pixels (used with flexible columns)         |
| `flex`                  | `number`                    | `1`     | Flex grow factor when no fixed `width` is set                       |
| `allowsSorting`         | `boolean`                   | `false` | Pressing the column toggles sorting                                 |
| `className`             | `string`                    | -       | Additional CSS classes for the column container                     |
| `classNames`            | `ElementSlots<ColumnSlots>` | -       | Additional CSS classes for individual slots                         |
| `styles`                | `TableColumnStyles`         | -       | Inline style overrides for individual slots                         |
| `indicator`             | `React.ReactNode`           | -       | Custom sort indicator replacing the default chevron                 |
| `textProps`             | `TextProps`                 | -       | Additional props forwarded to the inner label `Text`                |
| `animation`             | `TableColumnAnimation`      | -       | Sort indicator animation configuration (rotation / opacity)         |
| `isAnimatedStyleActive` | `boolean`                   | `true`  | When `false`, animated styles are not applied to the sort indicator |
| `...PressableProps`     | `PressableProps`            | -       | All standard React Native Pressable props are supported             |

#### ElementSlots\<ColumnSlots\>

| slot        | description                                 |
| ----------- | ------------------------------------------- |
| `container` | Column pressable container                  |
| `label`     | Column label text                           |
| `indicator` | Sort indicator wrapper (animated)           |
| `separator` | Trailing vertical separator between columns |

#### styles

| slot        | type        | description                               |
| ----------- | ----------- | ----------------------------------------- |
| `container` | `ViewStyle` | Style for the column pressable container  |
| `label`     | `TextStyle` | Style for the column label text           |
| `indicator` | `ViewStyle` | Style for the sort indicator wrapper      |
| `separator` | `ViewStyle` | Style for the trailing vertical separator |

The `indicator` slot has animated style properties that cannot be set via `className`: `opacity` (visibility) and `transform` (rotate, for the sort direction flip). To customize, use the `animation` prop. To disable animated styles, set `isAnimatedStyleActive={false}`.

#### TableColumnAnimation

Animation configuration for the column sort indicator. Can be:

- `false` or `"disabled"`: Disable the sort indicator animation
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop       | type             | default | description                                                                |
| ---------- | ---------------- | ------- | -------------------------------------------------------------------------- |
| `rotation` | `AnimationValue` | -       | Rotation of the indicator chevron in degrees for `[ascending, descending]` |
| `opacity`  | `AnimationValue` | -       | Opacity of the indicator for `[hidden, visible]`                           |

##### rotation

| prop           | type               | default             | description                                          |
| -------------- | ------------------ | ------------------- | ---------------------------------------------------- |
| `value`        | `[number, number]` | `[0, 180]`          | Rotation values `[ascending, descending]` in degrees |
| `timingConfig` | `WithTimingConfig` | `{ duration: 150 }` | Animation timing configuration                       |

##### opacity

| prop           | type               | default             | description                        |
| -------------- | ------------------ | ------------------- | ---------------------------------- |
| `value`        | `[number, number]` | `[0, 1]`            | Opacity values `[hidden, visible]` |
| `timingConfig` | `WithTimingConfig` | `{ duration: 150 }` | Animation timing configuration     |

### Table.Body

| prop               | type                                                                    | default | description                                                              |
| ------------------ | ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `children`         | `React.ReactNode \| (item: TItem, index: number) => React.ReactElement` | -       | Static rows, or a render function when `items` is provided               |
| `items`            | `readonly TItem[]`                                                      | -       | Dynamic collection rendered through the render function                  |
| `keyExtractor`     | `(item: TItem, index: number) => TableKey`                              | -       | Resolves the row key for an item (required for virtualized select-all)   |
| `virtualized`      | `boolean`                                                               | `false` | Renders rows through a `FlatList`; requires `items` and a bounded height |
| `renderEmptyState` | `() => React.ReactNode`                                                 | -       | Rendered centered inside the body when there are no rows                 |
| `className`        | `string`                                                                | -       | Additional CSS classes for the body container                            |
| `classNames`       | `ElementSlots<BodySlots>`                                               | -       | Additional CSS classes for individual slots                              |
| `styles`           | `Partial<Record<BodySlots, ViewStyle>>`                                 | -       | Inline style overrides for individual slots                              |
| `flatListProps`    | `Omit<FlatListProps<TItem>, 'data' \| 'renderItem' \| 'keyExtractor'>`  | -       | Extra props for the virtualized `FlatList`                               |
| `...ViewProps`     | `ViewProps`                                                             | -       | All standard React Native View props are supported                       |

#### ElementSlots\<BodySlots\>

| slot        | description                         |
| ----------- | ----------------------------------- |
| `container` | Body container                      |
| `empty`     | Empty state wrapper inside the body |

#### styles

| slot        | type        | description                       |
| ----------- | ----------- | --------------------------------- |
| `container` | `ViewStyle` | Style for the body container      |
| `empty`     | `ViewStyle` | Style for the empty state wrapper |

### Table.Row

| prop                | type              | default | description                                             |
| ------------------- | ----------------- | ------- | ------------------------------------------------------- |
| `children`          | `React.ReactNode` | -       | Cell parts                                              |
| `id`                | `TableKey`        | index   | Row key used by selection and `disabledKeys`            |
| `isDisabled`        | `boolean`         | `false` | Disables the row regardless of `disabledKeys`           |
| `className`         | `string`          | -       | Additional CSS classes for the row                      |
| `...PressableProps` | `PressableProps`  | -       | All standard React Native Pressable props are supported |

### Table.Cell

| prop           | type                      | default | description                                                |
| -------------- | ------------------------- | ------- | ---------------------------------------------------------- |
| `children`     | `React.ReactNode`         | -       | Cell content; plain strings are wrapped in a styled `Text` |
| `className`    | `string`                  | -       | Additional CSS classes for the cell container              |
| `classNames`   | `ElementSlots<CellSlots>` | -       | Additional CSS classes for individual slots                |
| `styles`       | `TableCellStyles`         | -       | Inline style overrides for individual slots                |
| `textProps`    | `TextProps`               | -       | Additional props forwarded to the inner `Text`             |
| `...ViewProps` | `ViewProps`               | -       | All standard React Native View props are supported         |

#### ElementSlots\<CellSlots\>

| slot        | description                                              |
| ----------- | -------------------------------------------------------- |
| `container` | Cell container                                           |
| `text`      | Cell text (only when children are plain strings/numbers) |

#### styles

| slot        | type        | description                  |
| ----------- | ----------- | ---------------------------- |
| `container` | `ViewStyle` | Style for the cell container |
| `text`      | `TextStyle` | Style for the cell text      |

### Table.SelectAllCell

| prop            | type                          | default | description                                           |
| --------------- | ----------------------------- | ------- | ----------------------------------------------------- |
| `width`         | `number`                      | `48`    | Fixed width of the selection column in pixels         |
| `className`     | `string`                      | -       | Additional CSS classes for the cell container         |
| `checkboxProps` | `TableSelectionCheckboxProps` | -       | Additional props forwarded to the select-all checkbox |
| `...ViewProps`  | `ViewProps`                   | -       | All standard React Native View props are supported    |

#### TableSelectionCheckboxProps

Props forwarded to the checkbox rendered by `Table.SelectAllCell` and `Table.SelectionCell`. Selection state and change handling are owned by the table. Omits `isSelected`, `onSelectedChange`, and `isDisabled` from `CheckboxProps`.

The table renders the checkboxes at a compact 20pt size with a reduced corner radius. The header select-all checkbox defaults to the `primary` variant; row checkboxes default to `secondary`. Override via `variant`, `className`, or `children`.

### Table.SelectionCell

| prop            | type                          | default | description                                              |
| --------------- | ----------------------------- | ------- | -------------------------------------------------------- |
| `className`     | `string`                      | -       | Additional CSS classes for the cell container            |
| `checkboxProps` | `TableSelectionCheckboxProps` | -       | Additional props forwarded to the row selection checkbox |
| `...ViewProps`  | `ViewProps`                   | -       | All standard React Native View props are supported       |

### Table.Footer

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Footer content                                     |
| `className`    | `string`          | -       | Additional CSS classes for the footer row          |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |
