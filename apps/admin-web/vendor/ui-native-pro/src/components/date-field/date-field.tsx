import { forwardRef, useCallback, useMemo } from 'react';
import { Keyboard, View } from 'react-native';
import { AnimationSettingsProvider, FormFieldProvider } from 'heroui-native/contexts';
import { useThemeColor } from 'heroui-native/hooks';
import { InputGroup } from 'heroui-native/input-group';
import { Select } from 'heroui-native/select';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { CalendarIcon } from '../../helpers/internal/icons/index';
import InternationalizedDatePackage from '../../optional/internationalized-date';
import { Calendar } from '../calendar/index';
import { DatePickerProvider, useDatePicker } from '../date-picker/date-picker.context';
import { tryParseDatePickerValueString } from '../date-picker/date-picker.utils';
import { useDateFieldRootAnimation } from './date-field.animation';
import { DISPLAY_NAME } from './date-field.constants';
import { DateFieldInputProvider, useDateField } from './date-field.context';
import { dateFieldClassNames } from './date-field.styles';
import { formatCalendarDateDdMmYyyy } from './date-field.utils';
const { toCalendarDate } = InternationalizedDatePackage ?? {};
// --------------------------------------------------
const DateFieldRoot = forwardRef((props: any, ref: any) => {
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
    locale,
    inputMode = 'masked',
    ...restProps
  } = props;
  const rootClassName = dateFieldClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useDateFieldRootAnimation({
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
  const formatLabel = useCallback((date) => formatCalendarDateDdMmYyyy(date), []);
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
          <DateFieldInputProvider inputMode={inputMode}>
            <View ref={ref} className={rootClassName} {...restProps}>
              {children}
            </View>
          </DateFieldInputProvider>
        </DatePickerProvider>
      </FormFieldProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const DateFieldSelect = forwardRef(({ isDisabled: isDisabledProp, ...props }: any, ref: any) => {
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
 * `Select.Portal` breaks ancestor context; re-wrap with `DatePickerProvider` so portaled
 * `DateField.Content` / `DateField.Calendar` still resolve `useDatePicker()`.
 */
function DateFieldPortal(props) {
  const { children, ...rest } = props;
  const ctx = useDatePicker();
  return (
    <Select.Portal {...rest}>
      <DatePickerProvider value={ctx}>{children}</DatePickerProvider>
    </Select.Portal>
  );
}
// --------------------------------------------------
const DateFieldOverlay = forwardRef(({ className, ...props }: any, ref: any) => {
  const overlayClassName = dateFieldClassNames.overlay({
    className,
  });
  return <Select.Overlay ref={ref} className={overlayClassName} {...props} />;
});
// --------------------------------------------------
const DateFieldContent = forwardRef((props: any, ref: any) => {
  return <Select.Content ref={ref} {...props} />;
});
// --------------------------------------------------
const DateFieldCalendar = forwardRef(
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
      /**
       * The underlying calendar primitive can emit a nullish value when the
       * controlled `value` transitions back to `undefined` (e.g. the user
       * clears `DateField.Input` and blurs). Guard against that so we don't
       * call `toCalendarDate(undefined)` and crash with
       * "Cannot read property 'calendar' of undefined".
       */
      if (date === null || date === undefined) {
        return;
      }
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
const DateFieldTrigger = forwardRef(({ onPress: onPressProp, ...props }: any, ref: any) => {
  const handlePress = useCallback(
    (event) => {
      Keyboard.dismiss();
      onPressProp?.(event);
    },
    [onPressProp]
  );
  return <Select.Trigger ref={ref} onPress={handlePress} {...props} variant="unstyled" />;
});
// --------------------------------------------------
const DateFieldTriggerIndicator = forwardRef(
  (
    {
      children,
      iconProps,
      animation = false,
      isAnimatedStyleActive = false,
      className,
      ...restProps
    }: any,
    ref: any
  ) => {
    const themeColorMuted = useThemeColor('muted');
    const triggerIndicatorClassName = dateFieldClassNames.triggerIndicator({
      className,
    });
    return (
      <Select.TriggerIndicator
        ref={ref}
        className={triggerIndicatorClassName}
        iconProps={iconProps}
        animation={animation}
        isAnimatedStyleActive={isAnimatedStyleActive}
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
const DateFieldInputGroupRoot = forwardRef((props: any, ref: any) => {
  return <InputGroup ref={ref} {...props} />;
});
const DateFieldSuffix = forwardRef((props: any, ref: any) => {
  return <InputGroup.Suffix ref={ref} {...props} />;
});
const DateFieldInput = forwardRef((props: any, ref: any) => {
  const {
    onBlur: onBlurProp,
    onChangeText: onChangeTextProp,
    placeholder = 'dd/mm/yyyy',
    inputMode = 'numeric',
    isDisabled: isDisabledProp,
    maxLength: maxLengthProp,
    ...restProps
  } = props;
  const fieldInput = useDateField();
  const { isDisabledRoot } = useDatePicker();
  const isDisabled = isDisabledProp !== undefined ? isDisabledProp : isDisabledRoot;
  const maxLength = fieldInput.inputMode === 'masked' ? 10 : maxLengthProp;
  return (
    <InputGroup.Input
      ref={ref}
      placeholder={placeholder}
      value={fieldInput.inputText}
      isDisabled={isDisabled}
      onChangeText={(text) => {
        fieldInput.onInputChangeText(text);
        onChangeTextProp?.(text);
      }}
      onBlur={(e) => {
        fieldInput.onInputBlur();
        onBlurProp?.(e);
      }}
      inputMode={inputMode}
      {...restProps}
      maxLength={maxLength}
    />
  );
});
const DateFieldPrefix = forwardRef((props: any, ref: any) => {
  return <InputGroup.Prefix ref={ref} {...props} />;
});
// --------------------------------------------------
DateFieldPortal.displayName = DISPLAY_NAME.PORTAL;
DateFieldRoot.displayName = DISPLAY_NAME.ROOT;
DateFieldSelect.displayName = DISPLAY_NAME.SELECT;
DateFieldOverlay.displayName = DISPLAY_NAME.OVERLAY;
DateFieldContent.displayName = DISPLAY_NAME.CONTENT;
DateFieldCalendar.displayName = DISPLAY_NAME.CALENDAR;
DateFieldTrigger.displayName = DISPLAY_NAME.TRIGGER;
DateFieldTriggerIndicator.displayName = DISPLAY_NAME.TRIGGER_INDICATOR;
DateFieldInputGroupRoot.displayName = DISPLAY_NAME.INPUT_GROUP;
DateFieldPrefix.displayName = DISPLAY_NAME.PREFIX;
DateFieldInput.displayName = DISPLAY_NAME.INPUT;
DateFieldSuffix.displayName = DISPLAY_NAME.SUFFIX;
/**
 * Static parts attached to the root. We assign properties explicitly instead of only using
 * `Object.assign`: some Metro / Hermes bundles do not reliably retain every key on `forwardRef`
 * results, which surfaced as `DateField.Input` being `undefined` at runtime.
 */
type DateFieldStaticParts = {
  Select: typeof DateFieldSelect;
  Portal: typeof DateFieldPortal;
  Overlay: typeof DateFieldOverlay;
  Content: typeof DateFieldContent;
  Calendar: typeof DateFieldCalendar;
  Trigger: typeof DateFieldTrigger;
  TriggerIndicator: typeof DateFieldTriggerIndicator;
  InputGroup: typeof DateFieldInputGroupRoot;
  Prefix: typeof DateFieldPrefix;
  Input: typeof DateFieldInput;
  Suffix: typeof DateFieldSuffix;
};
const DateField = DateFieldRoot as typeof DateFieldRoot & DateFieldStaticParts;
DateField.Select = DateFieldSelect;
DateField.Portal = DateFieldPortal;
DateField.Overlay = DateFieldOverlay;
DateField.Content = DateFieldContent;
DateField.Calendar = DateFieldCalendar;
DateField.Trigger = DateFieldTrigger;
DateField.TriggerIndicator = DateFieldTriggerIndicator;
DateField.InputGroup = DateFieldInputGroupRoot;
DateField.Prefix = DateFieldPrefix;
DateField.Input = DateFieldInput;
DateField.Suffix = DateFieldSuffix;
/**
 * `DateField` — text field with `dd/mm/yyyy` input and `DateField.Select` + calendar surface.
 *
 * Compose **`DateField.InputGroup`** with **`DateField.Input`**, **`DateField.Prefix`** / **`DateField.Suffix`**,
 * and nest **`DateField.Select`** (with **`DateField.Trigger`**, **`DateField.Portal`**, **`DateField.Content`**,
 * **`DateField.Calendar`**) inside the suffix when the trigger opens the calendar from the trailing slot.
 */
export default DateField;
