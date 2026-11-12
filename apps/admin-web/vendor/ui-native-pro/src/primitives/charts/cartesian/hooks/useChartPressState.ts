// @ts-nocheck
import * as React from 'react';
import { makeMutable, useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
export const useChartPressState = (initialValues) => {
  const keys = Object.keys(initialValues.y).join(',');
  const state = React.useMemo(() => {
    return {
      isActive: makeMutable(false),
      matchedIndex: makeMutable(-1),
      x: {
        value: makeMutable(initialValues.x),
        position: makeMutable(0),
      },
      y: Object.entries(initialValues.y).reduce((acc, [key, initVal]) => {
        acc[key] = {
          value: makeMutable(initVal),
          position: makeMutable(0),
        };
        return acc;
      }, {}),
      yIndex: makeMutable(-1), // used for stacked bar charts
    };
  }, [keys]);
  const isActive = useIsPressActive(state);
  return {
    state,
    isActive,
  };
};
const useIsPressActive = (value) => {
  const [isPressActive, setIsPressActive] = React.useState(false);
  useAnimatedReaction(
    () => value.isActive.get(),
    (val, oldVal) => {
      if (val !== oldVal) scheduleOnRN(setIsPressActive, val);
    }
  );
  return isPressActive;
};

export type ChartPressStateInit = {
  x: import('../../types').InputFieldType;
  y: Record<string, number>;
};
export type ChartPressState<Init extends ChartPressStateInit> = {
  isActive: import('react-native-reanimated').SharedValue<boolean>;
  matchedIndex: import('react-native-reanimated').SharedValue<number>;
  x: {
    value: import('react-native-reanimated').SharedValue<Init['x']>;
    position: import('react-native-reanimated').SharedValue<number>;
  };
  y: Record<
    keyof Init['y'],
    {
      value: import('react-native-reanimated').SharedValue<number>;
      position: import('react-native-reanimated').SharedValue<number>;
    }
  >;
  yIndex: import('react-native-reanimated').SharedValue<number>;
};
