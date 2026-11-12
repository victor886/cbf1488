# Agenda

A full calendar surface for mobile: a collapsible month calendar on top of a horizontally paged day / week / month body with draggable, resizable events.

> `Agenda` uses [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) for all date values (`CalendarDate` for days, `CalendarDateTime` for event start/end). Event drag-and-drop requires the optional peer dependency [`react-native-reanimated-dnd`](https://reanimated-dnd-docs.vercel.app); without it, events render but cannot be moved or resized.

## Import

```tsx
import { Agenda, useAgenda } from 'heroui-native-pro';
```

## Anatomy

State is built by the `useAgenda(options)` hook and spread into the root:

```tsx
const agenda = useAgenda({
  events,
  defaultView: 'week',
});

<Agenda {...agenda}>
  <Agenda.Header>
    <Agenda.Calendar>
      <Agenda.CalendarHeader>
        <Calendar.YearPickerTrigger>
          <Calendar.YearPickerTriggerHeading />
          <Calendar.YearPickerTriggerIndicator />
        </Calendar.YearPickerTrigger>
        <Calendar.NavButton slot="previous" />
        <Agenda.TodayButton />
        <Calendar.NavButton slot="next" />
      </Agenda.CalendarHeader>
      <Agenda.CalendarGrid>{(date) => <Calendar.Cell date={date} />}</Agenda.CalendarGrid>
      <Calendar.YearPickerGrid>
        <Calendar.YearPickerGridBody>
          {({ year, isSelected }) => (
            <Calendar.YearPickerCell year={year} isSelected={isSelected} />
          )}
        </Calendar.YearPickerGridBody>
      </Calendar.YearPickerGrid>
    </Agenda.Calendar>
  </Agenda.Header>
  <Agenda.DragArea>
    <Agenda.DragHandle />
  </Agenda.DragArea>
  <Agenda.Body>
    <Agenda.WeekHeader />
    <Agenda.AllDaySection />
    <Agenda.TimeGrid>
      <Agenda.DayColumns>
        <Agenda.Event>
          <Agenda.EventTitle />
          <Agenda.EventTime />
        </Agenda.Event>
      </Agenda.DayColumns>
      <Agenda.CurrentTimeIndicator />
    </Agenda.TimeGrid>
    <Agenda.MonthGrid />
  </Agenda.Body>
  <Agenda.ViewSelector options={['day', 'week', 'month']} />
</Agenda>;
```

Every level has a default: a childless `<Agenda {...agenda} />` renders the full composition above; a childless `Agenda.Body` renders the whole default page template; a childless `Agenda.TimeGrid` renders the day columns and the current time indicator; a childless `Agenda.DayColumns` renders default `Agenda.Event` cards; a childless `Agenda.Calendar` renders the prewired calendar.

- **Agenda**: Root container. Receives the `useAgenda(options)` state as spread props and wraps everything in a `SplitView` whose snap points derive from the measured header content (collapsed week row / fully expanded calendar).
- **Agenda.Background**: Absolute-fill background container behind the agenda shell. With no children, the active library theme decides the content (the glass theme renders a frosted blur layer); other themes render nothing. Replace or remove it via the `background` prop on the root.
- **Agenda.Header**: Top SplitView pane. Measures its natural content height, so anything placed under the calendar automatically expands the snap points.
- **Agenda.Calendar**: Month calendar (with year picker) bound to the agenda date. Collapses to the week row containing the selected date at the minimum snap point. Children compose the calendar anatomy from raw `Calendar.*` parts plus the two Agenda-measured wrappers below.
- **Agenda.CalendarHeader**: Measured wrapper around `Calendar.Header`; children compose the header content (year picker trigger, nav buttons, Today button).
- **Agenda.CalendarGrid**: Measured, collapse-animated month grid wrapping `Calendar.Grid`. Optional render-function children customize day cells via `Calendar.GridBody`'s own API; the default cell shows an event-coverage indicator.
- **Agenda.Heading**: Localized month + year title for the active date.
- **Agenda.TodayButton**: Compact outline button that jumps to today and collapses the header.
- **Agenda.NavButton**: Previous / next agenda navigation (`slot="previous" | "next"`); steps a day, week, or month depending on the current view and collapses the header.
- **Agenda.DragArea** / **Agenda.DragHandle**: SplitView drag region and pill between the header and the body.
- **Agenda.Body**: Horizontally paged day / week / month area inside the bottom SplitView pane, kept in sync with the calendar. Children act as the page template, rendered once per pager page under the page context; all collection parts self-gate by the page's view, so one template covers every view.
- **Agenda.WeekHeader**: Weekday letters row above the time grid on week pages (`showDates` switches to full names + tappable date pills).
- **Agenda.AllDaySection**: Packed all-day bars above the time grid. Children act as the per-event template (event available via `useAgendaEvent()`).
- **Agenda.TimeGrid**: Vertically scrollable hour grid with the time gutter, hour lines, and drag drop-guides. Scroll offset is synchronized across pages. Children compose the grid content.
- **Agenda.DayColumns**: One column per page day. Children act as the per-event template; the default is `Agenda.Event`.
- **Agenda.Event**: The positioned, draggable, resizable event card. Reads the event from the template context (or an explicit `event` prop). Children customize the card content; the default renders the color tint, accent bar, title, and time.
- **Agenda.EventTitle** / **Agenda.EventTime**: Text parts bound to the template context event.
- **Agenda.CurrentTimeIndicator**: Live time badge + line + notch, rendered only on day/week pages containing today.
- **Agenda.MonthGrid**: Six week rows with multi-day spanning bars and per-cell event chips (`maxEventsPerCell`, `moreLabel`). Children act as the per-event chip content template.
- **Agenda.ViewSelector**: Floating day / week / month selector built on `Segment`, absolutely positioned at the bottom-center by default. Exposes `Group` / `Indicator` / `Item` / `Label` / `Separator` for custom compositions.

## Usage

### Basic Usage

The only required option is `events`. The Agenda never mutates the array — apply move/resize intents back into your state. Event start/end values are `CalendarDateTime` objects from `@internationalized/date`.

```tsx
import type { CalendarDateTime } from '@internationalized/date';
import { Agenda, useAgenda, type AgendaEvent } from 'heroui-native-pro';

const [events, setEvents] = useState<AgendaEvent[]>(initialEvents);

const applyChange = (id: string, start: CalendarDateTime, end: CalendarDateTime) => {
  setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, start, end } : event)));
};

const agenda = useAgenda({
  events,
  onEventMove: applyChange,
  onEventResize: applyChange,
});

<Agenda {...agenda} />;
```

The hook return is also your window into the agenda from outside the component tree: read `agenda.heading`, `agenda.selectedEventId`, or `agenda.visibleDays`, and drive it with `agenda.setView`, `agenda.setDate`, or `agenda.goToToday` from any surrounding UI.

### Event Model

Events are plain objects built with `@internationalized/date` helpers. `color` tints the event chip, all-day events render as bars (day/week) or spanning month rows, read-only events cannot be moved or resized, and `"unconfirmed"` renders a dashed border. Dates follow the half-open `[start, end)` convention: an event ending at midnight does not cover the following day, so a one-day all-day event spans from midnight to the next day's midnight.

```tsx
import { getLocalTimeZone, Time, toCalendarDateTime, today } from '@internationalized/date';
import type { AgendaEvent } from 'heroui-native-pro';

const event: AgendaEvent = {
  id: 'standup',
  title: 'Daily standup',
  start: toCalendarDateTime(today(getLocalTimeZone()), new Time(10, 30)),
  end: toCalendarDateTime(today(getLocalTimeZone()), new Time(11, 0)),
  color: '#3b82f6',
  isAllDay: false,
  isReadOnly: false,
  status: 'confirmed',
};
```

### Controlled View and Date

Control the view mode and active date externally with `view` / `onViewChange` and `date` / `onDateChange`. The active date is a `CalendarDate` from `@internationalized/date`.

```tsx
import { getLocalTimeZone, today } from '@internationalized/date';
import { useAgenda, type AgendaView } from 'heroui-native-pro';

const [view, setView] = useState<AgendaView>('week');
const [date, setDate] = useState(today(getLocalTimeZone()));

const agenda = useAgenda({
  events,
  view,
  onViewChange: setView,
  date,
  onDateChange: setDate,
});
```

### Event Press

By default, pressing an event toggles the internal selection (`selectedEventId` / `onEventSelect`). Provide `onEventPress` to replace the toggle with an app-level action such as opening a details screen.

```tsx
const agenda = useAgenda({
  events,
  onEventPress: (event) => router.push(`/events/${event.id}`),
});
```

### Custom Event Templates

Collection parts render their own data; their children act as a per-item template rendered with the event available through context. For fully bespoke items, read the event inside your own component with `useAgendaEvent()`.

```tsx
<Agenda.Body>
  <Agenda.WeekHeader />
  <Agenda.AllDaySection>
    <Agenda.EventTitle className="text-[11px]" />
  </Agenda.AllDaySection>
  <Agenda.TimeGrid>
    <Agenda.DayColumns>
      <Agenda.Event className="bg-surface-secondary border-l-accent border-l-2">
        <View className="flex-1">
          <Agenda.EventTitle />
          <Agenda.EventTime className="text-accent" />
        </View>
      </Agenda.Event>
    </Agenda.DayColumns>
    <Agenda.CurrentTimeIndicator />
  </Agenda.TimeGrid>
  <Agenda.MonthGrid />
</Agenda.Body>
```

### Custom Calendar Composition

`Agenda.Calendar` composes like `DatePicker.Calendar`: children are raw `Calendar.*` parts, with `Agenda.CalendarHeader` and `Agenda.CalendarGrid` carrying the measurement / collapse machinery.

```tsx
<Agenda.Calendar>
  <Agenda.CalendarHeader>
    <Calendar.YearPickerTrigger>
      <Calendar.YearPickerTriggerHeading />
      <Calendar.YearPickerTriggerIndicator />
    </Calendar.YearPickerTrigger>
    <View className="flex-row items-center gap-0.5">
      <Calendar.NavButton slot="previous" />
      <Agenda.TodayButton />
      <Calendar.NavButton slot="next" />
    </View>
  </Agenda.CalendarHeader>
  <Agenda.CalendarGrid>{(date) => <Calendar.Cell date={date} />}</Agenda.CalendarGrid>
  <Calendar.YearPickerGrid>
    <Calendar.YearPickerGridBody>
      {({ year, isSelected }) => <Calendar.YearPickerCell year={year} isSelected={isSelected} />}
    </Calendar.YearPickerGridBody>
  </Calendar.YearPickerGrid>
</Agenda.Calendar>
```

### Header Content Below the Calendar

`Agenda.Header` measures its content, so extra content expands the snap points dynamically.

```tsx
<Agenda.Header>
  <Agenda.Calendar />
  <UpNextCard />
</Agenda.Header>
```

### Time Grid Configuration

Configure the rendered hour range, slot geometry, week start, and locale through the hook options. `startHour` is inclusive, `endHour` is exclusive.

```tsx
const agenda = useAgenda({
  events,
  startHour: 6,
  endHour: 22,
  slotHeight: 80,
  slotDuration: 60,
  firstDayOfWeek: 'mon',
  locale: 'en-GB',
});
```

### Fade Gradients

Two gradient overlays soften scrolling edges: the time grid's top fade (content scrolling under the grid's top edge) and the body's bottom fade (above the floating view selector). Each owner exposes three props — visibility, color, and height. Hide them with `showBottomFade={false}` (body) / `showTopFade={false}` (time grid). The colors default to the theme surface color, matching the body background.

