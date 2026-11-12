# Carousel

A horizontal snap pager with navigation buttons, dot indicators, and a thumbnail strip.

## Import

```tsx
import { Carousel, useCarousel } from 'heroui-native-pro';
```

## Anatomy

```tsx
<Carousel>
  <Carousel.Content>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
  <Carousel.Dots />
  <Carousel.Thumbnails>
    <Carousel.Thumbnail index={0} source={...} />
    <Carousel.Thumbnail index={1} source={...} />
  </Carousel.Thumbnails>
</Carousel>
```

- **Carousel**: Root container. Owns the snap engine — the selected index, the snap offsets computed from the measured viewport, and autoplay — and provides it to all parts via context.
- **Carousel.Content**: Measured slide viewport hosting the horizontal snap FlatList with the `Carousel.Item` children (fed to the list as data).
- **Carousel.Item**: One slide. Its width is computed by the engine from the measured viewport, `itemsPerView`, `gap`, and `sidePadding`.
- **Carousel.Previous** / **Carousel.Next**: Navigation buttons, disabled at the ends. Positioned per the root `type`: overlaid on the slide area (`in-place`), outside it (`modal`), or inline (`miniatures`). Default chevrons mirror in RTL.
- **Carousel.Dots**: Indication-only dots (not pressable), one per snap point. The selected pill interpolates against root `progress` as the strip is dragged. Hidden when there is at most one snap point.
- **Carousel.Thumbnails**: Horizontal FlatList strip of thumbnails that auto-scrolls the selection toward its center.
- **Carousel.Thumbnail**: Pressable thumbnail navigating to a slide (`index` required). Renders an image `source` or custom children, plus an animated selection ring.

## Usage

### Basic usage

One full-width slide per view with navigation buttons and dots.

```tsx
<Carousel>
  <Carousel.Content>
    {SLIDES.map((slide) => (
      <Carousel.Item key={slide.id} className="aspect-4/3 overflow-hidden rounded-3xl">
        <Image source={{ uri: slide.uri }} className="absolute inset-0 size-full" />
      </Carousel.Item>
    ))}
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
  <Carousel.Dots />
</Carousel>
```

### Multiple slides per view

Fractional `itemsPerView` values peek the next slide. `gap` controls the spacing between slides and `align` where the selected slide sits.

```tsx
<Carousel itemsPerView={1.2} gap={12} align="center">
  <Carousel.Content>{items}</Carousel.Content>
  <Carousel.Dots />
</Carousel>
```

### Full-bleed with side padding

For an edge-to-edge carousel with breathing room, use `sidePadding` instead of padding the container (which clips the strip) or the content row (which desyncs the snap offsets). The engine owns it: the first and last slides rest inset by the padding, intermediate slides keep their `align` position on screen, and the overlaid navigation buttons keep their inset relative to the padded slide area. Without an explicit `gap`, the gap defaults to `sidePadding`.

```tsx
<Carousel itemsPerView={1.15} sidePadding={20} align="center">
  <Carousel.Content>{items}</Carousel.Content>
  <Carousel.Dots />
</Carousel>
```

### Autoplay

Autoplay advances to the next snap point on an interval and wraps back to the first at the end. By default it stops permanently on the first user interaction; set `stopAutoPlayOnInteraction={false}` to only pause while dragging.

```tsx
<Carousel autoPlay autoPlayInterval={3000}>
  <Carousel.Content>{items}</Carousel.Content>
  <Carousel.Dots />
</Carousel>
```

### Thumbnails

The `miniatures` type renders the navigation buttons inline, typically in a row with the thumbnail strip.

```tsx
<Carousel type="miniatures">
  <Carousel.Content>{items}</Carousel.Content>
  <View className="flex-row items-center gap-3">
    <Carousel.Previous />
    <Carousel.Thumbnails>
      {SLIDES.map((slide, index) => (
        <Carousel.Thumbnail key={slide.id} index={index} source={{ uri: slide.uri }} />
      ))}
    </Carousel.Thumbnails>
    <Carousel.Next />
  </View>
</Carousel>
```

### Custom dots

`renderDot` replaces each default dot. Dots are indication-only; interpolate against the `progress` shared value (continuous snap index) so the indicator follows the drag on the UI thread.

```tsx
<Carousel>
  <Carousel.Content>{items}</Carousel.Content>
  <Carousel.Dots
    renderDot={({ index, progress }) => <MyDot key={index} index={index} progress={progress} />}
  />
</Carousel>
```

