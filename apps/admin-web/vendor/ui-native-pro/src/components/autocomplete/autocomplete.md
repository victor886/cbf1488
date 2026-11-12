# Autocomplete

An autocomplete combines a select with filtering, allowing users to search and select from a list of options.

> `Autocomplete` extends the heroui-native `Select` (selection, open state, and presentation) and `SearchField` (in-content filtering). Selection lives on the trigger while the search input is rendered inside the portaled content — it is a searchable select, not a free-text combo box.

## Import

```tsx
import { Autocomplete } from 'heroui-native-pro';
```

## Anatomy

```tsx
<Autocomplete>
  <Label>...</Label>
  <Autocomplete.Trigger>
    <Autocomplete.Value />
    <Autocomplete.ClearButton />
    <Autocomplete.TriggerIndicator />
  </Autocomplete.Trigger>
  <Autocomplete.Portal>
    <Autocomplete.Overlay />
    <Autocomplete.Content presentation="popover" width="trigger">
      <Autocomplete.SearchField />
      <Autocomplete.List>
        <Autocomplete.Item value="..." label="..." />
      </Autocomplete.List>
      <Autocomplete.Empty />
    </Autocomplete.Content>
  </Autocomplete.Portal>
  <Description>...</Description>
</Autocomplete>
```

- **Autocomplete**: Root that wraps `Select` and manages the search text, item filtering, clear behavior, and form field context (for Label, Description, FieldError). Supports single and multiple selection, controlled and uncontrolled modes.
- **Autocomplete.Trigger**: Pressable field surface that toggles the overlay. Inherits invalid border styling from the root.
- **Autocomplete.Value**: Selected label(s) or placeholder (defaults to `"Select an item"`).
- **Autocomplete.ClearButton**: Optional close button inside the trigger row that clears the selection and calls `onClear`. Hidden while nothing is selected.
- **Autocomplete.TriggerIndicator**: Chevron indicator that rotates with the open state.
- **Autocomplete.Portal**: Portal wrapper that re-provides the Autocomplete context across the portal boundary.
- **Autocomplete.Overlay**: Backdrop overlay behind the content. Tinted for the dialog and bottom-sheet presentations; transparent for popovers, where it only provides tap-outside dismissal.
- **Autocomplete.Content**: Content container. Supports `"popover"`, `"dialog"`, and `"bottom-sheet"` presentations.
- **Autocomplete.SearchField**: Search input wired to the autocomplete search text. Renders a default `SearchField` composition when no children are given.
- **Autocomplete.List**: Scrollable list container (`keyboardShouldPersistTaps="handled"`) with a capped height.
- **Autocomplete.Item**: Selectable option filtered by the search text. `textValue` overrides `label` for matching.
- **Autocomplete.ItemLabel / ItemDescription / ItemIndicator**: Item content parts (same as `Select`).
- **Autocomplete.ListLabel**: Section label for grouped items.
- **Autocomplete.Empty**: Fallback shown when no item matches the search text (also covers an empty collection).
- **Autocomplete.Close**: Close button for the overlay (useful for dialog and bottom-sheet presentations).

## Usage

### Basic Usage

The autocomplete uses a popover presentation by default. Items are filtered as the user types with a case- and diacritic-insensitive "contains" match.

```tsx
<Autocomplete>
  <Label>State</Label>
  <Autocomplete.Trigger>
    <Autocomplete.Value />
    <Autocomplete.TriggerIndicator />
  </Autocomplete.Trigger>
  <Autocomplete.Portal>
    <Autocomplete.Overlay />
    <Autocomplete.Content presentation="popover" width="trigger">
      <Autocomplete.SearchField />
      <Autocomplete.List>
        <Autocomplete.Item value="ca" label="California" />
        <Autocomplete.Item value="tx" label="Texas" />
        <Autocomplete.Item value="ny" label="New York" />
      </Autocomplete.List>
      <Autocomplete.Empty />
    </Autocomplete.Content>
  </Autocomplete.Portal>
</Autocomplete>
```

### With Clear Button

Add `Autocomplete.ClearButton` to the trigger row. It stays hidden while nothing is selected; pressing it clears the selection and calls `onClear` from the root.

```tsx
<Autocomplete onClear={handleClear}>
  <Autocomplete.Trigger>
    <Autocomplete.Value />
    <Autocomplete.ClearButton />
    <Autocomplete.TriggerIndicator />
  </Autocomplete.Trigger>
  <Autocomplete.Portal>...</Autocomplete.Portal>
</Autocomplete>
```

