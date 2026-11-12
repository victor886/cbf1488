# MorphTabs

Tabs that expand from an icon to an icon and label as you swipe between pages.

## Installation

`MorphTabs.Pager` requires the optional peer dependency `react-native-pager-view` (native code, so rebuild the app after installing):

```bash
npx expo install react-native-pager-view
```

## Import

```tsx
import { MorphTabs } from 'heroui-native-pro';
```

## Anatomy

```tsx
<MorphTabs>
  <MorphTabs.List>
    <MorphTabs.Trigger>
      <MorphTabs.Icon>...</MorphTabs.Icon>
      <MorphTabs.Label>...</MorphTabs.Label>
    </MorphTabs.Trigger>
  </MorphTabs.List>
  <MorphTabs.Pager>
    <MorphTabs.Content>...</MorphTabs.Content>
  </MorphTabs.Pager>
</MorphTabs>
```

- **MorphTabs**: Root container owning the selected value (controlled or uncontrolled), the continuous pager position that drives the header morph, and lazy-mount state. Its ref is the root `View` with a merged `goTo(value, animated?)` method.
- **MorphTabs.List**: Header row (`tablist`). Hosts the triggers and any other content (e.g. an avatar), which keeps its natural size. Place it above or below the pager.
- **MorphTabs.Trigger**: Pill (`tab`) that selects its page on press. Its `flexGrow` follows the pager position: the active pill fills the leftover row space, and neighbouring pills split it mid-swipe.
- **MorphTabs.TriggerBackground**: Optional absolute-fill background container behind a pill. With no children, the active library theme decides the default content (a frosted blur layer under `glass`).
- **MorphTabs.Icon**: Trigger icon wrapper. Stays visible in both states and brightens as its page becomes active.
- **MorphTabs.Label**: Single-line trigger label inside a clipping container that shrinks to zero width in a collapsed pill and fades in as the pill expands. Its text also becomes the trigger's accessibility label.
- **MorphTabs.Pager**: Native swipeable pager. Every direct `MorphTabs.Content` child is one page, in order.
- **MorphTabs.Content**: One page, identified by `value` and matched against `MorphTabs.Trigger` values. Host a plain `ScrollView` / `FlatList` inside for vertically scrollable content.

## Usage

### Basic usage

Triggers and pages are matched by `value`. The pages' order defines the swipe order.

```tsx
<MorphTabs defaultValue="home">
  <MorphTabs.List>
    <MorphTabs.Trigger value="home">
      <MorphTabs.Icon>
        <HomeIcon />
      </MorphTabs.Icon>
      <MorphTabs.Label>Home</MorphTabs.Label>
    </MorphTabs.Trigger>
    <MorphTabs.Trigger value="today">
      <MorphTabs.Icon>
        <CalendarIcon />
      </MorphTabs.Icon>
      <MorphTabs.Label>Today</MorphTabs.Label>
    </MorphTabs.Trigger>
  </MorphTabs.List>
  <MorphTabs.Pager>
    <MorphTabs.Content value="home">...</MorphTabs.Content>
    <MorphTabs.Content value="today">...</MorphTabs.Content>
  </MorphTabs.Pager>
</MorphTabs>
```

### Extra header content

Anything that is not a trigger keeps its natural size; the triggers share the rest of the row.

```tsx
<MorphTabs.List>
  <Avatar size="sm" alt="Profile">
    <Avatar.Image
      source={{
        uri: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg',
      }}
    />
    <Avatar.Fallback>A</Avatar.Fallback>
  </Avatar>
  <MorphTabs.Trigger value="home">...</MorphTabs.Trigger>
  <MorphTabs.Trigger value="today">...</MorphTabs.Trigger>
</MorphTabs.List>
```

### Controlled

Control the selected page with `value` and `onValueChange`. Swipes and trigger presses request changes through `onValueChange`; setting `value` from outside slides the pager to that page.

```tsx
const [tab, setTab] = useState('home');

<MorphTabs value={tab} onValueChange={setTab}>
  ...
</MorphTabs>;
```

### Imperative navigation

The root ref exposes `goTo(value, animated?)`.

```tsx
const tabsRef = useRef<MorphTabsRootRef>(null);

tabsRef.current?.goTo('notes', false);
```

### Lazy pages

With `lazy`, a page mounts the first time it is shown (the selected page, both neighbours as soon as a drag starts, and the target of a tap). Visited pages stay mounted. Use `renderLazyPlaceholder` to fill unmounted pages.

