# Glass theme

Frosted glass styling for HeroUI Native Pro. Requires setup beyond CSS alone.

## Install

```bash
npx expo install expo-blur
```

`expo-blur` is the only supported blur provider. Bare React Native projects can install it too — it works outside Expo apps as long as `expo-modules-core` is set up.

## Configure

Import the glass theme **after** `heroui-native/styles` in your app `global.css`:

```css
@import 'tailwindcss';
@import 'uniwind';

@import 'heroui-native/styles';

/* Glass theme — must come after base styles */
@import 'heroui-native-pro/themes/glass';
```

## How it works

heroui-native declares a `--theme` CSS variable (default: `default`). The glass theme overrides it:

```css
@theme inline static {
  --theme: glass;
}
```

Overlay and field components (Popover, Dialog, Menu, SubMenu, BottomSheet, Select, Toast, Input, InputOTP) read `--theme` at runtime via `ThemeBackground` / `GlassView` and render a frosted layer behind their content when the value is `glass`. On iOS that layer is a native `expo-blur` blur; translucent theme tokens (`--overlay`, `--field-background`, etc.) frost through it.

Surface-backed components do the same: the glass theme overrides `--surface`, `--surface-secondary`, and `--surface-tertiary` with semi-transparent values, and Surface (plus Card, which builds on it), Alert, the Accordion surface variant, the Select trigger, TagGroup surface tags, Toast, and the Pro components Widget, FlipCard, SlideButton, Agenda, Table, SwipeableRow, the Carousel nav buttons, the MorphTabs trigger pills, and the StackedMeter track's empty remainder (all three of which paint the translucent `--default` token) mount a matching frosted layer behind their surface tint (`Surface.Background`, `Alert.Background`, `Widget.Background`, `Agenda.Background`, `Table.Background`, `SwipeableRow.ContentBackground`, `Carousel.NavButtonBackground`, `MorphTabs.TriggerBackground`, `StackedMeter.TrackBackground`, etc.). `Widget.Content` intentionally keeps only its translucent tint — it composites over the widget root's layer, avoiding stacked blur views. The Agenda's header pane and body do the same over the agenda root's layer, as does the Table's body card over the table root's layer.

Charts follow the theme too. The `--chart-1` … `--chart-5` ramp is derived from `--accent` by default, which would collapse into a single tone under the glass accent (near-black in light, near-white in dark), so the glass theme redefines the whole ramp. Anything reading `--color-chart-*` — `accent-chart-*` / `bg-chart-*` utilities and `useThemeColorPro` alike — picks the glass values up automatically.

Each overlay component exposes the layer as a compound part (`Popover.ContentBackground`, `Dialog.ContentBackground`, `GlassView` directly, etc.) — supply it to customize intensity, tint, or the Android / web fallback color:

```tsx
<Popover.Content
  background={
    <Popover.ContentBackground>
      <GlassView intensity={80} tint="light" fallbackColor="overlay" />
    </Popover.ContentBackground>
  }
>
  ...
</Popover.Content>
```

For BottomSheet, customize via a gorhom `backgroundComponent` rendering `GlassView` (or the sheet's background part).

Without `expo-blur` installed, iOS falls back to the same opaque flattened color used on Android / web.

## Android / web fallback

React Native has no reliable backdrop blur on Android (or web). Instead of mounting a no-op transparent layer, `GlassView` paints an **opaque approximation of the iOS frosted look**:

1. Resolve the `fallbackColor` theme token (default `"overlay"`) and `--background` via `useThemeColor`.
2. Alpha-composite the token over the background (e.g. `#ffffffbf` over the page background → an opaque near-white).
3. Paint that opaque hex as the layer's `backgroundColor`.

Field-flavored surfaces (`Input.Background`, `InputOTP.SlotBackground`, `NumberStepper.ButtonBackground`) pass `fallbackColor="field"` so low-alpha navy tints flatten to a light frosted tone instead of a dark solid. Surface-backed parts pass their matching token — `fallbackColor="surface"` (Alert, Toast, FlipCard faces, etc.), `"surface-secondary"` (Widget root), or `"surface-tertiary"` — so the opaque fallback matches each surface tint.

Customize the fallback for any surface by passing `fallbackColor` on `GlassView` or `ThemeBackground`:

```tsx
<GlassView fallbackColor="surface" />
```