```tsx
<Agenda.Body className="bg-green-400" bottomFadeColor="#4ade80" bottomFadeHeight={80}>
  <Agenda.TimeGrid topFadeColor="#4ade80" topFadeHeight={48}>
    <Agenda.DayColumns />
  </Agenda.TimeGrid>
</Agenda.Body>
```

## Example

```tsx
import {
  getLocalTimeZone,
  Time,
  toCalendarDateTime,
  today,
  type CalendarDate,
  type CalendarDateTime,
} from '@internationalized/date';
import { Agenda, useAgenda, type AgendaEvent } from 'heroui-native-pro';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

const TIME_ZONE = getLocalTimeZone();

const at = (day: CalendarDate, hour: number, minute = 0): CalendarDateTime =>
  toCalendarDateTime(day, new Time(hour, minute));

const buildEvents = (): AgendaEvent[] => {
  const base = today(TIME_ZONE);

  return [
    {
      id: 'standup',
      title: 'Daily standup',
      start: at(base, 10, 30),
      end: at(base, 11, 30),
      color: '#3b82f6',
    },
    {
      id: 'interview',
      title: 'Interview: RN engineer',
      start: at(base, 10, 0),
      end: at(base, 12, 0),
      color: '#f59e0b',
    },
    {
      id: 'locked',
      title: 'All-hands (read-only)',
      start: at(base, 8, 0),
      end: at(base, 9, 0),
      isReadOnly: true,
      status: 'unconfirmed',
      color: '#f43f5e',
    },
    {
      id: 'conference',
      title: 'AppJS Conference',
      start: at(base, 0, 0),
      end: at(base.add({ days: 2 }), 0, 0),
      isAllDay: true,
      color: '#8b5cf6',
    },
  ];
};

export default function AgendaExample() {
  const [events, setEvents] = useState<AgendaEvent[]>(buildEvents);

  const applyEventChange = useCallback(
    (id: string, start: CalendarDateTime, end: CalendarDateTime) => {
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? { ...event, start, end } : event))
      );
    },
    []
  );

  const agenda = useAgenda({
    events,
    onEventMove: applyEventChange,
    onEventResize: applyEventChange,
  });

  return (
    <View className="pb-safe-offset-2 flex-1 px-4">
      <Agenda {...agenda}>
        <Agenda.Header>
          <Agenda.Calendar />
        </Agenda.Header>
        <Agenda.DragArea>
          <Agenda.DragHandle />
        </Agenda.DragArea>
        <Agenda.Body />
        <Agenda.ViewSelector />
      </Agenda>
    </View>
  );
}
```

