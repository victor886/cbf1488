// @ts-nocheck
import * as React from 'react';
import isEqual from 'react-fast-compare';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { FiberProvider, useContextBridge } from 'its-fine';
import { useFunctionRef } from '../hooks/useFunctionRef';
import { ChartWrapper } from '../shared/ChartWrapper';
import { GestureHandler } from '../shared/GestureHandler';
import { useChartCanvasSize } from '../shared/useChartCanvasSize';
import { assertSkiaInstalled, Group } from '../skia';
import { asNumber } from '../utils/asNumber';
import { boundsToClip } from '../utils/boundsToClip';
import { normalizeYAxisTicks } from '../utils/normalizeYAxisTicks';
import { downsampleTicks } from '../utils/tickHelpers';
import { valueFromSidedNumber } from '../utils/valueFromSidedNumber';
import { CategoryYAxis } from './components/CategoryYAxis';
import { Frame } from './components/Frame';
import { XAxis } from './components/XAxis';
import { YAxis } from './components/YAxis';
import { CartesianChartProvider } from './contexts/CartesianChartContext';
import {
  CartesianTransformProvider,
  CartesianTransformValueProvider,
  useCartesianTransformContext,
} from './contexts/CartesianTransformContext';
import { useBuildChartAxis } from './hooks/useBuildChartAxis';
import { applyChartPressPanConfig } from './utils/applyChartPressPanConfig';
import { pruneChartPressBootstrap } from './utils/chartPressBootstrap';
import { createFallbackChartState } from './utils/createFallbackChartState';
import { createSafeZoomTransform } from './utils/createSafeZoomTransform';
import { getCartesianChartBounds } from './utils/getCartesianChartBounds';
import { getCartesianTouchCoordinates } from './utils/getCartesianTouchCoordinates';
import { getClosestDatumIndex } from './utils/getClosestDatumIndex';
import { getStackedBarTouchSegmentIndex } from './utils/getStackedBarTouchSegmentIndex';
import { resetChartPressState } from './utils/resetChartPressState';
import { panTransformGesture, pinchTransformGesture } from './utils/transformGestures';
import { transformHorizontalInputData } from './utils/transformHorizontalInputData';
import { transformInputData } from './utils/transformInputData';
export function CartesianChart({ transformState, children, ref, ...rest }) {
  assertSkiaInstalled('CartesianChart');
  return (
    <FiberProvider>
      <CartesianTransformProvider transformState={transformState}>
        <CartesianChartContent {...rest} ref={ref}>
          {children}
        </CartesianChartContent>
      </CartesianTransformProvider>
    </FiberProvider>
  );
}
function CartesianCanvas({ children, xScale, yScale, orientation, ...props }) {
  const Bridge = useContextBridge();
  // its-fine Bridge is a render-time host component; use createElement so eslint
  // does not treat the JSX tag as a component declared inside render.
  const wrapCanvasContent = React.useCallback(
    (content) =>
      React.createElement(
        Bridge,
        null,
        React.createElement(CartesianChartProvider, { xScale, yScale, orientation }, content)
      ),
    [Bridge, orientation, xScale, yScale]
  );
  return <ChartWrapper {...props} chartContent={children} wrapCanvasContent={wrapCanvasContent} />;
}
function CartesianChartContent({
  data,
  xKey,
  yKeys,
  orientation = 'vertical',
  padding,
  domainPadding,
  children,
  renderOutside = () => null,
  axisOptions,
  domain,
  chartPressState,
  chartPressConfig,
  gestureHandlerConfig,
  onChartBoundsChange,
  onScaleChange,
  gestureLongPressDelay = 100,
  xAxis,
  yAxis,
  frame,
  transformState,
  transformConfig,
  customGestures,
  actionsRef,
  viewport,
  ref,
  explicitSize,
  headless,
}) {
  const { size, hasMeasuredLayoutSize, onLayout, isHeadless } = useChartCanvasSize({
    explicitSize,
    headless,
  });
  const chartBoundsRef = React.useRef(undefined);
  const xScaleRef = React.useRef(undefined);
  const yScaleRef = React.useRef(undefined);
  const canvasRef = React.useRef(null);
  const chartPressStateRef = React.useRef(chartPressState);
  chartPressStateRef.current = chartPressState;
  const yKeysKey = yKeys.join('\u0000');
  const normalizedAxisProps = useBuildChartAxis({
    xAxis: xAxis,
    yAxis: yAxis,
    frame,
    yKeys,
    axisOptions: axisOptions,
  });
  const axisScales = axisOptions?.axisScales;
  // create a d3-zoom transform object based on the current transform state. This
  // is used for rescaling the X and Y axes.
  const transform = useCartesianTransformContext();
  const zoomX = React.useMemo(
    () => createSafeZoomTransform(transform.k, transform.tx, transform.ty),
    [transform.k, transform.tx, transform.ty]
  );
  const zoomY = React.useMemo(
    () => createSafeZoomTransform(transform.ky, transform.tx, transform.ty),
    [transform.ky, transform.tx, transform.ty]
  );
  const tData = useSharedValue({
    ix: [],
    ox: [],
    y: yKeys.reduce((acc, key) => {
      acc[key] = {
        i: [],
        o: [],
      };
      return acc;
    }, {}),
  });
  const { yAxes, xScale, chartBounds, isNumericalData, xTicksNormalized, _tData } =
    React.useMemo(() => {
      if (!data.length) {
        return createFallbackChartState(yKeys);
      }
      const transformArgs = {
        data,
        xKey,
        yKeys,
        outputWindow: {
          xMin: valueFromSidedNumber(padding, 'left'),
          xMax: size.width - valueFromSidedNumber(padding, 'right'),
          yMin: valueFromSidedNumber(padding, 'top'),
          yMax: size.height - valueFromSidedNumber(padding, 'bottom'),
        },
        domain,
        domainPadding,
        viewport,
        labelRotate: normalizedAxisProps.xAxis.labelRotate,
        axisScales,
      };
      const transformed =
        orientation === 'horizontal'
          ? transformHorizontalInputData({
              ...transformArgs,
              xAxis: normalizedAxisProps.xAxis,
              yAxes: normalizedAxisProps.yAxes,
            })
          : transformInputData({
              ...transformArgs,
              xAxis: normalizedAxisProps.xAxis,
              yAxes: normalizedAxisProps.yAxes,
            });
      const {
        xScale: nextXScale,
        yAxes: nextYAxes,
        isNumericalData: nextIsNumericalData,
        xTicksNormalized: nextXTicksNormalized,
        ...nextTData
      } = transformed;
      const nextChartBounds = getCartesianChartBounds({
        xScale: nextXScale,
        yScale: nextYAxes[0].yScale,
        viewport,
        domainPadding,
        orientation,
      });
      return {
        xTicksNormalized: nextXTicksNormalized,
        yAxes: nextYAxes,
        xScale: nextXScale,
        chartBounds: nextChartBounds,
        isNumericalData: nextIsNumericalData,
        _tData: nextTData,
      };
    }, [
      data,
      xKey,
      yKeys,
      padding,
      size.width,
      size.height,
      domain,
      domainPadding,
      normalizedAxisProps,
      axisScales,
      viewport,
      orientation,
    ]);
  React.useEffect(() => {
    tData.set(_tData);
  }, [_tData, tData]);
  const primaryYAxis = yAxes[0];
  const primaryYScale = primaryYAxis.yScale;
  // stacked bar values
  const chartHeight = chartBounds.bottom;
  const yScaleTop = primaryYAxis.yScale.domain().at(0);
  const yScaleBottom = primaryYAxis.yScale.domain().at(-1);
  const chartWidth = chartBounds.right - chartBounds.left;
  const xScaleLeft = xScale.invert(chartBounds.left);
  const xScaleRight = xScale.invert(chartBounds.right);
  // end stacked bar values
  /**
   * Pan gesture handling
   */
  const lastIdx = useSharedValue(null);
  /**
   * Take a "press value" and an x-value and update the shared values accordingly.
   */
  const handleTouch = React.useCallback(
    (v, x, y) => {
      'worklet';
      const transformedData = tData.get();
      const idx = getClosestDatumIndex({
        orientation,
        categoryPositions: transformedData.ox,
        touchX: x,
        touchY: y,
      });
      if (typeof idx !== 'number') return;
      const isInYs = (yk) => yKeys.includes(yk);
      // begin stacked bar handling:
      // store the heights of each bar segment
      const barHeights = [];
      for (const yk in v.y) {
        if (isInYs(yk)) {
          const height = asNumber(transformedData.y[yk].i[idx]);
          barHeights.push(height);
        }
      }
      if (orientation === 'horizontal') {
        const chartXPressed = x - chartBounds.left;
        const xDomainValue =
          chartWidth > 0 && xScaleLeft !== undefined && xScaleRight !== undefined
            ? (chartXPressed / chartWidth) * (xScaleRight - xScaleLeft) + xScaleLeft
            : NaN;
        v.yIndex.set(
          getStackedBarTouchSegmentIndex({
            values: barHeights,
            touchValue: xDomainValue,
          })
        );
      } else {
        const chartYPressed = chartHeight - y; // Invert y-coordinate, since RNGH gives us the absolute Y, and we want to know where in the chart they clicked
        // Calculate the actual yValue of the touch within the domain of the yScale
        const yDomainValue = (chartYPressed / chartHeight) * (yScaleTop - yScaleBottom);
        // track the cumulative height and the y-index of the touched segment
        let cumulativeHeight = 0;
        let yIndex = -1;
        // loop through the bar heights to find which bar was touched
        for (let i = 0; i < barHeights.length; i++) {
          // Accumulate the height as we go along
          cumulativeHeight += barHeights[i];
          // Check if the y-value touched falls within the current segment
          if (yDomainValue <= cumulativeHeight) {
            // If it does, set yIndex to the current segment index and break
            yIndex = i;
            break;
          }
        }
        // Update the yIndex value in the state or context
        v.yIndex.set(yIndex);
      }
      // end stacked bar handling
      if (v) {
        try {
          v.matchedIndex.set(idx);
          v.x.value.set(transformedData.ix[idx]);
          v.x.position.set(asNumber(transformedData.ox[idx]));
          for (const yk in v.y) {
            if (isInYs(yk)) {
              v.y[yk].value.set(asNumber(transformedData.y[yk].i[idx]));
              v.y[yk].position.set(asNumber(transformedData.y[yk].o[idx]));
            }
          }
        } catch (err) {
          // no-op
        }
      }
      lastIdx.set(idx);
    },
    [
      chartBounds.left,
      chartHeight,
      chartWidth,
      lastIdx,
      orientation,
      tData,
      xScaleLeft,
      xScaleRight,
      yKeys,
      yScaleBottom,
      yScaleTop,
    ]
  );
  const handleTouchRef = useFunctionRef(handleTouch);
  const mutableActionsRef = actionsRef && 'current' in actionsRef ? actionsRef : undefined;
  const sharedActionsRef = actionsRef && 'value' in actionsRef ? actionsRef : undefined;
  React.useImperativeHandle(
    ref,
    () => ({
      get canvas() {
        return canvasRef.current;
      },
      actions: {
        handleTouch: (value, x, y) => {
          handleTouchRef.current?.(value, x, y);
        },
      },
    }),
    [canvasRef, handleTouchRef]
  );
  React.useImperativeHandle(
    mutableActionsRef,
    () => ({
      handleTouch: (value, x, y) => {
        handleTouchRef.current?.(value, x, y);
      },
    }),
    [handleTouchRef]
  );
  React.useEffect(() => {
    if (!sharedActionsRef) return;
    sharedActionsRef.set({
      handleTouch,
    });
    return () => {
      sharedActionsRef.set(null);
    };
  }, [handleTouch, sharedActionsRef]);
  /**
   * Touch gesture is a modified Pan gesture handler that allows for multiple presses:
   * - Using Pan Gesture handler effectively _just_ for the .activateAfterLongPress functionality.
   * - Tracking the finger is handled with .onTouchesMove instead of .onUpdate, because
   *    .onTouchesMove gives us access to each individual finger.
   * - The activation gets a bit complicated because we want to wait til "start" state before updating Press Value
   *    which gives time for the gesture to get cancelled before we start updating the shared values.
   *    Therefore we use gestureState.bootstrap to store some "bootstrap" information if gesture isn't active when finger goes down.
   */
  // touch ID -> value index mapping to keep track of which finger updates which value
  const touchMap = useSharedValue({});
  const activePressSharedValues = Array.isArray(chartPressState)
    ? chartPressState
    : [chartPressState];
  const gestureState = useSharedValue({
    isGestureActive: false,
    bootstrap: [],
  });
  React.useEffect(() => {
    const vals = chartPressStateRef.current;
    const states = Array.isArray(vals) ? vals : [vals];
    for (const state of states) {
      if (state) resetChartPressState(state);
    }
    touchMap.set({});
    gestureState.set({
      isGestureActive: false,
      bootstrap: [],
    });
    lastIdx.set(null);
  }, [data, gestureState, lastIdx, touchMap, xKey, yKeysKey]);
  const panGesture = Gesture.Pan()
    /**
     * When a finger goes down, either update the state or store in the bootstrap array.
     */ .onTouchesDown((e) => {
      const vals = activePressSharedValues || [];
      if (!vals.length || e.numberOfTouches === 0) return;
      for (let i = 0; i < Math.min(e.allTouches.length, vals.length); i++) {
        const touch = e.allTouches[i];
        const v = vals[i];
        if (!v || !touch) continue;
        if (gestureState.get().isGestureActive) {
          // Update the mapping
          if (typeof touchMap.get()[touch.id] !== 'number') {
            touchMap.modify((map) => {
              'worklet';
              map[touch.id] = i;
              return map;
            });
          }
          v.isActive.set(true);
          const touchPoint = getCartesianTouchCoordinates({
            touch,
            transform: transformState?.matrix.get(),
          });
          handleTouch(v, touchPoint.x, touchPoint.y);
        } else {
          gestureState.modify((state) => {
            'worklet';
            state.bootstrap.push({
              pressIndex: i,
              state: v,
              touch,
            });
            return state;
          });
        }
      }
    })
    /**
     * On start, check if we have any bootstrapped updates we need to apply.
     */ .onStart(() => {
      const bootstrap = gestureState.get().bootstrap.slice(0);
      gestureState.set({
        isGestureActive: true,
        bootstrap: [],
      });
      for (let i = 0; i < bootstrap.length; i++) {
        const { pressIndex, state: v, touch } = bootstrap[i];
        // Update the mapping
        if (typeof touchMap.get()[touch.id] !== 'number') {
          touchMap.modify((map) => {
            'worklet';
            map[touch.id] = pressIndex;
            return map;
          });
        }
        v.isActive.set(true);
        const touchPoint = getCartesianTouchCoordinates({
          touch,
          transform: transformState?.matrix.get(),
        });
        handleTouch(v, touchPoint.x, touchPoint.y);
      }
    })
    /**
     * Clear gesture state on gesture end.
     */ .onFinalize(() => {
      const vals = activePressSharedValues || [];
      for (const val of vals) {
        if (val) {
          val.isActive.set(false);
        }
      }
      touchMap.set({});
      gestureState.set({
        isGestureActive: false,
        bootstrap: [],
      });
    })
    /**
     * As fingers move, update the shared values accordingly.
     */ .onTouchesMove((e) => {
      const vals = activePressSharedValues || [];
      if (!vals.length || e.numberOfTouches === 0) return;
      for (let i = 0; i < Math.min(e.allTouches.length, vals.length); i++) {
        const touch = e.allTouches[i];
        const touchId = touch?.id;
        const idx = typeof touchId === 'number' && touchMap.get()[touchId];
        const v = typeof idx === 'number' && vals?.[idx];
        if (!v || !touch) continue;
        if (!v.isActive.get()) v.isActive.set(true);
        const touchPoint = getCartesianTouchCoordinates({
          touch,
          transform: transformState?.matrix.get(),
        });
        handleTouch(v, touchPoint.x, touchPoint.y);
      }
    })
    /**
     * On each finger up, start to update values and "free up" the touch map.
     */ .onTouchesUp((e) => {
      gestureState.modify((state) => {
        'worklet';
        state.bootstrap = pruneChartPressBootstrap({
          bootstrap: state.bootstrap,
          changedTouches: e.changedTouches,
          numberOfTouches: e.numberOfTouches,
        });
        return state;
      });
      for (const touch of e.changedTouches) {
        const vals = activePressSharedValues || [];
        // Set active state to false
        const touchId = touch?.id;
        const idx = typeof touchId === 'number' && touchMap.get()[touchId];
        const val = typeof idx === 'number' && vals[idx];
        if (val) {
          val.isActive.set(false);
        }
        // Free up touch map for this touch
        touchMap.modify((map) => {
          'worklet';
          map[touch.id] = undefined;
          return map;
        });
      }
    })
    /**
     * Once the gesture ends, ensure all active values are falsified.
     */ .onEnd(() => {
      const vals = activePressSharedValues || [];
      // Set active state to false for all vals
      for (const val of vals) {
        if (val) {
          val.isActive.set(false);
        }
      }
    });
  applyChartPressPanConfig({
    panGesture,
    panConfig: chartPressConfig?.pan,
    gestureLongPressDelay,
  });
  /**
   * Allow end-user to request "raw-ish" data for a given yKey.
   * Generate this on demand using a proxy.
   */
  const points = React.useMemo(() => {
    const cache = {};
    return new Proxy(
      {},
      {
        get(_, property) {
          const key = property;
          if (!yKeys.includes(key)) return undefined;
          if (cache[key]) return cache[key];
          cache[key] = _tData.ix.map((x, i) => ({
            x: orientation === 'horizontal' ? asNumber(_tData.y[key].o[i]) : asNumber(_tData.ox[i]),
            xValue: x,
            y: orientation === 'horizontal' ? asNumber(_tData.ox[i]) : _tData.y[key].o[i],
            yValue: _tData.y[key].i[i],
          }));
          return cache[key];
        },
      }
    );
  }, [_tData, orientation, yKeys]);
  // On bounds change, emit
  const onChartBoundsRef = useFunctionRef(onChartBoundsChange);
  React.useEffect(() => {
    if (!isEqual(chartBounds, chartBoundsRef.current)) {
      chartBoundsRef.current = chartBounds;
      onChartBoundsRef.current?.(chartBounds);
    }
  }, [chartBounds, onChartBoundsRef]);
  const onScaleRef = useFunctionRef(onScaleChange);
  React.useEffect(() => {
    const rescaledX = zoomX.rescaleX(xScale);
    const rescaledY = zoomY.rescaleY(primaryYScale);
    if (
      !isEqual(xScaleRef.current?.domain(), rescaledX.domain()) ||
      !isEqual(yScaleRef.current?.domain(), rescaledY.domain()) ||
      !isEqual(xScaleRef.current?.range(), rescaledX.range()) ||
      !isEqual(yScaleRef.current?.range(), rescaledY.range())
    ) {
      xScaleRef.current = xScale;
      yScaleRef.current = primaryYScale;
      onScaleRef.current?.(rescaledX, rescaledY);
    }
  }, [onScaleChange, onScaleRef, xScale, zoomX, zoomY, primaryYScale]);
  const renderArg = {
    xScale,
    xTicks: xTicksNormalized,
    yScale: primaryYScale,
    yTicks: primaryYAxis.yTicksNormalized,
    chartBounds,
    canvasSize: size,
    points,
  };
  const clipRect = boundsToClip(chartBounds);
  const YAxisComponents =
    hasMeasuredLayoutSize && (axisOptions || yAxes)
      ? normalizedAxisProps.yAxes?.map((axis, index) => {
          const resolvedYAxis = yAxes[index];
          if (!resolvedYAxis) return null;
          if (orientation === 'horizontal') {
            return (
              <CategoryYAxis
                key={index}
                {...axis}
                formatYLabel={axis.formatYLabel}
                labelRenderer={axis.labelRenderer}
                xScale={zoomX.rescaleX(xScale)}
                yScale={zoomY.rescaleY(resolvedYAxis.yScale)}
                yTicksNormalized={resolvedYAxis.yTicksNormalized}
                ix={_tData.ix}
                chartBounds={chartBounds}
              />
            );
          }
          const primaryAxisProps = normalizedAxisProps.yAxes[0];
          const primaryRescaled = zoomY.rescaleY(primaryYScale);
          const rescaled = zoomY.rescaleY(resolvedYAxis.yScale);
          const rescaledTicks = axis.tickValues
            ? downsampleTicks(axis.tickValues, axis.tickCount)
            : axis.enableRescaling
              ? rescaled.ticks(axis.tickCount)
              : resolvedYAxis.yScale.ticks(axis.tickCount);
          const primaryTicksRescaled = primaryAxisProps.tickValues
            ? downsampleTicks(primaryAxisProps.tickValues, primaryAxisProps.tickCount)
            : primaryAxisProps.enableRescaling
              ? primaryRescaled.ticks(primaryAxisProps.tickCount)
              : primaryYScale.ticks(primaryAxisProps.tickCount);
          return (
            <YAxis
              key={index}
              {...axis}
              xScale={zoomX.rescaleX(xScale)}
              yScale={rescaled}
              yTicksNormalized={
                index > 0 && !axis.tickValues
                  ? normalizeYAxisTicks(primaryTicksRescaled, primaryRescaled, rescaled)
                  : rescaledTicks
              }
              chartBounds={chartBounds}
              orientation={orientation}
            />
          );
        })
      : null;
  const XAxisComponents =
    hasMeasuredLayoutSize && (axisOptions || xAxis) ? (
      <XAxis
        {...normalizedAxisProps.xAxis}
        xScale={xScale}
        yScale={zoomY.rescaleY(primaryYScale)}
        ix={_tData.ix}
        isNumericalData={orientation === 'horizontal' ? true : isNumericalData}
        chartBounds={chartBounds}
        orientation={orientation}
        zoom={zoomX}
      />
    ) : null;
  const FrameComponent =
    hasMeasuredLayoutSize && (axisOptions || frame) ? (
      <Frame {...normalizedAxisProps.frame} xScale={xScale} yScale={primaryYScale} />
    ) : null;
  const chartContent = (
    <>
      {YAxisComponents}
      {XAxisComponents}
      {FrameComponent}
      <Group clip={clipRect}>
        <Group matrix={transformState?.matrix}>
          {hasMeasuredLayoutSize && children(renderArg)}
        </Group>
      </Group>
      {hasMeasuredLayoutSize && renderOutside?.(renderArg)}
    </>
  );
  let gestureOverlay;
  if (!isHeadless) {
    let composed = customGestures ?? Gesture.Race();
    if (transformState) {
      let gestures = Gesture.Simultaneous();
      if (transformConfig?.pinch?.enabled ?? true) {
        gestures = Gesture.Simultaneous(
          gestures,
          pinchTransformGesture(transformState, transformConfig?.pinch)
        );
      }
      if (transformConfig?.pan?.enabled ?? true) {
        gestures = Gesture.Simultaneous(
          gestures,
          panTransformGesture(transformState, transformConfig?.pan)
        );
      }
      composed = Gesture.Race(composed, Gesture.Simultaneous(gestures));
    }
    if (chartPressState) {
      composed = Gesture.Race(composed, panGesture);
    }
    gestureOverlay = <GestureHandler config={gestureHandlerConfig} gesture={composed} />;
  }
  return (
    <CartesianTransformValueProvider value={transform}>
      <CartesianCanvas
        isHeadless={isHeadless}
        explicitSize={explicitSize}
        onLayout={onLayout}
        hasMeasuredLayoutSize={hasMeasuredLayoutSize}
        canvasSize={size}
        canvasRef={canvasRef}
        gestureOverlay={gestureOverlay}
        yScale={primaryYScale}
        xScale={xScale}
        orientation={orientation}
      >
        {chartContent}
      </CartesianCanvas>
    </CartesianTransformValueProvider>
  );
}
