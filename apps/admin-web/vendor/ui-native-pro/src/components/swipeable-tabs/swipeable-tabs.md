# SwipeableTabs

Tabs whose pages you can swipe between, with an indicator that follows your finger.

## Installation

`SwipeableTabs.Pager` requires the optional peer dependency `react-native-pager-view` (native code, so rebuild the app after installing):

```bash
npx expo install react-native-pager-view
```

## Import

```tsx
import { SwipeableTabs } from 'heroui-native-pro';
```

## Anatomy

```tsx
<SwipeableTabs>
  <SwipeableTabs.List>
    <SwipeableTabs.ScrollView>
      <SwipeableTabs.Indicator />
      <SwipeableTabs.Trigger>
        <SwipeableTabs.Label>...</SwipeableTabs.Label>
      </SwipeableTabs.Trigger>
      <SwipeableTabs.Separator />
    </SwipeableTabs.ScrollView>
  </SwipeableTabs.List>
  <SwipeableTabs.Pager>
    <SwipeableTabs.Content>...</SwipeableTabs.Content>
  </SwipeableTabs.Pager>
</SwipeableTabs>
```

- **SwipeableTabs**: Root owning the selected value (controlled or uncontrolled), the continuous pager position, and lazy-mount state. Renders heroui-native `Tabs` with the chosen `variant`. Its ref is the root `View` with a merged `goTo(value, animated?)` method.
- **SwipeableTabs.List**, **ListBackground**, **ScrollView**, **Trigger**, **Label**, **Separator**: the heroui-native `Tabs` parts, unchanged. They look, behave, and theme exactly like `Tabs`. Pressing a trigger slides the pager to its page.
- **SwipeableTabs.Indicator**: Highlight behind (`primary`) or under (`secondary`) the triggers. It interpolates between the measured triggers as the pager moves, so it slides and resizes with the swipe.
- **SwipeableTabs.Pager**: Native swipeable pager. Every direct `SwipeableTabs.Content` child is one page, in order.
- **SwipeableTabs.Content**: One page, identified by `value` and matched against `SwipeableTabs.Trigger` values. Host a plain `ScrollView` / `FlatList` inside for vertically scrollable content.

## Usage

### Basic usage

Triggers and pages are matched by `value`. The pages' order defines the swipe order.

```tsx
<SwipeableTabs defaultValue="overview">
  <SwipeableTabs.List>
    <SwipeableTabs.Indicator />
    <SwipeableTabs.Trigger value="overview">
      <SwipeableTabs.Label>Overview</SwipeableTabs.Label>
    </SwipeableTabs.Trigger>
    <SwipeableTabs.Trigger value="activity">
      <SwipeableTabs.Label>Activity</SwipeableTabs.Label>
    </SwipeableTabs.Trigger>
  </SwipeableTabs.List>
  <SwipeableTabs.Pager>
    <SwipeableTabs.Content value="overview">...</SwipeableTabs.Content>
    <SwipeableTabs.Content value="activity">...</SwipeableTabs.Content>
  </SwipeableTabs.Pager>
</SwipeableTabs>
```

### Variants

`primary` (default) renders a segmented pill list; `secondary` renders an underlined list.

```tsx
<SwipeableTabs variant="secondary">...</SwipeableTabs>
```

### Scrollable list

Wrap the triggers in `SwipeableTabs.ScrollView` when they don't fit. The selected trigger scrolls into view (`scrollAlign`, default `"center"`).

```tsx
<SwipeableTabs.List className="self-stretch">
  <SwipeableTabs.ScrollView scrollAlign="center">
    <SwipeableTabs.Indicator />
    {/* many triggers */}
  </SwipeableTabs.ScrollView>
</SwipeableTabs.List>
```

### Separators

`SwipeableTabs.Separator` works exactly like `Tabs.Separator`: pass the values it sits between, and it hides while either of them is selected.

