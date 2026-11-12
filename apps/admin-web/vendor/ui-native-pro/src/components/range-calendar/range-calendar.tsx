import { forwardRef, memo, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimationSettingsProvider, FormFieldProvider } from 'heroui-native/contexts';
import { useThemeColor } from 'heroui-native/hooks';
import { getCalendarCellDataAttributes } from '../../helpers/external/utils/index';
import { HeroText } from '../../helpers/internal/components/index';
import { useControllableState } from '../../helpers/internal/hooks/use-controllable-state';
import { ChevronLeftIcon, ChevronRightIcon } from '../../helpers/internal/icons/index';
import { childrenToString, getGregorianYearOffset } from '../../helpers/internal/utils/index';
import InternationalizedDatePackage from '../../optional/internationalized-date';
import {
  CalendarCell as CalendarPrimitiveCell,
  CalendarCellIndicator as CalendarPrimitiveCellIndicator,
  CalendarGrid as CalendarPrimitiveGrid,
  CalendarGridBody as CalendarPrimitiveGridBody,
  CalendarGridHeader as CalendarPrimitiveGridHeader,
  CalendarHeader as CalendarPrimitiveHeader,
  CalendarHeaderCell as CalendarPrimitiveHeaderCell,
  CalendarHeading as CalendarPrimitiveHeading,
  CalendarNavButton as CalendarPrimitiveNavButton,
  RangeCalendarRoot as RangeCalendarPrimitiveRoot,
  useCalendarStateContext,
} from '../../primitives/calendar/index';
import {
  YearPickerCell,
  YearPickerContextProvider,
  YearPickerGrid,
  YearPickerGridBody,
  YearPickerTrigger,
  YearPickerTriggerHeading,
  YearPickerTriggerIndicator,
} from '../calendar-year-picker/calendar-year-picker';
import { useYearPicker } from '../calendar-year-picker/calendar-year-picker.context';
import type { YearPickerGridBounds } from '../calendar-year-picker/calendar-year-picker.types';
import { useCalendarCellBodyAnimation, useCalendarRootAnimation } from './range-calendar.animation';
import { DISPLAY_NAME, NAV_ICON_SIZE } from './range-calendar.constants';
import rangeCalendarClassNames, { rangeCalendarStyleSheet } from './range-calendar.styles';
const {
  CalendarDate,
  createCalendar: createCalendarDefault,
  DateFormatter,
  isSameDay,
} = InternationalizedDatePackage ?? {};
const useRangeCalendar = useCalendarStateContext;
// --------------------------------------------------
/**
 * Default lower/upper Gregorian year bounds for the year picker and
 * `minValue` / `maxValue` fallbacks. Shifted per calendar system via
 * {@link getGregorianYearOffset} so non-Gregorian calendars (Buddhist,
 * Hebrew, Persian, …) still get a sensible default range.
 */
const DEFAULT_MIN_GREGORIAN_YEAR = 1900;
const DEFAULT_MAX_GREGORIAN_YEAR = 2099;
/**
 * Computes default `minValue` / `maxValue` for the range calendar when the
 * consumer does not supply them. The defaults are anchored to Gregorian
 * `1900`–`2099` and shifted into the locale-resolved calendar system so
 * bounds stay meaningful under non-Gregorian calendars.
 */
