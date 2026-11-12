# StackedMeter

A stacked meter splits a single track into proportional colored segments to show how a whole breaks down into parts, such as the languages of a repository or the categories filling a storage quota.

## Import

```tsx
import { StackedMeter } from 'heroui-native-pro';
```

## Anatomy

```tsx
<StackedMeter segments={segments}>
  <StackedMeter.Label>...</StackedMeter.Label>
  <StackedMeter.Track>{() => <StackedMeter.Segment />}</StackedMeter.Track>
  <StackedMeter.Legend>
    {() => (
      <StackedMeter.LegendItem>
        <StackedMeter.LegendIndicator />
        <StackedMeter.LegendLabel />
        <StackedMeter.LegendValue />
      </StackedMeter.LegendItem>
    )}
  </StackedMeter.Legend>
</StackedMeter>
```

- **StackedMeter**: Root container that owns the `segments` data. Computes each segment's share of the total (the sum of the values, or a larger `maxValue`) and its formatted value text. With no children it renders the track and the legend; plain string children render a label, the track, and the legend.
- **StackedMeter.Label**: Title text describing the meter.
- **StackedMeter.Track**: Rounded horizontal container rendering one segment per non-zero segment, followed by the empty remainder when `maxValue` exceeds the sum. Accepts a render function called once per segment. Exposed to screen readers as a single element summarizing every segment.
- **StackedMeter.TrackBackground**: Optional theme-aware background container rendered behind the empty remainder of the track. Mounted automatically when the active theme registers default background content (e.g. `glass`). Replace or remove it via the Track's `background` prop.
- **StackedMeter.Segment**: Animated element sized by the segment's share of the track. Reads its segment from context.
- **StackedMeter.Legend**: Wrapping row rendering one legend item per segment. Accepts a render function called once per segment.
- **StackedMeter.LegendItem**: Row describing one segment. Defaults to indicator, label, and value. Exposed to screen readers as a single element.
- **StackedMeter.LegendIndicator**: Dot painted with the segment's color.
- **StackedMeter.LegendLabel**: Segment name text.
- **StackedMeter.LegendValue**: Formatted segment value, rendered with tabular figures.

## Usage

### Basic usage

Pass the segments and compose the parts. Segments without a `color` are assigned `chart-1` through `chart-5` in order.

```tsx
const LANGUAGES = [
  { id: 'ts', label: 'TypeScript', value: 96.3 },
  { id: 'css', label: 'CSS', value: 2.6 },
  { id: 'js', label: 'JavaScript', value: 1.1 },
];

<StackedMeter segments={LANGUAGES}>
  <StackedMeter.Label>Languages</StackedMeter.Label>
  <StackedMeter.Track />
  <StackedMeter.Legend />
</StackedMeter>;
```

### String children shortcut

Pass a string as children to auto-render the label, track, and legend.

```tsx
<StackedMeter segments={LANGUAGES}>Languages</StackedMeter>
```

### Sizes

Switch the track height with the `size` prop.

```tsx
<StackedMeter segments={segments} size="sm" />
<StackedMeter segments={segments} size="md" />
<StackedMeter segments={segments} size="lg" />
```

### Colors

Set `color` on a segment to use a color variant. Use `colorClassName` for colors outside the variant set; it applies to both the segment and its legend indicator.

```tsx
<StackedMeter
  segments={[
    { id: 'done', label: 'Done', value: 12, color: 'success' },
    { id: 'review', label: 'In review', value: 5, color: 'warning' },
    { id: 'blocked', label: 'Blocked', value: 2, color: 'danger' },
    { id: 'swift', label: 'Swift', value: 4, colorClassName: 'bg-[#f05138]' },
  ]}
/>
```

### Capacity

Set `maxValue` to measure the segments against a fixed capacity. The unused part of the track stays empty. Combine it with `formatOptions` to show raw values instead of percentages.

```tsx
<StackedMeter
  segments={STORAGE}
  maxValue={128}
  formatOptions={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
>
  Storage
</StackedMeter>
```

### Custom legend

