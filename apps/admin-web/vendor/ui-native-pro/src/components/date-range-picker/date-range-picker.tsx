import { forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { AnimationSettingsProvider, FormFieldProvider, useFormField } from 'heroui-native/contexts';
import { useThemeColor } from 'heroui-native/hooks';
import { Select } from 'heroui-native/select';
import { cn } from 'heroui-native/utils';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { CalendarIcon } from '../../helpers/internal/icons/index';
import InternationalizedDatePackage from '../../optional/internationalized-date';
import { RangeCalendar } from '../range-calendar/index';
import { useDateRangePickerRootAnimation } from './date-range-picker.animation';
import { DISPLAY_NAME } from './date-range-picker.constants';
import { DateRangePickerProvider, useDateRangePicker } from './date-range-picker.context';
import { dateRangePickerClassNames } from './date-range-picker.styles';
import {
  formatDateRangeForDisplay,
  serializeDateRangeToSelectValue,
  tryParseDateRangeFromSelectValue,
} from './date-range-picker.utils';
const { toCalendarDate } = InternationalizedDatePackage ?? {};
// --------------------------------------------------
const DateRangePickerRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    isDisabled = false,
    isInvalid = false,
    isRequired = false,
    animation,
    value: valueProp,
    defaultValue,
    onValueChange: onValueChangeProp,
    isOpen: isOpenProp,
    isDefaultOpen,
    onOpenChange: onOpenChangeProp,
    dateDisplayFormat = 'medium',
    locale,
    formatDateRange,
    rangeSeparator,
    ...restProps
  } = props;
  const rootClassName = dateRangePickerClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useDateRangePickerRootAnimation({
    animation,
  });
  const [selected, setSelected] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChangeProp,
  });
  const [openState, setOpenState] = useControllableState({
    prop: isOpenProp,
    defaultProp: isDefaultOpen,
    onChange: onOpenChangeProp,
  });
  const isOpen = openState ?? false;
  const formatRangeLabel = useCallback(
    (start, end) =>
      formatDateRangeForDisplay(start, end, {
        dateDisplayFormat,
        locale,
        formatDateRange,
        rangeSeparator,
      }),
    [dateDisplayFormat, locale, formatDateRange, rangeSeparator]
  );
  const commitRange = useCallback(
    (range) => {
      const label = formatRangeLabel(range.start, range.end);
      setSelected({
        value: serializeDateRangeToSelectValue(range),
        label,
      });
      setTimeout(() => {
        setOpenState(false);
      }, 250);
    },
    [formatRangeLabel, setSelected, setOpenState]
  );
  const formFieldContextValue = useMemo(
    () => ({
      isDisabled,
      isInvalid,
      isRequired,
      hasFieldPadding: true,
    }),
    [isDisabled, isInvalid, isRequired]
  );
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const dateRangePickerContextValue = useMemo(
    () => ({
      value: selected,
      onValueChange: setSelected,
      isOpen,
      onOpenChange: setOpenState,
      commitRange,
      formatRangeLabel,
      isDisabledRoot: isDisabled,
      locale,
    }),
    [selected, setSelected, isOpen, setOpenState, commitRange, formatRangeLabel, isDisabled, locale]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <FormFieldProvider value={formFieldContextValue}>
        <DateRangePickerProvider value={dateRangePickerContextValue}>
          <View ref={ref} className={rootClassName} {...restProps}>
            {children}
          </View>
        </DateRangePickerProvider>
      </FormFieldProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const DateRangePickerSelect = forwardRef(
  ({ isDisabled: isDisabledProp, ...props }: any, ref: any) => {
    const ctx = useDateRangePicker();
    return (
      <Select
        ref={ref}
        isDisabled={isDisabledProp ?? ctx.isDisabledRoot}
        isOpen={ctx.isOpen}
        onOpenChange={ctx.onOpenChange}
        onValueChange={ctx.onValueChange}
        value={ctx.value}
        {...props}
        selectionMode="single"
      />
    );
  }
);
// --------------------------------------------------
/**
 * `Select.Portal` renders into a host via the portal system, which breaks React context from
 * ancestors. Re-wrap `children` with `DateRangePickerProvider` so `DateRangePicker.Content` / `DateRangePicker.Calendar`
 * can still call `useDateRangePicker()` when portaled.
 */
function DateRangePickerPortal(props) {
  const { children, ...rest } = props;
  const ctx = useDateRangePicker();
  return (
    <Select.Portal {...rest}>
      <DateRangePickerProvider value={ctx}>{children}</DateRangePickerProvider>
    </Select.Portal>
  );
}
// --------------------------------------------------
const DateRangePickerOverlay = forwardRef(({ className, ...props }: any, ref: any) => {
  const overlayClassName = dateRangePickerClassNames.overlay({
    className,
  });
  return <Select.Overlay ref={ref} className={overlayClassName} {...props} />;
});
// --------------------------------------------------
const DateRangePickerContent = forwardRef((props: any, ref: any) => {
  return <Select.Content ref={ref} {...props} />;
});
// --------------------------------------------------
const DateRangePickerCalendar = forwardRef(
  (
    {
      value: valueProp,
      onChange: onChangeProp,
      accessibilityLabel = 'Pick a date range',
      locale: localeFromCalendarProps,
      ...rest
    }: any,
    ref: any
  ) => {
    const ctx = useDateRangePicker();
    const derivedRange =
      ctx.value?.value !== undefined
        ? tryParseDateRangeFromSelectValue(ctx.value.value)
        : undefined;
    const value =
      valueProp !== undefined ? valueProp : derivedRange !== undefined ? derivedRange : null;
    const handleChange = (next) => {
      onChangeProp?.(next);
      if (next !== null) {
        ctx.commitRange({
          start: toCalendarDate(next.start),
          end: toCalendarDate(next.end),
        });
      }
    };
    const locale = localeFromCalendarProps ?? ctx.locale;
    return (
      <RangeCalendar
        ref={ref}
        accessibilityLabel={accessibilityLabel}
        locale={locale}
        value={value ?? null}
        onChange={handleChange}
        {...rest}
      />
    );
  }
);
// --------------------------------------------------
const DateRangePickerTrigger = forwardRef(
  (
    { className, isInvalid: localIsInvalid, isDisabled: isDisabledProp, ...props }: any,
    ref: any
  ) => {
    const formField = useFormField();
    const isInvalid =
      localIsInvalid !== undefined ? localIsInvalid : (formField?.isInvalid ?? false);
    const triggerClassName = cn(
      dateRangePickerClassNames.trigger({
        isInvalid,
      }),
      className
    );
    return (
      <Select.Trigger
        ref={ref}
        className={triggerClassName}
        isDisabled={isDisabledProp}
        {...props}
        variant="default"
      />
    );
  }
);
// --------------------------------------------------
const DateRangePickerValue = forwardRef(
  ({ placeholder = 'Choose a date range', ...props }: any, ref: any) => {
    return <Select.Value ref={ref} placeholder={placeholder} {...props} />;
  }
);
// --------------------------------------------------
const DateRangePickerTriggerIndicator = forwardRef(
  (
    {
      children,
      iconProps,
      animation = false,
      isAnimatedStyleActive = false,
      style,
      ...restProps
    }: any,
    ref: any
  ) => {
    const themeColorMuted = useThemeColor('muted');
    return (
      <Select.TriggerIndicator
        ref={ref}
        iconProps={iconProps}
        animation={animation}
        isAnimatedStyleActive={isAnimatedStyleActive}
        style={style}
        {...restProps}
      >
        {children ?? (
          <CalendarIcon color={iconProps?.color ?? themeColorMuted} size={iconProps?.size ?? 16} />
        )}
      </Select.TriggerIndicator>
    );
  }
);
// --------------------------------------------------
DateRangePickerRoot.displayName = DISPLAY_NAME.ROOT;
DateRangePickerSelect.displayName = DISPLAY_NAME.SELECT;
DateRangePickerPortal.displayName = DISPLAY_NAME.PORTAL;
DateRangePickerOverlay.displayName = DISPLAY_NAME.OVERLAY;
DateRangePickerContent.displayName = DISPLAY_NAME.CONTENT;
DateRangePickerCalendar.displayName = DISPLAY_NAME.CALENDAR;
DateRangePickerTrigger.displayName = DISPLAY_NAME.TRIGGER;
DateRangePickerValue.displayName = DISPLAY_NAME.VALUE;
DateRangePickerTriggerIndicator.displayName = DISPLAY_NAME.TRIGGER_INDICATOR;
/**
 * DateRangePicker — field shell with optional managed state for `DateRangePicker.Select` + `DateRangePicker.Calendar`.
 *
 * For managed behavior, pass `value` / `onValueChange` / `isOpen` / `onOpenChange` on the root (or use
 * uncontrolled defaults) and use **`DateRangePicker.Select`** with **`DateRangePicker.Portal`**, **`DateRangePicker.Content`**,
 * and **`DateRangePicker.Calendar`** (range selection: two taps). Use a raw **`Select`** only if you omit root state props and wire
 * everything manually.
 */
const DateRangePicker = Object.assign(DateRangePickerRoot, {
  Select: DateRangePickerSelect,
  Portal: DateRangePickerPortal,
  Overlay: DateRangePickerOverlay,
  Content: DateRangePickerContent,
  Calendar: DateRangePickerCalendar,
  Trigger: DateRangePickerTrigger,
  Value: DateRangePickerValue,
  TriggerIndicator: DateRangePickerTriggerIndicator,
});
export default DateRangePicker;
