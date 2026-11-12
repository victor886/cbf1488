# FAB

A floating action button that expands into a list of actions with automatic content placement and a shared, progress-driven open/close animation.

## Import

```tsx
import { FAB } from 'heroui-native-pro';
```

## Anatomy

```tsx
<FAB className="absolute bottom-6 right-6">
  <FAB.Trigger>...</FAB.Trigger>
  <FAB.Portal>
    <FAB.Overlay />
    <FAB.Content>
      <FAB.Item onPress={...}>New message</FAB.Item>
      <FAB.Item onPress={...}>
        <ShareIcon />
        <FAB.ItemLabel>Share</FAB.ItemLabel>
      </FAB.Item>
    </FAB.Content>
  </FAB.Portal>
</FAB>
```

- **FAB**: Root container. Owns the open state (controlled via `isOpen` + `onOpenChange` or uncontrolled via `isDefaultOpen`), resolves the content placement and alignment — automatically from the trigger position on screen by default — and drives the shared open/close progress (`0` = idle, `1` = open, `2` = close) that orchestrates the overlay, items, and trigger rotation. Cascades `disable-all` to animated descendants.
- **FAB.Trigger**: The floating button itself. Toggles the open state on press and measures its own position so auto placement can resolve. Its content rotates with the shared progress (a plus icon reads as a close affordance while open). Position the FAB by passing positioning classes (e.g. `absolute bottom-6 right-6`) to the root.
- **FAB.Portal**: Renders the overlay and content in a portal layer above other content (using `FullWindowOverlay` on iOS). Stays mounted while the close animation plays and re-provides the FAB contexts to portaled descendants.
- **FAB.Overlay**: Optional backdrop behind the content. Its opacity follows the shared progress and pressing it closes the FAB. The `default` variant paints a solid backdrop; the `blur` variant renders an animated blur layer instead. Replace the part with a custom component built on `useFABAnimation` for fully custom backdrops.
- **FAB.Content**: Positioned column of items. Placement and alignment follow the root resolution and the column hugs the trigger edge. Provides each child its index so items can stagger.
- **FAB.Item**: Single action row. Appears and disappears with the shared progress — staggered by default, starting from the item nearest the trigger — and closes the FAB on press unless `closeOnPress={false}`. Plain string children are wrapped in `FAB.ItemLabel` automatically.
- **FAB.ItemBackground**: Optional theme-aware background container rendered behind the item content. Mounted automatically when the active theme registers default background content (e.g. `glass`). Replace or remove it via the `background` prop on `FAB.Item`.
- **FAB.ItemLabel**: Text label inside an item. Only needed for custom layouts (e.g. icon + label); string children get it for free.

## Usage

### Basic usage

Place the FAB anywhere on screen; the content placement resolves automatically. A FAB in the bottom-right corner opens its items upwards with end alignment, a FAB in the top-left opens downwards with start alignment, and so on.

```tsx
<FAB>
  <FAB.Trigger>
    <PlusIcon />
  </FAB.Trigger>
  <FAB.Portal>
    <FAB.Overlay />
    <FAB.Content>
      <FAB.Item onPress={handleNewMessage}>New message</FAB.Item>
      <FAB.Item onPress={handleNewLabel}>New label</FAB.Item>
    </FAB.Content>
  </FAB.Portal>
</FAB>
```

### Manual placement

Override the automatic resolution with explicit `placement` and `align` values on the root.

```tsx
<FAB placement="bottom" align="start">
  <FAB.Trigger>...</FAB.Trigger>
  <FAB.Portal>
    <FAB.Overlay />
    <FAB.Content>...</FAB.Content>
  </FAB.Portal>
</FAB>
```

### Items appearing mode

Items appear staggered by default (nearest to the trigger first, reversed on close). Set `itemsAppearance="normal"` to animate all items together.

```tsx
<FAB itemsAppearance="normal">
  <FAB.Trigger>...</FAB.Trigger>
  <FAB.Portal>
    <FAB.Overlay />
    <FAB.Content>...</FAB.Content>
  </FAB.Portal>
</FAB>
```

Control the stagger intensity with `animation.stagger.itemWindow` on the root: the fraction of the progress range each item's animation occupies. Smaller values produce a more sequential stagger; `1` makes all items animate together.

```tsx
<FAB animation={{ stagger: { itemWindow: 0.4 } }}>
  <FAB.Trigger>...</FAB.Trigger>
  <FAB.Portal>
    <FAB.Overlay />
    <FAB.Content>...</FAB.Content>
  </FAB.Portal>
</FAB>
```