Pass a render function to `StackedMeter.Legend` (or `StackedMeter.Track`). It is called once per segment, and the parts it returns read that segment from context.

```tsx
<StackedMeter segments={segments}>
  <StackedMeter.Track />
  <StackedMeter.Legend className="flex-col items-stretch gap-y-3">
    {(segment) => (
      <StackedMeter.LegendItem className="justify-between">
        <View className="flex-row items-center gap-2">
          <StackedMeter.LegendIndicator />
          <StackedMeter.LegendLabel />
        </View>
        <StackedMeter.LegendValue>{segment.value} files</StackedMeter.LegendValue>
      </StackedMeter.LegendItem>
    )}
  </StackedMeter.Legend>
</StackedMeter>
```

### Track only

Render only the track and provide `accessibilityLabel` on the root. It prefixes the summary screen readers announce for the track.

```tsx
<StackedMeter segments={segments} accessibilityLabel="Languages">
  <StackedMeter.Track />
</StackedMeter>
```

### Disabled

Set `isDisabled` to lower the opacity and mark the component as disabled for accessibility.

```tsx
<StackedMeter segments={segments} isDisabled />
```

### Render function children

Use a render function on the root to access the computed segment states.

```tsx
<StackedMeter segments={segments}>
  {({ segments, total, summaryText }) => (
    <>
      <StackedMeter.Track />
      <AppText>{summaryText}</AppText>
    </>
  )}
</StackedMeter>
```

## Example

```tsx
import { StackedMeter } from 'heroui-native-pro';
import { View } from 'react-native';

const LANGUAGES = [
  {
    id: 'ts',
    label: 'TypeScript',
    value: 96.3,
    colorClassName: 'bg-[#3178c6]',
  },
  { id: 'css', label: 'CSS', value: 2.6, colorClassName: 'bg-[#663399]' },
  { id: 'js', label: 'JavaScript', value: 1.1, colorClassName: 'bg-[#f1e05a]' },
];

export default function StackedMeterExample() {
  return (
    <View className="flex-1 items-center justify-center px-5">
      <View className="w-80">
        <StackedMeter segments={LANGUAGES}>
          <StackedMeter.Label>Languages</StackedMeter.Label>
          <StackedMeter.Track />
          <StackedMeter.Legend />
        </StackedMeter>
      </View>
    </View>
  );
}
```

## API Reference

### StackedMeter

| prop                 | type                                                           | default                                          | description                                                                                                           |
| -------------------- | -------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `children`           | `ReactNode \| ((props: StackedMeterRenderProps) => ReactNode)` | -                                                | Children elements or render function. Omitted children render Track + Legend; string children add a Label before them |
| `segments`           | `StackedMeterSegment[]`                                        | -                                                | Segments to display, in order along the reading direction                                                             |
| `maxValue`           | `number`                                                       | -                                                | Capacity the values are measured against. Ignored when smaller than the sum of the values                             |
| `size`               | `StackedMeterSize`                                             | `"md"`                                           | Size of the track                                                                                                     |
| `isDisabled`         | `boolean`                                                      | `false`                                          | Whether the component is disabled                                                                                     |
| `className`          | `string`                                                       | -                                                | Additional CSS classes for the root container                                                                         |
| `formatOptions`      | `Intl.NumberFormatOptions`                                     | `{ style: 'percent', maximumFractionDigits: 1 }` | Number format options for each segment's value text. `percent` formats the share; other styles format the raw value   |
| `accessibilityLabel` | `string`                                                       | -                                                | Prefixed to the track's accessibility summary                                                                         |
| `animation`          | `StackedMeterRootAnimation`                                    | -                                                | Animation configuration for the root component                                                                        |
| `...ViewProps`       | `ViewProps`                                                    | -                                                | All standard React Native View props are supported                                                                    |

#### StackedMeterSegment

