# Timeline

A composable event-history component for feeds, activity logs, and centered milestone timelines.

## Import

```tsx
import { Timeline } from 'heroui-native-pro';
```

## Anatomy

```tsx
<Timeline>
  <Timeline.Item>
    <Timeline.Leading>...</Timeline.Leading>
    <Timeline.Rail>
      <Timeline.Marker />
      <Timeline.Connector />
    </Timeline.Rail>
    <Timeline.Content>
      <Timeline.Title>...</Timeline.Title>
      <Timeline.Description>...</Timeline.Description>
    </Timeline.Content>
  </Timeline.Item>
</Timeline>
```

- **Timeline**: Root container. Manages size, density, and alignment context and renders items as a vertical, rail-on-left chronology.
- **Timeline.Item**: A single event row. Owns its marker `status` and optional `align`.
- **Timeline.Leading**: Optional left column, rendered to the left of the rail. Suited to timestamps or short metadata.
- **Timeline.Rail**: Relative wrapper for the marker and connector. Renders `Marker` and `Connector` by default when children are omitted; `Connector` is omitted on item index `0`.
- **Timeline.Marker**: Dot or circle for each item. Tone derives from the item `status`. Accepts icon children.
- **Timeline.Connector**: Static line bridging adjacent markers. Positioned via layout measurements so it spans variable-height items.
- **Timeline.Content**: Container for the item title, description, and any additional content.
- **Timeline.Title**: Title text for an item.
- **Timeline.Description**: Description text for an item.

## Usage

### Basic usage

Compose items with a `Rail` and a `Content` block. Omit `Rail` children to render the default marker and connector.

```tsx
<Timeline>
  <Timeline.Item status="success">
    <Timeline.Rail />
    <Timeline.Content>
      <Timeline.Title>Order placed</Timeline.Title>
      <Timeline.Description>We received your order.</Timeline.Description>
    </Timeline.Content>
  </Timeline.Item>
  <Timeline.Item status="current">
    <Timeline.Rail />
    <Timeline.Content>
      <Timeline.Title>Processing</Timeline.Title>
      <Timeline.Description>Preparing your items.</Timeline.Description>
    </Timeline.Content>
  </Timeline.Item>
</Timeline>
```

### Statuses

Set `status` per item to tint its marker. Each item owns its status independently.

```tsx
<Timeline>
  <Timeline.Item status="default">
    <Timeline.Rail />
    <Timeline.Content>
      <Timeline.Title>Created</Timeline.Title>
    </Timeline.Content>
  </Timeline.Item>
  <Timeline.Item status="warning">
    <Timeline.Rail />
    <Timeline.Content>
      <Timeline.Title>Guardrail tripped</Timeline.Title>
    </Timeline.Content>
  </Timeline.Item>
  <Timeline.Item status="success">
    <Timeline.Rail />
    <Timeline.Content>
      <Timeline.Title>Verified</Timeline.Title>
    </Timeline.Content>
  </Timeline.Item>
</Timeline>
```

### Leading column

Add `Timeline.Leading` to place timestamps or metadata to the left of the rail.

```tsx
<Timeline>
  <Timeline.Item align="center" status="default">
    <Timeline.Leading>
      <Text>09:12</Text>
    </Timeline.Leading>
    <Timeline.Rail />
    <Timeline.Content>
      <Timeline.Title>Feature flag created</Timeline.Title>
    </Timeline.Content>
  </Timeline.Item>
</Timeline>
```

### Custom marker

Pass icon children to `Timeline.Marker` and keep the default `Connector`.

```tsx
<Timeline.Item status="warning">
  <Timeline.Rail>
    <Timeline.Marker>
      <WarningIcon />
    </Timeline.Marker>
    <Timeline.Connector />
  </Timeline.Rail>
  <Timeline.Content>
    <Timeline.Title>Regional guardrail tripped</Timeline.Title>
  </Timeline.Content>
</Timeline.Item>
```

### Sizes and density

