# ComboBox

A text input combined with a listbox popover, letting users filter a collection of options to items matching a query.

> `ComboBox` composes the heroui-native `Select` (popover presentation only) and `InputGroup` components, mirroring the HeroUI web ComboBox anatomy. For a searchable select where filtering happens inside the popover instead of an inline input, see `Autocomplete`.

## Import

```tsx
import { ComboBox } from 'heroui-native-pro';
```

## Anatomy

```tsx
<ComboBox>
  <Label>...</Label>
  <ComboBox.Trigger>
    <ComboBox.InputGroup>
      <ComboBox.Input />
      <ComboBox.Suffix>
        <ComboBox.ClearButton />
        <ComboBox.TriggerIndicator />
      </ComboBox.Suffix>
    </ComboBox.InputGroup>
  </ComboBox.Trigger>
  <ComboBox.Value />
  <ComboBox.Portal>
    <ComboBox.Overlay />
    <ComboBox.Content>
      <ComboBox.List>
        <ComboBox.ListLabel>...</ComboBox.ListLabel>
        <ComboBox.Item value="..." label="...">
          <ComboBox.ItemLabel />
          <ComboBox.ItemIndicator />
        </ComboBox.Item>
      </ComboBox.List>
      <ComboBox.Empty />
    </ComboBox.Content>
  </ComboBox.Portal>
  <Description>...</Description>
</ComboBox>
```

- **ComboBox**: Root that wraps `Select` and manages the input text, item filtering, popover opening, and form field context (for Label, Description, FieldError). Supports controlled and uncontrolled selection, open state, and input text.
- **ComboBox.Trigger**: Unstyled pressable that wraps the input group so the popover anchors to (and can match) the full input width. Taps on the text input focus it; taps elsewhere on the group toggle the popover.
- **ComboBox.InputGroup**: Input group wrapper containing the text input and optional prefix/suffix slots. Inherits `isDisabled` from the root.
- **ComboBox.Input**: Text input wired to the combo box. Typing filters the items; focus/typing opens the popover per `menuTrigger`. In single mode it displays the selected label.
- **ComboBox.Prefix** / **ComboBox.Suffix**: Optional leading/trailing slots inside the input group. The suffix typically holds the trigger indicator.
- **ComboBox.TriggerIndicator**: Chevron indicator that rotates with the open state.
- **ComboBox.ClearButton**: Close button inside the suffix that clears the selection and input text, then calls `onClear`. Hidden while there is no selection and the input is empty. Being its own pressable, it does not toggle the popover.
- **ComboBox.Value**: Selected labels or placeholder. Primarily used in multiple mode (the input shows the selection in single mode).
- **ComboBox.Portal**: Portal wrapper that re-provides the combo box context across the portal boundary.
- **ComboBox.Overlay**: Backdrop behind the popover. Transparent by default so the input stays visible; pressing it dismisses the popover.
- **ComboBox.Content**: Popover content container. `presentation` is fixed to `"popover"`; `width` defaults to `"trigger"`.
- **ComboBox.ContentBackground**: Theme-aware background layer behind the content.
- **ComboBox.List**: Scrollable list container that keeps item taps working while the keyboard is open.
- **ComboBox.ListLabel**: Section label for grouped items.
- **ComboBox.Item**: Selectable option filtered by the input text (`textValue` overrides `label` for matching).
- **ComboBox.ItemLabel** / **ComboBox.ItemDescription** / **ComboBox.ItemIndicator**: Item content parts (label text, muted description, selected check).
- **ComboBox.Empty**: Fallback shown when no item matches the input text.

## Usage

### Basic Usage

Single selection with the default case- and diacritic-insensitive "contains" filter. Selecting an item writes its label into the input and closes the popover; clearing the input clears the selection; closing the popover reverts the input text to the selected label — custom values are not kept. When the input shows the committed selection label, reopening shows the full collection (the query is treated as empty).

The popover has no keyboard avoidance, so place the field in the upper half of the screen (or pass `placement="top"` on `ComboBox.Content` when the field sits low) to keep the popover above the keyboard.

