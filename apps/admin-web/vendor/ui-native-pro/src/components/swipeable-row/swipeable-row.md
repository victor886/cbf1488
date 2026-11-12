# SwipeableRow

Reveal contextual actions by swiping a row toward its logical start or end edge. The whole rounded content card travels with the finger and uncovers the actions resting behind it as separate rounded buttons. The component mirrors its gesture and rails automatically in right-to-left layouts.

## Import

```tsx
import { SwipeableRow } from 'heroui-native-pro';
```

## Anatomy

```tsx
<SwipeableRow>
  <SwipeableRow.Actions side="start">
    <SwipeableRow.Action>...</SwipeableRow.Action>
  </SwipeableRow.Actions>
  <SwipeableRow.Content>...</SwipeableRow.Content>
  <SwipeableRow.Actions side="end">
    <SwipeableRow.Action>...</SwipeableRow.Action>
  </SwipeableRow.Actions>
</SwipeableRow>
```

- **SwipeableRow**: Non-clipping root that owns gesture handling, controllable open state, and imperative controls. The card can travel past the row bounds; add `overflow-hidden` to the root to clip it at the row edges instead.
- **SwipeableRow.Actions**: An action rail anchored to a logical `start` or `end` edge. It never moves: it rests behind the card, which uncovers it. Its width (including the gap to the card) is measured automatically. Under the `glass` theme, whose translucent card would otherwise show the actions through at rest, the action row is mounted only while the card uncovers it and fades in and out (Reanimated `FadeIn` / `FadeOut`, 200ms); its ref is `null` while hidden.
- **SwipeableRow.Content**: The surface card translated as a whole by the swipe gesture — rounded in the `standalone` variant, square at rest in the `inline` variant.
- **SwipeableRow.ContentBackground**: Optional theme-aware layer behind the card (a frosted blur under the `glass` theme). Controlled through the `background` prop on `SwipeableRow.Content`.
- **SwipeableRow.Action**: A pressable action. Plain string and number children become an `ActionLabel` automatically; the row closes after the press by default.
- **SwipeableRow.ActionLabel**: Label styled with the enclosing action variant.

## Usage

### Basic usage

Place the actions before the content so the foreground content reveals the end rail. Action sides are logical: in RTL, `end` appears on the left and uses the matching swipe direction.

```tsx
<SwipeableRow>
  <SwipeableRow.Actions side="end">
    <SwipeableRow.Action variant="accent" onPress={archiveMessage}>
      <SwipeableRow.ActionLabel>Archive</SwipeableRow.ActionLabel>
    </SwipeableRow.Action>
  </SwipeableRow.Actions>
  <SwipeableRow.Content>
    <MessageRow />
  </SwipeableRow.Content>
</SwipeableRow>
```

### Start, end, and multiple actions

Compose rails on either edge. Each rail accepts one or more actions and measures its own width.

```tsx
<SwipeableRow>
  <SwipeableRow.Actions side="start">
    <SwipeableRow.Action variant="success" onPress={markRead}>
      Read
    </SwipeableRow.Action>
  </SwipeableRow.Actions>
  <SwipeableRow.Actions side="end">
    <SwipeableRow.Action variant="default" onPress={mute}>
      Mute
    </SwipeableRow.Action>
    <SwipeableRow.Action variant="danger" onPress={remove}>
      Delete
    </SwipeableRow.Action>
  </SwipeableRow.Actions>
  <SwipeableRow.Content>
    <MessageRow />
  </SwipeableRow.Content>
</SwipeableRow>
```

### Standalone and inline variants

`variant="standalone"` (the default) renders a rounded, elevated card for rows spaced apart. `variant="inline"` renders a square, flat row for lists whose rows touch: stack inline rows without gaps and separate them yourself. While an inline row is dragged, its corners round from `0` to the standalone card radius of the active theme over the first `32` points of travel, and flatten again as it settles closed.

```tsx
<View className="overflow-hidden rounded-3xl">
  {messages.map((message, index) => (
    <Fragment key={message.id}>
      {index > 0 ? <Separator /> : null}
      <SwipeableRow variant="inline">
        <SwipeableRow.Actions side="end">
          <SwipeableRow.Action variant="danger">Delete</SwipeableRow.Action>
        </SwipeableRow.Actions>
        <SwipeableRow.Content>
          <MessageRow message={message} />
        </SwipeableRow.Content>
      </SwipeableRow>
    </Fragment>
  ))}
</View>
```

Tune the corner animation with the root `animation` prop, or pass `value: [0, 0]` to keep inline rows square:

```tsx
<SwipeableRow variant="inline" animation={{ borderRadius: { value: [0, 16], distance: 48 } }}>
  {/* compound parts */}
</SwipeableRow>
```