## API Reference

### Agenda

The root also accepts every property of `UseAgendaReturn` — spread the `useAgenda(options)` result into it: `<Agenda {...agenda}>`.

| prop                   | type                                               | default  | description                                                                                                                    |
| ---------------------- | -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `children`             | `React.ReactNode`                                  | -        | Compound children; when omitted, renders the default composition (Header + Calendar, DragArea, Body, ViewSelector)             |
| `snapPoints`           | `readonly number[]`                                | measured | SplitView snap points; derived from the measured header content when omitted (collapsed week row / expanded)                   |
| `minHeight`            | `number`                                           | measured | Minimum top section height, forwarded to `SplitView`                                                                           |
| `maxHeight`            | `number`                                           | measured | Maximum top section height, forwarded to `SplitView`                                                                           |
| `snapIndex`            | `number`                                           | -        | Controlled snap index                                                                                                          |
| `defaultSnapIndex`     | `number`                                           | `0`      | Default snap index for uncontrolled usage; `0` shows the collapsed week row, `1` the full calendar                             |
| `skipInitialAnimation` | `boolean`                                          | `true`   | Applies the first snap instantly instead of animating the divider into place on mount                                          |
| `className`            | `string`                                           | -        | Additional CSS classes for the root container                                                                                  |
| `onSnapIndexChange`    | `(index: number) => void`                          | -        | Called when the snap index changes                                                                                             |
| `onSnap`               | `(snapIndex: number, topHeightPx: number) => void` | -        | Called after a snap completes with the resolved index and top height in px                                                     |
| `animation`            | `AgendaRootAnimation`                              | -        | Root animation configuration, forwarded to the underlying `SplitView`                                                          |
| `background`           | `React.ReactNode`                                  | -        | Background layer behind the agenda shell; theme-aware `Agenda.Background` by default, custom node to replace, `null` to remove |
| `...UseAgendaReturn`   | `UseAgendaReturn`                                  | -        | Agenda state built by `useAgenda(options)` (see Hooks)                                                                         |
| `...ViewProps`         | `ViewProps`                                        | -        | All standard React Native View props are supported                                                                             |

#### AgendaRootAnimation

Alias of `SplitViewRootAnimation`. Can be:

- `false` or `"disabled"`: Disable only root animations
- `"disable-all"`: Disable all animations including children
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop               | type               | default                                                                                                                           | description                                                              |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `snapSpringConfig` | `WithSpringConfig` | `{ damping: 25, stiffness: 300, mass: 0.8, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 }` | Spring used when snapping the top section after drag release or `snapTo` |

### Agenda.Background

Absolute-fill container behind the agenda shell. With no children, the active library theme decides the default content (the glass theme renders a frosted blur layer with a `surface-secondary`-matched fallback); other themes render nothing.

| prop           | type              | default | description                                                               |
| -------------- | ----------------- | ------- | ------------------------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Custom background content (gradients, images); replaces the theme default |
| `className`    | `string`          | -       | Additional CSS classes for the background container                       |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported                        |

### Agenda.Header

| prop           | type              | default | description                                                                                                    |
| -------------- | ----------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Header content (Agenda.Calendar, custom content)                                                               |
| `className`    | `string`          | -       | Additional CSS classes for the header wrapper. `height` is driven by the SplitView animation and cannot be set |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported                                                             |

### Agenda.Calendar

| prop           | type              | default | description                                                                                                             |
| -------------- | ----------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Calendar anatomy; defaults to `CalendarHeader` + `CalendarGrid` + year picker overlay                                   |
| `className`    | `string`          | -       | Additional CSS classes for the calendar wrapper. The grid body's `transform` (translateY) is animated and cannot be set |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported                                                                      |

### Agenda.CalendarHeader

