import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  type ReactElement,
  useMemo,
} from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { useThemeColor } from 'heroui-native/hooks';
import { AnimatedCheckIcon } from '../../helpers/internal/components/index';
import * as StepperPrimitives from '../../primitives/stepper/index';
import {
  StepperAnimationProvider,
  useStepperAnimation,
  useStepperRootAnimation,
  useStepperSeparatorFillAnimation,
} from './stepper.animation';
import { DISPLAY_NAME } from './stepper.constants';
import { stepperClassNames } from './stepper.styles';
const useStepper = StepperPrimitives.useRootContext;
const useStepperStep = StepperPrimitives.useStepContext;
// --------------------------------------------------
/**
 * Subtree inside primitive Root: reads `currentStep` from context and provides
 * animation settings plus step progress shared value to descendants.
 */
function StepperRootInner(props) {
  const { animation, children } = props;
  const { currentStep } = useStepper();
  const { progress, isAllAnimationsDisabled } = useStepperRootAnimation({
    animation,
    currentStep,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const stepperAnimationContextValue = useMemo(
    () => ({
      progress,
    }),
    [progress]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <StepperAnimationProvider value={stepperAnimationContextValue}>
        {children}
      </StepperAnimationProvider>
    </AnimationSettingsProvider>
  );
}
// --------------------------------------------------
const StepperRoot = forwardRef((props: any, ref: any) => {
  const { animation, children, className, orientation = 'vertical', ...restProps } = props;
  const enhancedChildren = useMemo(() => {
    const childArray = Children.toArray(children);
    const stepElements = childArray.filter(
      (child) => isValidElement(child) && child.type === StepperStep
    );
    const totalSteps = stepElements.length;
    let stepCounter = 0;
    return childArray.map((child) => {
      if (isValidElement(child) && child.type === StepperStep) {
        const idx = stepCounter;
        stepCounter += 1;
        return cloneElement(child as ReactElement<any>, {
          _index: idx,
          _isLast: idx === totalSteps - 1,
          key: child.key ?? `stepper-step-${idx}`,
        });
      }
      return child;
    });
  }, [children]);
  const rootClassName = stepperClassNames.root({
    className,
  });
  return (
    <StepperPrimitives.Root
      ref={ref}
      className={rootClassName}
      orientation={orientation}
      skipInjectStepIndices
      {...restProps}
    >
      <StepperRootInner animation={animation}>{enhancedChildren}</StepperRootInner>
    </StepperPrimitives.Root>
  );
});
// --------------------------------------------------
const StepperStep = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const stepClassName = stepperClassNames.step({
    className,
  });
  return (
    <StepperPrimitives.Step ref={ref} className={stepClassName} {...restProps}>
      {children}
    </StepperPrimitives.Step>
  );
});
// --------------------------------------------------
const StepperIndicatorCheck = forwardRef((props: any, ref: any) => {
  const {
    className,
    color,
    enterDuration = 200,
    exitDuration = 0,
    size = 16,
    strokeWidth,
    ...restProps
  } = props;
  const { status } = useStepperStep();
  const themeColorAccentForeground = useThemeColor('accent-foreground');
  const checkClassName = stepperClassNames.indicatorCheck({
    className,
  });
  return (
    <View ref={ref} className={checkClassName} {...restProps}>
      <AnimatedCheckIcon
        color={color ?? themeColorAccentForeground}
        enterDuration={enterDuration}
        exitDuration={exitDuration}
        isSelected={status === 'complete'}
        size={size}
        strokeWidth={strokeWidth}
      />
    </View>
  );
});
// --------------------------------------------------
const StepperIndicatorNumber = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const { index, status } = useStepperStep();
  const numberClassName = stepperClassNames.indicatorNumber({
    className,
  });
  const resolvedChildren =
    children === undefined
      ? String(index + 1)
      : typeof children === 'function'
        ? children(index)
        : children;
  return (
    <StepperPrimitives.Title
      ref={ref}
      className={numberClassName}
      data-status={status}
      {...restProps}
    >
      {resolvedChildren}
    </StepperPrimitives.Title>
  );
});
// --------------------------------------------------
const StepperIndicator = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const { status } = useStepperStep();
  const indicatorClassName = stepperClassNames.indicator({
    className,
  });
  return (
    <StepperPrimitives.Indicator ref={ref} className={indicatorClassName} {...restProps}>
      {children ?? (
        <View className="items-center justify-center">
          <StepperIndicatorCheck />
          {status !== 'complete' && (
            <View className="absolute">
              <StepperIndicatorNumber />
            </View>
          )}
        </View>
      )}
    </StepperPrimitives.Indicator>
  );
});
// --------------------------------------------------
const StepperSeparatorTrack = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const trackClassName = stepperClassNames.separatorTrack({
    className,
  });
  return (
    <View
      ref={ref}
      accessibilityElementsHidden
      className={trackClassName}
      importantForAccessibility="no-hide-descendants"
      {...restProps}
    />
  );
});
// --------------------------------------------------
const StepperSeparatorFill = forwardRef((props: any, ref: any) => {
  const { animation, className, isAnimatedStyleActive = true, style, ...restProps } = props;
  const { index } = useStepperStep();
  const { orientation } = useStepper();
  const { progress } = useStepperAnimation();
  const { animatedStyle } = useStepperSeparatorFillAnimation({
    animation,
    index,
    orientation,
    progress,
  });
  const fillClassName = stepperClassNames.separatorFill({
    className,
  });
  const styleValue = isAnimatedStyleActive ? [animatedStyle, style] : style;
  return (
    <Animated.View
      ref={ref}
      accessibilityElementsHidden
      className={fillClassName}
      importantForAccessibility="no-hide-descendants"
      style={styleValue}
      {...restProps}
    />
  );
});
// --------------------------------------------------
const StepperSeparator = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const separatorClassName = stepperClassNames.separator({
    className,
  });
  return (
    <StepperPrimitives.Separator ref={ref} className={separatorClassName} {...restProps}>
      {children ?? (
        <Fragment>
          <StepperSeparatorTrack />
          <StepperSeparatorFill />
        </Fragment>
      )}
    </StepperPrimitives.Separator>
  );
});
// --------------------------------------------------
const StepperRail = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const { index } = useStepperStep();
  const hasExplicitChildren = Children.count(children) > 0;
  const railChildren = hasExplicitChildren ? (
    children
  ) : (
    <Fragment>
      <StepperIndicator />
      {index > 0 ? <StepperSeparator /> : null}
    </Fragment>
  );
  return (
    <StepperPrimitives.Rail ref={ref} className={className} {...restProps}>
      {railChildren}
    </StepperPrimitives.Rail>
  );
});
// --------------------------------------------------
const StepperContent = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const contentClassName = stepperClassNames.content({
    className,
  });
  return (
    <StepperPrimitives.Content ref={ref} className={contentClassName} {...restProps}>
      {children}
    </StepperPrimitives.Content>
  );
});
// --------------------------------------------------
const StepperTitle = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const titleClassName = stepperClassNames.title({
    className,
  });
  return (
    <StepperPrimitives.Title ref={ref} className={titleClassName} {...restProps}>
      {children}
    </StepperPrimitives.Title>
  );
});
// --------------------------------------------------
const StepperDescription = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const descriptionClassName = stepperClassNames.description({
    className,
  });
  return (
    <StepperPrimitives.Description ref={ref} className={descriptionClassName} {...restProps}>
      {children}
    </StepperPrimitives.Description>
  );
});
// --------------------------------------------------
StepperRoot.displayName = DISPLAY_NAME.ROOT;
StepperStep.displayName = DISPLAY_NAME.STEP;
StepperRail.displayName = DISPLAY_NAME.RAIL;
StepperIndicator.displayName = DISPLAY_NAME.INDICATOR;
StepperIndicatorCheck.displayName = DISPLAY_NAME.INDICATOR_CHECK;
StepperIndicatorNumber.displayName = DISPLAY_NAME.INDICATOR_NUMBER;
StepperSeparator.displayName = DISPLAY_NAME.SEPARATOR;
StepperSeparatorTrack.displayName = DISPLAY_NAME.SEPARATOR_TRACK;
StepperSeparatorFill.displayName = DISPLAY_NAME.SEPARATOR_FILL;
StepperContent.displayName = DISPLAY_NAME.CONTENT;
StepperTitle.displayName = DISPLAY_NAME.TITLE;
StepperDescription.displayName = DISPLAY_NAME.DESCRIPTION;
// --------------------------------------------------
const Stepper = Object.assign(StepperRoot, {
  Step: StepperStep,
  Rail: StepperRail,
  Indicator: StepperIndicator,
  IndicatorCheck: StepperIndicatorCheck,
  IndicatorNumber: StepperIndicatorNumber,
  Separator: StepperSeparator,
  SeparatorTrack: StepperSeparatorTrack,
  SeparatorFill: StepperSeparatorFill,
  Content: StepperContent,
  Title: StepperTitle,
  Description: StepperDescription,
});
export default Stepper;
export { useStepper, useStepperAnimation, useStepperStep };
