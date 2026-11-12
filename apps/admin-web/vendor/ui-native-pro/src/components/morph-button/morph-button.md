# MorphButton

A pressable surface that morphs between auto-measured collapsed and expanded content, growing toward one of eight logical directions.

## Import

```tsx
import { MorphButton } from 'heroui-native-pro';
```

## Anatomy

```tsx
<MorphButton>
  <MorphButton.CollapsedContent>...</MorphButton.CollapsedContent>
  <MorphButton.ExpandedContent>...</MorphButton.ExpandedContent>
</MorphButton>
```

- **MorphButton**: Root container managing the open state. Its layout footprint always equals the collapsed content, so the expanding surface overflows without shifting surrounding layout. Tapping toggles the open state. Supports controlled and uncontrolled open state.
- **MorphButton.CollapsedContent**: In-flow content shown while collapsed. Its natural size defines the root footprint and the collapsed morph target. Fades and scales out while open.
- **MorphButton.ExpandedContent**: Panel content shown while expanded. Always mounted and measured at its natural size while hidden, so the morph target is known before the first open and the content never reflows mid-morph. Fades and scales in while open.

## Usage

### Basic usage

Both content parts are measured automatically; the surface springs between their sizes when tapped.

```tsx
<MorphButton>
  <MorphButton.CollapsedContent>...</MorphButton.CollapsedContent>
  <MorphButton.ExpandedContent className="w-72">...</MorphButton.ExpandedContent>
</MorphButton>
```

### Variants

Apply a surface color scheme with the `variant` prop. `primary` is a high-contrast inverted surface for floating buttons over app content; `secondary` reads clearly when the button sits on a `surface` card.

```tsx
<MorphButton variant="primary">...</MorphButton>

<MorphButton variant="secondary">...</MorphButton>
```

### Directions

Choose which way the surface grows with the `direction` prop. The opposite corner/edge stays pinned to the collapsed button. `start` and `end` are logical, so all eight directions mirror in RTL.

```tsx
<MorphButton direction="top">...</MorphButton>

<MorphButton direction="bottom-end">...</MorphButton>

<MorphButton direction="start">...</MorphButton>
```

### Positioning

The root's footprint stays at the collapsed size, so position it like any static element. Give the expanding side enough room; the panel overflows the root without shifting siblings.

```tsx
<View className="absolute inset-x-0 bottom-6 items-center">
  <MorphButton direction="top">...</MorphButton>
</View>
```

### Panel width

The expanded size is measured from the content. For panel layouts, set an explicit width on `ExpandedContent`; height flows from the content and re-measures when it changes.

```tsx
<MorphButton>
  <MorphButton.CollapsedContent>...</MorphButton.CollapsedContent>
  <MorphButton.ExpandedContent className="w-80">...</MorphButton.ExpandedContent>
</MorphButton>
```

### Controlled

Control the open state externally with `isOpen` and `onOpenChange`. Taps on the surface still request a toggle through `onOpenChange`.

```tsx
const [isOpen, setIsOpen] = useState(false);

<MorphButton isOpen={isOpen} onOpenChange={setIsOpen}>
  ...
</MorphButton>;
```

### Disabled

Disable the toggle interaction with `isDisabled`.

```tsx
<MorphButton isDisabled>...</MorphButton>
```

### Custom morph spring

Customize the width/height spring through the `animation` prop, or pass `"disable-all"` to snap every transition.

```tsx
<MorphButton animation={{ morphSpringConfig: { damping: 30, stiffness: 400 } }}>
  ...
</MorphButton>

<MorphButton animation="disable-all">...</MorphButton>
```

## Example