| prop           | type              | default | description                                                                                |
| -------------- | ----------------- | ------- | ------------------------------------------------------------------------------------------ |
| `children`     | `React.ReactNode` | -       | Header content; defaults to a year-picker trigger with month navigation and a Today button |
| `className`    | `string`          | -       | Additional CSS classes for the measured header wrapper                                     |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported                                         |

### Agenda.CalendarGrid

Day cells are `Calendar.Cell` parts, so they expose the Calendar cell data attributes (`data-today`, `data-selected`, `data-outside-month`, ...) — see the Calendar documentation.

| prop           | type                                   | default | description                                                                                                        |
| -------------- | -------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `children`     | `(date: CalendarDate) => ReactElement` | -       | Day cell renderer matching `Calendar.GridBody`'s API; defaults to `Calendar.Cell` with an event-coverage indicator |
| `className`    | `string`                               | -       | Additional CSS classes for the grid container                                                                      |
| `...ViewProps` | `ViewProps`                            | -       | All standard React Native View props are supported                                                                 |

### Agenda.Heading

| prop           | type              | default | description                                                                       |
| -------------- | ----------------- | ------- | --------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Custom heading content; defaults to the localized month + year of the active date |
| `className`    | `string`          | -       | Additional CSS classes for the heading text                                       |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported                                |

### Agenda.TodayButton

| prop        | type              | default | description                                        |
| ----------- | ----------------- | ------- | -------------------------------------------------- |
| `children`  | `React.ReactNode` | -       | Custom button content; defaults to a "Today" label |
| `className` | `string`          | -       | Additional CSS classes for the button              |

### Agenda.NavButton

| prop                | type                   | default | description                                             |
| ------------------- | ---------------------- | ------- | ------------------------------------------------------- |
| `slot`              | `'previous' \| 'next'` | -       | Navigation direction (required)                         |
| `children`          | `React.ReactNode`      | -       | Custom icon/content; defaults to a chevron              |
| `className`         | `string`               | -       | Additional CSS classes for the pressable                |
| `...PressableProps` | `PressableProps`       | -       | All standard React Native Pressable props are supported |

### Agenda.DragArea

Passthrough of `SplitView.DragArea`.

| prop                        | type                     | default | description                                  |
| --------------------------- | ------------------------ | ------- | -------------------------------------------- |
| `...SplitViewDragAreaProps` | `SplitViewDragAreaProps` | -       | All `SplitView.DragArea` props are supported |

### Agenda.DragHandle

Passthrough of `SplitView.DragHandle`.

| prop                          | type                       | default | description                                    |
| ----------------------------- | -------------------------- | ------- | ---------------------------------------------- |
| `...SplitViewDragHandleProps` | `SplitViewDragHandleProps` | -       | All `SplitView.DragHandle` props are supported |

### Agenda.Body

| prop               | type              | default             | description                                                                                                  |
| ------------------ | ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `children`         | `React.ReactNode` | -                   | Page template rendered per pager page; defaults to `WeekHeader` + `AllDaySection` + `TimeGrid` + `MonthGrid` |
| `showBottomFade`   | `boolean`         | `true`              | Whether the bottom fade gradient (above the floating view selector) is rendered                              |
| `bottomFadeColor`  | `string`          | theme surface color | Color the bottom fade dissolves from                                                                         |
| `bottomFadeHeight` | `number`          | `64`                | Height in px of the bottom fade                                                                              |
| `className`        | `string`          | -                   | Additional CSS classes for the body container                                                                |
| `...ViewProps`     | `ViewProps`       | -                   | All standard React Native View props are supported                                                           |

### Agenda.WeekHeader

Renders only on multi-day (week) pages.

| prop           | type                                  | default | description                                                                     |
| -------------- | ------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| `showDates`    | `boolean`                             | `false` | Renders full weekday names with tappable date pills instead of slim day letters |
| `className`    | `string`                              | -       | Additional CSS classes for the week header container                            |
| `classNames`   | `ElementSlots<AgendaWeekHeaderSlots>` | -       | Additional CSS classes for individual slots                                     |
| `styles`       | `object`                              | -       | Additional native styles for individual slots                                   |
| `...ViewProps` | `ViewProps`                           | -       | All standard React Native View props are supported                              |

#### ElementSlots\<AgendaWeekHeaderSlots\>

| slot        | description                           |
| ----------- | ------------------------------------- |
| `container` | Week header row container             |
| `cell`      | One weekday cell                      |
| `day`       | Weekday letter / name text            |
| `date`      | Tappable date pill (with `showDates`) |

#### styles

| slot        | type        | description                         |
| ----------- | ----------- | ----------------------------------- |
| `container` | `ViewStyle` | Style for the week header container |
| `cell`      | `ViewStyle` | Style for one weekday cell          |
| `day`       | `TextStyle` | Style for the weekday text          |
| `date`      | `TextStyle` | Style for the date pill text        |

#### Data Attributes

Set on the `day` and `date` slots; target them with `data-[...]` Tailwind variants via `classNames` (e.g. `classNames={{ date: 'data-[today=true]:bg-danger' }}`).

| attribute       | values    | description                                                                       |
| --------------- | --------- | --------------------------------------------------------------------------------- |
| `data-today`    | `boolean` | Whether the column's date is today (`day` and `date` slots)                       |
| `data-selected` | `boolean` | Whether the column's date is the selected agenda date and not today (`date` slot) |

### Agenda.AllDaySection

Renders only on day/week pages with at least one all-day event.

