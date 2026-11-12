# FlipCard

A pressable card that flips between a front and back face with a spring-driven 3D rotation.

## Import

```tsx
import { FlipCard } from 'heroui-native-pro';
```

## Anatomy

```tsx
<FlipCard>
  <FlipCard.Front>...</FlipCard.Front>
  <FlipCard.Back>...</FlipCard.Back>
</FlipCard>
```

- **FlipCard**: Pressable root container that drives the flip. Owns the shared spring progress, cascades `disable-all` to animated descendants, and supports controlled (`isFlipped` + `onFlipChange`) and uncontrolled (`defaultFlipped`) usage. Tapping toggles the flip unless `isPressDisabled` is set.
- **FlipCard.Front**: Face visible at rest (progress 0). Rotates from `0deg` to `180deg` as the card flips and hides mid-flip via `backfaceVisibility`. Removed from the accessibility tree and excluded from hit testing once the card is flipped.
- **FlipCard.Back**: Face revealed when flipped (progress 1). Positioned absolutely over the front face and rotates from `180deg` to `360deg`. Removed from the accessibility tree and excluded from hit testing while the front is visible, so hidden interactive content (e.g. a button on the back) cannot intercept touches.

## Usage

### Basic usage

Compose a tap-to-flip card with a front and a back face. The card animates with a spring on every tap.

```tsx
<FlipCard>
  <FlipCard.Front>...</FlipCard.Front>
  <FlipCard.Back>...</FlipCard.Back>
</FlipCard>
```

### Vertical direction

Flip around the X axis (top-over-bottom) with `direction="vertical"`.

```tsx
<FlipCard direction="vertical">
  <FlipCard.Front>...</FlipCard.Front>
  <FlipCard.Back>...</FlipCard.Back>
</FlipCard>
```

### Reverse rotation

Spin the opposite way around the chosen axis with `rotation="reverse"`.

```tsx
<FlipCard direction="vertical" rotation="reverse">
  <FlipCard.Front>...</FlipCard.Front>
  <FlipCard.Back>...</FlipCard.Back>
</FlipCard>
```

### Controlled

Drive the flip externally with `isFlipped` and `onFlipChange`. Set `isPressDisabled` when the card should not toggle on tap.

```tsx
const [isFlipped, setIsFlipped] = useState(false);

<FlipCard isFlipped={isFlipped} onFlipChange={setIsFlipped} isPressDisabled>
  <FlipCard.Front>...</FlipCard.Front>
  <FlipCard.Back>...</FlipCard.Back>
</FlipCard>;
```

### Custom spring

Customize the flip spring through the `animation` prop.

```tsx
<FlipCard
  animation={{
    progress: { springConfig: { stiffness: 120, damping: 16 } },
  }}
>
  <FlipCard.Front>...</FlipCard.Front>
  <FlipCard.Back>...</FlipCard.Back>
</FlipCard>
```