```tsx
<MorphTabs lazy renderLazyPlaceholder={() => <Spinner />}>
  ...
</MorphTabs>
```

### List below the pager

Place `MorphTabs.List` after `MorphTabs.Pager` for a bottom tab bar.

```tsx
<MorphTabs>
  <MorphTabs.Pager>...</MorphTabs.Pager>
  <MorphTabs.List>...</MorphTabs.List>
</MorphTabs>
```

### Pager behavior

Disable swiping with `swipeEnabled={false}`, or jump between pages without the native slide with `isPageAnimationEnabled={false}`. The remaining `react-native-pager-view` props (`overdrag`, `offscreenPageLimit`, `keyboardDismissMode`, …) pass through.

```tsx
<MorphTabs.Pager swipeEnabled={false} isPageAnimationEnabled={false}>
  ...
</MorphTabs.Pager>
```

### Render function

Trigger children can be a function receiving `{ isSelected, value, index, isDisabled }`, e.g. to swap an outline icon for a filled one.

```tsx
<MorphTabs.Trigger value="home">
  {({ isSelected }) => (
    <>
      <MorphTabs.Icon>{isSelected ? <HomeFilledIcon /> : <HomeIcon />}</MorphTabs.Icon>
      <MorphTabs.Label>Home</MorphTabs.Label>
    </>
  )}
</MorphTabs.Trigger>
```

### Custom morph

Tune the morph per part through `animation`, or pass `animation="disable-all"` on the root to snap pills to the selected state and switch pages without the slide.

```tsx
<MorphTabs.Trigger value="home" animation={{ flexGrow: { value: [0, 2] } }}>
  <MorphTabs.Icon animation={{ opacity: { value: [0.35, 1] } }}>
    ...
  </MorphTabs.Icon>
  <MorphTabs.Label>Home</MorphTabs.Label>
</MorphTabs.Trigger>

<MorphTabs animation="disable-all">...</MorphTabs>
```

## Example

```tsx
import { Avatar, ListGroup } from 'heroui-native';
import { MorphTabs } from 'heroui-native-pro';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

export default function HomeTabs() {
  const [tab, setTab] = useState('home');

  return (
    <MorphTabs value={tab} onValueChange={setTab} lazy>
      <MorphTabs.List>
        <Avatar size="sm" alt="Profile">
          <Avatar.Image
            source={{
              uri: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg',
            }}
          />
          <Avatar.Fallback>A</Avatar.Fallback>
        </Avatar>
        <MorphTabs.Trigger value="home">
          <MorphTabs.Icon>
            <HomeIcon />
          </MorphTabs.Icon>
          <MorphTabs.Label>Home</MorphTabs.Label>
        </MorphTabs.Trigger>
        <MorphTabs.Trigger value="today">
          <MorphTabs.Icon>
            <CalendarIcon />
          </MorphTabs.Icon>
          <MorphTabs.Label>Today</MorphTabs.Label>
        </MorphTabs.Trigger>
        <MorphTabs.Trigger value="notes">
          <MorphTabs.Icon>
            <NotesIcon />
          </MorphTabs.Icon>
          <MorphTabs.Label>Notes</MorphTabs.Label>
        </MorphTabs.Trigger>
      </MorphTabs.List>
      <MorphTabs.Pager>
        <MorphTabs.Content value="home">
          <ScrollView contentContainerClassName="p-4 gap-4">
            <ListGroup>...</ListGroup>
          </ScrollView>
        </MorphTabs.Content>
        <MorphTabs.Content value="today">
          <ScrollView contentContainerClassName="p-4">...</ScrollView>
        </MorphTabs.Content>
        <MorphTabs.Content value="notes">
          <Text className="text-foreground p-4">Notes</Text>
        </MorphTabs.Content>
      </MorphTabs.Pager>
    </MorphTabs>
  );
}
```

## API Reference

### MorphTabs

