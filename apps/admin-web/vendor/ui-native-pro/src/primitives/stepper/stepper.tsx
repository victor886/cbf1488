import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  type ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Pressable, Text, View } from 'react-native';
import { useControllableState } from '../../helpers/internal/hooks/index';
import * as Slot from '../slot/index';
import type { StepperRootContextValue, StepperStepContextValue } from './stepper.types';
// --------------------------------------------------
const StepperRootContext = createContext<StepperRootContextValue | null>(null);
const StepperStepContext = createContext<StepperStepContextValue | null>(null);
function useRootContext() {
  const ctx = useContext(StepperRootContext);
  if (!ctx) {
    throw new Error('Stepper primitive compound components must be used within Stepper.Root');
  }
  return ctx;
}
function useStepContext() {
  const ctx = useContext(StepperStepContext);
  if (!ctx) {
    throw new Error('Stepper primitive step subcomponents must be used within Stepper.Step');
  }
  return ctx;
}
// --------------------------------------------------
const Root = forwardRef(
  (
    {
      asChild,
      children,
      currentStep: currentStepProp,
      defaultStep = 0,
      onStepChange: onStepChangeProp,
      orientation = 'vertical',
      skipInjectStepIndices = false,
      ...viewProps
    }: any,
    ref: any
  ) => {
    const [currentStepState, setCurrentStepState] = useControllableState({
      prop: currentStepProp,
      defaultProp: defaultStep,
      onChange: onStepChangeProp,
    });
    const currentStep = currentStepState ?? 0;
    const [measurements, setMeasurements] = useState({});
    const setStepMeasurement = useCallback((index, partial) => {
      setMeasurements((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          ...partial,
        },
      }));
    }, []);
    const handleStepChange = useCallback(
      (step) => {
        setCurrentStepState(step);
      },
      [setCurrentStepState]
    );
    const contextValue = useMemo(
      () => ({
        currentStep,
        onStepChange: handleStepChange,
        orientation,
        measurements,
        setStepMeasurement,
      }),
      [currentStep, handleStepChange, orientation, measurements, setStepMeasurement]
    );
    const enhancedChildren = useMemo(() => {
      if (skipInjectStepIndices) {
        return children;
      }
      const childArray = Children.toArray(children);
      const stepElements = childArray.filter(
        (child) => isValidElement(child) && child.type === Step
      );
      const totalSteps = stepElements.length;
      let stepCounter = 0;
      return childArray.map((child) => {
        if (isValidElement(child) && child.type === Step) {
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
    }, [children, skipInjectStepIndices]);
    const Component = asChild ? Slot.View : View;
    return (
      <StepperRootContext.Provider value={contextValue}>
        <Component ref={ref} {...viewProps} data-orientation={orientation}>
          {enhancedChildren}
        </Component>
      </StepperRootContext.Provider>
    );
  }
);
Root.displayName = 'HeroUINative.Primitive.Stepper.Root';
// --------------------------------------------------
const Step = forwardRef(
  (
    {
      asChild,
      children,
      _index: injectedIndex = 0,
      _isLast: injectedIsLast = false,
      onLayout: onLayoutProp,
      onPress: onPressProp,
      ...restProps
    }: any,
    ref: any
  ) => {
    const { currentStep, onStepChange, orientation, setStepMeasurement } = useRootContext();
    const currentStepFloor = Math.floor(currentStep);
    const status: 'active' | 'complete' | 'inactive' =
      currentStepFloor === injectedIndex
        ? 'active'
        : currentStepFloor > injectedIndex
          ? 'complete'
          : 'inactive';
    const stepCtx = useMemo(
      () => ({
        index: injectedIndex,
        isLast: injectedIsLast,
        status,
      }),
      [injectedIndex, injectedIsLast, status]
    );
    const handleLayout = useCallback(
      (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        const layout = {
          x,
          y,
          width,
          height,
        };
        setStepMeasurement(injectedIndex, {
          step: layout,
        });
        onLayoutProp?.(event);
      },
      [injectedIndex, onLayoutProp, setStepMeasurement]
    );
    const handlePress = useCallback(
      (event) => {
        onStepChange(injectedIndex);
        onPressProp?.(event);
      },
      [injectedIndex, onStepChange, onPressProp]
    );
    const Component = asChild ? Slot.Pressable : Pressable;
    return (
      <StepperStepContext.Provider value={stepCtx}>
        <Component
          ref={ref}
          onLayout={handleLayout}
          onPress={handlePress}
          {...restProps}
          data-orientation={orientation}
        >
          {children}
        </Component>
      </StepperStepContext.Provider>
    );
  }
);
Step.displayName = 'HeroUINative.Primitive.Stepper.Step';
// --------------------------------------------------
const Rail = forwardRef(
  ({ asChild, children, onLayout: onLayoutProp, ...restProps }: any, ref: any) => {
    const { setStepMeasurement } = useRootContext();
    const { index } = useStepContext();
    const handleLayout = useCallback(
      (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        const layout = {
          x,
          y,
          width,
          height,
        };
        setStepMeasurement(index, {
          rail: layout,
        });
        onLayoutProp?.(event);
      },
      [index, onLayoutProp, setStepMeasurement]
    );
    const Component = asChild ? Slot.View : View;
    return (
      <Component ref={ref} onLayout={handleLayout} {...restProps}>
        {children}
      </Component>
    );
  }
);
Rail.displayName = 'HeroUINative.Primitive.Stepper.Rail';
// --------------------------------------------------
const Indicator = forwardRef(({ asChild, children, ...restProps }: any, ref: any) => {
  const { status } = useStepContext();
  const Component = asChild ? Slot.View : View;
  return (
    <Component ref={ref} {...restProps} data-status={status}>
      {children}
    </Component>
  );
});
Indicator.displayName = 'HeroUINative.Primitive.Stepper.Indicator';
// --------------------------------------------------
const Separator = forwardRef(
  ({ asChild, children, force, onLayout: onLayoutProp, style, ...restProps }: any, ref: any) => {
    const { measurements, orientation, setStepMeasurement } = useRootContext();
    const { index, status } = useStepContext();
    const { step, rail, separator } = measurements[index] ?? {};
    const prevMeasurements = measurements[index - 1];
    const handleLayout = useCallback(
      (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        const layout = {
          x,
          y,
          width,
          height,
        };
        setStepMeasurement(index, {
          separator: layout,
        });
        onLayoutProp?.(event);
      },
      [index, onLayoutProp, setStepMeasurement]
    );
    const absoluteStyle = useMemo(() => {
      if (!rail || !step) {
        return {
          opacity: 0,
        };
      }
      if (orientation === 'vertical') {
        const halfW = separator ? separator.width / 2 : 0;
        const prevRailGap =
          prevMeasurements?.step && prevMeasurements?.rail
            ? prevMeasurements.step.height - prevMeasurements.rail.y - prevMeasurements.rail.height
            : 0;
        const computedHeight = prevRailGap + rail.y;
        return {
          position: 'absolute',
          left: rail.width / 2 - halfW,
          right: 0,
          top: -(prevRailGap + rail.y),
          height: computedHeight > 0 ? computedHeight : 0,
        };
      }
      const halfH = separator ? separator.height / 2 : 0;
      const prevRailGap =
        prevMeasurements?.step && prevMeasurements?.rail
          ? prevMeasurements.step.width - prevMeasurements.rail.x - prevMeasurements.rail.width
          : 0;
      const computedWidth = prevRailGap + rail.x;
      return {
        position: 'absolute',
        top: rail.height / 2 - halfH,
        left: -(prevRailGap + rail.x),
        bottom: 0,
        right: 0,
        width: computedWidth > 0 ? computedWidth : 0,
      };
    }, [orientation, prevMeasurements?.rail, prevMeasurements?.step, rail, separator, step]);
    if (index === 0 && !force) {
      return null;
    }
    const Component = asChild ? Slot.View : View;
    return (
      <Component
        ref={ref}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        onLayout={handleLayout}
        style={[absoluteStyle, style]}
        {...restProps}
        data-orientation={orientation}
        data-status={status}
      >
        {children}
      </Component>
    );
  }
);
Separator.displayName = 'HeroUINative.Primitive.Stepper.Separator';
// --------------------------------------------------
const Content = forwardRef(({ asChild, children, ...restProps }: any, ref: any) => {
  const { orientation } = useRootContext();
  const Component = asChild ? Slot.View : View;
  return (
    <Component ref={ref} {...restProps} data-orientation={orientation}>
      {children}
    </Component>
  );
});
Content.displayName = 'HeroUINative.Primitive.Stepper.Content';
// --------------------------------------------------
const Title = forwardRef(({ asChild, children, ...restProps }: any, ref: any) => {
  const { orientation } = useRootContext();
  const { status } = useStepContext();
  const Component = asChild ? Slot.Text : Text;
  return (
    <Component ref={ref} {...restProps} data-orientation={orientation} data-status={status}>
      {children}
    </Component>
  );
});
Title.displayName = 'HeroUINative.Primitive.Stepper.Title';
// --------------------------------------------------
const Description = forwardRef(({ asChild, children, ...restProps }: any, ref: any) => {
  const { orientation } = useRootContext();
  const { status } = useStepContext();
  const Component = asChild ? Slot.Text : Text;
  return (
    <Component ref={ref} {...restProps} data-orientation={orientation} data-status={status}>
      {children}
    </Component>
  );
});
Description.displayName = 'HeroUINative.Primitive.Stepper.Description';
export {
  Content,
  Description,
  Indicator,
  Rail,
  Root,
  Separator,
  Step,
  Title,
  useRootContext,
  useStepContext,
};