Use `size` to scale markers and text, and `density` to control vertical rhythm.

```tsx
<Timeline size="sm" density="compact">
  <Timeline.Item status="current">
    <Timeline.Rail />
    <Timeline.Content>
      <Timeline.Title>...</Timeline.Title>
    </Timeline.Content>
  </Timeline.Item>
</Timeline>
```

## Example

```tsx
import { Chip, useThemeColor } from 'heroui-native';
import { Timeline } from 'heroui-native-pro';
import { Text, View } from 'react-native';
import { BellIcon } from './icons/bell';
import { ShieldCheckIcon } from './icons/shield-check';
import { ShieldExclamationIcon } from './icons/shield-exclamation';

const EVENTS = [
  {
    title: 'Canary rollout started',
    description: 'Enabled for 5% of workspaces.',
    meta: 'Canary',
    metaColor: 'accent',
    status: 'current',
    time: '09:34',
    Icon: BellIcon,
  },
  {
    title: 'Regional guardrail tripped',
    description: 'Latency climbed in eu-central-1.',
    meta: 'Paused',
    metaColor: 'warning',
    status: 'warning',
    time: '09:51',
    Icon: ShieldExclamationIcon,
  },
  {
    title: 'Release checklist verified',
    description: 'Rollback owner and dashboard checks are recorded.',
    meta: 'Ready',
    metaColor: 'success',
    status: 'success',
    time: '10:42',
    Icon: ShieldCheckIcon,
  },
] as const;

export default function RolloutTimeline() {
  const [accent, warning, success] = useThemeColor(['accent', 'warning', 'success']);

  const iconColorByStatus = {
    current: accent,
    warning,
    success,
  } as const;

  return (
    <View className="flex-1 justify-center px-5">
      <Timeline density="compact" size="sm">
        {EVENTS.map((event) => {
          const Icon = event.Icon;

          return (
            <Timeline.Item key={event.title} align="center" status={event.status}>
              <Timeline.Leading className="w-11 items-end">
                <Text className="text-muted text-xs">{event.time}</Text>
              </Timeline.Leading>
              <Timeline.Rail>
                <Timeline.Marker>
                  <Icon size={12} color={iconColorByStatus[event.status]} />
                </Timeline.Marker>
                <Timeline.Connector />
              </Timeline.Rail>
              <Timeline.Content>
                <View className="flex-row flex-wrap items-center gap-2">
                  <Timeline.Title>{event.title}</Timeline.Title>
                  <Chip color={event.metaColor} size="sm" variant="soft">
                    {event.meta}
                  </Chip>
                </View>
                <Timeline.Description className="mt-1">{event.description}</Timeline.Description>
              </Timeline.Content>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </View>
  );
}
```

## API Reference

### Timeline

| prop           | type                    | default         | description                                        |
| -------------- | ----------------------- | --------------- | -------------------------------------------------- |
| `children`     | `React.ReactNode`       | -               | Item elements to render inside the timeline        |
| `size`         | `TimelineSize`          | `'md'`          | Visual size scale for markers and text             |
| `density`      | `TimelineDensity`       | `'comfortable'` | Vertical rhythm between items                      |
| `itemAlign`    | `TimelineItemAlign`     | `'start'`       | Default vertical alignment of item content         |
| `className`    | `string`                | -               | Additional CSS classes for the root container      |
| `animation`    | `TimelineRootAnimation` | -               | Root animation configuration (disable-all cascade) |
| `...ViewProps` | `ViewProps`             | -               | All standard React Native View props are supported |

#### TimelineSize

| value  | description       |
| ------ | ----------------- |
| `'sm'` | Compact size tier |
| `'md'` | Default size tier |
| `'lg'` | Large size tier   |

#### TimelineDensity

| value           | description             |
| --------------- | ----------------------- |
| `'compact'`     | Tighter vertical rhythm |
| `'comfortable'` | Default vertical rhythm |

#### TimelineItemAlign