| prop                    | type                           | default | description                                                                                            |
| ----------------------- | ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------ |
| `children`              | `React.ReactNode`              | -       | Compound children, typically `MorphTabs.List` and `MorphTabs.Pager` in any order                       |
| `value`                 | `string`                       | -       | Selected page value (controlled mode)                                                                  |
| `defaultValue`          | `string`                       | -       | Initially selected page value (uncontrolled mode). Falls back to the first page                        |
| `lazy`                  | `boolean`                      | `false` | Whether pages mount only when first shown                                                              |
| `renderLazyPlaceholder` | `(value: string) => ReactNode` | -       | Rendered in place of a lazy page's content until it mounts                                             |
| `className`             | `string`                       | -       | Additional CSS classes for the root container                                                          |
| `onValueChange`         | `(value: string) => void`      | -       | Callback fired when the selected page changes (tap, swipe, or `goTo`)                                  |
| `animation`             | `"disable-all" \| undefined`   | -       | `"disable-all"` disables all animations including children and switches pages without the native slide |
| `...ViewProps`          | `ViewProps`                    | -       | All standard React Native View props are supported                                                     |

#### MorphTabsRootRef

The root `View` ref with a merged method:

| method | type                                          | description                                                                 |
| ------ | --------------------------------------------- | --------------------------------------------------------------------------- |
| `goTo` | `(value: string, animated?: boolean) => void` | Selects a page. `animated` defaults to the pager's `isPageAnimationEnabled` |

### MorphTabs.List

| prop           | type              | default | description                                         |
| -------------- | ----------------- | ------- | --------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Header content, typically `MorphTabs.Trigger` items |
| `className`    | `string`          | -       | Additional CSS classes for the list row             |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported  |

### MorphTabs.Trigger

| prop                    | type                                                                     | default | description                                                                                      |
| ----------------------- | ------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------ |
| `children`              | `React.ReactNode \| ((props: MorphTabsTriggerRenderProps) => ReactNode)` | -       | Trigger content, or a render function receiving the trigger state                                |
| `value`                 | `string`                                                                 | -       | Value of the `MorphTabs.Content` page this trigger selects                                       |
| `isDisabled`            | `boolean`                                                                | `false` | Whether the trigger is disabled (the page can still be reached by swiping)                       |
| `className`             | `string`                                                                 | -       | Additional CSS classes for the pill. `flexGrow` is animated and cannot be set via className      |
| `style`                 | `StyleProp<ViewStyle>`                                                   | -       | Style for the pill. The Pressable function form is not supported                                 |
| `background`            | `React.ReactNode`                                                        | -       | Background layer behind the pill: `undefined` = theme default, node = replacement, `null` = none |
| `animation`             | `MorphTabsTriggerAnimation`                                              | -       | Animation configuration for the pill morph                                                       |
| `isAnimatedStyleActive` | `boolean`                                                                | `true`  | When `false`, animated styles are not applied                                                    |
| `...PressableProps`     | `PressableProps`                                                         | -       | All standard React Native Pressable props are supported (except `disabled`; use `isDisabled`)    |

#### MorphTabsTriggerRenderProps

| property     | type      | description                                           |
| ------------ | --------- | ----------------------------------------------------- |
| `isSelected` | `boolean` | Whether this trigger's page is selected               |
| `value`      | `string`  | The trigger's page value                              |
| `index`      | `number`  | Page index (`-1` when no `MorphTabs.Content` matches) |
| `isDisabled` | `boolean` | Whether the trigger is disabled                       |

#### MorphTabsTriggerAnimation

Value tuples read `[inactive, active]` and are interpolated against the pager position. Can be:

- `false` or `"disabled"`: Snap to the selected state
- `true` or `undefined`: Follow the pager position
- `object`: Custom animation configuration

| prop       | type                           | default  | description                     |
| ---------- | ------------------------------ | -------- | ------------------------------- |
| `flexGrow` | `{ value?: [number, number] }` | `[0, 1]` | `flexGrow` `[inactive, active]` |

### MorphTabs.TriggerBackground

Absolute-fill background container behind a pill. With no children, the active library theme decides the default content (a `GlassView` blur layer under `glass`, nothing otherwise).

| prop           | type        | default | description                                        |
| -------------- | ----------- | ------- | -------------------------------------------------- |
| `className`    | `string`    | -       | Additional CSS classes for the background          |
| `...ViewProps` | `ViewProps` | -       | All standard React Native View props are supported |

### MorphTabs.Icon

| prop                    | type                     | default | description                                                                   |
| ----------------------- | ------------------------ | ------- | ----------------------------------------------------------------------------- |
| `children`              | `React.ReactNode`        | -       | Icon element (user-supplied icons are never mirrored in RTL)                  |
| `className`             | `string`                 | -       | Additional CSS classes. `opacity` is animated and cannot be set via className |
| `animation`             | `MorphTabsIconAnimation` | -       | `{ opacity?: { value?: [number, number] } }`, default `[0.5, 1]`              |
| `isAnimatedStyleActive` | `boolean`                | `true`  | When `false`, animated styles are not applied                                 |
| `...ViewProps`          | `ViewProps`              | -       | All standard React Native View props are supported                            |