```tsx
import { Button, Separator } from 'heroui-native';
import { MorphButton } from 'heroui-native-pro';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function CartMorphButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="absolute inset-x-0 bottom-6 items-center">
      <MorphButton direction="top" isOpen={isOpen} onOpenChange={setIsOpen}>
        <MorphButton.CollapsedContent>
          <Text className="text-background text-sm font-medium">2 products in bag</Text>
          <View className="bg-accent-soft rounded-2xl px-2 py-0.5">
            <Text className="text-accent-soft-foreground text-xs font-medium">View</Text>
          </View>
        </MorphButton.CollapsedContent>
        <MorphButton.ExpandedContent className="w-80">
          <Text className="text-background text-base font-semibold">Order summary</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-background/70 text-sm">2 × Gazelle Indoor</Text>
            <Text className="text-background text-sm font-medium">$208</Text>
          </View>
          <Separator className="bg-background/15" />
          <View className="flex-row items-center justify-between">
            <Text className="text-background text-sm font-medium">Subtotal</Text>
            <Text className="text-background text-base font-semibold">$208</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Button
              size="sm"
              variant="tertiary"
              className="bg-background/10 flex-1"
              onPress={() => setIsOpen(false)}
            >
              <Button.Label className="text-background">Keep shopping</Button.Label>
            </Button>
            <Button size="sm" variant="tertiary" className="bg-background flex-1">
              <Button.Label className="text-foreground">Buy now</Button.Label>
            </Button>
          </View>
        </MorphButton.ExpandedContent>
      </MorphButton>
    </View>
  );
}
```

## API Reference

### MorphButton

| prop                | type                                                                                                  | default     | description                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| `children`          | `React.ReactNode`                                                                                     | -           | Compound children, typically `MorphButton.CollapsedContent` and `MorphButton.ExpandedContent` |
| `direction`         | `'top' \| 'top-end' \| 'end' \| 'bottom-end' \| 'bottom' \| 'bottom-start' \| 'start' \| 'top-start'` | `"top"`     | Logical direction the surface grows toward when expanding                                     |
| `variant`           | `'primary' \| 'secondary'`                                                                            | `"primary"` | Visual variant controlling the surface color scheme                                           |
| `isOpen`            | `boolean`                                                                                             | -           | Whether the button is expanded (controlled mode)                                              |
| `defaultOpen`       | `boolean`                                                                                             | `false`     | Default expanded state for uncontrolled mode                                                  |
| `isDisabled`        | `boolean`                                                                                             | `false`     | Whether the toggle interaction is disabled                                                    |
| `className`         | `string`                                                                                              | -           | Additional CSS classes for the root container (see animated property notes below)             |
| `classNames`        | `ElementSlots<MorphButtonRootSlots>`                                                                  | -           | Additional CSS classes for individual slots                                                   |
| `styles`            | `{ container?: ViewStyle; surface?: ViewStyle }`                                                      | -           | Styles for individual slots                                                                   |
| `style`             | `StyleProp<ViewStyle>`                                                                                | -           | Style for the root container. The Pressable function form is not supported                    |
| `onOpenChange`      | `(isOpen: boolean) => void`                                                                           | -           | Callback fired when the open state changes                                                    |
| `animation`         | `MorphButtonRootAnimation`                                                                            | -           | Animation configuration for the root component                                                |
| `...PressableProps` | `PressableProps`                                                                                      | -           | All standard React Native Pressable props are supported                                       |

#### ElementSlots\<MorphButtonRootSlots\>