```tsx
const MyDot = ({ index, progress }: { index: number; progress: SharedValue<number> }) => {
  const rStyle = useAnimatedStyle(() => {
    const amount = interpolate(
      progress.get(),
      [index - 1, index, index + 1],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { opacity: 0.35 + amount * 0.65 };
  });

  return <Animated.View className="bg-accent size-2 rounded-full" style={rStyle} />;
};
```

### Scroll-driven effects

`useCarousel()` exposes `scrollX` (physical offset) and `progress` (continuous snap index) as shared values for parallax and indicator effects. `progress` is logical: interpolating a physical `translateX` from it must be mirrored off `useIsRTL()`, while interpolating `start` needs no mirroring.

```tsx
const { progress, snapCount } = useCarousel();

const rStyle = useAnimatedStyle(() => ({
  transform: [
    {
      translateX: interpolate(progress.get(), [0, snapCount - 1], [0, trackWidth]),
    },
  ],
}));
```

## Example

```tsx
import { Carousel } from 'heroui-native-pro';
import { Image, View } from 'react-native';

const SLIDE_URIS = [
  'https://example.com/photo-1.jpg',
  'https://example.com/photo-2.jpg',
  'https://example.com/photo-3.jpg',
  'https://example.com/photo-4.jpg',
];

export default function GalleryCarousel() {
  return (
    <View className="flex-1 items-center justify-center">
      <Carousel sidePadding={20} type="miniatures">
        <Carousel.Content>
          {SLIDE_URIS.map((uri) => (
            <Carousel.Item key={uri} className="aspect-4/3 overflow-hidden rounded-3xl">
              <Image source={{ uri }} className="absolute inset-0 size-full" resizeMode="cover" />
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <View className="mt-4 w-full flex-row items-center gap-2">
          <Carousel.Thumbnails classNames={{ content: 'px-5' }}>
            {SLIDE_URIS.map((uri, index) => (
              <Carousel.Thumbnail key={uri} index={index} source={{ uri }} />
            ))}
          </Carousel.Thumbnails>
        </View>
      </Carousel>
    </View>
  );
}
```

## API Reference

### Carousel