| prop           | type                                     | default | description                                                                         |
| -------------- | ---------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode`                        | -       | Per-event content template (event via `useAgendaEvent()`); defaults to tint + title |
| `className`    | `string`                                 | -       | Additional CSS classes for the section container                                    |
| `classNames`   | `ElementSlots<AgendaAllDaySectionSlots>` | -       | Additional CSS classes for individual slots                                         |
| `styles`       | `object`                                 | -       | Additional native styles for individual slots                                       |
| `...ViewProps` | `ViewProps`                              | -       | All standard React Native View props are supported                                  |

#### ElementSlots\<AgendaAllDaySectionSlots\>

| slot         | description                                 |
| ------------ | ------------------------------------------- |
| `container`  | All-day section container                   |
| `event`      | One packed all-day event bar                |
| `eventTitle` | Title text inside the default bar content   |
| `tint`       | Absolute-fill color tint behind the content |

#### styles

| slot         | type        | description                      |
| ------------ | ----------- | -------------------------------- |
| `container`  | `ViewStyle` | Style for the section container  |
| `event`      | `ViewStyle` | Style for one all-day event bar  |
| `eventTitle` | `TextStyle` | Style for the default title text |

### Agenda.TimeGrid

Renders only on day/week pages. The top fade is customized via the `showTopFade` / `topFadeColor` / `topFadeHeight` props instead of a slot.

| prop            | type                                                    | default             | description                                                              |
| --------------- | ------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------ |
| `children`      | `React.ReactNode`                                       | -                   | Grid content; defaults to the current-time indicator and the day columns |
| `showTopFade`   | `boolean`                                               | `true`              | Whether the top fade gradient is rendered                                |
| `topFadeColor`  | `string`                                                | theme surface color | Color the top fade dissolves from                                        |
| `topFadeHeight` | `number`                                                | `36`                | Height in px of the top fade                                             |
| `className`     | `string`                                                | -                   | Additional CSS classes for the grid viewport wrapper                     |
| `classNames`    | `ElementSlots<Exclude<AgendaTimeGridSlots, 'topFade'>>` | -                   | Additional CSS classes for individual slots                              |
| `styles`        | `object`                                                | -                   | Additional native styles for individual slots                            |
| `...ViewProps`  | `ViewProps`                                             | -                   | All standard React Native View props are supported                       |

#### ElementSlots\<AgendaTimeGridSlots\>

| slot                | description                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `container`         | Grid viewport wrapper                                                                                               |
| `scroll`            | Vertical scroll view                                                                                                |
| `content`           | Scrollable content container                                                                                        |
| `gutterLabel`       | Hour label in the left time gutter                                                                                  |
| `hourLine`          | Horizontal hour line                                                                                                |
| `dragGuide`         | Drop guide row shown while dragging/resizing. `opacity` and `transform` (translateY) are animated and cannot be set |
| `dragGuideLine`     | Drop guide leading line container                                                                                   |
| `dragGuideLineDash` | Dashed border of the drop guide line                                                                                |
| `dragGuideLabel`    | Snapped time label on the rail                                                                                      |

#### styles

| slot                | type        | description                             |
| ------------------- | ----------- | --------------------------------------- |
| `container`         | `ViewStyle` | Style for the grid viewport wrapper     |
| `scroll`            | `ViewStyle` | Style for the vertical scroll view      |
| `content`           | `ViewStyle` | Style for the scrollable content        |
| `gutterLabel`       | `TextStyle` | Style for the hour gutter labels        |
| `hourLine`          | `ViewStyle` | Style for the hour lines                |
| `dragGuide`         | `ViewStyle` | Style for the drop guide row            |
| `dragGuideLine`     | `ViewStyle` | Style for the drop guide line container |
| `dragGuideLineDash` | `ViewStyle` | Style for the dashed guide border       |
| `dragGuideLabel`    | `TextStyle` | Style for the rail time label           |

### Agenda.DayColumns

| prop           | type                                                | default | description                                          |
| -------------- | --------------------------------------------------- | ------- | ---------------------------------------------------- |
| `children`     | `React.ReactNode`                                   | -       | Per-event template; defaults to `Agenda.Event`       |
| `className`    | `string`                                            | -       | Additional CSS classes for the columns row container |
| `classNames`   | `ElementSlots<AgendaDayColumnsSlots>`               | -       | Additional CSS classes for individual slots          |
| `styles`       | `Partial<Record<AgendaDayColumnsSlots, ViewStyle>>` | -       | Additional native styles for individual slots        |
| `...ViewProps` | `ViewProps`                                         | -       | All standard React Native View props are supported   |

#### ElementSlots\<AgendaDayColumnsSlots\>

| slot          | description                       |
| ------------- | --------------------------------- |
| `container`   | Columns row container             |
| `column`      | One day column                    |
| `eventsLayer` | Absolute-fill fading events layer |

### Agenda.Event

| prop                    | type                             | default | description                                                                                                    |
| ----------------------- | -------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `event`                 | `AgendaEvent`                    | -       | The event to render; defaults to the template context event (`useAgendaEvent`)                                 |
| `children`              | `React.ReactNode`                | -       | Card content; defaults to color tint + accent bar + title + time                                               |
| `isAnimatedStyleActive` | `boolean`                        | `true`  | When `false`, the decorative scale style is not applied (functional drag/resize styles stay active)            |
| `className`             | `string`                         | -       | Additional CSS classes for the card container. `transform` (scale) and `height` are animated and cannot be set |
| `classNames`            | `ElementSlots<AgendaEventSlots>` | -       | Additional CSS classes for individual slots                                                                    |
| `styles`                | `object`                         | -       | Additional native styles for individual slots                                                                  |
| `animation`             | `AgendaEventAnimation`           | -       | Press / drag scale animation for the card                                                                      |
| `...ViewProps`          | `ViewProps`                      | -       | All standard React Native View props are supported                                                             |

#### ElementSlots\<AgendaEventSlots\>

| slot            | description                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `container`     | Positioned card container                                                                                         |
| `content`       | Inner content wrapper                                                                                             |
| `tint`          | Color tint overlay derived from `event.color`                                                                     |
| `accentBar`     | Left accent bar                                                                                                   |
| `title`         | Title text of the default content                                                                                 |
| `time`          | Time text of the default content                                                                                  |
| `resizeHandle`  | Invisible resize hit area at the bottom of the card                                                               |
| `resizeGrabber` | Visible resize grabber pill. `transform` (scale) is animated while the resize gesture is active and cannot be set |

#### styles

| slot            | type        | description                      |
| --------------- | ----------- | -------------------------------- |
| `container`     | `ViewStyle` | Style for the card container     |
| `content`       | `ViewStyle` | Style for the content wrapper    |
| `tint`          | `ViewStyle` | Style for the color tint overlay |
| `accentBar`     | `ViewStyle` | Style for the accent bar         |
| `title`         | `TextStyle` | Style for the title text         |
| `time`          | `TextStyle` | Style for the time text          |
| `resizeHandle`  | `ViewStyle` | Style for the resize hit area    |
| `resizeGrabber` | `ViewStyle` | Style for the resize grabber     |

#### Data Attributes

Set on the `container` and `resizeGrabber` slots. The default styles use them for the selected accent border (`data-[selected=true]:border-accent`), the unconfirmed dashed border (`data-[unconfirmed=true]:border-dashed`), and the selected grabber fill (`data-[selected=true]:bg-accent`).

| attribute          | values    | description                                                           |
| ------------------ | --------- | --------------------------------------------------------------------- |
| `data-selected`    | `boolean` | Whether the event is selected (`container` and `resizeGrabber` slots) |
| `data-unconfirmed` | `boolean` | Whether the event's `status` is `'unconfirmed'` (`container` slot)    |

#### AgendaEventAnimation

Animation configuration for the press / drag scale feedback. Can be:

- `false` or `"disabled"`: Disable the scale animation
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop    | type                                                            | default                                                 | description                                                    |
| ------- | --------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| `scale` | `{ value?: [number, number]; timingConfig?: WithTimingConfig }` | `{ value: [1, 0.97], timingConfig: { duration: 120 } }` | Scale values `[rest, active]` applied while pressed or dragged |

### Agenda.EventTitle

| prop           | type              | default | description                                           |
| -------------- | ----------------- | ------- | ----------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Custom title content; defaults to the event's `title` |
| `className`    | `string`          | -       | Additional CSS classes for the title text             |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported    |

### Agenda.EventTime

| prop           | type              | default | description                                                                       |
| -------------- | ----------------- | ------- | --------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Custom time content; defaults to the localized `start – end` range (or "All day") |
| `className`    | `string`          | -       | Additional CSS classes for the time text                                          |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported                                |

### Agenda.CurrentTimeIndicator

Renders only on day/week pages containing today.

| prop           | type                                            | default | description                                        |
| -------------- | ----------------------------------------------- | ------- | -------------------------------------------------- |
| `className`    | `string`                                        | -       | Additional CSS classes for the indicator container |
| `classNames`   | `ElementSlots<AgendaCurrentTimeIndicatorSlots>` | -       | Additional CSS classes for individual slots        |
| `styles`       | `object`                                        | -       | Additional native styles for individual slots      |
| `...ViewProps` | `ViewProps`                                     | -       | All standard React Native View props are supported |

#### ElementSlots\<AgendaCurrentTimeIndicatorSlots\>

| slot        | description                       |
| ----------- | --------------------------------- |
| `container` | Indicator row container           |
| `gutter`    | Time gutter area of the indicator |
| `badge`     | Live time badge                   |
| `line`      | Horizontal line                   |
| `dot`       | Notch at the line start           |
| `label`     | Time text inside the badge        |

#### styles

| slot        | type        | description                 |
| ----------- | ----------- | --------------------------- |
| `container` | `ViewStyle` | Style for the row container |
| `gutter`    | `ViewStyle` | Style for the gutter area   |
| `badge`     | `ViewStyle` | Style for the time badge    |
| `line`      | `ViewStyle` | Style for the line          |
| `dot`       | `ViewStyle` | Style for the notch         |
| `label`     | `TextStyle` | Style for the badge text    |

### Agenda.MonthGrid

Renders only on month pages.

| prop               | type                                 | default                      | description                                                                              |
| ------------------ | ------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------- |
| `children`         | `React.ReactNode`                    | -                            | Per-event chip content template (event via `useAgendaEvent()`); defaults to tint + title |
| `maxEventsPerCell` | `number`                             | `2`                          | Maximum event chips per cell before the overflow label                                   |
| `moreLabel`        | `(count: number) => string`          | `` (count) => `+${count}` `` | Custom overflow label; pressing it opens the day view for that date                      |
| `className`        | `string`                             | -                            | Additional CSS classes for the month grid container                                      |
| `classNames`       | `ElementSlots<AgendaMonthGridSlots>` | -                            | Additional CSS classes for individual slots                                              |
| `styles`           | `object`                             | -                            | Additional native styles for individual slots                                            |
| `...ViewProps`     | `ViewProps`                          | -                            | All standard React Native View props are supported                                       |

#### ElementSlots\<AgendaMonthGridSlots\>

| slot                 | description                          |
| -------------------- | ------------------------------------ |
| `container`          | Month grid container                 |
| `weekdayRow`         | Weekday labels row                   |
| `weekdayLabel`       | One weekday label                    |
| `row`                | One week row                         |
| `spanningLayer`      | Absolute layer hosting spanning bars |
| `spanningEvent`      | One multi-day spanning bar           |
| `spanningEventTitle` | Title text inside a spanning bar     |
| `cell`               | One day cell                         |
| `cellDate`           | Date pill of a cell                  |
| `cellEvents`         | Event chip stack of a cell           |
| `cellEvent`          | One event chip                       |
| `cellEventTitle`     | Title text inside an event chip      |
| `cellMore`           | Overflow ("+N") label                |

#### styles

| slot                 | type        | description                        |
| -------------------- | ----------- | ---------------------------------- |
| `container`          | `ViewStyle` | Style for the month grid container |
| `weekdayRow`         | `ViewStyle` | Style for the weekday row          |
| `weekdayLabel`       | `TextStyle` | Style for one weekday label        |
| `row`                | `ViewStyle` | Style for one week row             |
| `spanningEvent`      | `ViewStyle` | Style for a spanning bar           |
| `spanningEventTitle` | `TextStyle` | Style for a spanning bar title     |
| `cell`               | `ViewStyle` | Style for one day cell             |
| `cellDate`           | `TextStyle` | Style for the date pill            |
| `cellEvents`         | `ViewStyle` | Style for the chip stack           |
| `cellEvent`          | `ViewStyle` | Style for one event chip           |
| `cellEventTitle`     | `TextStyle` | Style for a chip title             |
| `cellMore`           | `TextStyle` | Style for the overflow label       |

#### Data Attributes

Set on the `cellDate` slot. The default styles use them for the today pill (`data-[today=true]:bg-accent`), the selected pill (`data-[selected=true]:bg-accent-soft`), and the muted outside-month dates (`data-[outside-month=true]:text-muted`).

| attribute            | values    | description                                         |
| -------------------- | --------- | --------------------------------------------------- |
| `data-today`         | `boolean` | Whether the cell's date is today                    |
| `data-selected`      | `boolean` | Whether the cell's date is the selected agenda date |
| `data-outside-month` | `boolean` | Whether the cell's date is outside the page's month |

### Agenda.ViewSelector

Extends the `Segment` API except the selection value, which is bound to the agenda view. Exposes `Agenda.ViewSelector.Group` / `.Indicator` / `.Item` / `.Label` / `.Separator` for custom compositions (item values must be `AgendaView` strings); `Segment.ScrollView` is intentionally not exposed.

| prop                  | type                                  | default                                        | description                                                                                         |
| --------------------- | ------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `children`            | `React.ReactNode`                     | -                                              | Custom `Segment` composition; defaults to a `Group` with an `Indicator` and one `Item` per option   |
| `options`             | `AgendaView[]`                        | `['day', 'week', 'month']`                     | Which views can be selected, in render order                                                        |
| `labels`              | `Partial<Record<AgendaView, string>>` | `{ day: 'Day', week: 'Week', month: 'Month' }` | Custom labels per view                                                                              |
| `size`                | `SegmentRootProps['size']`            | `'sm'`                                         | Visual size of the underlying `Segment`                                                             |
| `className`           | `string`                              | -                                              | Additional CSS classes for the selector root; the default places it absolutely at the bottom-center |
| `...SegmentRootProps` | `SegmentRootProps`                    | -                                              | All `Segment` root props are supported except `value`, `defaultValue`, and `onValueChange`          |

## Hooks

### useAgenda

The state builder. Returns `UseAgendaReturn`; spread it into the root: `<Agenda {...agenda}>`.

```tsx
import { useAgenda } from 'heroui-native-pro';

