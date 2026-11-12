// @ts-nocheck
import { createContext, useContext, useMemo } from 'react';
import { View } from 'react-native';
import { AnimationSettingsProvider, useAnimationSettings } from 'heroui-native/contexts';
import { BasePolarChart } from '../../helpers/internal/components/index';
import { Pie } from '../../primitives/charts/index';
import { usePieChartRootAnimation } from './pie-chart.animation';
import { DISPLAY_NAME } from './pie-chart.constants';
import pieChartClassNames from './pie-chart.styles';
/**
 * Module-private React context that carries `isAllAnimationsDisabled` from `PieChart` (root)
 * to {@link PieChart.Pie}. Lives outside the Skia Canvas reconciler — `PieChart.Pie` reads it
 * via {@link useContext} and re-emits the value through `AnimationSettingsProvider` *inside*
 * the `Pie.Chart` render callback so descendants rendered in the Canvas (e.g.
 * `PieChart.Slice`, `PieChart.SliceAngularInset`) still see the cascade through
 * `useAnimationSettings()`.
 *
 * Default is `{ isAllAnimationsDisabled: false }` so `PieChart.Pie` remains safe to use
 * outside of `PieChart` (animations are simply not disabled).
 */
const PieChartAnimationBridgeContext = createContext({
  isAllAnimationsDisabled: false,
});
// --------------------------------------------------
/**
 * @note RTL: the chart deliberately stays left-to-right. Everything inside
 * the chart canvas (axes, tick labels, series) is drawn by Skia in physical
 * coordinates — the chart engine has no direction concept — and chart axes
 * conventionally read left-to-right in RTL locales too. Only the surrounding
 * Yoga wrapper participates in layout direction.
 */
function PieChartRoot(props) {
  const { wrapperClassName, animation, children, ...polarProps } = props;
  const { isAllAnimationsDisabled } = usePieChartRootAnimation({
    animation,
  });
  const rootClassName = pieChartClassNames.root({
    className: wrapperClassName,
  });
  /**
   * Memoized bridge value forwarded to {@link PieChart.Pie}. Stable across renders unless the
   * cascade state flips so consumers of the context don't re-render unnecessarily.
   */
  const animationBridgeContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  return (
    <PieChartAnimationBridgeContext.Provider value={animationBridgeContextValue}>
      <View className={rootClassName}>
        <BasePolarChart {...polarProps}>{children}</BasePolarChart>
      </View>
    </PieChartAnimationBridgeContext.Provider>
  );
}
// --------------------------------------------------
function PieChartPie(props) {
  const { children, ...pieProps } = props;
  /**
   * Read the root-provided cascade state outside the Skia Canvas, then re-emit it inside the
   * `Pie.Chart` render callback through `AnimationSettingsProvider` so the chart engine's Skia
   * reconciler sees the same context value that `PieChart.Slice` / `PieChart.SliceAngularInset`
   * resolve via `useAnimationSettings()`.
   */
  const animationBridgeValue = useContext(PieChartAnimationBridgeContext);
  return (
    <Pie.Chart {...pieProps}>
      {(args) => (
        <AnimationSettingsProvider value={animationBridgeValue}>
          {children(args)}
        </AnimationSettingsProvider>
      )}
    </Pie.Chart>
  );
}
// --------------------------------------------------
function PieChartSlice(props) {
  const { animate, ...restProps } = props;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  return <Pie.Slice animate={isAllAnimationsDisabled ? undefined : animate} {...restProps} />;
}
// --------------------------------------------------
function PieChartSliceAngularInset(props) {
  const { animate, ...restProps } = props;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  return (
    <Pie.SliceAngularInset animate={isAllAnimationsDisabled ? undefined : animate} {...restProps} />
  );
}
// --------------------------------------------------
function PieChartLabel(props) {
  return <Pie.Label {...props} />;
}
// --------------------------------------------------
PieChartRoot.displayName = DISPLAY_NAME.ROOT;
PieChartPie.displayName = DISPLAY_NAME.PIE;
PieChartSlice.displayName = DISPLAY_NAME.SLICE;
PieChartSliceAngularInset.displayName = DISPLAY_NAME.SLICE_ANGULAR_INSET;
PieChartLabel.displayName = DISPLAY_NAME.LABEL;
// --------------------------------------------------
/**
 * Compound `PieChart` wrapping the chart engine's `PolarChart` with a themed outer `View`.
 *
 * The root is a themed `PolarChart` container; `Pie.Chart` (with its layout props and per-slice
 * render callback) is exposed as the {@link PieChart.Pie} compound subcomponent so consumers
 * compose the chart the same way as the engine's own `<PolarChart><Pie.Chart>...` composition.
 *
 * Animation cascading mirrors the cartesian charts: an `animation` prop typed as
 * {@link PieChartRootAnimation} is computed at the root via `usePieChartRootAnimation` and
 * carried to `PieChart.Pie` through a private React context. `PieChart.Pie` then re-emits the
 * value via {@link AnimationSettingsProvider} *inside* the `Pie.Chart` render callback so the
 * cascade crosses the Skia Canvas reconciler boundary and reaches `PieChart.Slice` /
 * `PieChart.SliceAngularInset` via `useAnimationSettings()`.
 *
 * @component PieChart — Themed `PolarChart` wrapper inside a full-width `View`. Pass chart
 * dimensions on `wrapperClassName` (for example `h-[260px]`). Accepts an `animation` prop typed
 * as {@link PieChartRootAnimation} for cascading `"disable-all"` to animated compound parts.
 * Expects a single `PieChart.Pie` child.
 *
 * @component PieChart.Pie — Wraps the chart engine's `Pie.Chart`. Owns the layout props
 * (`innerRadius`, `circleSweepDegrees`, `startAngle`, `size`) and the per-slice render callback.
 * Bridges the root's animation cascade into the Skia Canvas via `AnimationSettingsProvider`.
 *
 * @component PieChart.Slice — A single pie/donut slice. `Pie.Slice` strips `color` and `path`
 * from `PathProps` (the fill is sourced from `data[colorKey]` and the path is computed from
 * slice geometry); pass other Skia paint props (`opacity`, `blendMode`, etc.) directly.
 * Respects cascaded `isAllAnimationsDisabled`: when disabled at the root, the `animate` prop
 * is dropped.
 *
 * @component PieChart.SliceAngularInset — Stroke drawn between adjacent slices, typically set
 * to the chart background color for a "segmented" donut look. Pass
 * `angularInset={{ angularStrokeWidth, angularStrokeColor }}`. Respects cascaded
 * `isAllAnimationsDisabled`.
 *
 * @component PieChart.Label — Text label rendered inside a slice. Accepts a Skia `font`,
 * `radiusOffset`, `color`, an explicit `text` override, and a render-function `children` for
 * fully custom label content.
 */
const PieChart = Object.assign(PieChartRoot, {
  /** Wraps the chart engine's `Pie.Chart`; owns the layout props and per-slice render callback. */
  Pie: PieChartPie,
  /** Single pie/donut slice; fill is automatically sourced from `data[colorKey]`. */
  Slice: PieChartSlice,
  /** Angular stroke between adjacent slices for a segmented look. */
  SliceAngularInset: PieChartSliceAngularInset,
  /** Text label rendered inside a slice (must be a child of `PieChart.Slice`). */
  Label: PieChartLabel,
});
export default PieChart;
