// @ts-nocheck
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root (`View`) wrapper around `CartesianChart`.
 *
 * Base `w-full` lets the chart participate in flex layouts; height must be supplied by the
 * consumer via `wrapperClassName` (for example `h-52`).
 */
const root = tv({
  base: 'bar-chart__root',
});
/**
 * Combined Tailwind Variant entries for `BarChart`. Only the outer wrapper is styled with tv;
 * bar fills use `colorClassName` on Uniwind-wrapped Skia primitives.
 */
export const barChartClassNames = combineStyles({
  root,
});
export default barChartClassNames;