| prop             | type                | description                                                                        |
| ---------------- | ------------------- | ---------------------------------------------------------------------------------- |
| `id`             | `string`            | Unique identifier, used as the React key                                           |
| `label`          | `string`            | Segment name, shown in the legend and used in accessibility labels                 |
| `value`          | `number`            | Raw value. Negative and non-finite values are treated as `0`                       |
| `color`          | `StackedMeterColor` | Color variant. Defaults to the next color in the `chart-1` … `chart-5` sequence    |
| `colorClassName` | `string`            | Classes applied to both the segment and its legend indicator (e.g. `bg-[#3178c6]`) |

#### StackedMeterSegmentState

Extends `StackedMeterSegment` with computed fields.

| prop         | type                | description                      |
| ------------ | ------------------- | -------------------------------- |
| `index`      | `number`            | Position in the `segments` array |
| `percentage` | `number`            | Share of the total (0–100)       |
| `valueText`  | `string`            | Formatted value text             |
| `color`      | `StackedMeterColor` | Resolved color variant           |

#### StackedMeterSize

| type                   | description                |
| ---------------------- | -------------------------- |
| `'sm' \| 'md' \| 'lg'` | Size variants of the track |

#### StackedMeterColor

| type                                                                                                                           | description                               |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger' \| 'chart-1' \| 'chart-2' \| 'chart-3' \| 'chart-4' \| 'chart-5'` | Color variants of segments and indicators |

#### StackedMeterRenderProps

| prop          | type                         | description                             |
| ------------- | ---------------------------- | --------------------------------------- |
| `segments`    | `StackedMeterSegmentState[]` | Computed state for every segment        |
| `total`       | `number`                     | Total the percentages are computed from |
| `summaryText` | `string`                     | Combined text summary of all segments   |

#### StackedMeterRootAnimation

Animation configuration for the StackedMeter root. Can be:

- `"disable-all"`: Disable all animations including children (cascades down)
- `undefined`: Use default animations

### StackedMeter.Label

| prop           | type        | default | description                                        |
| -------------- | ----------- | ------- | -------------------------------------------------- |
| `children`     | `ReactNode` | -       | Text content for the label                         |
| `className`    | `string`    | -       | Additional CSS classes for the label text          |
| `...TextProps` | `TextProps` | -       | All standard React Native Text props are supported |

### StackedMeter.Track

