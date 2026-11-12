// @ts-nocheck
import * as React from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { FiberProvider, useContextBridge } from 'its-fine';
import { panTransformGesture, pinchTransformGesture } from '../cartesian/utils/transformGestures';
import { ChartWrapper } from '../shared/ChartWrapper';
import { GestureHandler } from '../shared/GestureHandler';
import { useChartCanvasSize } from '../shared/useChartCanvasSize';
import { assertSkiaInstalled, Group } from '../skia';
import { PolarChartProvider } from './contexts/PolarChartContext';
const PolarChartBase = (props) => {
  const {
    containerStyle,
    canvasStyle,
    children,
    onLayout,
    hasMeasuredLayoutSize,
    canvasSize,
    transformState,
    isHeadless,
    explicitSize,
  } = props;
  const Bridge = useContextBridge();
  // its-fine Bridge is a render-time host component; use createElement so eslint
  // does not treat the JSX tag as a component declared inside render.
  const wrapCanvasContent = React.useCallback(
    (content) => React.createElement(Bridge, null, content),
    [Bridge]
  );
  let composed = Gesture.Race();
  if (transformState) {
    composed = Gesture.Race(
      composed,
      pinchTransformGesture(transformState),
      panTransformGesture(transformState)
    );
  }
  const chartContent = (
    <Group matrix={transformState?.matrix}>{hasMeasuredLayoutSize && children}</Group>
  );
  return (
    <ChartWrapper
      isHeadless={isHeadless}
      explicitSize={explicitSize}
      onLayout={onLayout}
      hasMeasuredLayoutSize={hasMeasuredLayoutSize}
      canvasSize={canvasSize}
      containerStyle={containerStyle}
      canvasStyle={canvasStyle}
      chartContent={chartContent}
      wrapCanvasContent={isHeadless ? undefined : wrapCanvasContent}
      gestureOverlay={isHeadless ? undefined : <GestureHandler gesture={composed} />}
    />
  );
};
export const PolarChart = (props) => {
  assertSkiaInstalled('PolarChart');
  const { data, labelKey, colorKey, valueKey } = props;
  const {
    size: canvasSize,
    hasMeasuredLayoutSize,
    onLayout,
    isHeadless,
  } = useChartCanvasSize({
    explicitSize: props.explicitSize,
    headless: props.headless,
  });
  return (
    <FiberProvider>
      <PolarChartProvider
        data={data}
        labelKey={labelKey.toString()}
        colorKey={colorKey.toString()}
        valueKey={valueKey.toString()}
        canvasSize={canvasSize}
      >
        <PolarChartBase
          {...props}
          onLayout={onLayout}
          hasMeasuredLayoutSize={hasMeasuredLayoutSize}
          canvasSize={canvasSize}
          isHeadless={isHeadless}
        />
      </PolarChartProvider>
    </FiberProvider>
  );
};