| value      | description                         |
| ---------- | ----------------------------------- |
| `'start'`  | Align content to the top of the row |
| `'center'` | Center content against the marker   |

#### TimelineRootAnimation

| value           | description                                            |
| --------------- | ------------------------------------------------------ |
| `'disable-all'` | Disable all animations, including animated descendants |
| `undefined`     | Use default animations                                 |

### Timeline.Item

| prop           | type                | default     | description                                        |
| -------------- | ------------------- | ----------- | -------------------------------------------------- |
| `children`     | `React.ReactNode`   | -           | Item content (Leading, Rail, Content, etc.)        |
| `status`       | `TimelineStatus`    | `'default'` | Marker tone for this item                          |
| `align`        | `TimelineItemAlign` | inherited   | Vertical alignment of this item's content          |
| `className`    | `string`            | -           | Additional CSS classes for the item row            |
| `...ViewProps` | `ViewProps`         | -           | All standard React Native View props are supported |

#### TimelineStatus

| value       | description           |
| ----------- | --------------------- |
| `'default'` | Neutral marker        |
| `'muted'`   | Dimmed neutral marker |
| `'current'` | Accent-toned marker   |
| `'success'` | Success-toned marker  |
| `'warning'` | Warning-toned marker  |
| `'danger'`  | Danger-toned marker   |

### Timeline.Leading

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Left column content (e.g. timestamps)              |
| `className`    | `string`          | -       | Additional CSS classes for the leading container   |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Timeline.Rail

| prop           | type              | default | description                                                                            |
| -------------- | ----------------- | ------- | -------------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Custom rail content; when omitted, renders `Marker` and `Connector` (except on item 0) |
| `className`    | `string`          | -       | Additional CSS classes for the rail container                                          |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported                                     |

### Timeline.Marker

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Optional icon content inside the marker            |
| `className`    | `string`          | -       | Additional CSS classes for the marker              |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Timeline.Connector

| prop           | type        | default | description                                        |
| -------------- | ----------- | ------- | -------------------------------------------------- |
| `force`        | `boolean`   | `false` | Render the connector even on the first item        |
| `className`    | `string`    | -       | Additional CSS classes for the connector           |
| `...ViewProps` | `ViewProps` | -       | All standard React Native View props are supported |

### Timeline.Content

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Content to render (title, description, etc.)       |
| `className`    | `string`          | -       | Additional CSS classes for the content container   |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Timeline.Title

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Title text for the item                            |
| `className`    | `string`          | -       | Additional CSS classes for the title text          |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported |

### Timeline.Description

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Description text for the item                      |
| `className`    | `string`          | -       | Additional CSS classes for the description text    |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported |

## Hooks

### useTimeline

Hook to access the timeline root context. Must be used within a `Timeline` component.

```tsx
import { useTimeline } from 'heroui-native-pro';

const { size, density, itemAlign } = useTimeline();
```

#### Returns

| property             | type                                                          | description                                |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| `size`               | `TimelineSize`                                                | Current size tier propagated from the root |
| `density`            | `TimelineDensity`                                             | Current vertical rhythm                    |
| `itemAlign`          | `TimelineItemAlign`                                           | Default content alignment for items        |
| `measurements`       | `Record<number, ItemMeasurements>`                            | Per-item layout measurements               |
| `setItemMeasurement` | `(index: number, partial: Partial<ItemMeasurements>) => void` | Updates layout measurements for an item    |

### useTimelineItem

Hook to access the per-item context. Must be used within a `Timeline.Item` component.

```tsx
import { useTimelineItem } from 'heroui-native-pro';

const { index, isLast, status, align } = useTimelineItem();
```

#### Returns

| property | type                | description                         |
| -------- | ------------------- | ----------------------------------- |
| `index`  | `number`            | Zero-based index of the item        |
| `isLast` | `boolean`           | Whether this is the last item       |
| `status` | `TimelineStatus`    | Marker tone for the item            |
| `align`  | `TimelineItemAlign` | Resolved vertical content alignment |
