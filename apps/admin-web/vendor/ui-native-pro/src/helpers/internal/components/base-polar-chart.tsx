// @ts-nocheck
import { PolarChart } from '../../../primitives/charts/index';
// --------------------------------------------------
// Component
// --------------------------------------------------
/**
 * Themed wrapper around the internal `PolarChart` engine.
 *
 * Currently a generic-preserving passthrough — unlike `BaseCartesianChart`, the polar chart has
 * no axis/font surface to theme. Reserved as the integration seam so future polar-specific
 * theming (transform state, themed backdrops, etc.) lands in one place.
 *
 * **Generics**: kept as a function (not `forwardRef`) so the `RawData` / `LabelKey` / `ValueKey`
 * / `ColorKey` generic parameters survive into the consumer — `PolarChart` itself does not
 * expose a ref.
 *
 * @example
 * ```tsx
 * <BasePolarChart
 *   data={data}
 *   labelKey="label"
 *   valueKey="value"
 *   colorKey="color"
 * >
 *   <Pie.Chart />
 * </BasePolarChart>
 * ```
 */
export function BasePolarChart(props) {
  return <PolarChart {...props} />;
}
BasePolarChart.displayName = 'HeroUINative.BasePolarChart';