```tsx
<ComboBox>
  <Label>Favorite animal</Label>
  <ComboBox.Trigger>
    <ComboBox.InputGroup>
      <ComboBox.Input placeholder="Search animals..." />
      <ComboBox.Suffix>
        <ComboBox.TriggerIndicator />
      </ComboBox.Suffix>
    </ComboBox.InputGroup>
  </ComboBox.Trigger>
  <ComboBox.Portal>
    <ComboBox.Overlay />
    <ComboBox.Content>
      <ComboBox.List>
        <ComboBox.Item value="cat" label="Cat" />
        <ComboBox.Item value="dog" label="Dog" />
      </ComboBox.List>
      <ComboBox.Empty />
    </ComboBox.Content>
  </ComboBox.Portal>
</ComboBox>
```

### Multiple Selection

Set `selectionMode="multiple"`. The input acts as a search field and is cleared when the popover closes; the popover stays open while items toggle; display the selection with `ComboBox.Value`.

```tsx
import type { ComboBoxOption } from 'heroui-native-pro';
import { useState } from 'react';

const [selected, setSelected] = useState<ComboBoxOption[]>([]);

<ComboBox selectionMode="multiple" value={selected} onValueChange={setSelected}>
  <Label>Favorite animals</Label>
  <ComboBox.Trigger>
    <ComboBox.InputGroup>
      <ComboBox.Input placeholder="Search animals..." />
      <ComboBox.Suffix>
        <ComboBox.TriggerIndicator />
      </ComboBox.Suffix>
    </ComboBox.InputGroup>
  </ComboBox.Trigger>
  <ComboBox.Value />
  <ComboBox.Portal>
    <ComboBox.Overlay />
    <ComboBox.Content>
      <ComboBox.List>
        <ComboBox.Item value="cat" label="Cat" />
        <ComboBox.Item value="dog" label="Dog" />
        <ComboBox.Item value="bird" label="Bird" />
      </ComboBox.List>
      <ComboBox.Empty />
    </ComboBox.Content>
  </ComboBox.Portal>
</ComboBox>;
```

### Controlled

Control the selection, open state, and input text externally.

```tsx
import type { ComboBoxOption } from 'heroui-native-pro';
import { useState } from 'react';

const [selected, setSelected] = useState<ComboBoxOption | undefined>({
  value: 'cat',
  label: 'Cat',
});
const [isOpen, setIsOpen] = useState(false);
const [query, setQuery] = useState('');

<ComboBox
  value={selected}
  onValueChange={setSelected}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  inputValue={query}
  onInputChange={setQuery}
>
  <ComboBox.Trigger>...</ComboBox.Trigger>
  <ComboBox.Portal>...</ComboBox.Portal>
</ComboBox>;
```

### Menu Trigger

`menuTrigger` decides when the popover opens: `"focus"` (default) opens it when the input gains focus and while typing, `"input"` opens it only while typing, and `"manual"` opens it only from `ComboBox.Trigger` presses (e.g. the chevron area).

```tsx
<ComboBox menuTrigger="focus">...</ComboBox>

<ComboBox menuTrigger="input">...</ComboBox>

<ComboBox menuTrigger="manual">...</ComboBox>
```

### Custom Filtering

Provide a `filter` predicate, or use `textValue` on items so keywords match that are not part of the visible label. For async or externally filtered collections, control `inputValue` via `onInputChange`, render the fetched options as `ComboBox.Item` children, and keep the built-in filter permissive (or return `true`) when the server already filtered.

```tsx
<ComboBox
  filter={(textValue, inputValue) =>
    textValue.toLowerCase().startsWith(inputValue.trim().toLowerCase())
  }
>
  ...
</ComboBox>
```

```tsx
<ComboBox.Item value="nyc" label="New York" textValue="New York NYC Big Apple" />
```

### Sections

```tsx
<ComboBox.List>
  <ComboBox.ListLabel>North America</ComboBox.ListLabel>
  <ComboBox.Item value="usa" label="United States" />
  <ComboBox.ListLabel>Europe</ComboBox.ListLabel>
  <ComboBox.Item value="uk" label="United Kingdom" />
</ComboBox.List>
```

