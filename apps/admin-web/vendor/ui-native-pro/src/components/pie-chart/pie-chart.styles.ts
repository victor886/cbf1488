// @ts-nocheck
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root (`View`) wrapper around `PolarChart`.
 *
 * Base `w-full` lets the chart participate in flex layouts; height must be supplied by the
 * consumer via `wrapperClassName` (for example `h-[260px]`).
 */
const root = tv({
  base: 'pie-chart__root',
});
/**
 * Combined Tailwind Variant entries for `PieChart`. Only the outer wrapper is styled with tv;
 * slice fills come from each data row's `colorKey` field (a Skia `Color`).
 */
export const pieChartClassNames = combineStyles({
  root,
});
export default pieChartClassNames;
