import type { CalendarCellRenderProps } from '../../../primitives/calendar';

/**
 * Every `data-*` prop applied to both the primitive calendar day pressable and range calendar
 * labels, derived from {@link CalendarCellRenderProps} plus interaction state.
 */
export type CalendarCellDataAttributes = {
  'data-today': boolean;
  'data-today-not-in-range': boolean;
  'data-outside-month': boolean;
  'data-unavailable': boolean;
  'data-disabled': boolean;
  'data-focused': boolean;
  'data-invalid': boolean;
  'data-readonly': boolean;
  'data-selected': boolean;
  'data-range-start': boolean;
  'data-range-end': boolean;
  'data-range-filled': boolean;
  'data-range-middle': boolean;
  'data-range-middle-row-start': boolean;
  'data-range-middle-row-end': boolean;
  'data-pressed': boolean;
  'data-disabled-not-outside-month': boolean;
};

/**
 * Input for {@link getCalendarCellDataAttributes}: render props from the calendar cell callback,
 * plus optional press/read-only state applied on the outer pressable.
 */
export type CalendarCellDataAttributesInput = {
  cellRenderProps?: CalendarCellRenderProps;
  isReadOnly?: boolean;
  isPressed?: boolean;
};

/**
 * Maps render props (and optional `isReadOnly` / `isPressed`) to a single `data-*` object for
 * the day cell pressable and for calendar/range `CellLabel` / `CellBody` slots.
 */
export function getCalendarCellDataAttributes(
  input: CalendarCellDataAttributesInput
): CalendarCellDataAttributes {
  const props = input.cellRenderProps;
  const isToday = props?.isToday ?? false;
  const isOutsideMonth = props?.isOutsideMonth ?? false;
  const isUnavailable = props?.isUnavailable ?? false;
  const isDisabled = props?.isDisabled ?? false;
  const isInvalid = props?.isInvalid ?? false;
  const isSelected = props?.isSelected ?? false;
  const isRangeStart = props?.isRangeStart ?? false;
  const isRangeEnd = props?.isRangeEnd ?? false;
  const isRangeFilled = props?.isRangeFilled ?? false;
  const isRangeMiddle = props?.isRangeMiddle ?? false;
  const isRangeMiddleRowStart = props?.isRangeMiddleRowStart ?? false;
  const isRangeMiddleRowEnd = props?.isRangeMiddleRowEnd ?? false;
  const isFocused = props?.isFocused ?? false;
  const isReadOnly = input.isReadOnly ?? false;
  const isPressed = input.isPressed ?? props?.isPressed ?? false;
  const rangeStartVisible = isRangeStart && !isOutsideMonth;
  const rangeEndVisible = isRangeEnd && !isOutsideMonth;
  /** Match start/end: no range strip or row rounding on leading/trailing outside-month cells. */
  const rangeMiddleVisible = isRangeMiddle && !isOutsideMonth;
  const rangeMiddleRowStartVisible = isRangeMiddleRowStart && !isOutsideMonth;
  const rangeMiddleRowEndVisible = isRangeMiddleRowEnd && !isOutsideMonth;
  /**
   * Today highlight must defer to range styling: when the current day is a visible range
   * endpoint or sits inside the range strip, the range `data-*` selectors own the cell so the
   * "today" background/foreground don't override (or break the continuous strip in the middle).
   */
  const isTodayNotInRange =
    isToday && !rangeStartVisible && !rangeEndVisible && !rangeMiddleVisible;
  return {
    'data-today': isToday,
    'data-today-not-in-range': isTodayNotInRange,
    'data-outside-month': isOutsideMonth,
    'data-unavailable': isUnavailable,
    'data-disabled': isDisabled,
    'data-focused': isFocused,
    'data-invalid': isInvalid,
    'data-readonly': isReadOnly,
    'data-selected': isSelected,
    'data-range-start': rangeStartVisible,
    'data-range-end': rangeEndVisible,
    'data-range-filled': isRangeFilled,
    'data-range-middle': rangeMiddleVisible,
    'data-range-middle-row-start': rangeMiddleRowStartVisible,
    'data-range-middle-row-end': rangeMiddleRowEndVisible,
    'data-pressed': isPressed,
    'data-disabled-not-outside-month': isDisabled && !isOutsideMonth,
  };
}