### Field States

Use root props for required, invalid, and disabled states; the input picks up the form field styling automatically.

```tsx
<ComboBox isRequired>...</ComboBox>

<ComboBox isInvalid>
  <ComboBox.Trigger>...</ComboBox.Trigger>
  <ComboBox.Portal>...</ComboBox.Portal>
  <FieldError>Please select an option.</FieldError>
</ComboBox>

<ComboBox isDisabled>...</ComboBox>
```

## Example

```tsx
import { Description, Label } from 'heroui-native';
import { ComboBox } from 'heroui-native-pro';
import { View } from 'react-native';

export default function ComboBoxExample() {
  return (
    <View className="flex-1 justify-start px-5 pt-10">
      <ComboBox>
        <Label>Favorite animal</Label>
        <ComboBox.Trigger>
          <ComboBox.InputGroup>
            <ComboBox.Input placeholder="Search animals..." />
            <ComboBox.Suffix>
              <ComboBox.TriggerIndicator />
            </ComboBox.Suffix>
          </ComboBox.InputGroup>
        </ComboBox.Trigger>
        <ComboBox.Portal>
          <ComboBox.Overlay />
          <ComboBox.Content>
            <ComboBox.List>
              <ComboBox.Item value="cat" label="Cat" />
              <ComboBox.Item value="dog" label="Dog" />
              <ComboBox.Item value="bird" label="Bird" />
            </ComboBox.List>
            <ComboBox.Empty>No matching animals.</ComboBox.Empty>
          </ComboBox.Content>
        </ComboBox.Portal>
        <Description>Type to filter the list.</Description>
      </ComboBox>
    </View>
  );
}
```

## API Reference

### ComboBox

Extends the `Select` root — all selection and open-state props are supported. `presentation` is not configurable (popover only).

| prop                | type                                 | default    | description                                                               |
| ------------------- | ------------------------------------ | ---------- | ------------------------------------------------------------------------- |
| `children`          | `React.ReactNode`                    | -          | Children elements (Label, ComboBox.Trigger, ComboBox.Portal, Description) |
| `selectionMode`     | `'single' \| 'multiple'`             | `'single'` | Whether one or many options can be selected                               |
| `value`             | `ComboBoxOption \| ComboBoxOption[]` | -          | Controlled selected option(s)                                             |
| `defaultValue`      | `ComboBoxOption \| ComboBoxOption[]` | -          | Default selected option(s) for uncontrolled usage                         |
| `isOpen`            | `boolean`                            | -          | Controlled open state of the popover                                      |
| `isDefaultOpen`     | `boolean`                            | -          | Initial open state for uncontrolled usage                                 |
| `inputValue`        | `string`                             | -          | Controlled text shown in `ComboBox.Input`                                 |
| `defaultInputValue` | `string`                             | `""`       | Uncontrolled initial input text                                           |
| `menuTrigger`       | `ComboBoxMenuTrigger`                | `'focus'`  | Interaction that opens the popover                                        |
| `filter`            | `ComboBoxFilter`                     | contains   | Predicate deciding whether an item matches the input text                 |
| `onClear`           | `() => void`                         | -          | Called after `ComboBox.ClearButton` clears the selection and input text   |
| `isDisabled`        | `boolean`                            | `false`    | Whether the entire field is disabled                                      |
| `isInvalid`         | `boolean`                            | `false`    | Whether the field is in an invalid state                                  |
| `isRequired`        | `boolean`                            | `false`    | Whether the field is required                                             |
| `className`         | `string`                             | -          | Additional CSS classes for the root container                             |
| `animation`         | `AnimationRootDisableAll`            | -          | Animation configuration for the combo box subtree                         |
| `onValueChange`     | `(value) => void`                    | -          | Handler called when the selection changes                                 |
| `onOpenChange`      | `(open: boolean) => void`            | -          | Handler called when the open state changes                                |
| `onInputChange`     | `(value: string) => void`            | -          | Handler called when the input text changes                                |
| `...ViewProps`      | `ViewProps`                          | -          | All standard React Native View props are supported                        |

