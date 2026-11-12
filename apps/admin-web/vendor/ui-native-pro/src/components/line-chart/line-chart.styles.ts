// @ts-nocheck
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root (`View`) wrapper around `CartesianChart`.
 *
 * Base `w-full` lets the chart participate in flex layouts; height must be supplied by the
 * consumer via `wrapperClassName` (for example `h-72`).
 */
const root = tv({
  base: 'line-chart__root',
});
/**
 * Combined Tailwind Variant entries for `LineChart`. Only the outer wrapper is styled with tv;
 * line colors use `colorClassName` on the Uniwind-wrapped Skia `Line`.
 */
export const lineChartClassNames = combineStyles({
  root,
});
export default lineChartClassNames;