```tsx
<SwipeableTabs.Trigger value="overview">...</SwipeableTabs.Trigger>
<SwipeableTabs.Separator betweenValues={['overview', 'activity']} />
<SwipeableTabs.Trigger value="activity">...</SwipeableTabs.Trigger>
```

### Controlled

Control the selected page with `value` and `onValueChange`. Swipes and trigger presses request changes through `onValueChange`; setting `value` from outside slides the pager to that page.

```tsx
const [tab, setTab] = useState('overview');

<SwipeableTabs value={tab} onValueChange={setTab}>
  ...
</SwipeableTabs>;
```

### Imperative navigation

The root ref exposes `goTo(value, animated?)`.

```tsx
const tabsRef = useRef<SwipeableTabsRootRef>(null);

tabsRef.current?.goTo('settings', false);
```

### Lazy pages

With `lazy`, a page mounts the first time it is shown (the selected page, both neighbours as soon as a drag starts, and the target of a tap). Visited pages stay mounted. Use `renderLazyPlaceholder` to fill unmounted pages.

```tsx
<SwipeableTabs lazy renderLazyPlaceholder={() => <Spinner />}>
  ...
</SwipeableTabs>
```

### Pager behavior

Disable swiping with `swipeEnabled={false}`, or jump between pages without the native slide with `isPageAnimationEnabled={false}`. The remaining `react-native-pager-view` props (`overdrag`, `offscreenPageLimit`, `keyboardDismissMode`, …) pass through.

```tsx
<SwipeableTabs.Pager swipeEnabled={false} isPageAnimationEnabled={false}>
  ...
</SwipeableTabs.Pager>
```

### Indicator without swipe tracking

Pass `animation="disabled"` to make the indicator snap to the selected trigger instead of following the swipe, or `animation="disable-all"` on the root to also switch pages without the slide.

```tsx
<SwipeableTabs.Indicator animation="disabled" />
```

## Example

```tsx
import { SwipeableTabs } from 'heroui-native-pro';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

export default function AccountTabs() {
  const [tab, setTab] = useState('overview');

  return (
    <SwipeableTabs value={tab} onValueChange={setTab} lazy>
      <SwipeableTabs.List>
        <SwipeableTabs.Indicator />
        <SwipeableTabs.Trigger value="overview">
          <SwipeableTabs.Label>Overview</SwipeableTabs.Label>
        </SwipeableTabs.Trigger>
        <SwipeableTabs.Trigger value="activity">
          <SwipeableTabs.Label>Activity</SwipeableTabs.Label>
        </SwipeableTabs.Trigger>
        <SwipeableTabs.Trigger value="settings">
          <SwipeableTabs.Label>Settings</SwipeableTabs.Label>
        </SwipeableTabs.Trigger>
      </SwipeableTabs.List>
      <SwipeableTabs.Pager>
        <SwipeableTabs.Content value="overview">
          <ScrollView contentContainerClassName="p-4 gap-4">...</ScrollView>
        </SwipeableTabs.Content>
        <SwipeableTabs.Content value="activity">
          <ScrollView contentContainerClassName="p-4">...</ScrollView>
        </SwipeableTabs.Content>
        <SwipeableTabs.Content value="settings">
          <Text className="text-foreground p-4">Settings</Text>
        </SwipeableTabs.Content>
      </SwipeableTabs.Pager>
    </SwipeableTabs>
  );
}
```

## API Reference

### SwipeableTabs