function useDefaultRangeCalendarBounds(locale, createCalendar, minValue, maxValue) {
  return useMemo(() => {
    const resolvedLocale = locale ?? Intl.DateTimeFormat().resolvedOptions().locale;
    const identifier = new DateFormatter(resolvedLocale).resolvedOptions().calendar;
    const calendarSystem = (createCalendar ?? createCalendarDefault)(identifier);
    const offset = getGregorianYearOffset(identifier);
    const resolvedMin =
      minValue ?? new CalendarDate(calendarSystem, DEFAULT_MIN_GREGORIAN_YEAR + offset, 1, 1);
    const resolvedMax =
      maxValue ?? new CalendarDate(calendarSystem, DEFAULT_MAX_GREGORIAN_YEAR + offset, 12, 31);
    return {
      minValue: resolvedMin,
      maxValue: resolvedMax,
    };
  }, [locale, createCalendar, minValue, maxValue]);
}
// --------------------------------------------------
const RangeCalendarRoot = forwardRef((props: any, ref: any) => {
  const {
    className,
    animation,
    children,
    isYearPickerOpen: isYearPickerOpenProp,
    defaultYearPickerOpen,
    onYearPickerOpenChange,
    locale,
    createCalendar,
    minValue,
    maxValue,
    ...rest
  } = props;
  const { minValue: resolvedMinValue, maxValue: resolvedMaxValue } = useDefaultRangeCalendarBounds(
    locale,
    createCalendar,
    minValue,
    maxValue
  );
  const isDisabled = rest.isDisabled ?? false;
  const isInvalid = rest.isInvalid ?? false;
  const { isAllAnimationsDisabled } = useCalendarRootAnimation({
    animation,
  });
  const animationSettingsValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const formFieldContextValue = useMemo(
    () => ({
      isDisabled,
      isInvalid,
      isRequired: false,
      hasFieldPadding: true,
    }),
    [isDisabled, isInvalid]
  );
  const [gridBounds, setGridBounds] = useState<YearPickerGridBounds | null>(null);
  const [isYearPickerOpen, setIsYearPickerOpen] = useControllableState({
    prop: isYearPickerOpenProp,
    defaultProp: defaultYearPickerOpen ?? false,
    onChange: onYearPickerOpenChange,
  });
  const yearPickerContextValue = useMemo(
    () => ({
      gridBounds,
      isYearPickerOpen: isYearPickerOpen ?? false,
      setGridBounds,
      setIsYearPickerOpen: (open) => {
        setIsYearPickerOpen(open);
      },
    }),
    [gridBounds, isYearPickerOpen, setIsYearPickerOpen]
  );
  const rootClassName = rangeCalendarClassNames.root({
    className,
  });
  return (
    <AnimationSettingsProvider value={animationSettingsValue}>
      <FormFieldProvider value={formFieldContextValue}>
        <YearPickerContextProvider value={yearPickerContextValue}>
          <RangeCalendarPrimitiveRoot
            ref={ref}
            locale={locale}
            createCalendar={createCalendar}
            minValue={resolvedMinValue}
            maxValue={resolvedMaxValue}
            className={rootClassName}
            {...rest}
          >
            {children}
          </RangeCalendarPrimitiveRoot>
        </YearPickerContextProvider>
      </FormFieldProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const RangeCalendarHeader = forwardRef(({ className, ...rest }: any, ref: any) => {
  const headerClassName = rangeCalendarClassNames.header({
    className,
  });
  return <CalendarPrimitiveHeader ref={ref} className={headerClassName} {...rest} />;
});
// --------------------------------------------------
const RangeCalendarHeading = forwardRef(({ className, ...rest }: any, ref: any) => {
  const headingClassName = rangeCalendarClassNames.heading({
    className,
  });
  return <CalendarPrimitiveHeading ref={ref} className={headingClassName} {...rest} />;
});
// --------------------------------------------------
const RangeCalendarNavButton = forwardRef(
  ({ className, style, children, slot, iconProps, ...rest }: any, ref: any) => {
    const themeAccent = useThemeColor('accent-soft-foreground');
    const isPrevious = slot === 'previous';
    const navButtonClassName = rangeCalendarClassNames.navButton({
      className,
    });
    const iconSize = iconProps?.size ?? NAV_ICON_SIZE;
    const iconColor = iconProps?.color ?? themeAccent;
    const defaultIcon = isPrevious ? (
      <ChevronLeftIcon color={iconColor} size={iconSize} />
    ) : (
      <ChevronRightIcon color={iconColor} size={iconSize} />
    );
    return (
      <CalendarPrimitiveNavButton
        ref={ref}
        slot={slot}
        className={navButtonClassName}
        style={typeof style === 'object' ? [rangeCalendarStyleSheet.borderCurve, style] : style}
        {...rest}
      >
        {children ?? defaultIcon}
      </CalendarPrimitiveNavButton>
    );
  }
);
// --------------------------------------------------
const RangeCalendarGrid = forwardRef(({ className, onLayout, ...rest }: any, ref: any) => {
  const { setGridBounds } = useYearPicker();
  const gridClassName = rangeCalendarClassNames.grid({
    className,
  });
  const handleLayout = useCallback(
    (event) => {
      onLayout?.(event);
      const { height, y } = event.nativeEvent.layout;
      setGridBounds({
        height,
        top: y,
      });
    },
    [onLayout, setGridBounds]
  );
  return (
    <View className="w-full" onLayout={handleLayout}>
      <CalendarPrimitiveGrid ref={ref} className={gridClassName} {...rest} />
    </View>
  );
});
// --------------------------------------------------
const RangeCalendarGridHeader = forwardRef(({ children, ...rest }: any, ref: any) => {
  return (
    <CalendarPrimitiveGridHeader ref={ref} {...rest}>
      {children}
    </CalendarPrimitiveGridHeader>
  );
});
// --------------------------------------------------
const RangeCalendarGridBody = forwardRef(({ ...rest }: any, ref: any) => {
  return <CalendarPrimitiveGridBody ref={ref} {...rest} />;
});
// --------------------------------------------------
const RangeCalendarHeaderCellLabel = forwardRef(
  ({ className, children, ...textProps }: any, ref: any) => {
    const labelClassName = rangeCalendarClassNames.headerCellLabel({
      className,
    });
    return (
      <HeroText ref={ref} className={labelClassName} {...textProps}>
        {children}
      </HeroText>
    );
  }
);
// --------------------------------------------------
const RangeCalendarHeaderCell = forwardRef(
  ({ className, children, day, ...rest }: any, ref: any) => {
    const headerCellClassName = rangeCalendarClassNames.headerCell({
      className,
    });
    const stringifiedChildren = childrenToString(children);
    const renderChildren =
      stringifiedChildren != null ? (
        <RangeCalendarHeaderCellLabel>{stringifiedChildren}</RangeCalendarHeaderCellLabel>
      ) : children != null ? (
        children
      ) : (
        <RangeCalendarHeaderCellLabel>{day}</RangeCalendarHeaderCellLabel>
      );
    return (
      <CalendarPrimitiveHeaderCell ref={ref} className={headerCellClassName} {...rest}>
        {renderChildren}
      </CalendarPrimitiveHeaderCell>
    );
  }
);
// --------------------------------------------------
/**
 * Module-level default render function for `RangeCalendarCell`. Hoisted out of the component body
 * so each render doesn't allocate a fresh closure, which would otherwise defeat `React.memo` on
 * the wrapper cell (every cell would look like it had a new `children` prop).
 */
const renderDefaultRangeCellChildren = (renderProps) => (
  <RangeCalendarCellBody cellRenderProps={renderProps}>
    <RangeCalendarCellLabel cellRenderProps={renderProps}>
      {renderProps.formattedDate}
    </RangeCalendarCellLabel>
  </RangeCalendarCellBody>
);
const RangeCalendarCellInner = forwardRef(
  ({ className, style, children, ...rest }: any, ref: any) => {
    const renderChildren = children ?? renderDefaultRangeCellChildren;
    const cellClassName = rangeCalendarClassNames.cell({
      className,
    });
    return (
      <CalendarPrimitiveCell
        ref={ref}
        className={cellClassName}
        style={typeof style === 'object' ? [rangeCalendarStyleSheet.borderCurve, style] : style}
        {...rest}
      >
        {renderChildren}
      </CalendarPrimitiveCell>
    );
  }
);
RangeCalendarCellInner.displayName = `${DISPLAY_NAME.CELL}.Inner`;
/**
 * Memo comparator for the wrapper `RangeCalendarCell`. `date` is a fresh `CalendarDate` per grid
 * render, so strict equality never matches — we compare by `isSameDay`.
 *
 * `children` gets special treatment: when both prev and next are functions, we skip the
 * comparison. Render-prop children are almost always defined inline by callers (the surrounding
 * `GridBody` child arrow is itself inline, so `useCallback` on the inner fn wouldn't even help),
 * which means strict equality would never match and defeat the memo entirely. The contract is
 * that render functions are *pure with respect to `cellRenderProps`* — if the cell's computed
 * state (`isSelected`, `isRangeStart`, `isRangeMiddle`, etc.) hasn't changed, the render
 * function's output can't change either, so skipping re-execution is safe.
 *
 * All other props fall back to reference equality, matching React's default behavior.
 */
function areRangeCellPropsEqual(prev, next) {
  if (prev === next) {
    return true;
  }
  if (!isSameDay(prev.date, next.date)) {
    return false;
  }
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  for (const key of prevKeys) {
    if (key === 'date') {
      continue;
    }
    if (
      key === 'children' &&
      typeof prev.children === 'function' &&
      typeof next.children === 'function'
    ) {
      continue;
    }
    if (prev[key] !== next[key]) {
      return false;
    }
  }
  return true;
}
const RangeCalendarCell = memo(RangeCalendarCellInner, areRangeCellPropsEqual);
// --------------------------------------------------
const RangeCalendarCellBody = forwardRef(
  (
    {
      className,
      children,
      cellRenderProps,
      animation,
      isAnimatedStyleActive = true,
      style,
      ...viewProps
    }: any,
    ref: any
  ) => {
    const { rCellBodyStyle } = useCalendarCellBodyAnimation({
      animation,
      isPressed: cellRenderProps?.isPressed ?? false,
    });
    const bodyClassName = rangeCalendarClassNames.cellBody({
      className,
    });
    const bodyStyle = isAnimatedStyleActive
      ? [rangeCalendarStyleSheet.borderCurve, rCellBodyStyle, style]
      : [rangeCalendarStyleSheet.borderCurve, style];
    return (
      <Animated.View
        ref={ref}
        accessible={false}
        accessibilityRole="none"
        importantForAccessibility="no"
        className={bodyClassName}
        style={bodyStyle}
        {...getCalendarCellDataAttributes({
          cellRenderProps,
        })}
        {...viewProps}
      >
        {children}
      </Animated.View>
    );
  }
);
// --------------------------------------------------
const RangeCalendarCellLabel = forwardRef(
  ({ className, children, cellRenderProps, ...textProps }: any, ref: any) => {
    const labelClassName = rangeCalendarClassNames.cellLabel({
      className,
    });
    return (
      <HeroText
        ref={ref}
        accessible={false}
        accessibilityRole="text"
        importantForAccessibility="no"
        className={labelClassName}
        {...getCalendarCellDataAttributes({
          cellRenderProps,
        })}
        {...textProps}
      >
        {children}
      </HeroText>
    );
  }
);
// --------------------------------------------------
const RangeCalendarCellIndicator = forwardRef(
  ({ className, cellRenderProps, style, ...viewProps }: any, ref: any) => {
    const cellIndicatorClassName = rangeCalendarClassNames.cellIndicator({
      className,
    });
    const isSelected = cellRenderProps?.isSelected ?? false;
    return (
      <CalendarPrimitiveCellIndicator
        ref={ref}
        isSelected={isSelected}
        className={cellIndicatorClassName}
        style={[rangeCalendarStyleSheet.borderCurve, style]}
        {...getCalendarCellDataAttributes({
          cellRenderProps,
        })}
        {...viewProps}
      />
    );
  }
);
// --------------------------------------------------
RangeCalendarRoot.displayName = DISPLAY_NAME.ROOT;
RangeCalendarHeader.displayName = DISPLAY_NAME.HEADER;
RangeCalendarHeading.displayName = DISPLAY_NAME.HEADING;
RangeCalendarNavButton.displayName = DISPLAY_NAME.NAV_BUTTON;
RangeCalendarGrid.displayName = DISPLAY_NAME.GRID;
RangeCalendarGridHeader.displayName = DISPLAY_NAME.GRID_HEADER;
RangeCalendarGridBody.displayName = DISPLAY_NAME.GRID_BODY;
RangeCalendarHeaderCell.displayName = DISPLAY_NAME.HEADER_CELL;
RangeCalendarHeaderCellLabel.displayName = DISPLAY_NAME.HEADER_CELL_LABEL;
RangeCalendarCellLabel.displayName = DISPLAY_NAME.CELL_LABEL;
RangeCalendarCellBody.displayName = DISPLAY_NAME.CELL_BODY;
RangeCalendarCell.displayName = DISPLAY_NAME.CELL;
RangeCalendarCellIndicator.displayName = DISPLAY_NAME.CELL_INDICATOR;
/**
 * Styled range calendar: same layout tokens as {@link Calendar}, with range selection and
 * `data-range-*` / `data-invalid` on cells and labels.
 */
const RangeCalendar = Object.assign(RangeCalendarRoot, {
  Header: RangeCalendarHeader,
  Heading: RangeCalendarHeading,
  NavButton: RangeCalendarNavButton,
  Grid: RangeCalendarGrid,
  GridHeader: RangeCalendarGridHeader,
  GridBody: RangeCalendarGridBody,
  HeaderCell: RangeCalendarHeaderCell,
  HeaderCellLabel: RangeCalendarHeaderCellLabel,
  Cell: RangeCalendarCell,
  CellBody: RangeCalendarCellBody,
  CellLabel: RangeCalendarCellLabel,
  CellIndicator: RangeCalendarCellIndicator,
  YearPickerTrigger: YearPickerTrigger,
  YearPickerTriggerHeading: YearPickerTriggerHeading,
  YearPickerTriggerIndicator: YearPickerTriggerIndicator,
  YearPickerGrid: YearPickerGrid,
  YearPickerGridBody: YearPickerGridBody,
  YearPickerCell: YearPickerCell,
});
export { useRangeCalendar };
export default RangeCalendar;