### Items with icons

Pass elements as item children for custom layouts. Use `FAB.ItemLabel` for the text part.

```tsx
<FAB.Item onPress={handleShare}>
  <ShareIcon size={16} />
  <FAB.ItemLabel>Share</FAB.ItemLabel>
</FAB.Item>
```

### Controlled

Drive the open state externally with `isOpen` and `onOpenChange`.

```tsx
const [isOpen, setIsOpen] = useState(false);

<FAB isOpen={isOpen} onOpenChange={setIsOpen}>
  <FAB.Trigger>...</FAB.Trigger>
  <FAB.Portal>
    <FAB.Overlay />
    <FAB.Content>...</FAB.Content>
  </FAB.Portal>
</FAB>;
```

### Blur backdrop

Use the built-in `blur` variant for an animated blur backdrop: the blur intensity follows the shared progress instead of the overlay opacity. iOS only, requires the optional `expo-blur` package; other platforms (or a missing package) fall back to the default solid backdrop. When the library theme is `glass`, the blur variant is used by default.

```tsx
<FAB>
  <FAB.Trigger>...</FAB.Trigger>
  <FAB.Portal>
    <FAB.Overlay variant="blur" blurViewProps={{ intensity: 60 }} />
    <FAB.Content>...</FAB.Content>
  </FAB.Portal>
</FAB>
```

### Custom backdrop

Build a custom backdrop on the shared progress via `useFABAnimation` and place it inside `FAB.Portal` instead of `FAB.Overlay`. The progress follows the `[idle, open, close]` = `[0, 1, 2]` convention.

```tsx
import { useFAB, useFABAnimation } from 'heroui-native-pro';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedProps } from 'react-native-reanimated';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

function FABBlurBackdrop() {
  const { onOpenChange } = useFAB();
  const { progress } = useFABAnimation();

  const animatedProps = useAnimatedProps(() => ({
    intensity: interpolate(progress.get(), [0, 1, 2], [0, 50, 0]),
  }));

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={() => onOpenChange(false)}>
      <AnimatedBlurView animatedProps={animatedProps} style={StyleSheet.absoluteFill} />
    </Pressable>
  );
}

<FAB.Portal>
  <FABBlurBackdrop />
  <FAB.Content>...</FAB.Content>
</FAB.Portal>;
```

### Custom animation configuration

Customize the progress driver on the root (a spring with `{ mass: 3, stiffness: 1200, damping: 90 }` unless configured) and the per-part motion on each part.

```tsx
<FAB
  animation={{
    progress: { type: 'timing', config: { duration: 400 } },
    // or: progress: { type: 'spring', config: { damping: 14, stiffness: 160 } }
  }}
>
  <FAB.Trigger animation={{ rotate: { value: [0, 135, 0] } }}>...</FAB.Trigger>
  <FAB.Portal>
    <FAB.Overlay animation={{ opacity: { value: [0, 0.6, 0] } }} />
    <FAB.Content>
      <FAB.Item animation={{ translate: { value: 24 }, scale: { value: [0.8, 1] } }}>...</FAB.Item>
    </FAB.Content>
  </FAB.Portal>
</FAB>
```

## Example

```tsx
import { Ionicons } from '@expo/vector-icons';
import { FAB } from 'heroui-native-pro';
import { Text, View } from 'react-native';

const MESSAGES = [
  {
    sender: 'Maya Chen',
    subject: 'Design review notes',
    time: '09:41',
  },
  {
    sender: 'Hero Bank',
    subject: 'Your statement is ready',
    time: '08:15',
  },
  {
    sender: 'Luis Ortega',
    subject: 'Re: Offsite agenda',
    time: 'Yesterday',
  },
];

export default function InboxComposeFab() {
  return (
    <View className="bg-surface flex-1">
      <View className="border-border border-b px-5 pt-5 pb-3">
        <Text className="text-foreground text-xl font-bold">Inbox</Text>
        <Text className="text-muted text-xs">3 unread messages</Text>
      </View>
      <View className="flex-1">
        {MESSAGES.map((message) => (
          <View key={message.subject} className="border-default-soft border-b px-5 py-3.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-sm font-semibold">{message.sender}</Text>
              <Text className="text-muted text-xs">{message.time}</Text>
            </View>
            <Text className="text-foreground text-xs" numberOfLines={1}>
              {message.subject}
            </Text>
          </View>
        ))}
      </View>
      <FAB className="absolute right-6 bottom-6">
        <FAB.Trigger>
          <Ionicons name="pencil" size={22} color="white" />
        </FAB.Trigger>
        <FAB.Portal>
          <FAB.Overlay />
          <FAB.Content>
            <FAB.Item onPress={() => console.log('new message')}>New message</FAB.Item>
            <FAB.Item onPress={() => console.log('new label')}>New label</FAB.Item>
            <FAB.Item onPress={() => console.log('new folder')}>
              <Ionicons name="folder-outline" size={16} color="gray" />
              <FAB.ItemLabel>New folder</FAB.ItemLabel>
            </FAB.Item>
          </FAB.Content>
        </FAB.Portal>
      </FAB>
    </View>
  );
}
```