### Controlled state

Use `openSide` and `onOpenSideChange` to store which logical rail is open. Pass `null` to close the row.

```tsx
const [openSide, setOpenSide] = useState<SwipeableRowOpenSide>(null);

<SwipeableRow openSide={openSide} onOpenSideChange={setOpenSide}>
  <SwipeableRow.Actions side="end">
    <SwipeableRow.Action variant="danger">Delete</SwipeableRow.Action>
  </SwipeableRow.Actions>
  <SwipeableRow.Content>
    <MessageRow />
  </SwipeableRow.Content>
</SwipeableRow>;
```

Use `defaultOpenSide` for an uncontrolled initial state.

### Imperative controls

The root ref includes the underlying view ref plus `open`, `close`, and `reset`. `reset` clears the gesture and animation state immediately.

```tsx
const rowRef = useRef<SwipeableRowRootRef>(null);

<SwipeableRow ref={rowRef}>{/* compound parts */}</SwipeableRow>;

rowRef.current?.open('end');
rowRef.current?.close();
rowRef.current?.reset();
```

### Action behavior

Actions close their row after `onPress` by default. Set `closeOnPress={false}` for an action that should remain visible. Use `isDisabled` on the root to disable swiping and all action presses.

```tsx
<SwipeableRow isDisabled>
  <SwipeableRow.Actions side="end">
    <SwipeableRow.Action variant="danger">Delete</SwipeableRow.Action>
  </SwipeableRow.Actions>
  <SwipeableRow.Content>
    <MessageRow />
  </SwipeableRow.Content>
</SwipeableRow>
```

### Screen readers

`SwipeableRow.Content` exposes custom accessibility actions for each mounted rail. A screen-reader user can reveal start or end actions, navigate to the visible action buttons, and close the rail without performing a touch swipe. Localize the three action labels through the root accessibility label props.

```tsx
<SwipeableRow
  accessibilityOpenStartActionsLabel="Show leading actions"
  accessibilityOpenEndActionsLabel="Show trailing actions"
  accessibilityCloseActionsLabel="Hide row actions"
>
  {/* compound parts */}
</SwipeableRow>
```

### Action zoom

Action buttons stay still while the card uncovers them; only their content animates. Each `SwipeableRow.Action` animates its content with its own reveal progress — only over the travel during which the card uncovers that action, so actions sharing a rail animate in turn, outermost first. The content slides 15pt out from the card toward the rail's outer edge, scale goes from `0.5` to `1`, and opacity from `0` to `1`. The slide is logical — left-to-right for end actions in LTR, mirrored for start actions and in RTL. While pressed, the whole action button also scales down to `0.95` over `150ms`. Tune the ranges or turn it all off with the `animation` prop; set `pressScale.value` to `1` to keep only the reveal animation.

```tsx
<SwipeableRow.Action
  variant="danger"
  animation={{
    translateX: { value: [12, 0] },
    scale: { value: [0.8, 1] },
    opacity: { value: [0.4, 1] },
    pressScale: { value: 0.9, timingConfig: { duration: 100 } },
  }}
>
  Delete
</SwipeableRow.Action>

<SwipeableRow.Action animation={false}>Static</SwipeableRow.Action>
```

### Rubber band

With `overshoot` enabled (the default), dragging toward a side that has no actions pulls the card a little with `overshootFriction` resistance, then springs back on release. Set `overshoot={false}` for a hard stop.

### Animated action content

`Actions` accepts a render function for live, UI-thread reveal values. Pass `animation={false}` to the actions you animate yourself so the built-in zoom does not stack on top. `progress` is clamped between `0` and `1`; `translation` is logical, so positive values reveal `start` and negative values reveal `end` in every layout direction.

```tsx
function AnimatedArchiveAction({ progress }: { progress: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: 0.8 + progress.get() * 0.2 }],
  }));

  return (
    <SwipeableRow.Action variant="accent" animation={false}>
      <Animated.View style={animatedStyle}>
        <SwipeableRow.ActionLabel>Archive</SwipeableRow.ActionLabel>
      </Animated.View>
    </SwipeableRow.Action>
  );
}

<SwipeableRow.Actions side="end">
  {({ progress }) => <AnimatedArchiveAction progress={progress} />}
</SwipeableRow.Actions>;
```

## API Reference

### SwipeableRow

