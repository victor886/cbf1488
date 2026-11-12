// @ts-nocheck
import InternationalizedDatePackage from '../../optional/internationalized-date';
import { PAGE_WINDOW } from './agenda.constants';
const {
  CalendarDate: CalendarDateClass,
  isSameDay,
  startOfWeek,
} = InternationalizedDatePackage ?? {};
/**
 * Clamps a number into `[min, max]`. Worklet-safe.
 */
export function clampNumber(value, min, max) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}
/**
 * Instant reset for the DnD drop translation: the event re-renders at its new time
 * from data, so the drop translation must not spring back visibly.
 */
export function instantDropAnimation(toValue) {
  'worklet';
  return toValue;
}
/**
 * Localized hour labels for the time gutter. The first hour is omitted so the label
 * does not collide with the grid's top edge.
 */
export function buildHourLabels(startHour, endHour, formatter) {
  const labels = [];
  for (let hour = startHour + 1; hour < endHour; hour++) {
    const sample = new Date(2000, 0, 1, hour, 0, 0, 0);
    labels.push({
      hour,
      label: formatter.format(sample),
    });
  }
  return labels;
}
/**
 * Formats minutes-of-day (e.g. `870` -> `"14:30"`) with the given time formatter.
 */
export function formatMinutesOfDay(formatter, totalMinutes) {
  return formatter.format(
    new Date(2000, 0, 1, Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0)
  );
}
/**
 * Converts a `CalendarDateTime` into a monotonic comparable minute value.
 * Multipliers are padded (32 days / 13 months) so the ordering never inverts
 * across month or year boundaries.
 */
export function toComparableMinutes(dateTime) {
  return (
    dateTime.year * 599040 +
    dateTime.month * 46080 +
    dateTime.day * 1440 +
    dateTime.hour * 60 +
    dateTime.minute
  );
}
/**
 * Minutes elapsed since local midnight of the event's own day.
 */
export function getMinutesFromMidnight(dateTime) {
  return dateTime.hour * 60 + dateTime.minute;
}
/**
 * Event duration in wall-clock minutes (clamped to a non-negative value).
 *
 * Computed as whole calendar days between the start and end dates plus the
 * minute-of-day difference. {@link toComparableMinutes} must NOT be used here:
 * its padded multipliers are ordering-only and inflate differences that cross
 * month or year boundaries.
 */
export function getEventDurationMinutes(event) {
  const dayDelta = toDateOnly(event.end).compare(toDateOnly(event.start));
  const minuteDelta = getMinutesFromMidnight(event.end) - getMinutesFromMidnight(event.start);
  return Math.max(0, dayDelta * 1440 + minuteDelta);
}
/**
 * Days visible for a date in the given view: `[date]` for day, a full week for week,
 * empty for month (month uses {@link getVisibleWeeks}).
 */
export function getVisibleDays(view, date, locale, firstDayOfWeek) {
  if (view === 'day') {
    return [date];
  }
  if (view === 'week') {
    const weekStart = startOfWeek(date, locale, firstDayOfWeek);
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(
        weekStart.add({
          days: i,
        })
      );
    }
    return days;
  }
  return [];
}
/**
 * Six week rows (7 days each) covering the month of the given date.
 */
export function getVisibleWeeks(date, locale, firstDayOfWeek) {
  const monthStart = date.set({
    day: 1,
  });
  const gridStart = startOfWeek(monthStart, locale, firstDayOfWeek);
  const weeks = [];
  let current = gridStart;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(current);
      current = current.add({
        days: 1,
      });
    }
    weeks.push(week);
  }
  return weeks;
}
/**
 * Builds the overlap column layout map for all timed events: connected overlap
 * clusters are packed greedily into columns (first column whose last event ends
 * at or before the candidate's start).
 */
export function buildEventLayoutMap(events) {
  const map = new Map();
  const timedEvents = events.filter((event) => !event.isAllDay);
  const overlaps = (a, b) => {
    return (
      toComparableMinutes(a.start) < toComparableMinutes(b.end) &&
      toComparableMinutes(b.start) < toComparableMinutes(a.end)
    );
  };
  const visited = new Set();
  for (const event of timedEvents) {
    if (visited.has(event.id)) {
      continue;
    }
    const group = [event];
    visited.add(event.id);
    let expanded = true;
    while (expanded) {
      expanded = false;
      for (const other of timedEvents) {
        if (visited.has(other.id)) {
          continue;
        }
        if (group.some((member) => overlaps(member, other))) {
          group.push(other);
          visited.add(other.id);
          expanded = true;
        }
      }
    }
    group.sort((a, b) => toComparableMinutes(a.start) - toComparableMinutes(b.start));
    const columns = [];
    for (const member of group) {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const column = columns[col];
        if (column === undefined) {
          continue;
        }
        const lastInCol = column[column.length - 1];
        if (
          lastInCol !== undefined &&
          toComparableMinutes(lastInCol.end) <= toComparableMinutes(member.start)
        ) {
          column.push(member);
          map.set(member.id, {
            columnIndex: col,
            totalColumns: 0,
          });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([member]);
        map.set(member.id, {
          columnIndex: columns.length - 1,
          totalColumns: 0,
        });
      }
    }
    for (const member of group) {
      const entry = map.get(member.id);
      if (entry !== undefined) {
        entry.totalColumns = columns.length;
      }
    }
  }
  return map;
}
/**
 * Converts an event's calendar day into a `CalendarDate` (drops the time part).
 */
