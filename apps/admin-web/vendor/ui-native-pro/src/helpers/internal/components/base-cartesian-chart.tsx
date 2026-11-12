// @ts-nocheck
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useThemeColor } from 'heroui-native/hooks';
import { colorKit } from 'heroui-native/utils';
import ReactNativeSkiaPackage from '../../../optional/react-native-skia';
import { CartesianChart } from '../../../primitives/charts/index';
const { matchFont } = ReactNativeSkiaPackage ?? {};
const DEFAULT_FONT_FAMILY = Platform.select({
  ios: 'Helvetica',
  default: 'sans-serif',
});
const DEFAULT_FONT_STYLE = {
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSize: 11,
  fontStyle: 'normal',
  fontWeight: 'normal',
};
const LINE_COLOR_ALPHA = 0.4;
const DEFAULT_X_AXIS_LINE_WIDTH = 0;
const DEFAULT_DOMAIN_PADDING = 8;
/**
 * Resolve the default axis font lazily. On web, CanvasKit's "system" FontMgr is an empty
 * TypefaceFontProvider, so `matchFont('sans-serif')` throws — catch and leave labels unstyled
 * until the app registers fonts / passes `xAxis.font` / `yAxis.font`.
 */
const resolveDefaultAxisFont = () => {
  if (!matchFont) return undefined;
  try {
    return matchFont(DEFAULT_FONT_STYLE);
  } catch {
    return undefined;
  }
};
// --------------------------------------------------
// Types
// --------------------------------------------------
/**
 * Keys of `T` whose values are valid x-axis input types (`number` or `string`).
 *
 * Mirrors the chart engine's internal `InputFields` helper (not part of the public API) so
 * `BaseCartesianChart` can be parameterized with the same generic constraints as `CartesianChart`.
 */
/**
 * Keys of `T` whose values are numeric (or nullable) y-axis fields.
 *
 * Mirrors the chart engine's internal `NumericalFields` helper.
 */
/**
 * Union of the parameter types across all `CartesianChart` call signatures.
 *
 * The chart engine declares `CartesianChart` with three overloads (horizontal, vertical, and
 * dynamic orientation). `Parameters<typeof CartesianChart<...>>[0]` resolves to the **last**
 * overload only — the dynamic-orientation one, which makes `orientation` required and widens
 * axis label types (e.g. `formatYLabel` becomes `(label: string | number) => string`). That
 * breaks the common vertical usage where `orientation` is omitted. Matching the overload list
 * explicitly recovers all three prop shapes; the single-signature branch is a fallback in case
 * upstream changes the overload count.
 */
/**
 * Full set of props accepted by `BaseCartesianChart` — identical to the chart engine's
 * `CartesianChart` props for the chosen data / x-key / y-keys, across all orientation overloads.
 *
 * We derive the shape from the wrapped component so any additions upstream flow through without
 * needing manual re-declaration.
 */
/**
 * Widest single overload shape (dynamic orientation, last in the overload list). Used internally
 * to collapse the {@link BaseCartesianChartProps} union back into one object shape when spreading
 * into `CartesianChart` — spreading a destructured union rest cannot satisfy any individual
 * overload (same TS limitation documented in `PieChart` for `ChartLayoutModeProps`). Safe at
 * runtime: `orientation` defaults to `"vertical"` inside the chart engine when omitted, and axis
 * label callback parameters are only widened, never narrowed.
 */
// --------------------------------------------------
// Component
// --------------------------------------------------
/**
 * Themed wrapper around the chart engine's `CartesianChart` that injects sensible defaults for axis
 * styling so the chart visually matches the HeroUI Native theme out of the box.
 *
 * Defaults applied (each overridable through the corresponding chart engine prop):
 * - `xAxis.font` / `yAxis[i].font` — a Skia font built from a platform-aware sans/serif family
 *   (via {@link resolveDefaultAxisFont}; may be `undefined` on web until fonts are registered).
 * - `xAxis.lineColor` / `yAxis[i].lineColor` — theme `muted` at 15% alpha for subtle gridlines.
 * - `xAxis.labelColor` / `yAxis[i].labelColor` — theme `muted` so tick labels stay legible without
 *   competing with the data series.
 *
 * **Precedence**: defaults are merged first and any property explicitly supplied via `xAxis` or
 * a `yAxis[i]` entry wins (standard spread-merge semantics). If `yAxis` is omitted we still emit
 * one default entry so the chart engine always has at least one y-axis to render.
 *
 * **Generics**: `ref` is accepted as a regular prop (React 19) and forwarded via
 * the spread. We intentionally avoid `forwardRef`, which would erase the `RawData` / `XK` / `YK`
 * generic parameters required for strongly-typed `points` in the render callback.
 *
 * @example
 * ```tsx
 * <BaseCartesianChart data={data} xKey="month" yKeys={["revenue"]}>
 *   {({ points }) => <Line points={points.revenue} />}
 * </BaseCartesianChart>
 * ```
 */
export function BaseCartesianChart(props) {
  /**
   * The cast collapses the overload union back into the widest (dynamic-orientation) shape so
   * the destructured rest can be spread into `CartesianChart` — a rest object built from a
   * union no longer satisfies any individual overload (see {@link BaseCartesianChartWidestProps}).
   */
  const {
    xAxis: userXAxis,
    yAxis: userYAxis,
    domainPadding = DEFAULT_DOMAIN_PADDING,
    ...rest
  } = props;
  const themeColorMuted = useThemeColor('muted');
  /**
   * Axis defaults derived from the active theme. Recomputed only when the resolved `muted` color
   * changes (theme switch), keeping the `xAxis` / `yAxis` references stable for the chart engine's
   * memoization inside `useBuildChartAxis`.
   */
  const axisDefaults = useMemo(
    () => ({
      font: resolveDefaultAxisFont(),
      lineColor: colorKit.setAlpha(themeColorMuted, LINE_COLOR_ALPHA).hex(),
      labelColor: themeColorMuted,
    }),
    [themeColorMuted]
  );
  /**
   * Merged x-axis config: themed defaults first, user overrides last so any explicit value wins.
   *
   * Additionally defaults to {@link DEFAULT_X_AXIS_LINE_WIDTH} so the horizontal rule stays hidden
   * unless explicitly re-enabled by the caller.
   */
  const xAxis = useMemo(
    () => ({
      ...axisDefaults,
      lineWidth: DEFAULT_X_AXIS_LINE_WIDTH,
      ...userXAxis,
    }),
    [axisDefaults, userXAxis]
  );
  /**
   * Merged y-axis config: the chart engine expects an array (one entry per y-axis). We default to a
   * single themed entry when none is supplied, otherwise we merge defaults into each provided
   * entry so multi-axis charts get consistent theming while still allowing per-axis overrides.
   */
  const yAxis = useMemo(() => {
    const entries = userYAxis ?? [undefined];
    return entries.map((entry) => ({
      ...axisDefaults,
      ...entry,
    }));
  }, [axisDefaults, userYAxis]);
  return <CartesianChart {...rest} domainPadding={domainPadding} xAxis={xAxis} yAxis={yAxis} />;
}
BaseCartesianChart.displayName = 'HeroUINative.BaseCartesianChart';