const agenda = useAgenda({ events, defaultView: 'week' });
```

#### UseAgendaOptions

| option                   | type                                                                   | default                 | description                                                                 |
| ------------------------ | ---------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| `events`                 | `AgendaEvent[]`                                                        | -                       | Events to display; the Agenda never mutates this array                      |
| `view`                   | `AgendaView`                                                           | -                       | Controlled view mode                                                        |
| `defaultView`            | `AgendaView`                                                           | `'day'`                 | Uncontrolled initial view mode                                              |
| `date`                   | `CalendarDate`                                                         | -                       | Controlled active date                                                      |
| `defaultDate`            | `CalendarDate`                                                         | today (local time zone) | Uncontrolled initial active date                                            |
| `selectedEventId`        | `string \| null`                                                       | -                       | Controlled selected event id                                                |
| `defaultSelectedEventId` | `string \| null`                                                       | `null`                  | Uncontrolled initial selected event id                                      |
| `startHour`              | `number`                                                               | `0`                     | First rendered hour of the time grid (inclusive)                            |
| `endHour`                | `number`                                                               | `24`                    | Last rendered hour of the time grid (exclusive)                             |
| `slotDuration`           | `number`                                                               | `60`                    | Minutes represented by one grid slot                                        |
| `slotHeight`             | `number`                                                               | `60`                    | Rendered height in px of one grid slot                                      |
| `firstDayOfWeek`         | `AgendaFirstDayOfWeek`                                                 | -                       | First day of week for the calendar and week view                            |
| `locale`                 | `string`                                                               | environment locale      | BCP 47 locale                                                               |
| `onViewChange`           | `(view: AgendaView) => void`                                           | -                       | Called when the view mode changes                                           |
| `onDateChange`           | `(date: CalendarDate) => void`                                         | -                       | Called when the active date changes (calendar tap, page swipe, `goToToday`) |
| `onEventSelect`          | `(id: string \| null) => void`                                         | -                       | Called when an event is selected (or deselected with `null`)                |
| `onEventPress`           | `(event: AgendaEvent) => void`                                         | -                       | Replaces the selection toggle when an event chip is pressed                 |
| `onEventMove`            | `(id: string, start: CalendarDateTime, end: CalendarDateTime) => void` | -                       | Called with the new start/end after a drag; omit to disable dragging        |
| `onEventResize`          | `(id: string, start: CalendarDateTime, end: CalendarDateTime) => void` | -                       | Called with the new start/end after a resize; omit to disable resizing      |
| `onEventDelete`          | `(id: string) => void`                                                 | -                       | Deletion intent callback; invoke from custom UI                             |

#### AgendaEvent

| property     | type                | default       | description                                                                                                          |
| ------------ | ------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `id`         | `string`            | -             | Unique, stable identifier                                                                                            |
| `title`      | `string`            | -             | Event title shown inside event chips                                                                                 |
| `start`      | `CalendarDateTime`  | -             | Start date-time (wall clock, no time zone)                                                                           |
| `end`        | `CalendarDateTime`  | -             | End date-time (wall clock, no time zone); exclusive, so an event ending at midnight does not cover the following day |
| `color`      | `string`            | -             | Optional accent color used to tint the event chip                                                                    |
| `isAllDay`   | `boolean`           | `false`       | All-day events render in the all-day section and as spanning month rows                                              |
| `isReadOnly` | `boolean`           | `false`       | Read-only events cannot be moved or resized                                                                          |
| `status`     | `AgendaEventStatus` | `'confirmed'` | `'confirmed' \| 'unconfirmed'`; unconfirmed renders a dashed border                                                  |

#### Returns

`UseAgendaReturn` — the resolved state, layout helpers, actions, and interaction callbacks.

| property                 | type                                                                                  | description                                                               |
| ------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `view`                   | `AgendaView`                                                                          | Current view mode                                                         |
| `date`                   | `CalendarDate`                                                                        | Active date                                                               |
| `events`                 | `AgendaEvent[]`                                                                       | Events passed to the root                                                 |
| `selectedEventId`        | `string \| null`                                                                      | Selected event id or `null`                                               |
| `startHour`              | `number`                                                                              | First rendered hour (inclusive)                                           |
| `endHour`                | `number`                                                                              | Last rendered hour (exclusive)                                            |
| `slotDuration`           | `number`                                                                              | Minutes per grid slot                                                     |
| `slotHeight`             | `number`                                                                              | Height in px of one grid slot                                             |
| `locale`                 | `string`                                                                              | Resolved BCP 47 locale                                                    |
| `timeZone`               | `string`                                                                              | Local time zone identifier                                                |
| `firstDayOfWeek`         | `AgendaFirstDayOfWeek \| undefined`                                                   | First day of week, when explicitly provided                               |
| `heading`                | `string`                                                                              | Month + year heading for the active date                                  |
| `visibleDays`            | `CalendarDate[]`                                                                      | Days visible in the current view (1 for day, 7 for week, empty for month) |
| `visibleWeeks`           | `CalendarDate[][]`                                                                    | Six week rows for the active month (month view only, empty otherwise)     |
| `setView`                | `(view: AgendaView) => void`                                                          | Sets the view mode                                                        |
| `setDate`                | `(date: CalendarDate) => void`                                                        | Sets the active date (syncs calendar and pager)                           |
| `selectEvent`            | `(id: string \| null) => void`                                                        | Selects an event (or deselects with `null`)                               |
| `goToNext`               | `() => void`                                                                          | Moves to the next day/week/month depending on the view                    |
| `goToPrevious`           | `() => void`                                                                          | Moves to the previous day/week/month depending on the view                |
| `goToToday`              | `() => void`                                                                          | Jumps to today                                                            |
| `getEventsForDay`        | `(day: CalendarDate) => AgendaEvent[]`                                                | Timed events whose start falls on the given day                           |
| `getEventLayout`         | `(eventId: string) => AgendaEventLayout`                                              | Overlap column layout for a timed event                                   |
| `getAllEventsForDay`     | `(day: CalendarDate) => AgendaEvent[]`                                                | All events (timed + all-day) covering the given day                       |
| `getAllDayLayoutForDays` | `(days: CalendarDate[]) => AgendaAllDayLayoutItem[]`                                  | Packed all-day rows for an arbitrary visible day range                    |
| `getMonthRowLayout`      | `(week: CalendarDate[]) => AgendaMonthRowLayout`                                      | Spanning-event layout for a month week row                                |
| `getPerCellEvents`       | `(day: CalendarDate, week: CalendarDate[]) => AgendaEvent[]`                          | Non-spanning events for a month cell                                      |
| `onEventDelete`          | `((id: string) => void) \| undefined`                                                 | Deletion intent callback, when provided                                   |
| `onEventMove`            | `((id: string, start: CalendarDateTime, end: CalendarDateTime) => void) \| undefined` | Move intent callback, when provided                                       |
| `onEventResize`          | `((id: string, start: CalendarDateTime, end: CalendarDateTime) => void) \| undefined` | Resize intent callback, when provided                                     |
| `onEventPress`           | `((event: AgendaEvent) => void) \| undefined`                                         | Press callback, when provided; replaces the selection toggle              |

#### AgendaEventLayout

| property       | type     | description                                               |
| -------------- | -------- | --------------------------------------------------------- |
| `columnIndex`  | `number` | Zero-based column of the event within its overlap cluster |
| `totalColumns` | `number` | Total columns of the overlap cluster the event belongs to |

#### AgendaAllDayLayoutItem

| property   | type          | description                                 |
| ---------- | ------------- | ------------------------------------------- |
| `event`    | `AgendaEvent` | The all-day event                           |
| `colStart` | `number`      | Zero-based first visible day column covered |
| `colSpan`  | `number`      | Number of visible day columns covered       |
| `row`      | `number`      | Zero-based packed row index                 |

#### AgendaMonthRowLayout

| property         | type                         | description                                   |
| ---------------- | ---------------------------- | --------------------------------------------- |
| `items`          | `AgendaMonthRowLayoutItem[]` | Packed spanning events for the week           |
| `rowCount`       | `number`                     | Total packed spanning rows in the week        |
| `rowCountPerCol` | `number[]`                   | Per-column count of spanning rows covering it |

### useAgendaContext

Reads the agenda state anywhere inside the `Agenda` subtree (used by all compound parts internally).

```tsx
import { useAgendaContext } from 'heroui-native-pro';