export function toDateOnly(dateTime) {
  return new CalendarDateClass(dateTime.year, dateTime.month, dateTime.day);
}
/**
 * Last calendar day actually covered by an event, honoring the half-open
 * `[start, end)` convention used by {@link getEventDurationMinutes} and the
 * timed-event overlap packing: an event ending exactly at midnight of a later
 * day occupies zero minutes of that day, so the day before is the last covered
 * one. Events ending mid-day, single-day events, and zero-duration events keep
 * their end date unchanged.
 */
export function getLastCoveredDay(event) {
  const endDate = toDateOnly(event.end);
  if (getMinutesFromMidnight(event.end) === 0 && endDate.compare(toDateOnly(event.start)) > 0) {
    return endDate.subtract({
      days: 1,
    });
  }
  return endDate;
}
/**
 * Packs all-day events covering the given visible day range into rows.
 * Returns `colStart` / `colSpan` / `row` per event, clamped to the range.
 */
export function getAllDayLayoutForDays(allDayEvents, visibleDays) {
  if (visibleDays.length === 0) {
    return [];
  }
  const firstVisible = visibleDays[0];
  const lastVisible = visibleDays[visibleDays.length - 1];
  if (firstVisible === undefined || lastVisible === undefined) {
    return [];
  }
  const items = [];
  const rowEnds = [];
  for (const event of allDayEvents) {
    const eventStartDate = toDateOnly(event.start);
    const eventEndDate = getLastCoveredDay(event);
    const clampedStart = eventStartDate.compare(firstVisible) < 0 ? firstVisible : eventStartDate;
    const clampedEnd = eventEndDate.compare(lastVisible) > 0 ? lastVisible : eventEndDate;
    if (clampedStart.compare(lastVisible) > 0 || clampedEnd.compare(firstVisible) < 0) {
      continue;
    }
    let colStart = -1;
    for (let i = 0; i < visibleDays.length; i++) {
      const day = visibleDays[i];
      if (day !== undefined && isSameDay(day, clampedStart)) {
        colStart = i;
        break;
      }
    }
    if (colStart === -1) {
      continue;
    }
    let colEnd = colStart;
    for (let i = colStart; i < visibleDays.length; i++) {
      const day = visibleDays[i];
      if (day !== undefined && day.compare(clampedEnd) <= 0) {
        colEnd = i;
      } else {
        break;
      }
    }
    const colSpan = colEnd - colStart + 1;
    let row = 0;
    for (row = 0; row < rowEnds.length; row++) {
      const rowEnd = rowEnds[row];
      if (rowEnd !== undefined && rowEnd < colStart) {
        break;
      }
    }
    rowEnds[row] = colStart + colSpan - 1;
    items.push({
      colSpan,
      colStart,
      event,
      row,
    });
  }
  return items;
}
/**
 * Spanning-event layout for one month week row: all-day events covering two or
 * more days of the week are packed into rows above the per-cell chips.
 */
export function getMonthRowLayout(events, week) {
  if (week.length === 0) {
    return {
      items: [],
      rowCount: 0,
      rowCountPerCol: [],
    };
  }
  const firstDay = week[0];
  const lastDay = week[week.length - 1];
  if (firstDay === undefined || lastDay === undefined) {
    return {
      items: [],
      rowCount: 0,
      rowCountPerCol: [],
    };
  }
  const items = [];
  const rowEnds = [];
  for (const event of events) {
    if (event.isAllDay !== true) {
      continue;
    }
    const eventStartDate = toDateOnly(event.start);
    const eventEndDate = getLastCoveredDay(event);
    if (eventEndDate.compare(firstDay) < 0 || eventStartDate.compare(lastDay) > 0) {
      continue;
    }
    const clampedStart = eventStartDate.compare(firstDay) < 0 ? firstDay : eventStartDate;
    const clampedEnd = eventEndDate.compare(lastDay) > 0 ? lastDay : eventEndDate;
    let colStart = 0;
    for (let i = 0; i < week.length; i++) {
      const day = week[i];
      if (day !== undefined && isSameDay(day, clampedStart)) {
        colStart = i;
        break;
      }
    }
    let colEnd = colStart;
    for (let i = colStart; i < week.length; i++) {
      const day = week[i];
      if (day !== undefined && day.compare(clampedEnd) <= 0) {
        colEnd = i;
      } else {
        break;
      }
    }
    if (colEnd - colStart < 1) {
      continue;
    }
    const colSpan = colEnd - colStart + 1;
    let row = 0;
    for (row = 0; row < rowEnds.length; row++) {
      const rowEnd = rowEnds[row];
      if (rowEnd !== undefined && rowEnd < colStart) {
        break;
      }
    }
    rowEnds[row] = colStart + colSpan - 1;
    items.push({
      colSpan,
      colStart,
      event,
      row,
    });
  }
  const rowCountPerCol = new Array(week.length).fill(0);
  for (const item of items) {
    for (let c = item.colStart; c < item.colStart + item.colSpan; c++) {
      const current = rowCountPerCol[c];
      if (current !== undefined) {
        rowCountPerCol[c] = Math.max(current, item.row + 1);
      }
    }
  }
  return {
    items,
    rowCount: rowEnds.length,
    rowCountPerCol,
  };
}
/**
 * Events shown inside a month cell: everything covering the day except the week's
 * spanning events (which render as bars above the cells).
 */