## Example

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from 'heroui-native';
import { FlipCard } from 'heroui-native-pro';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function DestinationFlipCard() {
  return (
    <View className="flex-1 items-center justify-center px-5">
      <View className="w-full max-w-sm">
        <FlipCard
          className="aspect-[1.3]"
          animation={{
            progress: { springConfig: { stiffness: 120, damping: 16 } },
          }}
        >
          <FlipCard.Front>
            <Image
              source={{
                uri: 'https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo2.jpeg',
              }}
              className="absolute inset-0"
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.6)']}
              style={StyleSheet.absoluteFill}
            />
            <View className="flex-1 justify-end p-6">
              <Text className="text-2xl font-bold text-white">Kyoto Getaway</Text>
              <Text className="text-sm text-zinc-200">5 nights · Tap for trip details</Text>
            </View>
          </FlipCard.Front>
          <FlipCard.Back className="bg-surface-secondary justify-between p-6">
            <Text className="text-foreground text-xl font-semibold">Kyoto Getaway</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground text-lg font-bold">$1,240</Text>
              <Button size="sm">Book now</Button>
            </View>
          </FlipCard.Back>
        </FlipCard>
      </View>
    </View>
  );
}
```

## API Reference

### FlipCard

| prop                | type                           | default        | description                                                                                          |
| ------------------- | ------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------- |
| `children`          | `React.ReactNode`              | -              | Compound parts to render inside the card (typically `FlipCard.Front` and `FlipCard.Back`)            |
| `direction`         | `FlipCardDirection`            | `"horizontal"` | Axis around which the card flips (`"horizontal"` = rotateY, `"vertical"` = rotateX)                  |
| `rotation`          | `FlipCardRotation`             | `"normal"`     | Spin direction around the chosen axis. `"reverse"` negates the rotation range so the card spins back |
| `isFlipped`         | `boolean`                      | -              | Whether the card shows its back face (controlled mode)                                               |
| `defaultFlipped`    | `boolean`                      | `false`        | Default flipped state for uncontrolled mode                                                          |
| `isPressDisabled`   | `boolean`                      | `false`        | When `true`, tapping the card does not toggle the flip. Use to drive the flip externally             |
| `className`         | `string`                       | -              | Additional CSS classes for the root container                                                        |
| `onFlipChange`      | `(isFlipped: boolean) => void` | -              | Callback fired when the flipped state changes                                                        |
| `animation`         | `FlipCardRootAnimation`        | -              | Animation configuration for the flip (spring config and `disable-all` cascade)                       |
| `...PressableProps` | `PressableProps`               | -              | All standard React Native Pressable props are supported                                              |

#### FlipCardDirection

Axis around which the card flips.

- `"horizontal"`: Rotates around the Y axis (left/right flip)
- `"vertical"`: Rotates around the X axis (top/bottom flip)

#### FlipCardRotation

Spin direction of the flip around the chosen axis. Follows the CSS `animation-direction` naming convention.

- `"normal"`: Rotates towards positive angles (front `0deg` to `180deg`)
- `"reverse"`: Rotates the opposite way (front `0deg` to `-180deg`)

#### FlipCardRootAnimation

Animation configuration for the root component. Can be:

- `false` or `"disabled"`: Disable only root animations (flip snaps instantly; children can still animate)
- `"disable-all"`: Disable all animations including children (cascades down through `AnimationSettingsProvider`)
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop       | type             | default | description                                |
| ---------- | ---------------- | ------- | ------------------------------------------ |
| `progress` | `AnimationValue` | -       | Configuration for the flip progress spring |

##### progress

| prop           | type               | default                                     | description                                                          |
| -------------- | ------------------ | ------------------------------------------- | -------------------------------------------------------------------- |
| `springConfig` | `WithSpringConfig` | `{ mass: 1.2, stiffness: 60, damping: 12 }` | Spring configuration driving the flip progress (0 = front, 1 = back) |

### FlipCard.Front

| prop                    | type                    | default | description                                                                                            |
| ----------------------- | ----------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `children`              | `React.ReactNode`       | -       | Content rendered on the front face                                                                     |
| `className`             | `string`                | -       | Additional CSS classes for the front face                                                              |
| `animation`             | `FlipCardFaceAnimation` | -       | Animation configuration for the front face                                                             |
| `isAnimatedStyleActive` | `boolean`               | `true`  | Whether animated styles are active. When `false`, the animated flip transform is removed from the face |
| `...ViewProps`          | `ViewProps`             | -       | All standard React Native View props are supported                                                     |

#### FlipCardFaceAnimation

Animation configuration for a face. Can be:

- `false` or `"disabled"`: Snap between resting and flipped rotation without interpolating against the shared flip progress
- `undefined`: Use default animations

### FlipCard.Back

| prop                    | type                    | default | description                                                                                            |
| ----------------------- | ----------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `children`              | `React.ReactNode`       | -       | Content rendered on the back face                                                                      |
| `className`             | `string`                | -       | Additional CSS classes for the back face                                                               |
| `animation`             | `FlipCardFaceAnimation` | -       | Animation configuration for the back face                                                              |
| `isAnimatedStyleActive` | `boolean`               | `true`  | Whether animated styles are active. When `false`, the animated flip transform is removed from the face |
| `...ViewProps`          | `ViewProps`             | -       | All standard React Native View props are supported                                                     |

## Hooks

### useFlipCard

Hook to access the flip card state context. Must be used within a `FlipCard` component.

```tsx
import { useFlipCard } from 'heroui-native-pro';

const { isFlipped, direction, rotation, toggle } = useFlipCard();
```

#### Returns

| property    | type                | description                                          |
| ----------- | ------------------- | ---------------------------------------------------- |
| `isFlipped` | `boolean`           | Whether the card currently shows its back face       |
| `direction` | `FlipCardDirection` | Axis around which the card flips                     |
| `rotation`  | `FlipCardRotation`  | Spin direction of the flip around the chosen axis    |
| `toggle`    | `() => void`        | Toggles the flipped state (respects controlled mode) |

### useFlipCardAnimation

Hook to access the shared flip progress. Use it to build custom progress-driven animated styles inside compound parts. Must be used within a `FlipCard` component.

```tsx
import { useFlipCardAnimation } from 'heroui-native-pro';

const { progress } = useFlipCardAnimation();
```

#### Returns

| property   | type                  | description                                          |
| ---------- | --------------------- | ---------------------------------------------------- |
| `progress` | `SharedValue<number>` | Animated flip progress (0 = front visible, 1 = back) |