#### ComboBoxOption

| property | type     | description                       |
| -------- | -------- | --------------------------------- |
| `value`  | `string` | Unique value identifying the item |
| `label`  | `string` | Display label for the item        |

#### ComboBoxMenuTrigger

- `'focus'` — opens when the input gains focus (and while typing) (default)
- `'input'` — opens while typing into the input
- `'manual'` — opens only from `ComboBox.Trigger` presses

### ComboBox.Trigger

Pass-through to `Select.Trigger` (always `unstyled`). Wrap it around `ComboBox.InputGroup`.

| prop                | type              | default | description                                             |
| ------------------- | ----------------- | ------- | ------------------------------------------------------- |
| `children`          | `React.ReactNode` | -       | Trigger content (ComboBox.InputGroup)                   |
| `isDisabled`        | `boolean`         | -       | Whether the trigger is disabled                         |
| `className`         | `string`          | -       | Additional CSS classes                                  |
| `...PressableProps` | `PressableProps`  | -       | All standard React Native Pressable props are supported |

### ComboBox.InputGroup

Same as `InputGroup`; `isDisabled` defaults to the root `isDisabled`.

### ComboBox.Input

`InputGroup.Input` wired to the combo box (`value` and `defaultValue` are managed by the root).

| prop            | type                      | default | description                                                    |
| --------------- | ------------------------- | ------- | -------------------------------------------------------------- |
| `placeholder`   | `string`                  | -       | Placeholder text shown when the input is empty                 |
| `isDisabled`    | `boolean`                 | -       | Whether the input is disabled; inherits from root when omitted |
| `onChangeText`  | `(text: string) => void`  | -       | Side-effect handler called after the internal change handler   |
| `onFocus`       | `(e: FocusEvent) => void` | -       | Side-effect handler called after the internal open logic       |
| `onBlur`        | `(e: BlurEvent) => void`  | -       | Side-effect handler called after the internal commit logic     |
| `...InputProps` | `InputGroupInputProps`    | -       | All InputGroup.Input props except `value` and `defaultValue`   |

### ComboBox.Prefix / ComboBox.Suffix

Same as `InputGroup.Prefix` / `InputGroup.Suffix`.

### ComboBox.TriggerIndicator

Same as `Select.TriggerIndicator` (animated chevron that rotates with the open state).

### ComboBox.ClearButton

Extends `CloseButton`. Rendered inside the input group suffix; hidden while there is no selection and the input is empty. Pressing it clears the selection (`undefined` in single mode, `[]` in multiple mode) and the input text, then calls `onClear` from the root.

| prop                  | type               | default             | description                                        |
| --------------------- | ------------------ | ------------------- | -------------------------------------------------- |
| `isDisabled`          | `boolean`          | -                   | Whether the button is disabled; inherits from root |
| `accessibilityLabel`  | `string`           | `'Clear selection'` | Screen reader label                                |
| `className`           | `string`           | -                   | Additional CSS classes                             |
| `...CloseButtonProps` | `CloseButtonProps` | -                   | All CloseButton props are supported                |

### ComboBox.Value

Same as `Select.Value` with an optional placeholder.

| prop          | type     | default               | description                      |
| ------------- | -------- | --------------------- | -------------------------------- |
| `placeholder` | `string` | `'No items selected'` | Shown when no option is selected |

### ComboBox.Portal

Same as `Select.Portal`. Re-provides the combo box context across the portal boundary.

### ComboBox.Overlay

Same as `Select.Overlay`. Transparent by default; pressing it dismisses the popover.

### ComboBox.Content

Popover subset of `Select.Content` — `presentation` is fixed to `"popover"`. The popover has no keyboard avoidance; use `placement="top"` when the field sits in the lower half of the screen so the open keyboard cannot cover the list.

