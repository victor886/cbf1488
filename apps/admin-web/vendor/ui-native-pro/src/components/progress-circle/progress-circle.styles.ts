import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition.
 * Centers the indicator and optional value label.
 */
const root = tv({
  base: 'progress-circle__root',
  variants: {
    isDisabled: {
      true: 'progress-circle__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * ValueLabel style definition.
 * Absolutely centered text on top of the circle indicator.
 */
const valueLabel = tv({
  base: 'progress-circle__value-label',
  variants: {
    size: {
      sm: 'progress-circle__value-label--size-sm',
      md: 'progress-circle__value-label--size-md',
      lg: 'progress-circle__value-label--size-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
export const progressCircleClassNames = combineStyles({
  root,
  valueLabel,
});
