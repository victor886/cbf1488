// @ts-nocheck
/**
 * Internal cartesian + polar chart engine (vendored/adapted from victory-native).
 * Prefer the public `AreaChart` / `BarChart` / `LineChart` / `ComposedChart` /
 * `PieChart` / `RadarChart` / `RadialChart` wrappers for product UI.
 */
export {
  type CartesianActionsHandle,
  type CartesianActionsRef,
  CartesianChart,
  type CartesianChartRef,
} from './cartesian/CartesianChart';
export { AnimatedPath } from './cartesian/components/AnimatedPath';
export { Area } from './cartesian/components/Area';
export { AreaRange } from './cartesian/components/AreaRange';
export { Bar } from './cartesian/components/Bar';
export { BarGroup } from './cartesian/components/BarGroup';
export { Line } from './cartesian/components/Line';
export { Scatter, type ScatterShape } from './cartesian/components/Scatter';
export { StackedArea } from './cartesian/components/StackedArea';
export { StackedBar } from './cartesian/components/StackedBar';
export {
  type CartesianChartContextValue,
  useCartesianChartContext,
} from './cartesian/contexts/CartesianChartContext';
export { useAreaPath } from './cartesian/hooks/useAreaPath';
export { useBarGroupPaths } from './cartesian/hooks/useBarGroupPaths';
export { useBarPath } from './cartesian/hooks/useBarPath';
export { type ChartPressState, useChartPressState } from './cartesian/hooks/useChartPressState';
export { useChartTransformState } from './cartesian/hooks/useChartTransformState';
export { useLinePath } from './cartesian/hooks/useLinePath';
export { useStackedAreaPaths } from './cartesian/hooks/useStackedAreaPaths';
export { useStackedBarPaths } from './cartesian/hooks/useStackedBarPaths';
export { type CurveType } from './cartesian/utils/curves';
export { type PathAnimationConfig, useAnimatedPath } from './hooks/useAnimatedPath';
export { usePieSliceContext } from './pie/contexts/PieSliceContext';
export { useSliceAngularInsetPath } from './pie/hooks/useSliceAngularInsetPath';
export { useSlicePath } from './pie/hooks/useSlicePath';
export { Pie, type PieSliceData } from './pie/index';
export { type PieLabelProps } from './pie/PieLabel';
export { type PieSliceAngularInsetData } from './pie/PieSliceAngularInset';
export { usePolarChartContext } from './polar/contexts/PolarChartContext';
export { PolarChart } from './polar/PolarChart';
export { type ChartExplicitSize } from './shared/ChartExplicitSize';
export { type ChartLayoutModeProps } from './shared/ChartLayoutModeProps';
export {
  type AxisLabelMeasureArgs,
  type AxisLabelMeasurement,
  type AxisLabelRenderArgs,
  type AxisLabelRenderer,
  type AxisTitle,
  type AxisTitlePosition,
  type CartesianChartOrientation,
  type CartesianChartRenderArg,
  type ChartBounds,
  type ChartPressPanConfig,
  type InputDatum,
  type MaybeNumber,
  type PointsArray,
  type Scale,
  type Viewport,
  type XAxisSide,
  type YAxisSide,
} from './types';
export { createRoundedRectPath, type RoundedCorners } from './utils/createRoundedRectPath';
export { usePrevious } from './utils/usePrevious';