| prop                    | type                           | default     | description                                                                                            |
| ----------------------- | ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| `children`              | `React.ReactNode`              | -           | Compound children, typically `SwipeableTabs.List` and `SwipeableTabs.Pager`                            |
| `value`                 | `string`                       | -           | Selected page value (controlled mode)                                                                  |
| `defaultValue`          | `string`                       | -           | Initially selected page value (uncontrolled mode). Falls back to the first page                        |
| `variant`               | `'primary' \| 'secondary'`     | `"primary"` | Visual variant of the tab list                                                                         |
| `className`             | `string`                       | -           | Additional CSS classes for the root container                                                          |
| `lazy`                  | `boolean`                      | `false`     | Whether pages mount only when first shown                                                              |
| `renderLazyPlaceholder` | `(value: string) => ReactNode` | -           | Rendered in place of a lazy page's content until it mounts                                             |
| `onValueChange`         | `(value: string) => void`      | -           | Callback fired when the selected page changes (tap, swipe, or `goTo`)                                  |
| `animation`             | `"disable-all" \| undefined`   | -           | `"disable-all"` disables all animations including children and switches pages without the native slide |
| `...ViewProps`          | `ViewProps`                    | -           | All standard React Native View props are supported                                                     |

#### SwipeableTabsRootRef

The root `View` ref with a merged method:

| method | type                                          | description                                                                 |
| ------ | --------------------------------------------- | --------------------------------------------------------------------------- |
| `goTo` | `(value: string, animated?: boolean) => void` | Selects a page. `animated` defaults to the pager's `isPageAnimationEnabled` |

### SwipeableTabs.List, ListBackground, ScrollView, Trigger, Label, Separator

Same components and props as the corresponding heroui-native `Tabs` parts (`Tabs.List`, `Tabs.ListBackground`, `Tabs.ScrollView`, `Tabs.Trigger`, `Tabs.Label`, `Tabs.Separator`). See the [Tabs documentation](https://heroui.com/docs/native/components/tabs).

### SwipeableTabs.Indicator

| prop                    | type                  | default | description                                                                                                                     |
| ----------------------- | --------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `children`              | `React.ReactNode`     | -       | Optional content rendered inside the indicator                                                                                  |
| `className`             | `string`              | -       | Additional CSS classes. `width`, `height`, `transform` (translateX), and `opacity` are animated and cannot be set via className |
| `animation`             | `'disabled' \| false` | -       | Snap to the selected trigger instead of following the swipe                                                                     |
| `isAnimatedStyleActive` | `boolean`             | `true`  | When `false`, animated styles are not applied                                                                                   |
| `...ViewProps`          | `ViewProps`           | -       | All standard React Native View props are supported                                                                              |

### SwipeableTabs.Pager

| prop                     | type              | default | description                                                                                            |
| ------------------------ | ----------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `children`               | `React.ReactNode` | -       | Pages. Only direct `SwipeableTabs.Content` children are rendered                                       |
| `swipeEnabled`           | `boolean`         | `true`  | Whether the user can swipe between pages                                                               |
| `isPageAnimationEnabled` | `boolean`         | `true`  | Whether trigger presses and `value` changes slide to the target page                                   |
| `className`              | `string`          | -       | Additional CSS classes for the pager container                                                         |
| `onSwipeStart`           | `() => void`      | -       | Callback fired when the user starts dragging                                                           |
| `onSwipeEnd`             | `() => void`      | -       | Callback fired when the pager settles after a drag                                                     |
| `...PagerViewProps`      | `PagerViewProps`  | -       | Remaining `react-native-pager-view` props (`overdrag`, `offscreenPageLimit`, `keyboardDismissMode`, …) |

The ref is the `PagerView` instance (`setPage`, `setPageWithoutAnimation`). Prefer `value` / `goTo` so the selection stays in sync.

### SwipeableTabs.Content

| prop           | type              | default | description                                                 |
| -------------- | ----------------- | ------- | ----------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Page content                                                |
| `value`        | `string`          | -       | Value identifying this page, matched against trigger values |
| `className`    | `string`          | -       | Additional CSS classes for the page container               |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported          |

## Hooks

### useSwipeableTabs

Hook to access the SwipeableTabs context. Must be used within a `SwipeableTabs` component.

```tsx
import { useSwipeableTabs } from 'heroui-native-pro';

const { value, values, selectedIndex, progress, goTo } = useSwipeableTabs();
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

The heroui-native `useTabs`, `useTabsMeasurements`, and `useTabsTrigger` hooks also work inside `SwipeableTabs`.