## API Reference

### FAB

| prop              | type                        | default       | description                                                                                           |
| ----------------- | --------------------------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| `children`        | `React.ReactNode`           | -             | Compound parts to render (`FAB.Trigger` + `FAB.Portal`)                                               |
| `placement`       | `FABAutoPlacement`          | `"auto"`      | Side of the trigger on which the content opens. `"auto"` resolves from the trigger screen position    |
| `align`           | `FABAutoAlign`              | `"auto"`      | Alignment along the perpendicular axis. `"auto"` resolves from the trigger screen position            |
| `itemsAppearance` | `FABItemsAppearance`        | `"staggered"` | Appearing mode for the items (`"staggered"` or `"normal"`)                                            |
| `isOpen`          | `boolean`                   | -             | Whether the FAB is open (controlled mode)                                                             |
| `isDefaultOpen`   | `boolean`                   | -             | Default open state for uncontrolled mode                                                              |
| `isDisabled`      | `boolean`                   | -             | Whether the FAB is disabled                                                                           |
| `className`       | `string`                    | -             | Additional CSS classes for the root container (use for positioning, e.g. `absolute bottom-6 right-6`) |
| `onOpenChange`    | `(isOpen: boolean) => void` | -             | Callback fired when the open state changes                                                            |
| `animation`       | `FABRootAnimation`          | -             | Animation configuration for the progress (spring/timing driver, stagger, and `disable-all` cascade)   |
| `...ViewProps`    | `ViewProps`                 | -             | All standard React Native View props are supported                                                    |

#### FABAutoPlacement

Side of the trigger on which the content is rendered.

- `"auto"`: Resolves from the trigger position — a trigger in the bottom half of the screen opens upwards, a trigger in the top half opens downwards
- `"top"` / `"bottom"` / `"left"` / `"right"`: Explicit placement

#### FABAutoAlign

Alignment of the content along the axis perpendicular to the placement.

- `"auto"`: Resolves from the trigger position — the perpendicular axis is split into thirds mapping to `"start"`, `"center"`, and `"end"`
- `"start"` / `"center"` / `"end"`: Explicit alignment

#### FABItemsAppearance

- `"staggered"`: Items appear one after another, nearest to the trigger first; the order is reversed on close
- `"normal"`: All items appear and disappear together

#### FABRootAnimation

Animation configuration for the root component. Can be:

- `false` or `"disabled"`: Disable only root animations (open/close snaps instantly; children can still animate)
- `"disable-all"`: Disable all animations including children (cascades down through `AnimationSettingsProvider`)
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop       | type             | default | description                                                          |
| ---------- | ---------------- | ------- | -------------------------------------------------------------------- |
| `progress` | `AnimationValue` | -       | Configuration for the open/close progress                            |
| `stagger`  | `AnimationValue` | -       | Configuration for the item stagger (staggered items appearance only) |

##### progress

| prop     | type                                   | default                                     | description                                                                                                                           |
| -------- | -------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `type`   | `"spring" \| "timing"`                 | `"spring"`                                  | Driver animating the progress (0 = idle, 1 = open, 2 = close)                                                                         |
| `config` | `WithSpringConfig \| WithTimingConfig` | `{ mass: 3, stiffness: 1200, damping: 90 }` | Configuration for the chosen driver. A custom spring config replaces the default; timing configs use Reanimated defaults when omitted |

##### stagger

| prop         | type     | default | description                                                                                                                                                                |
| ------------ | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `itemWindow` | `number` | `0.5`   | Fraction of the progress range each item's animation occupies, clamped to `(0, 1]`. Smaller values produce a more sequential stagger; `1` makes all items animate together |

