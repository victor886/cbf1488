# RadioButtonGroup

A compound radio group for choosing one option, with flexible item content and styling hooks for selected state and variants.

## Import

```tsx
import { RadioButtonGroup } from 'heroui-native-pro';
```

## Anatomy

```tsx
<RadioButtonGroup>
  <RadioButtonGroup.Item value="...">
    <RadioButtonGroup.ItemContent>...</RadioButtonGroup.ItemContent>
    <Radio />
  </RadioButtonGroup.Item>
</RadioButtonGroup>
```

- **RadioButtonGroup**: Root wrapper around HeroUI Native `RadioGroup`. Holds the selected `value`, `onValueChange`, and optional group `variant`. Exposes the same context as `RadioGroup` (`useRadioButtonGroup` matches `useRadioGroup`).
- **RadioButtonGroup.Item**: Wraps `RadioGroup.Item`. Sets `data-selected` and `data-variant` for Tailwind variants, merges default item styles, and maps your `variant` to the underlying item variant so row styling stays consistent.
- **RadioButtonGroup.ItemBackground**: Optional theme-aware background container rendered behind the item surface. Mounted automatically for the unselected `secondary` variant when the active theme registers default background content (e.g. `glass`). Replace or remove it via the `background` prop.
- **RadioButtonGroup.ItemContent**: Optional row container (`flex-1`) for label text, descriptions, and `Radio` / `Radio.Indicator`. Place the `Radio` inside the item as sibling or child depending on layout.
- **Radio**: The radio control component.

## Usage

### Basic usage

Controlled group with two items and centered content inside each row.

```tsx
const [subscription, setSubscription] = useState('quarterly');

<RadioButtonGroup className="flex-row" value={subscription} onValueChange={setSubscription}>
  <RadioButtonGroup.Item className="flex-1" value="quarterly">
    <RadioButtonGroup.ItemContent className="items-center">...</RadioButtonGroup.ItemContent>
  </RadioButtonGroup.Item>
  <RadioButtonGroup.Item className="flex-1" value="monthly">
    <RadioButtonGroup.ItemContent className="items-center">...</RadioButtonGroup.ItemContent>
  </RadioButtonGroup.Item>
</RadioButtonGroup>;
```

### Group variant

Set `variant` on the root so items inherit `primary` or `secondary` surface styling unless an item overrides `variant`.

```tsx
<RadioButtonGroup variant="secondary" value={plan} onValueChange={setPlan}>
  <RadioButtonGroup.Item value="monthly" className="py-5">
    <Radio />
    <RadioButtonGroup.ItemContent>...</RadioButtonGroup.ItemContent>
  </RadioButtonGroup.Item>
</RadioButtonGroup>
```

### With radio and labels

Use `Radio` with `Label` and `Description` inside an item for a typical list row.

```tsx
<RadioButtonGroup value={plan} variant="secondary" onValueChange={setPlan}>
  <RadioButtonGroup.Item value="monthly" className="py-5">
    <Radio />
    <RadioButtonGroup.ItemContent>
      <Label>Monthly</Label>
      <Description>...</Description>
    </RadioButtonGroup.ItemContent>
  </RadioButtonGroup.Item>
</RadioButtonGroup>
```

### Render function children

Use a render function on `RadioButtonGroup.Item` to read `isSelected` and compose a custom `Radio.Indicator`.

```tsx
<RadioButtonGroup value={billing} variant="secondary" onValueChange={setBilling}>
  <RadioButtonGroup.Item value="yearly" className="flex-1">
    {({ isSelected }) => (
      <>
        <RadioButtonGroup.ItemContent>...</RadioButtonGroup.ItemContent>
        <Radio>
          <Radio.Indicator>{isSelected && ...}</Radio.Indicator>
        </Radio>
      </>
    )}
  </RadioButtonGroup.Item>
</RadioButtonGroup>
```

## Example

```tsx
import { Chip } from 'heroui-native';
import { RadioButtonGroup } from 'heroui-native-pro';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';

const PrimaryVariantContent = () => {
  const [subscription, setSubscription] = useState('quarterly');

  return (
    <View className="flex-1 justify-center px-5">
      <View className="mb-5 items-center px-2">
        <AppText className="text-foreground text-base font-medium">Choose a subscription</AppText>
        <AppText className="text-muted text-sm">Choose the plan that best fits your needs</AppText>
      </View>
      <RadioButtonGroup
        className="flex-row gap-3"
        value={subscription}
        onValueChange={setSubscription}
      >
        <RadioButtonGroup.Item className="flex-1" value="quarterly">
          <RadioButtonGroup.ItemContent className="items-center">
            <AppText className="text-foreground text-3xl font-semibold">3</AppText>
            <AppText className="text-foreground text-base font-semibold">months</AppText>
            <AppText className="text-foreground mb-2 text-base font-semibold">$3.99/wk</AppText>
            <Chip size="sm" className="self-center">
              Save 73%
            </Chip>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
        <RadioButtonGroup.Item className="flex-1" value="monthly">
          <RadioButtonGroup.ItemContent className="items-center">
            <AppText className="text-foreground text-3xl font-semibold">1</AppText>
            <AppText className="text-foreground text-base font-semibold">month</AppText>
            <AppText className="text-foreground mb-2 text-base font-semibold">$5.77/wk</AppText>
            <Chip size="sm" variant="soft" color="warning" className="self-center">
              Popular
            </Chip>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
      </RadioButtonGroup>
    </View>
  );
};
```

## API Reference

Full prop tables, render-prop shapes, and hook return values are documented for HeroUI Native `RadioGroup` here:

**[RadioGroup API reference](https://heroui.com/docs/native/components/radio-group#api-reference)**

Inheritance in this package:

- **`RadioButtonGroup`** — Same API as **`RadioGroup`** ([`RadioGroupProps`](https://heroui.com/docs/native/components/radio-group#api-reference)). Forwarded to the underlying `RadioGroup` root.
- **`RadioButtonGroup.Item`** — Same API as **`RadioGroup.Item`** ([`RadioGroupItemProps`](https://heroui.com/docs/native/components/radio-group#api-reference), including `RadioGroupItemRenderProps` for render children). Adds `data-selected`, `data-variant`, default item styling, and variant mapping for the wrapped row; see the source if you rely on those details. Also adds a `background` prop (`React.ReactNode`) for the layer behind the item surface: `undefined` renders the theme-aware default for the unselected `secondary` variant; a custom node replaces it; `null` removes it.
- **`RadioButtonGroup.ItemBackground`** — Not part of HeroUI `RadioGroup`. Absolute-fill container rendered behind the item surface. With no children, the active library theme decides the default content (e.g. a glass blur layer); pass children to host custom content with the same positioning and clipping. Extends React Native **`View`** with optional `children` and `className` (see `RadioButtonGroupItemBackgroundProps` in this repo).
- **`RadioButtonGroup.ItemContent`** — Not part of HeroUI `RadioGroup`. Extends React Native **`View`** with an optional `className` (see `RadioButtonGroupItemContentProps` in this repo).
- **`useRadioButtonGroup`** — Same behavior as **`useRadioGroup`** from `heroui-native`.
- **`useRadioButtonGroupItem`** — Same behavior as **`useRadioGroupItem`** from `heroui-native`.
