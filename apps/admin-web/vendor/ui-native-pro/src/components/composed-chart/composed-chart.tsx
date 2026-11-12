// @ts-nocheck
import { useMemo } from 'react';
import { View } from 'react-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { BaseCartesianChart } from '../../helpers/internal/components/index';
import AreaChart from '../area-chart/area-chart';
import BarChart from '../bar-chart/bar-chart';
import LineChart from '../line-chart/line-chart';
import { useComposedChartRootAnimation } from './composed-chart.animation';
import { DEFAULT_COMPOSED_CHART_DOMAIN_PADDING, DISPLAY_NAME } from './composed-chart.constants';
import composedChartClassNames from './composed-chart.styles';
// --------------------------------------------------
/**
 * @note RTL: the chart deliberately stays left-to-right. Everything inside
 * `BaseCartesianChart` (axes, tick labels, series) is drawn on a Skia canvas
 * in physical coordinates — the chart engine has no direction concept — and
 * cartesian time/value axes conventionally read left-to-right in RTL locales
 * too. Only the surrounding Yoga wrapper participates in layout direction.
 */
function ComposedChartRoot(props) {
  const { ref, wrapperClassName, animation, children, ...cartesianProps } = props;
  const { isAllAnimationsDisabled } = useComposedChartRootAnimation({
    animation,
  });
  const rootClassName = composedChartClassNames.root({
    className: wrapperClassName,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  return (
    <View className={rootClassName}>
      <BaseCartesianChart
        ref={ref}
        domainPadding={DEFAULT_COMPOSED_CHART_DOMAIN_PADDING}
        {...cartesianProps}
      >
        {(args) => (
          <AnimationSettingsProvider value={animationSettingsContextValue}>
            {children(args)}
          </AnimationSettingsProvider>
        )}
      </BaseCartesianChart>
    </View>
  );
}
// --------------------------------------------------
ComposedChartRoot.displayName = DISPLAY_NAME.ROOT;
// --------------------------------------------------
/**
 * Compound `ComposedChart` wrapping the chart engine's `CartesianChart` with a themed outer `View`.
 *
 * Bundles bar, line, and area series parts from the existing chart components under one root so
 * multi-metric dashboards can mix column, stroke, and fill layers in a single cartesian plot.
 * Series parts reuse the themed Skia implementations from `BarChart`, `LineChart`, and `AreaChart`
 * and honour the same `AnimationSettingsProvider` cascade for `"disable-all"`.
 *
 * Configure axes and grid through the chart root props (`xAxis`, `yAxis`, `domain`, `frame`).
 * For dual-scale charts, pass a `yAxis` array with per-axis `yKeys` and `domain` entries.
 *
 * For press-driven overlays (indicator dot, vertical crosshair), use `ChartIndicator` and
 * `ChartCrosshair` from `heroui-native-pro` with `useChartPressState` — they are Skia
 * primitives in the same canvas as `ComposedChart` children.
 *
 * @component ComposedChart — Renders `CartesianChart` inside a full-width `View`. Pass chart height
 * on `wrapperClassName` (for example `h-52`). Forward `ref` to access the chart handle. Accepts an
 * `animation` prop typed as {@link ComposedChartRootAnimation} for cascading `"disable-all"` to
 * animated compound parts.
 *
 * @component ComposedChart.Bar — Themed Skia bar series (from {@link BarChart.Bar}).
 *
 * @component ComposedChart.BarGroup — Clustered bars (from {@link BarChart.BarGroup}).
 *
 * @component ComposedChart.BarGroupItem — One series inside {@link ComposedChart.BarGroup}.
 *
 * @component ComposedChart.StackedBar — Stacked columns (from {@link BarChart.StackedBar}).
 *
 * @component ComposedChart.Line — Themed Skia line series (from {@link LineChart.Line}).
 *
 * @component ComposedChart.AnimatedLine — Replayable draw-on line (from {@link LineChart.AnimatedLine}).
 *
 * @component ComposedChart.Area — Themed Skia area series (from {@link AreaChart.Area}).
 *
 * @component ComposedChart.StackedArea — Stacked area layers (from {@link AreaChart.StackedArea}).
 *
 * @component ComposedChart.AreaRange — Shaded band between bounds (from {@link AreaChart.AreaRange}).
 */
const ComposedChart = Object.assign(ComposedChartRoot, {
  /** Theme-styled single-series bars; uses Uniwind `colorClassName` for fill color. */
  Bar: BarChart.Bar,
  /** Grouped (clustered) bars — compose with {@link ComposedChart.BarGroupItem}. */
  BarGroup: BarChart.BarGroup,
  /** One bar series inside {@link ComposedChart.BarGroup}. */
  BarGroupItem: BarChart.BarGroupItem,
  /** Stacked bars across multiple `PointsArray` entries (order matches stack bottom to top). */
  StackedBar: BarChart.StackedBar,
  /** Theme-styled line series; uses Uniwind `colorClassName` for stroke color. */
  Line: LineChart.Line,
  /** Replayable draw-on line with a `resetKey` trigger to re-play the entrance animation. */
  AnimatedLine: LineChart.AnimatedLine,
  /** Theme-styled area series; uses Uniwind `colorClassName` for fill color. */
  Area: AreaChart.Area,
  /** Stacked area layers from an ordered `points` array (bottom to top). */
  StackedArea: AreaChart.StackedArea,
  /** Range band between an upper and a lower series. */
  AreaRange: AreaChart.AreaRange,
});
export default ComposedChart;
