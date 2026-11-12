import { forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { AnimationSettingsProvider, FormFieldProvider, useFormField } from 'heroui-native/contexts';
import { useThemeColor } from 'heroui-native/hooks';
import { Select } from 'heroui-native/select';
import { cn } from 'heroui-native/utils';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { CalendarIcon } from '../../helpers/internal/icons/index';
import InternationalizedDatePackage from '../../optional/internationalized-date';
import { Calendar } from '../calendar/index';
import { useDatePickerRootAnimation } from './date-picker.animation';
import { DISPLAY_NAME } from './date-picker.constants';
import { DatePickerProvider, useDatePicker } from './date-picker.context';
import { datePickerClassNames } from './date-picker.styles';
import { formatCalendarDateForDisplay, tryParseDatePickerValueString } from './date-picker.utils';
const { toCalendarDate } = InternationalizedDatePackage ?? {};
// --------------------------------------------------
const DatePickerRoot = forwardRef((props: any, ref: any) => {
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
    formatDate,
    ...restProps
  } = props;
  const rootClassName = datePickerClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useDatePickerRootAnimation({
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
  const formatLabel = useCallback(
    (date) =>
      formatCalendarDateForDisplay(date, {
        dateDisplayFormat,
        locale,
        formatDate,
      }),
    [dateDisplayFormat, locale, formatDate]
  );
  const commitDate = useCallback(
    (date) => {
      const label = formatLabel(date);
      setSelected({
        value: date.toString(),
        label,
      });
      setOpenState(false);
    },
    [formatLabel, setSelected, setOpenState]
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
  const datePickerContextValue = useMemo(
    () => ({
      value: selected,
      onValueChange: setSelected,
      isOpen,
      onOpenChange: setOpenState,
      commitDate,
      formatLabel,
      isDisabledRoot: isDisabled,
      locale,
    }),
    [selected, setSelected, isOpen, setOpenState, commitDate, formatLabel, isDisabled, locale]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <FormFieldProvider value={formFieldContextValue}>
        <DatePickerProvider value={datePickerContextValue}>
          <View ref={ref} className={rootClassName} {...restProps}>
            {children}
          </View>
        </DatePickerProvider>
      </FormFieldProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const DatePickerSelect = forwardRef(({ isDisabled: isDisabledProp, ...props }: any, ref: any) => {
  const ctx = useDatePicker();
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
});
// --------------------------------------------------
/**
 * `Select.Portal` renders into a host via the portal system, which breaks React context from
 * ancestors. Re-wrap `children` with `DatePickerProvider` so `DatePicker.Content` / `DatePicker.Calendar`
 * can still call `useDatePicker()` when portaled.
 */
function DatePickerPortal(props) {
  const { children, ...rest } = props;
  const ctx = useDatePicker();
  return (
    <Select.Portal {...rest}>
      <DatePickerProvider value={ctx}>{children}</DatePickerProvider>
    </Select.Portal>
  );
}
// --------------------------------------------------
const DatePickerOverlay = forwardRef(({ className, ...props }: any, ref: any) => {
  const overlayClassName = datePickerClassNames.overlay({
    className,
  });
  return <Select.Overlay ref={ref} className={overlayClassName} {...props} />;
});
// --------------------------------------------------
const DatePickerContent = forwardRef((props: any, ref: any) => {
  return <Select.Content ref={ref} {...props} />;
});
// --------------------------------------------------
const DatePickerCalendar = forwardRef(
  (
    {
      value: valueProp,
      onChange: onChangeProp,
      accessibilityLabel = 'Pick a date',
      locale: localeFromCalendarProps,
      ...rest
    }: any,
    ref: any
  ) => {
    const ctx = useDatePicker();
    const derivedValue =
      ctx.value?.value !== undefined ? tryParseDatePickerValueString(ctx.value.value) : undefined;
    const value = valueProp !== undefined ? valueProp : derivedValue;
    const handleChange = (date) => {
      onChangeProp?.(date);
      ctx.commitDate(toCalendarDate(date));
    };
    const locale = localeFromCalendarProps ?? ctx.locale;
    return (
      <Calendar
        ref={ref}
        accessibilityLabel={accessibilityLabel}
        locale={locale}
        value={value}
        onChange={handleChange}
        {...rest}
      />
    );
  }
);
// --------------------------------------------------
const DatePickerTrigger = forwardRef(
  (
    { className, isInvalid: localIsInvalid, isDisabled: isDisabledProp, ...props }: any,
    ref: any
  ) => {
    const formField = useFormField();
    const isInvalid =
      localIsInvalid !== undefined ? localIsInvalid : (formField?.isInvalid ?? false);
    const triggerClassName = cn(
      datePickerClassNames.trigger({
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
const DatePickerValue = forwardRef(({ placeholder = 'Choose a date', ...props }: any, ref: any) => {
  return <Select.Value ref={ref} placeholder={placeholder} {...props} />;
});
// --------------------------------------------------
const DatePickerTriggerIndicator = forwardRef(
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
DatePickerRoot.displayName = DISPLAY_NAME.ROOT;
DatePickerSelect.displayName = DISPLAY_NAME.SELECT;
DatePickerPortal.displayName = DISPLAY_NAME.PORTAL;
DatePickerOverlay.displayName = DISPLAY_NAME.OVERLAY;
DatePickerContent.displayName = DISPLAY_NAME.CONTENT;
DatePickerCalendar.displayName = DISPLAY_NAME.CALENDAR;
DatePickerTrigger.displayName = DISPLAY_NAME.TRIGGER;
DatePickerValue.displayName = DISPLAY_NAME.VALUE;
DatePickerTriggerIndicator.displayName = DISPLAY_NAME.TRIGGER_INDICATOR;
/**
 * DatePicker — field shell with optional managed state for `DatePicker.Select` + `DatePicker.Calendar`.
 *
 * For managed behavior, pass `value` / `onValueChange` / `isOpen` / `onOpenChange` on the root (or use
 * uncontrolled defaults) and use **`DatePicker.Select`** with **`DatePicker.Portal`**, **`DatePicker.Content`**,
 * and **`DatePicker.Calendar`**. Use a raw **`Select`** only if you omit root state props and wire
 * everything manually.
 */
const DatePicker = Object.assign(DatePickerRoot, {
  Select: DatePickerSelect,
  Portal: DatePickerPortal,
  Overlay: DatePickerOverlay,
  Content: DatePickerContent,
  Calendar: DatePickerCalendar,
  Trigger: DatePickerTrigger,
  Value: DatePickerValue,
  TriggerIndicator: DatePickerTriggerIndicator,
});
export default DatePicker;