### FAB.Trigger

| prop                    | type                                       | default | description                                                                    |
| ----------------------- | ------------------------------------------ | ------- | ------------------------------------------------------------------------------ |
| `children`              | `React.ReactNode`                          | -       | Content rendered inside the trigger (typically an icon)                        |
| `isDisabled`            | `boolean`                                  | `false` | Whether the trigger is disabled                                                |
| `className`             | `string`                                   | -       | Additional CSS classes for the trigger container                               |
| `classNames`            | `ElementSlots<TriggerSlots>`               | -       | Additional CSS classes for the trigger slots (`container`, `contentContainer`) |
| `styles`                | `Partial<Record<TriggerSlots, ViewStyle>>` | -       | Additional styles for the trigger slots                                        |
| `animation`             | `FABTriggerAnimation`                      | -       | Animation configuration for the content rotation                               |
| `isAnimatedStyleActive` | `boolean`                                  | `true`  | Whether animated styles are active                                             |
| `...PressableProps`     | `PressableProps`                           | -       | All standard React Native Pressable props are supported                        |

#### FABTriggerAnimation

| prop     | type             | default | description                     |
| -------- | ---------------- | ------- | ------------------------------- |
| `rotate` | `AnimationValue` | -       | Rotation of the trigger content |

##### rotate

| prop    | type                       | default      | description                                                    |
| ------- | -------------------------- | ------------ | -------------------------------------------------------------- |
| `value` | `[number, number, number]` | `[0, 45, 0]` | Rotation degrees for the `[idle, open, close]` progress states |

#### FABTriggerRef

The trigger ref exposes imperative methods:

| method    | description                    |
| --------- | ------------------------------ |
| `open()`  | Programmatically open the FAB  |
| `close()` | Programmatically close the FAB |

### FAB.Portal

| prop                                         | type              | default | description                                                            |
| -------------------------------------------- | ----------------- | ------- | ---------------------------------------------------------------------- |
| `children`                                   | `React.ReactNode` | -       | Content to render within the portal                                    |
| `hostName`                                   | `string`          | -       | Optional name of the portal host to render into                        |
| `forceMount`                                 | `true`            | -       | Force mount the portal regardless of the open state                    |
| `disableFullWindowOverlay`                   | `boolean`         | `false` | Use a regular View instead of FullWindowOverlay on iOS                 |
| `unstable_accessibilityContainerViewIsModal` | `boolean`         | `false` | Whether VoiceOver treats the overlay window as a modal container (iOS) |
| `className`                                  | `string`          | -       | Additional CSS classes for the portal container                        |

### FAB.Overlay

| prop                    | type                      | default                                                          | description                                                                                                                       |
| ----------------------- | ------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `closeOnPress`          | `boolean`                 | `true`                                                           | Whether pressing the overlay closes the FAB                                                                                       |
| `className`             | `string`                  | -                                                                | Additional CSS classes for the overlay                                                                                            |
| `variant`               | `'default' \| 'blur'`     | `'default'` (`'blur'` when the library theme is `glass`)         | Overlay variant. `'blur'` renders an animated blur backdrop (iOS only, requires `expo-blur`; falls back to `'default'` otherwise) |
| `blurViewProps`         | `FABOverlayBlurViewProps` | -                                                                | Props forwarded to the BlurView rendered by the `'blur'` variant; `intensity` acts as the maximum (animated) intensity            |
| `animation`             | `FABOverlayAnimation`     | -                                                                | Animation configuration for the overlay opacity                                                                                   |
| `isAnimatedStyleActive` | `boolean`                 | `true` for the `default` variant, `false` for the `blur` variant | Whether animated styles are active. The blur variant animates blur intensity instead of the overlay opacity                       |
| `...PressableProps`     | `PressableProps`          | -                                                                | All standard React Native Pressable props are supported                                                                           |

#### FABOverlayAnimation

| prop      | type             | default | description            |
| --------- | ---------------- | ------- | ---------------------- |
| `opacity` | `AnimationValue` | -       | Opacity of the overlay |

##### opacity

| prop    | type                       | default     | description                                                  |
| ------- | -------------------------- | ----------- | ------------------------------------------------------------ |
| `value` | `[number, number, number]` | `[0, 1, 0]` | Opacity values for the `[idle, open, close]` progress states |

### FAB.Content