### Multiple Selection

Set `selectionMode="multiple"`. The trigger shows a formatted list of the selected labels, and items stay open on press.

```tsx
import type { AutocompleteOption } from 'heroui-native-pro';
import { useState } from 'react';

const [selected, setSelected] = useState<AutocompleteOption[]>([]);

<Autocomplete selectionMode="multiple" value={selected} onValueChange={setSelected}>
  <Autocomplete.Trigger>
    <Autocomplete.Value placeholder="Select states" />
    <Autocomplete.ClearButton />
    <Autocomplete.TriggerIndicator />
  </Autocomplete.Trigger>
  <Autocomplete.Portal>...</Autocomplete.Portal>
</Autocomplete>;
```

### Controlled

Control the selected option with `value` / `onValueChange`, the overlay with `isOpen` / `onOpenChange`, and the search text with `inputValue` / `onInputChange`.

```tsx
import type { AutocompleteOption } from 'heroui-native-pro';
import { useState } from 'react';

const [selected, setSelected] = useState<AutocompleteOption | undefined>({
  value: 'ca',
  label: 'California',
});
const [isOpen, setIsOpen] = useState(false);
const [search, setSearch] = useState('');

<Autocomplete
  value={selected}
  onValueChange={setSelected}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  inputValue={search}
  onInputChange={setSearch}
>
  <Autocomplete.Trigger>...</Autocomplete.Trigger>
  <Autocomplete.Portal>...</Autocomplete.Portal>
</Autocomplete>;
```

### Custom Filter

Pass a `filter` predicate to replace the default "contains" match — e.g. a "starts with" match, or an always-true filter when the item collection is filtered externally (async search).

```tsx
<Autocomplete
  filter={(textValue, inputValue) =>
    textValue.toLowerCase().startsWith(inputValue.trim().toLowerCase())
  }
>
  ...
</Autocomplete>
```

### Filter Text Override

Use `textValue` on items to match against different text than the visible label (e.g. keywords).

```tsx
<Autocomplete.Item value="ny" label="New York" textValue="New York NYC Big Apple" />
```

### Sections

Group items with `Autocomplete.ListLabel`.

```tsx
<Autocomplete.List>
  <Autocomplete.ListLabel>West Coast</Autocomplete.ListLabel>
  <Autocomplete.Item value="ca" label="California" />
  <Autocomplete.Item value="wa" label="Washington" />
  <Autocomplete.ListLabel>East Coast</Autocomplete.ListLabel>
  <Autocomplete.Item value="ny" label="New York" />
</Autocomplete.List>
```

### Empty State

`Autocomplete.Empty` renders only when no registered item matches the current search text. String (or omitted) children render styled muted text; custom nodes render as-is.

```tsx
<Autocomplete.Content presentation="popover" width="trigger">
  <Autocomplete.SearchField />
  <Autocomplete.List>...</Autocomplete.List>
  <Autocomplete.Empty>No matching states.</Autocomplete.Empty>
</Autocomplete.Content>
```

### Dialog and Bottom Sheet Presentations

Match `presentation` between the root and `Autocomplete.Content`, exactly like `Select`.

The default `Autocomplete.SearchField` input autofocuses when the overlay opens, for every presentation. Because of that, the bottom sheet defaults to a fixed `snapPoints={['90%']}` with `enableDynamicSizing={false}` so its content sits above the keyboard from the start, together with `keyboardBehavior="extend"`, `keyboardBlurBehavior="restore"`, `android_keyboardInputMode="adjustResize"`, and bottom-sheet-aware focus/blur handlers on the input. Selecting an item that closes the overlay also dismisses the keyboard. All of these props can be overridden (e.g. `autoFocus={false}` on `Autocomplete.SearchField`).

```tsx
<Autocomplete presentation="bottom-sheet">
  <Autocomplete.Trigger>
    <Autocomplete.Value />
    <Autocomplete.TriggerIndicator />
  </Autocomplete.Trigger>
  <Autocomplete.Portal>
    <Autocomplete.Overlay />
    <Autocomplete.Content presentation="bottom-sheet">
      <Autocomplete.SearchField />
      <Autocomplete.List>...</Autocomplete.List>
      <Autocomplete.Empty />
    </Autocomplete.Content>
  </Autocomplete.Portal>
</Autocomplete>
```