| prop           | type                                                              | default | description                                                                                                                                            |
| -------------- | ----------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children`     | `ReactNode \| ((segment: StackedMeterSegmentState) => ReactNode)` | -       | Omitted: one `Segment` per non-zero segment. Function: called per non-zero segment inside its context. Node: rendered verbatim instead of the segments |
| `className`    | `string`                                                          | -       | Additional CSS classes for the track container                                                                                                         |
| `background`   | `ReactNode`                                                       | -       | Background layer behind the empty remainder. `undefined` renders the theme-aware default; custom node replaces it; `null` removes it                   |
| `...ViewProps` | `ViewProps`                                                       | -       | All standard React Native View props are supported                                                                                                     |

### StackedMeter.TrackBackground

Absolute-fill container rendered behind the empty remainder of the track. With no children, the active library theme decides the default content (e.g. a glass blur layer); pass children to host custom content with the same positioning and clipping.

| prop           | type        | default | description                                        |
| -------------- | ----------- | ------- | -------------------------------------------------- |
| `children`     | `ReactNode` | -       | Custom content inside the background container     |
| `className`    | `string`    | -       | Additional CSS classes                             |
| `...ViewProps` | `ViewProps` | -       | All standard React Native View props are supported |

### StackedMeter.Segment

> Note: `flexGrow` is occupied by the animation and cannot be set via `className`. To fully control the segment size, set `isAnimatedStyleActive={false}`.

| prop                    | type                           | default | description                                                                           |
| ----------------------- | ------------------------------ | ------- | ------------------------------------------------------------------------------------- |
| `className`             | `string`                       | -       | Additional CSS classes for the segment element                                        |
| `animation`             | `StackedMeterSegmentAnimation` | -       | Animation configuration for the segment                                               |
| `isAnimatedStyleActive` | `boolean`                      | `true`  | When `false`, the animated `flexGrow` is not applied, allowing full control via style |
| `...ViewProps`          | `ViewProps`                    | -       | All standard React Native View props are supported                                    |

#### StackedMeterSegmentAnimation

Animation configuration for `StackedMeter.Segment`. Can be:

- `false` or `"disabled"`: Disable the share transition
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop               | type                               | default             | description                                   |
| ------------------ | ---------------------------------- | ------------------- | --------------------------------------------- |
| `growTimingConfig` | `AnimationValue<WithTimingConfig>` | `{ duration: 300 }` | Timing configuration for the share transition |

### StackedMeter.Legend

| prop           | type                                                              | default | description                                                                                                             |
| -------------- | ----------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| `children`     | `ReactNode \| ((segment: StackedMeterSegmentState) => ReactNode)` | -       | Omitted: one `LegendItem` per segment. Function: called per segment inside its context. Node: rendered verbatim instead |
| `className`    | `string`                                                          | -       | Additional CSS classes for the legend container                                                                         |
| `...ViewProps` | `ViewProps`                                                       | -       | All standard React Native View props are supported                                                                      |

### StackedMeter.LegendItem

| prop           | type        | default | description                                                                 |
| -------------- | ----------- | ------- | --------------------------------------------------------------------------- |
| `children`     | `ReactNode` | -       | Item content. Defaults to `LegendIndicator` + `LegendLabel` + `LegendValue` |
| `className`    | `string`    | -       | Additional CSS classes for the legend item container                        |
| `...ViewProps` | `ViewProps` | -       | All standard React Native View props are supported                          |

### StackedMeter.LegendIndicator

| prop           | type        | default | description                                        |
| -------------- | ----------- | ------- | -------------------------------------------------- |
| `className`    | `string`    | -       | Additional CSS classes for the indicator dot       |
| `...ViewProps` | `ViewProps` | -       | All standard React Native View props are supported |

### StackedMeter.LegendLabel

| prop           | type        | default | description                                        |
| -------------- | ----------- | ------- | -------------------------------------------------- |
| `children`     | `ReactNode` | -       | Custom content. Defaults to the segment's `label`  |
| `className`    | `string`    | -       | Additional CSS classes for the legend label text   |
| `...TextProps` | `TextProps` | -       | All standard React Native Text props are supported |

### StackedMeter.LegendValue

| prop           | type        | default | description                                           |
| -------------- | ----------- | ------- | ----------------------------------------------------- |
| `children`     | `ReactNode` | -       | Custom content. Defaults to the segment's `valueText` |
| `className`    | `string`    | -       | Additional CSS classes for the legend value text      |
| `...TextProps` | `TextProps` | -       | All standard React Native Text props are supported    |

## Hooks

### useStackedMeter

Hook to access the StackedMeter context. Must be used within a `StackedMeter` component.

```tsx
import { useStackedMeter } from 'heroui-native-pro';

const { segments, total, remainderPercentage, summaryText, size, isDisabled } = useStackedMeter();
```

#### Returns: StackedMeterContextValue

| property              | type                         | description                                                       |
| --------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `segments`            | `StackedMeterSegmentState[]` | Computed state for every segment, in input order                  |
| `total`               | `number`                     | Total the percentages are computed from                           |
| `remainderPercentage` | `number`                     | Share (0–100) of the track left empty; `100` when nothing to show |
| `summaryText`         | `string`                     | Combined text summary of all segments                             |
| `accessibilityLabel`  | `string \| undefined`        | Accessibility label passed to the root                            |
| `size`                | `StackedMeterSize`           | Current size variant                                              |
| `isDisabled`          | `boolean`                    | Whether the component is disabled                                 |

### useStackedMeterSegment

Hook to access the current segment inside a `StackedMeter.Track` or `StackedMeter.Legend` render function (or the default content).

```tsx
import { useStackedMeterSegment } from 'heroui-native-pro';

const { segment } = useStackedMeterSegment();
```

#### Returns: StackedMeterSegmentContextValue

| property  | type                       | description                       |
| --------- | -------------------------- | --------------------------------- |
| `segment` | `StackedMeterSegmentState` | Computed state of the current one |