| prop           | type                                             | default     | description                                           |
| -------------- | ------------------------------------------------ | ----------- | ----------------------------------------------------- |
| `children`     | `React.ReactNode`                                | -           | Content (ComboBox.List, ComboBox.Empty)               |
| `width`        | `'content-fit' \| 'trigger' \| 'full' \| number` | `'trigger'` | Content width sizing strategy                         |
| `placement`    | `'top' \| 'bottom' \| 'left' \| 'right'`         | `'bottom'`  | Popover placement relative to the input group         |
| `offset`       | `number`                                         | `4`         | Gap between the input group and the popover           |
| `className`    | `string`                                         | -           | Additional CSS classes for the content container      |
| `animation`    | `SelectContentPopoverAnimation`                  | -           | Keyframe animation configuration for entering/exiting |
| `...ViewProps` | `ViewProps`                                      | -           | All standard React Native View props are supported    |

### ComboBox.List

| prop                        | type              | default     | description                                        |
| --------------------------- | ----------------- | ----------- | -------------------------------------------------- |
| `children`                  | `React.ReactNode` | -           | List content (ComboBox.Item, ComboBox.ListLabel)   |
| `keyboardShouldPersistTaps` | `string`          | `'handled'` | Keeps item taps working while the keyboard is open |
| `className`                 | `string`          | -           | Additional CSS classes                             |
| `...ScrollViewProps`        | `ScrollViewProps` | -           | All standard React Native ScrollView props         |

### ComboBox.Item

Extends `Select.Item` with a filter text override.

| prop           | type              | default | description                                                    |
| -------------- | ----------------- | ------- | -------------------------------------------------------------- |
| `value`        | `string`          | -       | The value of this item                                         |
| `label`        | `string`          | -       | The label to display for this item                             |
| `textValue`    | `string`          | -       | Text used for filtering instead of `label`                     |
| `closeOnPress` | `boolean`         | mode    | Defaults to `true` in single mode and `false` in multiple mode |
| `children`     | `ReactNode \| fn` | -       | Custom item content, or a render function receiving item state |

### ComboBox.ItemLabel / ComboBox.ItemDescription / ComboBox.ItemIndicator / ComboBox.ListLabel

Same as the corresponding `Select` parts.

### ComboBox.Empty

| prop         | type                                          | default               | description                                             |
| ------------ | --------------------------------------------- | --------------------- | ------------------------------------------------------- |
| `children`   | `React.ReactNode`                             | `'No results found.'` | Fallback content (strings render styled)                |
| `className`  | `string`                                      | -                     | Additional CSS classes for the container                |
| `classNames` | `ElementSlots<EmptySlots>`                    | -                     | Additional CSS classes for the container and text slots |
| `styles`     | `{ container?: ViewStyle; text?: TextStyle }` | -                     | Styles for the container and text slots                 |

## Hooks

### useComboBox

Hook to access the combo box context. Must be used within a `ComboBox` component.

```tsx
import { useComboBox } from 'heroui-native-pro';

const { inputValue, filterText, visibleItemCount, openMenu } = useComboBox();
```

#### Returns: ComboBoxContextValue

| property           | type                      | description                                                                         |
| ------------------ | ------------------------- | ----------------------------------------------------------------------------------- |
| `inputValue`       | `string`                  | Current text shown in `ComboBox.Input`                                              |
| `filterText`       | `string`                  | Text driving item filtering (empty while showing a committed single-mode selection) |
| `onInputChange`    | `(value: string) => void` | Updates the input text                                                              |
| `onInputBlur`      | `() => void`              | Commits the input text on blur while the popover is closed                          |
| `openMenu`         | `() => void`              | Opens the popover (measures the trigger first)                                      |
| `menuTrigger`      | `ComboBoxMenuTrigger`     | Interaction that opens the popover                                                  |
| `filter`           | `ComboBoxFilter`          | Predicate deciding whether an item matches the filter text                          |
| `visibleItemCount` | `number`                  | Number of registered items matching the current filter text                         |
| `isDisabledRoot`   | `boolean`                 | `isDisabled` from the root                                                          |