For the dialog presentation, position the content below the top safe-area inset (instead of the centered default) so the keyboard cannot cover it:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

<Autocomplete.Content
  presentation="dialog"
  classNames={{ wrapper: 'justify-start' }}
  styles={{ wrapper: { paddingTop: insets.top + 12 } }}
>
  ...
</Autocomplete.Content>;
```

### Field States

Use root props for required, invalid, and disabled states. Combine `isInvalid` with `FieldError` to display validation messages; the trigger shows a danger border.

```tsx
<Autocomplete isInvalid>
  <Label>State</Label>
  <Autocomplete.Trigger>
    <Autocomplete.Value />
    <Autocomplete.TriggerIndicator />
  </Autocomplete.Trigger>
  <Autocomplete.Portal>...</Autocomplete.Portal>
  <Description hideOnInvalid>Where you currently live.</Description>
  <FieldError>Please select a state.</FieldError>
</Autocomplete>
```

## Example

```tsx
import { Label } from 'heroui-native';
import { Autocomplete } from 'heroui-native-pro';
import { View } from 'react-native';

const STATES = [
  { value: 'ca', label: 'California' },
  { value: 'tx', label: 'Texas' },
  { value: 'fl', label: 'Florida' },
  { value: 'ny', label: 'New York' },
  { value: 'wa', label: 'Washington' },
];