| prop                                 | type                                                           | default                | description                                                                                  |
| ------------------------------------ | -------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| `children`                           | `ReactNode`                                                    | -                      | Compound action rails and foreground content.                                                |
| `openSide`                           | `'start' \| 'end' \| null`                                     | -                      | Controlled open rail. `null` closes the row. A side without a non-empty rail stays closed.   |
| `defaultOpenSide`                    | `'start' \| 'end' \| null`                                     | `null`                 | Initial uncontrolled open rail.                                                              |
| `variant`                            | `'standalone' \| 'inline'`                                     | `'standalone'`         | Rounded card for spaced rows, or a square list row whose corners round while dragged.        |
| `isDisabled`                         | `boolean`                                                      | `false`                | Disables swiping and action presses. Disabling an open row closes it.                        |
| `openThreshold`                      | `number`                                                       | `0.5`                  | Fraction of an action rail that must be crossed before it settles open. Clamped to `0...1`.  |
| `activationThreshold`                | `number`                                                       | `10`                   | Horizontal distance required to activate the pan gesture.                                    |
| `failOffsetY`                        | `number \| [number, number]`                                   | `[-10, 10]`            | Vertical movement range that causes the pan gesture to fail for a parent scroll view.        |
| `friction`                           | `number`                                                       | `1`                    | Ratio between finger travel and row travel. Higher values feel heavier. Minimum `1`.         |
| `overshoot`                          | `boolean`                                                      | `true`                 | Allows content to move beyond its action rail width, and rubber-bands sides without actions. |
| `overshootFriction`                  | `number`                                                       | `8`                    | Resistance applied while overshooting or rubber-banding. Minimum `1`.                        |
| `closeOnContentPress`                | `boolean`                                                      | `true`                 | Closes an open row when its foreground content is pressed.                                   |
| `accessibilityOpenStartActionsLabel` | `string`                                                       | `'Open start actions'` | Localized label for the screen-reader action that reveals the start rail.                    |
| `accessibilityOpenEndActionsLabel`   | `string`                                                       | `'Open end actions'`   | Localized label for the screen-reader action that reveals the end rail.                      |
| `accessibilityCloseActionsLabel`     | `string`                                                       | `'Close actions'`      | Localized label for the screen-reader action that closes the row.                            |
| `enableTrackpadTwoFingerGesture`     | `boolean`                                                      | `false`                | Enables supported iPadOS two-finger trackpad swipes.                                         |
| `simultaneousWithExternalGesture`    | `SwipeableRowGestureRelation \| SwipeableRowGestureRelation[]` | -                      | Gesture relation allowed to recognize simultaneously.                                        |
| `requireExternalGestureToFail`       | `SwipeableRowGestureRelation \| SwipeableRowGestureRelation[]` | -                      | Gesture relation that must fail before this row recognizes.                                  |
| `blocksExternalGesture`              | `SwipeableRowGestureRelation \| SwipeableRowGestureRelation[]` | -                      | Gesture relation blocked while this row is active.                                           |
| `onOpenSideChange`                   | `(side: SwipeableRowOpenSide) => void`                         | -                      | Called when the requested open rail changes.                                                 |
| `animation`                          | `SwipeableRowRootAnimation`                                    | -                      | Settling spring and inline corner configuration; accepts `"disable-all"` to cascade.         |
| `className`                          | `string`                                                       | -                      | Additional classes for the root. It does not clip; add `overflow-hidden` to clip the card.   |
| `...ViewProps`                       | `ViewProps`                                                    | -                      | Standard React Native view props, except `children`.                                         |

#### SwipeableRowRootAnimation

| property                | type                                     | default                           | description                                                                                         |
| ----------------------- | ---------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `springConfig`          | `WithSpringConfig`                       | `{ mass: 2, damping: 1000, ... }` | Spring used when the row settles open or closed.                                                    |
| `borderRadius.value`    | `[number, number]`                       | `[0, standalone card radius]`     | `inline` only. Content corner radius at `[rest, dragged]`; the dragged radius comes from the theme. |
| `borderRadius.distance` | `number`                                 | `32`                              | `inline` only. Drag distance in points over which the radius goes from rest to dragged.             |
| `state`                 | `'disabled' \| 'disable-all' \| boolean` | -                                 | Disables the settle spring; `'disable-all'` also disables descendant animations.                    |

### SwipeableRow.Actions

| prop           | type                                                                  | default | description                                                                         |
| -------------- | --------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `side`         | `'start' \| 'end'`                                                    | -       | Logical edge where the rail is anchored.                                            |
| `children`     | `ReactNode \| ((props: SwipeableRowActionsRenderProps) => ReactNode)` | -       | Action controls or a function receiving live reveal state.                          |
| `className`    | `string`                                                              | -       | Additional classes for the rail.                                                    |
| `...ViewProps` | `ViewProps`                                                           | -       | Standard view props except managed children, pointer, and accessibility-tree props. |

#### SwipeableRowActionsRenderProps