export function getPerCellEvents(events, day, spanningIds) {
  return events.filter((event) => {
    if (spanningIds.has(event.id)) {
      return false;
    }
    const eventStartDate = toDateOnly(event.start);
    const eventEndDate = getLastCoveredDay(event);
    return eventStartDate.compare(day) <= 0 && eventEndDate.compare(day) >= 0;
  });
}
/**
 * Builds the set of day keys (ISO date strings) covered by at least one event,
 * including every day of multi-day spans. Used for calendar day indicators.
 * Spans are capped at 370 days per event as a runaway guard.
 */
export function buildEventDayKeySet(events) {
  const keys = new Set();
  for (const event of events) {
    let day = toDateOnly(event.start);
    const endDay = getLastCoveredDay(event);
    let guard = 0;
    while (day.compare(endDay) <= 0 && guard < 370) {
      keys.add(day.toString());
      day = day.add({
        days: 1,
      });
      guard++;
    }
  }
  return keys;
}
/**
 * Pager index of the given date relative to the frozen anchor for the view mode.
 * Day pages step by one day, week pages by seven days, month pages by one calendar month.
 */
export function getPageIndexForDate(view, anchor, date, locale, firstDayOfWeek) {
  if (view === 'day') {
    return PAGE_WINDOW + date.compare(anchor);
  }
  if (view === 'week') {
    const anchorWeekStart = startOfWeek(anchor, locale, firstDayOfWeek);
    const dateWeekStart = startOfWeek(date, locale, firstDayOfWeek);
    return PAGE_WINDOW + Math.round(dateWeekStart.compare(anchorWeekStart) / 7);
  }
  return PAGE_WINDOW + (date.year - anchor.year) * 12 + (date.month - anchor.month);
}
/**
 * Date represented by a pager index (start-of-page date for week/month).
 */
export function getDateForPageIndex(view, anchor, index, locale, firstDayOfWeek) {
  const delta = index - PAGE_WINDOW;
  if (view === 'day') {
    return anchor.add({
      days: delta,
    });
  }
  if (view === 'week') {
    return startOfWeek(anchor, locale, firstDayOfWeek).add({
      days: delta * 7,
    });
  }
  return anchor
    .set({
      day: 1,
    })
    .add({
      months: delta,
    });
}
/**
 * Advances a date by a number of pages while preserving the day-of-week (week view)
 * or day-of-month (month view, clamped by the date library).
 */
export function addPagesToDate(view, date, pages) {
  if (view === 'day') {
    return date.add({
      days: pages,
    });
  }
  if (view === 'week') {
    return date.add({
      days: pages * 7,
    });
  }
  return date.add({
    months: pages,
  });
}
/**
 * Snaps a drag translation in px to whole minutes on the grid.
 */
export function snapDeltaMinutes(translationPx, pxPerMinute, snapMinutes) {
  'worklet';
  if (pxPerMinute <= 0) {
    return 0;
  }
  const rawMinutes = translationPx / pxPerMinute;
  return Math.round(rawMinutes / snapMinutes) * snapMinutes;
}
/**
 * Zero-based index of the week row containing `date` within the month grid of the
 * visible month starting at `monthStart`.
 */
export function getWeekIndexInMonth(date, monthStart, locale, firstDayOfWeek) {
  const gridStart = startOfWeek(
    monthStart.set({
      day: 1,
    }),
    locale,
    firstDayOfWeek
  );
  const dateWeekStart = startOfWeek(date, locale, firstDayOfWeek);
  return Math.max(0, Math.round(dateWeekStart.compare(gridStart) / 7));
}
/**
 * Number of week rows needed to render the month containing `monthStart`.
 */
export function getWeeksInMonth(monthStart, locale, firstDayOfWeek) {
  const firstOfMonth = monthStart.set({
    day: 1,
  });
  const gridStart = startOfWeek(firstOfMonth, locale, firstDayOfWeek);
  const lastOfMonth = firstOfMonth
    .add({
      months: 1,
    })
    .subtract({
      days: 1,
    });
  return Math.ceil((lastOfMonth.compare(gridStart) + 1) / 7);
}