| prop                        | type                                    | default              | description                                                                                                                                                        |
| --------------------------- | --------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children`                  | `React.ReactNode`                       | -                    | Compound parts rendered inside the carousel                                                                                                                        |
| `itemsPerView`              | `number`                                | `1`                  | Slides visible per view; fractional values peek the next slide                                                                                                     |
| `gap`                       | `number`                                | `16` / `sidePadding` | Gap between adjacent slides in pixels; defaults to `sidePadding` when that is provided                                                                             |
| `sidePadding`               | `number`                                | `0`                  | Engine-owned breathing room at both ends of the strip; edge slides rest inset by it and overlaid nav buttons keep their inset relative to the padded slide area    |
| `align`                     | `'start' \| 'center' \| 'end'`          | `'start'`            | Alignment of the selected slide within the viewport                                                                                                                |
| `type`                      | `'in-place' \| 'modal' \| 'miniatures'` | `'in-place'`         | Where the navigation buttons sit                                                                                                                                   |
| `defaultIndex`              | `number`                                | `0`                  | Snap index the carousel starts on                                                                                                                                  |
| `autoPlay`                  | `boolean`                               | `false`              | Advance automatically; wraps to the first snap point at the end                                                                                                    |
| `autoPlayInterval`          | `number`                                | `4000`               | Interval between autoplay advances in milliseconds                                                                                                                 |
| `stopAutoPlayOnInteraction` | `boolean`                               | `true`               | Stop autoplay permanently on the first user interaction                                                                                                            |
| `className`                 | `string`                                | -                    | Additional CSS classes for the root container                                                                                                                      |
| `onSelectedIndexChange`     | `(index: number) => void`               | -                    | Fires when the selected snap index changes. Navigation presses commit immediately; a swipe commits as soon as it crosses the halfway point between two snap points |
| `animation`                 | `'disable-all' \| undefined`            | -                    | `'disable-all'` disables all animations including children; `undefined` uses default animations                                                                    |
| `...ViewProps`              | `ViewProps`                             | -                    | All standard React Native View props are supported                                                                                                                 |

### Carousel.Content

The engine owns `horizontal`, `snapToOffsets`, `onScroll`, `contentOffset`, `data`, `renderItem`, `keyExtractor`, `getItemLayout`, and `contentContainerClassName`; style the slide row through `className` / `classNames.content` instead. `CellRendererComponent` is reserved by Reanimated's animated FlatList.

| prop               | type                                               | default | description                                         |
| ------------------ | -------------------------------------------------- | ------- | --------------------------------------------------- |
| `children`         | `React.ReactNode`                                  | -       | `Carousel.Item` children, one per slide             |
| `className`        | `string`                                           | -       | Additional CSS classes for the slide row            |
| `classNames`       | `ElementSlots<CarouselContentSlots>`               | -       | Additional CSS classes for individual slots         |
| `styles`           | `Partial<Record<CarouselContentSlots, ViewStyle>>` | -       | Inline styles for individual slots                  |
| `...FlatListProps` | `FlatListProps<ReactNode>`                         | -       | Remaining FlatList props are forwarded to the strip |

#### ElementSlots\<CarouselContentSlots\>

| slot       | description                                            |
| ---------- | ------------------------------------------------------ |
| `viewport` | Measured content-box wrapper hosting the snap FlatList |
| `content`  | Slide row inside the FlatList                          |

#### styles

| slot       | type        | description                           |
| ---------- | ----------- | ------------------------------------- |
| `viewport` | `ViewStyle` | Inline style for the viewport wrapper |
| `content`  | `ViewStyle` | Inline style for the slide row        |

### Carousel.Item

The slide `width` is owned by the engine and cannot be set via `className` or `style`.

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Slide content                                      |
| `className`    | `string`          | -       | Additional CSS classes for the slide container     |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Carousel.Previous / Carousel.Next

| prop                | type                                           | default | description                                                                                                                         |
| ------------------- | ---------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `children`          | `React.ReactNode`                              | Chevron | Custom icon replacing the default chevron                                                                                           |
| `className`         | `string`                                       | -       | Additional CSS classes for the button element                                                                                       |
| `classNames`        | `ElementSlots<CarouselNavSlots>`               | -       | Additional CSS classes for individual slots                                                                                         |
| `styles`            | `Partial<Record<CarouselNavSlots, ViewStyle>>` | -       | Inline styles for individual slots                                                                                                  |
| `style`             | `StyleProp<ViewStyle>`                         | -       | Style applied to the button element                                                                                                 |
| `background`        | `React.ReactNode`                              | -       | Background layer behind the button surface. `undefined` renders the theme-aware default; custom node replaces it; `null` removes it |
| `...PressableProps` | `Omit<PressableProps, 'children' \| 'style'>`  | -       | All standard React Native Pressable props are supported                                                                             |

#### ElementSlots\<CarouselNavSlots\>

| slot        | description                                                                    |
| ----------- | ------------------------------------------------------------------------------ |
| `container` | Positioning shell (absolute for `in-place` / `modal`, inline for `miniatures`) |
| `button`    | The pressable button                                                           |

#### styles

| slot        | type        | description                            |
| ----------- | ----------- | -------------------------------------- |
| `container` | `ViewStyle` | Inline style for the positioning shell |
| `button`    | `ViewStyle` | Inline style for the pressable button  |

### Carousel.NavButtonBackground

Absolute-fill container rendered behind a nav button's surface. With no children, the active library theme decides the default content (e.g. a glass blur layer); pass children to host custom content with the same positioning and clipping.

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Custom content inside the background container     |
| `className`    | `string`          | -       | Additional CSS classes                             |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Carousel.Dots

Indication-only (not pressable). Hidden when there is at most one snap point.

| prop                    | type                                            | default | description                                                                           |
| ----------------------- | ----------------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `className`             | `string`                                        | -       | Additional CSS classes for the dots container                                         |
| `classNames`            | `ElementSlots<CarouselDotsSlots>`               | -       | Additional CSS classes for individual slots (see animated property notes below)       |
| `styles`                | `Partial<Record<CarouselDotsSlots, ViewStyle>>` | -       | Inline styles for individual slots                                                    |
| `renderDot`             | `(props: CarouselDotRenderProps) => ReactNode`  | -       | Replaces each default dot                                                             |
| `animation`             | `CarouselDotAnimation`                          | -       | Width / background-color ranges interpolated from root `progress`                     |
| `isAnimatedStyleActive` | `boolean`                                       | `true`  | When `false`, the selected state is styled through the `--is-selected` modifier class |
| `...ViewProps`          | `ViewProps`                                     | -       | All standard React Native View props are supported                                    |

#### CarouselDotRenderProps

Argument passed to `renderDot`.

| prop         | type                  | description                                                                                                      |
| ------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `index`      | `number`              | Snap index this dot represents                                                                                   |
| `isSelected` | `boolean`             | Whether this dot's snap point is currently selected                                                              |
| `progress`   | `SharedValue<number>` | Continuous snap-index progress (same numeric scale as `index`); interpolate against it inside `useAnimatedStyle` |

#### ElementSlots\<CarouselDotsSlots\>

| slot        | description                                         |
| ----------- | --------------------------------------------------- |
| `container` | Row hosting the dots                                |
| `dot`       | One default dot (see animated property notes below) |

The `dot` slot animates `width` and `backgroundColor`, interpolated from root `progress`. These properties cannot be overridden via `className`; use the `animation` prop to customize, or `isAnimatedStyleActive={false}` to remove them entirely.

#### styles

| slot        | type        | description                      |
| ----------- | ----------- | -------------------------------- |
| `container` | `ViewStyle` | Inline style for the dots row    |
| `dot`       | `ViewStyle` | Inline style for one default dot |

#### CarouselDotAnimation

Animation configuration for the default dots. Can be:

- `false` or `"disabled"`: Disable the width and background-color interpolation (dots snap through the `--is-selected` modifier class)
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop                    | type               | default                          | description                                    |
| ----------------------- | ------------------ | -------------------------------- | ---------------------------------------------- |
| `width.value`           | `[number, number]` | `[8, 20]`                        | `[unselected, selected]` dot widths in pixels  |
| `backgroundColor.value` | `[string, string]` | Theme `[default, accent]` colors | `[unselected, selected]` dot background colors |

### Carousel.Thumbnails

The strip owns `horizontal`, `data`, `renderItem`, `keyExtractor`, `onScrollToIndexFailed`, and `contentContainerClassName`; style the content row through `classNames.content` instead. Auto-scrolls the selected thumbnail toward its center.

| prop               | type                                                  | default | description                                         |
| ------------------ | ----------------------------------------------------- | ------- | --------------------------------------------------- |
| `children`         | `React.ReactNode`                                     | -       | `Carousel.Thumbnail` children                       |
| `className`        | `string`                                              | -       | Additional CSS classes for the strip container      |
| `classNames`       | `ElementSlots<CarouselThumbnailsSlots>`               | -       | Additional CSS classes for individual slots         |
| `styles`           | `Partial<Record<CarouselThumbnailsSlots, ViewStyle>>` | -       | Inline styles for individual slots                  |
| `...FlatListProps` | `FlatListProps<ReactNode>`                            | -       | Remaining FlatList props are forwarded to the strip |

#### ElementSlots\<CarouselThumbnailsSlots\>

| slot        | description                  |
| ----------- | ---------------------------- |
| `container` | Horizontal FlatList strip    |
| `content`   | Content row inside the strip |

#### styles

| slot        | type        | description                          |
| ----------- | ----------- | ------------------------------------ |
| `container` | `ViewStyle` | Inline style for the strip container |
| `content`   | `ViewStyle` | Inline style for the content row     |

### Carousel.Thumbnail

| prop                    | type                                          | default | description                                                                                                         |
| ----------------------- | --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `children`              | `React.ReactNode`                             | -       | Custom thumbnail content, replacing the default image                                                               |
| `index`                 | `number`                                      | -       | Snap index this thumbnail navigates to (0-based). Required                                                          |
| `source`                | `ImageSourcePropType`                         | -       | Image rendered when no custom children are provided                                                                 |
| `className`             | `string`                                      | -       | Additional CSS classes for the thumbnail container (see animated property notes below)                              |
| `classNames`            | `ElementSlots<CarouselThumbnailSlots>`        | -       | Additional CSS classes for individual slots                                                                         |
| `styles`                | `{ container?, image?, ring? }`               | -       | Inline styles for individual slots                                                                                  |
| `style`                 | `StyleProp<ViewStyle>`                        | -       | Style applied to the thumbnail container                                                                            |
| `imageProps`            | `Omit<ImageProps, 'source'>`                  | -       | Props forwarded to the default image. Ignored when custom children are provided                                     |
| `animation`             | `CarouselThumbnailAnimation`                  | -       | Scale / ring-opacity animation configuration                                                                        |
| `isAnimatedStyleActive` | `boolean`                                     | `true`  | When `false`, the selection ring is styled through the `--is-selected` modifier class and press feedback is removed |
| `...PressableProps`     | `Omit<PressableProps, 'children' \| 'style'>` | -       | All standard React Native Pressable props are supported                                                             |

#### ElementSlots\<CarouselThumbnailSlots\>

| slot        | description                                                |
| ----------- | ---------------------------------------------------------- |
| `container` | Pressable thumbnail (see animated property notes below)    |
| `image`     | Default image element                                      |
| `ring`      | Selection ring overlay (see animated property notes below) |

The `container` slot animates `transform` (scale) for press feedback and the `ring` slot animates `opacity` for the selection transition. These properties cannot be overridden via `className`; use the `animation` prop to customize, or `isAnimatedStyleActive={false}` to remove them entirely.

#### styles

| slot        | type         | description                              |
| ----------- | ------------ | ---------------------------------------- |
| `container` | `ViewStyle`  | Inline style for the pressable container |
| `image`     | `ImageStyle` | Inline style for the default image       |
| `ring`      | `ViewStyle`  | Inline style for the selection ring      |

#### CarouselThumbnailAnimation

Animation configuration for the thumbnail. Can be:

- `false` or `"disabled"`: Disable press scale and ring opacity animations
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop                       | type               | default             | description                                       |
| -------------------------- | ------------------ | ------------------- | ------------------------------------------------- |
| `scale.value`              | `[number, number]` | `[1, 0.95]`         | `[idle, pressed]` thumbnail scale values          |
| `scale.timingConfig`       | `WithTimingConfig` | `{ duration: 150 }` | Timing configuration for the press scale          |
| `ringOpacity.value`        | `[number, number]` | `[0, 1]`            | `[unselected, selected]` selection-ring opacities |
| `ringOpacity.timingConfig` | `WithTimingConfig` | `{ duration: 150 }` | Timing configuration for the ring opacity         |

## Hooks

### useCarousel

Hook to access the carousel context. Must be used within a `Carousel` component.

```tsx
import { useCarousel } from 'heroui-native-pro';