| prop                      | type              | default                                        | description                                        |
| ------------------------- | ----------------- | ---------------------------------------------- | -------------------------------------------------- |
| `children`                | `React.ReactNode` | -                                              | Items to render, typically `FAB.Item` parts        |
| `offset`                  | `number`          | `12`                                           | Gap between the trigger and the content in pixels  |
| `alignOffset`             | `number`          | `0`                                            | Offset along the alignment axis in pixels          |
| `insets`                  | `Insets`          | `{ top: 12, bottom: 12, left: 12, right: 12 }` | Screen edge insets respected when positioning      |
| `avoidCollisions`         | `boolean`         | `true`                                         | Whether to adjust position to avoid screen edges   |
| `disablePositioningStyle` | `boolean`         | `false`                                        | Disable the automatic positioning styles           |
| `className`               | `string`          | -                                              | Additional CSS classes for the content container   |
| `...ViewProps`            | `ViewProps`       | -                                              | All standard React Native View props are supported |

### FAB.Item

| prop                    | type               | default | description                                                                                                                       |
| ----------------------- | ------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `children`              | `React.ReactNode`  | -       | Item content. Strings/numbers are wrapped in `FAB.ItemLabel` automatically                                                        |
| `closeOnPress`          | `boolean`          | `true`  | Whether pressing the item closes the FAB                                                                                          |
| `className`             | `string`           | -       | Additional CSS classes for the item container                                                                                     |
| `background`            | `React.ReactNode`  | -       | Background layer behind the item content. `undefined` renders the theme-aware default; custom node replaces it; `null` removes it |
| `animation`             | `FABItemAnimation` | -       | Animation configuration for the appearing motion                                                                                  |
| `isAnimatedStyleActive` | `boolean`          | `true`  | Whether animated styles are active                                                                                                |
| `...PressableProps`     | `PressableProps`   | -       | All standard React Native Pressable props are supported                                                                           |

#### FABItemAnimation

| prop        | type             | default | description                                 |
| ----------- | ---------------- | ------- | ------------------------------------------- |
| `translate` | `AnimationValue` | -       | Translation of the item towards the trigger |
| `scale`     | `AnimationValue` | -       | Scale of the item while appearing           |

##### translate

| prop    | type     | default | description                                                    |
| ------- | -------- | ------- | -------------------------------------------------------------- |
| `value` | `number` | `16`    | Distance in pixels the item travels from the trigger direction |

##### scale

| prop    | type               | default    | description                                     |
| ------- | ------------------ | ---------- | ----------------------------------------------- |
| `value` | `[number, number]` | `[0.9, 1]` | Scale values for the `[hidden, visible]` states |

### FAB.ItemBackground

Absolute-fill container rendered behind the item content. With no children, the active library theme decides the default content (e.g. a glass blur layer); pass children to host custom content with the same positioning and clipping.

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Custom content inside the background container     |
| `className`    | `string`          | -       | Additional CSS classes                             |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### FAB.ItemLabel

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Label text                                         |
| `className`    | `string`          | -       | Additional CSS classes for the label               |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported |

## Hooks

### useFAB

Hook to access the FAB root context. Must be used within a `FAB` component (works inside `FAB.Portal` too).

```tsx
import { useFAB } from 'heroui-native-pro';

const { isOpen, onOpenChange, placement, align } = useFAB();
```

#### Returns

| property          | type                        | description                                  |
| ----------------- | --------------------------- | -------------------------------------------- |
| `isOpen`          | `boolean`                   | Whether the FAB is currently open            |
| `onOpenChange`    | `(isOpen: boolean) => void` | Callback to change the open state            |
| `triggerPosition` | `LayoutPosition \| null`    | Measured trigger position (page coordinates) |
| `contentLayout`   | `LayoutRectangle \| null`   | Measured content layout                      |
| `placement`       | `FABPlacement`              | Resolved content placement                   |
| `align`           | `FABAlign`                  | Resolved content alignment                   |
| `nativeID`        | `string`                    | Unique identifier for the FAB instance       |

### useFABAnimation

Hook to access the shared open/close progress. Use it to build custom progress-driven parts (e.g. a blur backdrop). Must be used within a `FAB` component (works inside `FAB.Portal` too).

```tsx
import { useFABAnimation } from 'heroui-native-pro';

const { progress } = useFABAnimation();
```

#### Returns

| property   | type                  | description                                                                                         |
| ---------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| `progress` | `SharedValue<number>` | Animated open/close progress (0 = idle/closed, 1 = open, 2 = close target; resets to 0 after close) |
