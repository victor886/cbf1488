import { forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { AnimationSettingsProvider, FormFieldProvider, useFormField } from 'heroui-native/contexts';
import { useThemeColor } from 'heroui-native/hooks';
import { Select } from 'heroui-native/select';
import { cn } from 'heroui-native/utils';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { ClockIcon } from '../../helpers/internal/icons/index';
import { WheelTimePicker } from '../wheel-time-picker/index';
import { useTimePickerRootAnimation } from './time-picker.animation';
import {
  DEFAULT_HOUR_FORMAT,
  DEFAULT_MINUTE_INTERVAL,
  DEFAULT_TIME_DISPLAY_FORMAT,
  DISPLAY_NAME,
} from './time-picker.constants';
import { TimePickerProvider, useTimePicker } from './time-picker.context';
import { timePickerClassNames } from './time-picker.styles';
import { formatTimeForDisplay, tryParseTimePickerValueString } from './time-picker.utils';
const TimePickerRoot = forwardRef((props: any, ref: any) => {
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
    hourFormat = DEFAULT_HOUR_FORMAT,
    minuteInterval = DEFAULT_MINUTE_INTERVAL,
    timeDisplayFormat = DEFAULT_TIME_DISPLAY_FORMAT,
    locale,
    formatTime,
    ...restProps
  } = props;
  const rootClassName = timePickerClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useTimePickerRootAnimation({
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
    (time) =>
      formatTimeForDisplay(time, {
        timeDisplayFormat,
        hourFormat,
        locale,
        formatTime,
      }),
    [timeDisplayFormat, hourFormat, locale, formatTime]
  );
  const commitTime = useCallback(
    (time, options) => {
      const label = formatLabel(time);
      setSelected({
        value: time.toString(),
        label,
      });
      if (options?.close !== false) {
        setOpenState(false);
      }
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
  const timePickerContextValue = useMemo(
    () => ({
      value: selected,
      onValueChange: setSelected,
      isOpen,
      onOpenChange: setOpenState,
      commitTime,
      formatLabel,
      hourFormat,
      minuteInterval,
      locale,
      isDisabledRoot: isDisabled,
    }),
    [
      selected,
      setSelected,
      isOpen,
      setOpenState,
      commitTime,
      formatLabel,
      hourFormat,
      minuteInterval,
      locale,
      isDisabled,
    ]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <FormFieldProvider value={formFieldContextValue}>
        <TimePickerProvider value={timePickerContextValue}>
          <View ref={ref} className={rootClassName} {...restProps}>
            {children}
          </View>
        </TimePickerProvider>
      </FormFieldProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const TimePickerSelect = forwardRef(({ isDisabled: isDisabledProp, ...props }: any, ref: any) => {
  const ctx = useTimePicker();
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
 * ancestors. Re-wrap `children` with `TimePickerProvider` so `TimePicker.Content` / `TimePicker.Wheel`
 * can still call `useTimePicker()` when portaled.
 */
function TimePickerPortal(props) {
  const { children, ...rest } = props;
  const ctx = useTimePicker();
  return (
    <Select.Portal {...rest}>
      <TimePickerProvider value={ctx}>{children}</TimePickerProvider>
    </Select.Portal>
  );
}
// --------------------------------------------------
const TimePickerOverlay = forwardRef(({ className, ...props }: any, ref: any) => {
  const overlayClassName = timePickerClassNames.overlay({
    className,
  });
  return <Select.Overlay ref={ref} className={overlayClassName} {...props} />;
});
// --------------------------------------------------
const TimePickerContent = forwardRef((props: any, ref: any) => {
  if (props.presentation === 'dialog') {
    // Force dialog swipe-to-dismiss off (the prop is omitted from the public API).
    return <Select.Content ref={ref} {...props} isSwipeable={false} />;
  }
  if (props.presentation === 'bottom-sheet') {
    return (
      <Select.Content
        ref={ref}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={false}
        handleComponent={() => null}
        {...props}
      />
    );
  }
  return <Select.Content ref={ref} {...props} />;
});
// --------------------------------------------------
const TimePickerTrigger = forwardRef(
  (
    { className, isInvalid: localIsInvalid, isDisabled: isDisabledProp, ...props }: any,
    ref: any
  ) => {
    const formField = useFormField();
    const isInvalid =
      localIsInvalid !== undefined ? localIsInvalid : (formField?.isInvalid ?? false);
    const triggerClassName = cn(
      timePickerClassNames.trigger({
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
const TimePickerValue = forwardRef(({ placeholder = 'Choose a time', ...props }: any, ref: any) => {
  return <Select.Value ref={ref} placeholder={placeholder} {...props} />;
});
// --------------------------------------------------
const TimePickerTriggerIndicator = forwardRef(
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
          <ClockIcon color={iconProps?.color ?? themeColorMuted} size={iconProps?.size ?? 16} />
        )}
      </Select.TriggerIndicator>
    );
  }
);
// --------------------------------------------------
const TimePickerWheel = forwardRef(
  (
    {
      children,
      className,
      hourFormat: hourFormatProp,
      minuteInterval: minuteIntervalProp,
      locale: localeProp,
      ...rest
    }: any,
    ref: any
  ) => {
    const ctx = useTimePicker();
    const derivedValue =
      ctx.value?.value !== undefined ? tryParseTimePickerValueString(ctx.value.value) : undefined;
    const handleValueChange = (time) => {
      ctx.commitTime(time, {
        close: false,
      });
    };
    const resolvedHourFormat = hourFormatProp ?? ctx.hourFormat;
    return (
      <WheelTimePicker
        ref={ref}
        value={derivedValue}
        onValueChange={handleValueChange}
        hourFormat={resolvedHourFormat}
        minuteInterval={minuteIntervalProp ?? ctx.minuteInterval}
        locale={localeProp ?? ctx.locale}
        className={timePickerClassNames.wheel({
          className,
        })}
        {...rest}
      >
        {children ?? (
          <>
            <TimePickerWheelHour />
            <TimePickerWheelMinute />
            {resolvedHourFormat === 12 ? <TimePickerWheelPeriod /> : null}
            <TimePickerWheelIndicator />
            <TimePickerWheelMask />
          </>
        )}
      </WheelTimePicker>
    );
  }
);
// --------------------------------------------------
const TimePickerWheelHour = forwardRef((props: any, ref: any) => {
  return <WheelTimePicker.Hour ref={ref} {...props} />;
});
// --------------------------------------------------
const TimePickerWheelMinute = forwardRef((props: any, ref: any) => {
  return <WheelTimePicker.Minute ref={ref} {...props} />;
});
// --------------------------------------------------
const TimePickerWheelPeriod = forwardRef((props: any, ref: any) => {
  return <WheelTimePicker.Period ref={ref} {...props} />;
});
// --------------------------------------------------
const TimePickerWheelIndicator = forwardRef((props: any, ref: any) => {
  return <WheelTimePicker.Indicator ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Mask wrapper that defaults the gradient `color` to the Select `overlay`
 * surface so the fade blends with the popover / dialog / bottom-sheet
 * background instead of the screen background.
 */
const TimePickerWheelMask = forwardRef(({ color, ...props }: any, ref: any) => {
  const overlayColor = useThemeColor('overlay');
  return <WheelTimePicker.Mask ref={ref} color={color ?? overlayColor} {...props} />;
});
// --------------------------------------------------
TimePickerRoot.displayName = DISPLAY_NAME.ROOT;
TimePickerSelect.displayName = DISPLAY_NAME.SELECT;
TimePickerPortal.displayName = DISPLAY_NAME.PORTAL;
TimePickerOverlay.displayName = DISPLAY_NAME.OVERLAY;
TimePickerContent.displayName = DISPLAY_NAME.CONTENT;
TimePickerTrigger.displayName = DISPLAY_NAME.TRIGGER;
TimePickerValue.displayName = DISPLAY_NAME.VALUE;
TimePickerTriggerIndicator.displayName = DISPLAY_NAME.TRIGGER_INDICATOR;
TimePickerWheel.displayName = DISPLAY_NAME.WHEEL;
TimePickerWheelHour.displayName = DISPLAY_NAME.WHEEL_HOUR;
TimePickerWheelMinute.displayName = DISPLAY_NAME.WHEEL_MINUTE;
TimePickerWheelPeriod.displayName = DISPLAY_NAME.WHEEL_PERIOD;
TimePickerWheelIndicator.displayName = DISPLAY_NAME.WHEEL_INDICATOR;
TimePickerWheelMask.displayName = DISPLAY_NAME.WHEEL_MASK;
/**
 * TimePicker — field shell with optional managed state for `TimePicker.Select` + `TimePicker.Wheel`.
 *
 * For managed behavior, pass `value` / `onValueChange` / `isOpen` / `onOpenChange` on the root (or use
 * uncontrolled defaults) and use **`TimePicker.Select`** with **`TimePicker.Portal`**, **`TimePicker.Content`**,
 * and **`TimePicker.Wheel`**. Use a raw **`Select`** only if you omit root state props and wire
 * everything manually.
 *
 * @component TimePicker - Field shell owning selection, open state, and commit behavior.
 * @component TimePicker.Select - Wires `Select` (single mode) to the root state.
 * @component TimePicker.Portal - Portals content and re-provides `TimePicker` context.
 * @component TimePicker.Overlay - Backdrop behind portaled content.
 * @component TimePicker.Content - Presentation surface (popover / dialog / bottom-sheet).
 * @component TimePicker.Trigger - Trigger surface with invalid border styling.
 * @component TimePicker.Value - Selected label / placeholder.
 * @component TimePicker.TriggerIndicator - Trailing clock icon.
 * @component TimePicker.Wheel - Wheel time selector wired to commit on scroll; renders the default
 * wheel parts when no children are passed.
 * @component TimePicker.WheelHour - Hour column (`WheelTimePicker.Hour`).
 * @component TimePicker.WheelMinute - Minute column (`WheelTimePicker.Minute`).
 * @component TimePicker.WheelPeriod - AM/PM column (`WheelTimePicker.Period`).
 * @component TimePicker.WheelIndicator - Shared selection band (`WheelTimePicker.Indicator`).
 * @component TimePicker.WheelMask - Fade overlays with an overlay-surface-aware default color.
 */
const TimePicker = Object.assign(TimePickerRoot, {
  Select: TimePickerSelect,
  Portal: TimePickerPortal,
  Overlay: TimePickerOverlay,
  Content: TimePickerContent,
  Trigger: TimePickerTrigger,
  Value: TimePickerValue,
  TriggerIndicator: TimePickerTriggerIndicator,
  Wheel: TimePickerWheel,
  WheelHour: TimePickerWheelHour,
  WheelMinute: TimePickerWheelMinute,
  WheelPeriod: TimePickerWheelPeriod,
  WheelIndicator: TimePickerWheelIndicator,
  WheelMask: TimePickerWheelMask,
});
export default TimePicker;