const { selectedIndex, snapCount, scrollTo, progress } = useCarousel();
```

#### Returns: CarouselContextValue

| property         | type                                          | description                                                                                                                                                                                        |
| ---------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`           | `'in-place' \| 'modal' \| 'miniatures'`       | Active layout type                                                                                                                                                                                 |
| `align`          | `'start' \| 'center' \| 'end'`                | Alignment of the selected slide within the viewport                                                                                                                                                |
| `gap`            | `number`                                      | Gap between adjacent slides in pixels                                                                                                                                                              |
| `sidePadding`    | `number`                                      | Breathing room at both ends of the slide strip in pixels                                                                                                                                           |
| `itemsPerView`   | `number`                                      | Number of slides visible per view                                                                                                                                                                  |
| `itemWidth`      | `number`                                      | Computed slide width in pixels (`0` until the viewport is measured)                                                                                                                                |
| `viewportWidth`  | `number`                                      | Measured width of the slide viewport (`0` until measured)                                                                                                                                          |
| `viewportHeight` | `number`                                      | Measured height of the slide viewport (`0` until measured)                                                                                                                                         |
| `selectedIndex`  | `number`                                      | Currently selected snap index. Navigation presses commit immediately; a swipe commits at the halfway point                                                                                         |
| `snapCount`      | `number`                                      | Number of distinct snap points                                                                                                                                                                     |
| `canScrollPrev`  | `boolean`                                     | Whether a previous snap point exists                                                                                                                                                               |
| `canScrollNext`  | `boolean`                                     | Whether a next snap point exists                                                                                                                                                                   |
| `scrollTo`       | `(index: number, animated?: boolean) => void` | Scroll to the given snap index                                                                                                                                                                     |
| `scrollPrev`     | `() => void`                                  | Scroll to the previous snap point                                                                                                                                                                  |
| `scrollNext`     | `() => void`                                  | Scroll to the next snap point                                                                                                                                                                      |
| `scrollX`        | `SharedValue<number>`                         | Physical scroll offset of the strip in pixels. Grows toward the physical end regardless of RTL                                                                                                     |
| `progress`       | `SharedValue<number>`                         | Continuous snap-index progress (`0` to `snapCount - 1`), interpolating while the strip is dragged. Logical in both layout directions; mirror physical `translateX` interpolations off `useIsRTL()` |