const { view, date, heading, setView, goToToday } = useAgendaContext();
```

#### Returns

`AgendaContextValue` — the same state as `UseAgendaReturn` except the `onEventMove` / `onEventResize` / `onEventPress` callbacks.

### useAgendaPage

Reads the current pager page inside `Agenda.Body` template children.

```tsx
import { useAgendaPage } from 'heroui-native-pro';

const { date, days, weeks, isMonthPage } = useAgendaPage();
```

#### Returns

| property      | type               | description                                                                 |
| ------------- | ------------------ | --------------------------------------------------------------------------- |
| `date`        | `CalendarDate`     | Page anchor date: the day itself, the week start, or the first of the month |
| `days`        | `CalendarDate[]`   | Days rendered by this page (1 for day, 7 for week, empty for month)         |
| `weeks`       | `CalendarDate[][]` | Six week rows for month pages (empty for day/week)                          |
| `isMonthPage` | `boolean`          | Whether this page renders a month grid                                      |

### useAgendaEvent

Reads the event being rendered inside item templates (`Agenda.DayColumns`, `Agenda.AllDaySection`, `Agenda.MonthGrid` children).

```tsx
import { useAgendaEvent } from 'heroui-native-pro';

const event = useAgendaEvent();
```

#### Returns

The current template `AgendaEvent`.