| slot        | description                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container` | Root container: the collapsed-size footprint that the consumer positions                                                                                |
| `surface`   | The morphing card. `width`, `height`, `top`, and `start` are animated and cannot be set via className; use the `animation` prop to customize the spring |

#### styles

| slot        | type        | description                    |
| ----------- | ----------- | ------------------------------ |
| `container` | `ViewStyle` | Style for the root container   |
| `surface`   | `ViewStyle` | Style for the morphing surface |

#### MorphButtonRootAnimation

Animation configuration for the root component. Can be:

- `false` or `"disabled"`: Disable only root animations
- `"disable-all"`: Disable all animations including children
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop                | type               | default                                                                                                                           | description                                                                             |
| ------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `morphSpringConfig` | `WithSpringConfig` | `{ damping: 25, stiffness: 300, mass: 0.8, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 }` | Spring used when morphing the surface between the measured collapsed and expanded sizes |

### MorphButton.CollapsedContent

In-flow content shown while collapsed. Its natural size defines the root footprint and the collapsed morph target.

| prop                    | type                          | default | description                                                                                            |
| ----------------------- | ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `children`              | `React.ReactNode`             | -       | Content to display while collapsed                                                                     |
| `className`             | `string`                      | -       | Additional CSS classes. `opacity` and `transform` (scale) are animated and cannot be set via className |
| `animation`             | `MorphButtonContentAnimation` | -       | Animation configuration for the cross-fade and scale transition                                        |
| `isAnimatedStyleActive` | `boolean`                     | `true`  | When `false`, animated styles are not applied                                                          |
| `...ViewProps`          | `ViewProps`                   | -       | All standard React Native View props are supported                                                     |

### MorphButton.ExpandedContent

Always-mounted panel content measured at its natural size while hidden, so the expanded morph target is known before the first open. Set an explicit width via `className` (e.g. `w-72`) for panel layouts.

| prop                    | type                          | default | description                                                                                            |
| ----------------------- | ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `children`              | `React.ReactNode`             | -       | Content to display while expanded                                                                      |
| `className`             | `string`                      | -       | Additional CSS classes. `opacity` and `transform` (scale) are animated and cannot be set via className |
| `animation`             | `MorphButtonContentAnimation` | -       | Animation configuration for the cross-fade and scale transition                                        |
| `isAnimatedStyleActive` | `boolean`                     | `true`  | When `false`, animated styles are not applied                                                          |
| `...ViewProps`          | `ViewProps`                   | -       | All standard React Native View props are supported                                                     |

#### MorphButtonContentAnimation

Animation configuration for the content parts. Value tuples read `[closed, open]`. Can be:

- `false` or `"disabled"`: Disable the part's animations
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop      | type                                                            | default                                                                             | description                     |
| --------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| `opacity` | `{ value?: [number, number]; timingConfig?: WithTimingConfig }` | `[1, 0]` for `CollapsedContent`, `[0, 1]` for `ExpandedContent`, 200ms timing       | Opacity values `[closed, open]` |
| `scale`   | `{ value?: [number, number]; timingConfig?: WithTimingConfig }` | `[1, 0.96]` for `CollapsedContent`, `[0.97, 1]` for `ExpandedContent`, 200ms timing | Scale values `[closed, open]`   |

## Hooks

### useMorphButton

Hook to access the morph button context. Must be used within a `MorphButton` component.

```tsx
import { useMorphButton } from 'heroui-native-pro';

const {
  isOpen,
  isOpenValue,
  direction,
  variant,
  isDisabled,
  collapsedWidth,
  collapsedHeight,
  expandedWidth,
  expandedHeight,
  surfaceWidth,
  surfaceHeight,
  open,
  close,
  toggle,
} = useMorphButton();
```

#### Returns

| property          | type                   | description                                         |
| ----------------- | ---------------------- | --------------------------------------------------- |
| `isOpen`          | `boolean`              | Whether the button is expanded                      |
| `isOpenValue`     | `SharedValue<boolean>` | UI-thread mirror of `isOpen`, updated during render |
| `direction`       | `MorphButtonDirection` | Logical direction the surface grows toward          |
| `variant`         | `MorphButtonVariant`   | Visual variant applied to the surface               |
| `isDisabled`      | `boolean`              | Whether the toggle interaction is disabled          |
| `collapsedWidth`  | `SharedValue<number>`  | Measured natural width of the collapsed content     |
| `collapsedHeight` | `SharedValue<number>`  | Measured natural height of the collapsed content    |
| `expandedWidth`   | `SharedValue<number>`  | Measured natural width of the expanded content      |
| `expandedHeight`  | `SharedValue<number>`  | Measured natural height of the expanded content     |
| `surfaceWidth`    | `SharedValue<number>`  | Current animated width of the morphing surface      |
| `surfaceHeight`   | `SharedValue<number>`  | Current animated height of the morphing surface     |
| `open`            | `() => void`           | Programmatically expand the button                  |
| `close`           | `() => void`           | Programmatically collapse the button                |
| `toggle`          | `() => void`           | Programmatically toggle the open state              |