### MorphTabs.Label

| prop                    | type                                          | default  | description                                                           |
| ----------------------- | --------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `children`              | `React.ReactNode`                             | -        | Label text                                                            |
| `className`             | `string`                                      | -        | Additional CSS classes for the text                                   |
| `classNames`            | `ElementSlots<MorphTabsLabelSlots>`           | -        | Additional CSS classes for individual slots                           |
| `styles`                | `{ container?: ViewStyle; text?: TextStyle }` | -        | Styles for individual slots                                           |
| `numberOfLines`         | `number`                                      | `1`      | Maximum number of lines                                               |
| `ellipsizeMode`         | `'head' \| 'middle' \| 'tail' \| 'clip'`      | `"clip"` | How overflowing text is cut while the pill is narrower than the label |
| `animation`             | `MorphTabsLabelAnimation`                     | -        | `{ opacity?: { value?: [number, number] } }`, default `[0, 1]`        |
| `isAnimatedStyleActive` | `boolean`                                     | `true`   | When `false`, animated styles are not applied                         |
| `...TextProps`          | `TextProps`                                   | -        | All standard React Native Text props are supported                    |

#### ElementSlots\<MorphTabsLabelSlots\>

| slot        | description                                                                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container` | Clipping container whose `maxWidth` grows from 0 to the label's measured width, so a collapsed pill holds only the centered icon. `opacity` and `maxWidth` are animated and cannot be set here |
| `text`      | The label text                                                                                                                                                                                 |

### MorphTabs.Pager

| prop                     | type              | default | description                                                                                            |
| ------------------------ | ----------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `children`               | `React.ReactNode` | -       | Pages. Only direct `MorphTabs.Content` children are rendered                                           |
| `swipeEnabled`           | `boolean`         | `true`  | Whether the user can swipe between pages                                                               |
| `isPageAnimationEnabled` | `boolean`         | `true`  | Whether trigger presses and `value` changes slide to the target page                                   |
| `className`              | `string`          | -       | Additional CSS classes for the pager container                                                         |
| `onSwipeStart`           | `() => void`      | -       | Callback fired when the user starts dragging                                                           |
| `onSwipeEnd`             | `() => void`      | -       | Callback fired when the pager settles after a drag                                                     |
| `...PagerViewProps`      | `PagerViewProps`  | -       | Remaining `react-native-pager-view` props (`overdrag`, `offscreenPageLimit`, `keyboardDismissMode`, …) |

The ref is the `PagerView` instance (`setPage`, `setPageWithoutAnimation`). Prefer `value` / `goTo` so the selection stays in sync.

### MorphTabs.Content

| prop           | type              | default | description                                                 |
| -------------- | ----------------- | ------- | ----------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Page content                                                |
| `value`        | `string`          | -       | Value identifying this page, matched against trigger values |
| `className`    | `string`          | -       | Additional CSS classes for the page container               |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported          |

## Hooks

### useMorphTabs

Hook to access the MorphTabs context. Must be used within a `MorphTabs` component.

```tsx
import { useMorphTabs } from 'heroui-native-pro';

const { value, values, selectedIndex, progress, goTo } = useMorphTabs();
```

#### Returns

| property        | type                                          | description                                                       |
| --------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| `value`         | `string \| undefined`                         | Selected page value (falls back to the first page)                |
| `values`        | `string[]`                                    | Page values in pager order                                        |
| `selectedIndex` | `number`                                      | Page index of `value` (`-1` before any page registers)            |
| `progress`      | `SharedValue<number>`                         | Continuous pager position, updated on the UI thread during swipes |
| `goTo`          | `(value: string, animated?: boolean) => void` | Selects a page                                                    |
| `getIndex`      | `(value: string) => number`                   | Page index of a value (`-1` when unknown)                         |
| `isMounted`     | `(value: string) => boolean`                  | Whether a page's content renders (always `true` unless `lazy`)    |

### useMorphTabsTrigger

Hook to access the enclosing trigger's state (`value`, `index`, `isSelected`, `isDisabled`). Must be used within a `MorphTabs.Trigger`, e.g. in a custom animated part that reads `useMorphTabs().progress`.
