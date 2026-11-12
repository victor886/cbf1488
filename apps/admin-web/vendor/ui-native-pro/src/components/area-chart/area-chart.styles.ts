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
  base: 'area-chart__root',
});
/**
 * Combined Tailwind Variant entries for `AreaChart`. Only the outer wrapper is styled with tv;
 * area colors use `colorClassName` on the Uniwind-wrapped Skia `Area`.
 */
export const areaChartClassNames = combineStyles({
  root,
});
export default areaChartClassNames;