export default function AutocompleteExample() {
  return (
    <View className="flex-1 justify-center px-5">
      <Autocomplete>
        <Label>State</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value placeholder="Select a state" />
          <Autocomplete.ClearButton />
          <Autocomplete.TriggerIndicator />
        </Autocomplete.Trigger>
        <Autocomplete.Portal>
          <Autocomplete.Overlay />
          <Autocomplete.Content presentation="popover" width="trigger">
            <Autocomplete.SearchField placeholder="Search states..." />
            <Autocomplete.List>
              {STATES.map((state) => (
                <Autocomplete.Item key={state.value} value={state.value} label={state.label} />
              ))}
            </Autocomplete.List>
            <Autocomplete.Empty />
          </Autocomplete.Content>
        </Autocomplete.Portal>
      </Autocomplete>
    </View>
  );
}
```

## API Reference

### Autocomplete

Extends all `Select` root props (generic on `selectionMode`).

| prop                | type                                         | default     | description                                                          |
| ------------------- | -------------------------------------------- | ----------- | -------------------------------------------------------------------- |
| `children`          | `React.ReactNode`                            | -           | Children elements (Label, Trigger, Portal, Description, FieldError)  |
| `selectionMode`     | `'single' \| 'multiple'`                     | `'single'`  | Whether single or multiple selection is enabled                      |
| `value`             | `AutocompleteOption \| AutocompleteOption[]` | -           | Controlled selected option(s), typed by `selectionMode`              |
| `defaultValue`      | `AutocompleteOption \| AutocompleteOption[]` | -           | Default selected option(s) for uncontrolled usage                    |
| `isOpen`            | `boolean`                                    | -           | Controlled open state of the overlay                                 |
| `isDefaultOpen`     | `boolean`                                    | -           | Initial open state for uncontrolled usage                            |
| `presentation`      | `'popover' \| 'bottom-sheet' \| 'dialog'`    | `'popover'` | Presentation mode (must match `Autocomplete.Content`)                |
| `isDisabled`        | `boolean`                                    | `false`     | Whether the entire field is disabled                                 |
| `isInvalid`         | `boolean`                                    | `false`     | Whether the field is in an invalid state                             |
| `isRequired`        | `boolean`                                    | `false`     | Whether the field is required                                        |
| `inputValue`        | `string`                                     | -           | Controlled search text                                               |
| `defaultInputValue` | `string`                                     | `''`        | Initial search text for uncontrolled usage                           |
| `filter`            | `AutocompleteFilter`                         | contains    | Predicate deciding whether an item matches the search text           |
| `clearInputOnClose` | `boolean`                                    | `true`      | Whether the search text resets when the overlay closes               |
| `className`         | `string`                                     | -           | Additional CSS classes for the root container                        |
| `onValueChange`     | `(value) => void`                            | -           | Handler called when the selection changes                            |
| `onOpenChange`      | `(open: boolean) => void`                    | -           | Handler called when the open state changes                           |
| `onInputChange`     | `(value: string) => void`                    | -           | Handler called when the search text changes                          |
| `onClear`           | `() => void`                                 | -           | Handler called after `Autocomplete.ClearButton` clears the selection |
| `animation`         | `AnimationRootDisableAll`                    | -           | Animation configuration for the autocomplete subtree                 |
| `...ViewProps`      | `ViewProps`                                  | -           | All standard React Native View props are supported                   |

#### AutocompleteOption

| property | type     | description                                      |
| -------- | -------- | ------------------------------------------------ |
| `value`  | `string` | Unique option value                              |
| `label`  | `string` | Display string shown in the trigger and the item |

#### AutocompleteFilter

```ts
type AutocompleteFilter = (textValue: string, inputValue: string) => boolean;
```

The default filter is a case- and diacritic-insensitive "contains" match (exported as `defaultAutocompleteFilter`).

### Autocomplete.Trigger

| prop                | type              | default | description                                                           |
| ------------------- | ----------------- | ------- | --------------------------------------------------------------------- |
| `children`          | `React.ReactNode` | -       | Trigger content (Value, ClearButton, TriggerIndicator)                |
| `isDisabled`        | `boolean`         | -       | Whether the trigger is disabled                                       |
| `isInvalid`         | `boolean`         | -       | When `true`, applies a danger border; inherits from root when omitted |
| `className`         | `string`          | -       | Additional CSS classes for the trigger                                |
| `...PressableProps` | `PressableProps`  | -       | All standard React Native Pressable props are supported               |

### Autocomplete.Value

| prop           | type        | default            | description                                        |
| -------------- | ----------- | ------------------ | -------------------------------------------------- |
| `placeholder`  | `string`    | `'Select an item'` | Text shown when nothing is selected                |
| `className`    | `string`    | -                  | Additional CSS classes for the value text          |
| `...TextProps` | `TextProps` | -                  | All standard React Native Text props are supported |

### Autocomplete.TriggerIndicator

Same as `Select.TriggerIndicator` — an animated chevron that rotates with the open state (`animation`, `iconProps`, `isAnimatedStyleActive`).

### Autocomplete.ClearButton

Extends `CloseButton` (which extends `Button`). Hidden while nothing is selected. Renders as a compact 24px button (icon size 14) with `hitSlop` preserving the touch target.

| prop                 | type                   | default             | description                                |
| -------------------- | ---------------------- | ------------------- | ------------------------------------------ |
| `iconProps`          | `CloseButtonIconProps` | `{ size: 14 }`      | Overrides for the default close icon       |
| `hitSlop`            | `number`               | `10`                | Extra touch area around the compact button |
| `isDisabled`         | `boolean`              | root `isDisabled`   | Whether the button is disabled             |
| `accessibilityLabel` | `string`               | `'Clear selection'` | Screen reader label                        |
| `className`          | `string`               | -                   | Additional CSS classes                     |
| `onPress`            | `(event) => void`      | -                   | Called after the selection is cleared      |
| `...ButtonProps`     | `ButtonRootProps`      | -                   | All `Button` props are supported           |

### Autocomplete.Portal / Autocomplete.Overlay / Autocomplete.Content / Autocomplete.ContentBackground

Same props as the corresponding `Select` parts. `Autocomplete.Content` is a union type discriminated by `presentation` (`'popover'` with `width`, `'dialog'` with `isSwipeable`, `'bottom-sheet'` with `BottomSheetProps`).

For the bottom-sheet presentation, the sheet defaults to a fixed `snapPoints={['90%']}` with `enableDynamicSizing={false}` — the search input autofocuses on open, so the sheet must be tall enough from the start to keep the content above the keyboard. Keyboard props default to `keyboardBehavior="extend"`, `keyboardBlurBehavior="restore"`, and `android_keyboardInputMode="adjustResize"`. Pass any of these props explicitly to override.

### Autocomplete.SearchField

Extends `SearchField` root props (minus `value` / `onChange`, which come from the root). The default input uses `variant="secondary"` and wires bottom-sheet-aware focus/blur handlers (no-ops outside a bottom sheet).

| prop             | type                    | default       | description                                                                                                        |
| ---------------- | ----------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `children`       | `React.ReactNode`       | -             | Custom `SearchField` composition; replaces the default when provided                                               |
| `placeholder`    | `string`                | `'Search...'` | Placeholder for the default input (ignored with `children`)                                                        |
| `autoFocus`      | `boolean`               | `true`        | Whether the default input focuses when the overlay opens (ignored with `children`)                                 |
| `autoFocusDelay` | `number`                | `150` / `300` | Delay in ms before the automatic focus: 150 for popover and dialog, 300 for bottom-sheet (ignored with `children`) |
| `inputProps`     | `SearchFieldInputProps` | -             | Extra props for the default input, e.g. `variant` to override `'secondary'` (ignored with `children`)              |
| `isDisabled`     | `boolean`               | root value    | Whether the search field is disabled                                                                               |
| `className`      | `string`                | -             | Additional CSS classes                                                                                             |
| `...ViewProps`   | `ViewProps`             | -             | All standard React Native View props are supported                                                                 |

### Autocomplete.List

| prop                        | type              | default     | description                                           |
| --------------------------- | ----------------- | ----------- | ----------------------------------------------------- |
| `children`                  | `React.ReactNode` | -           | Items and list labels                                 |
| `keyboardShouldPersistTaps` | `string`          | `'handled'` | Keeps item presses working while the keyboard is open |
| `className`                 | `string`          | -           | Additional CSS classes (max height set in CSS)        |
| `...ScrollViewProps`        | `ScrollViewProps` | -           | All standard ScrollView props are supported           |

### Autocomplete.Item

Extends `Select.Item`.

| prop                | type             | default | description                                                      |
| ------------------- | ---------------- | ------- | ---------------------------------------------------------------- |
| `value`             | `string`         | -       | Unique option value                                              |
| `label`             | `string`         | -       | Display label (also the default filter text)                     |
| `textValue`         | `string`         | -       | Filter text override (e.g. keywords for a custom-rendered label) |
| `disabled`          | `boolean`        | `false` | Whether the item is disabled                                     |
| `closeOnPress`      | `boolean`        | mode    | Close on press (`true` in single mode, `false` in multiple mode) |
| `children`          | node / render fn | -       | Custom item content; defaults to `ItemLabel` + `ItemIndicator`   |
| `className`         | `string`         | -       | Additional CSS classes                                           |
| `...PressableProps` | `PressableProps` | -       | All standard React Native Pressable props are supported          |

### Autocomplete.ItemLabel / ItemDescription / ItemIndicator / ListLabel / Close

Same props as the corresponding `Select` parts.

### Autocomplete.Empty

| prop           | type                                          | default               | description                                            |
| -------------- | --------------------------------------------- | --------------------- | ------------------------------------------------------ |
| `children`     | `React.ReactNode`                             | `'No results found.'` | String children render styled text; nodes render as-is |
| `className`    | `string`                                      | -                     | Additional CSS classes for the container               |
| `classNames`   | `{ container?: string; text?: string }`       | -                     | CSS classes per slot                                   |
| `styles`       | `{ container?: ViewStyle; text?: TextStyle }` | -                     | Styles per slot                                        |
| `...ViewProps` | `ViewProps`                                   | -                     | All standard React Native View props are supported     |

## Hooks

### useAutocomplete

Hook to access the Autocomplete context. Must be used within an `Autocomplete` component.

```tsx
import { useAutocomplete } from 'heroui-native-pro';

const { inputValue, onInputChange, visibleItemCount } = useAutocomplete();
```

#### Returns: AutocompleteContextValue

| property           | type                                         | description                                                 |
| ------------------ | -------------------------------------------- | ----------------------------------------------------------- |
| `inputValue`       | `string`                                     | Current search text                                         |
| `onInputChange`    | `(value: string) => void`                    | Update the search text                                      |
| `filter`           | `AutocompleteFilter`                         | Active filter predicate                                     |
| `registerItem`     | `(value: string, textValue: string) => void` | Registers an item's filter text (used internally by `Item`) |
| `unregisterItem`   | `(value: string) => void`                    | Removes an item from the registry                           |
| `visibleItemCount` | `number`                                     | Registered items matching the current search text           |
| `onClear`          | `(() => void) \| undefined`                  | Root `onClear` callback                                     |
| `isDisabledRoot`   | `boolean`                                    | Whether the root is disabled                                |

> Selection and open state live in the wrapped `Select` — read them with `useSelect` from `heroui-native` inside the autocomplete subtree.