| property      | type                                                | description                                                               |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| `side`        | `'start' \| 'end'`                                  | Logical edge owned by the rail.                                           |
| `progress`    | `SharedValue<number>`                               | Rail reveal progress, clamped from `0` to `1`.                            |
| `translation` | `SharedValue<number>`                               | Logical row translation; positive reveals start and negative reveals end. |
| `isOpen`      | `boolean`                                           | Whether this rail is the settled open side.                               |
| `close`       | `(options?: SwipeableRowTransitionOptions) => void` | Imperatively closes the row.                                              |

### SwipeableRow.Content

| prop           | type        | default | description                                                                                                                          |
| -------------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `children`     | `ReactNode` | -       | Card content.                                                                                                                        |
| `className`    | `string`    | -       | Additional classes. Do not set `transform`: the swipe animation owns it.                                                             |
| `background`   | `ReactNode` | -       | Layer behind the card. `undefined` renders the theme default (blur under `glass`), a custom node replaces it, and `null` removes it. |
| `...ViewProps` | `ViewProps` | -       | Standard view props except managed pointer and accessibility-tree props.                                                             |

### SwipeableRow.ContentBackground

Absolute-fill container clipped to the card radius. With no `children`, the active theme decides its content. Wrap custom gradients or images in it to keep the positioning and clipping.

| prop           | type        | default | description                       |
| -------------- | ----------- | ------- | --------------------------------- |
| `children`     | `ReactNode` | -       | Custom background content.        |
| `className`    | `string`    | -       | Additional classes for the layer. |
| `...ViewProps` | `ViewProps` | -       | Standard React Native view props. |

### SwipeableRow.Action

| prop                | type                                             | default     | description                                                                                                                       |
| ------------------- | ------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `children`          | `ReactNode`                                      | -           | Action content. Strings and numbers receive an automatic `ActionLabel`.                                                           |
| `variant`           | `'default' \| 'accent' \| 'success' \| 'danger'` | `'default'` | Action color treatment.                                                                                                           |
| `closeOnPress`      | `boolean`                                        | `true`      | Closes the enclosing row after invoking `onPress`.                                                                                |
| `className`         | `string`                                         | -           | Additional classes for the action button.                                                                                         |
| `animation`         | `SwipeableRowActionAnimation`                    | -           | Content slide, zoom, and fade driven by the action's own reveal progress, plus press scale. `false` or `"disabled"` turns it off. |
| `...PressableProps` | `PressableProps`                                 | -           | Standard React Native pressable props, except `children`.                                                                         |

#### SwipeableRowActionAnimation

| property                  | type                    | default             | description                                                                                                            |
| ------------------------- | ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `translateX.value`        | `[number, number]`      | `[15, 0]`           | Content offset in points toward the card at `[hidden, fully revealed]`. Logical; mirrors for start actions and in RTL. |
| `scale.value`             | `[number, number]`      | `[0.5, 1]`          | Content scale at `[hidden, fully revealed]`.                                                                           |
| `opacity.value`           | `[number, number]`      | `[0, 1]`            | Content opacity at `[hidden, fully revealed]`.                                                                         |
| `pressScale.value`        | `number`                | `0.95`              | Whole-button scale while pressed. `1` turns the press feedback off.                                                    |
| `pressScale.timingConfig` | `WithTimingConfig`      | `{ duration: 150 }` | Timing of the press-in and press-out scale.                                                                            |
| `state`                   | `'disabled' \| boolean` | -                   | Disables the animation while keeping custom values.                                                                    |

### SwipeableRow.ActionLabel

| prop           | type        | default | description                       |
| -------------- | ----------- | ------- | --------------------------------- |
| `children`     | `ReactNode` | -       | Label content.                    |
| `className`    | `string`    | -       | Additional label classes.         |
| `...TextProps` | `TextProps` | -       | Standard React Native text props. |

## Hooks

### useSwipeableRow

Read the enclosing row state and controls from a descendant of `SwipeableRow`.

```tsx
const { openSide, startProgress, endProgress, close } = useSwipeableRow();
```

| property        | type                       | description                                     |
| --------------- | -------------------------- | ----------------------------------------------- |
| `openSide`      | `SwipeableRowOpenSide`     | Current logical open rail.                      |
| `variant`       | `'standalone' \| 'inline'` | Layout treatment of the row.                    |
| `isDisabled`    | `boolean`                  | Whether row interaction is disabled.            |
| `translation`   | `SharedValue<number>`      | Logical horizontal translation.                 |
| `startProgress` | `SharedValue<number>`      | Start rail reveal progress.                     |
| `endProgress`   | `SharedValue<number>`      | End rail reveal progress.                       |
| `open`          | `(side, options?) => void` | Opens a logical rail.                           |
| `close`         | `(options?) => void`       | Closes the row.                                 |
| `reset`         | `() => void`               | Immediately resets gesture and animation state. |
