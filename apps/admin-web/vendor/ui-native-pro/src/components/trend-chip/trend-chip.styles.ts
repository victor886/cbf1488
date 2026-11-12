import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const indicator = tv({
  base: [
    'trend-chip__indicator',
    'data-[size=sm]:size-3.5',
    'data-[size=md]:size-4',
    'data-[size=lg]:size-5',
  ],
});
const value = tv({
  base: 'trend-chip__value',
});
const suffix = tv({
  base: 'trend-chip__suffix',
});
export const trendChipClassNames = combineStyles({
  indicator,
  value,
  suffix,
});
