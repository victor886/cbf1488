import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: '',
  variants: {
    variant: {
      default: '',
      ghost: '',
    },
    isSelected: {
      true: 'toggle-button__root--is-selected',
      false: '',
    },
    inAttachedGroup: {
      true: 'toggle-button__root--in-attached-group',
      false: '',
    },
    inGroup: {
      true: '',
      false: '',
    },
    groupFullWidth: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'default',
      isSelected: false,
      className: 'toggle-button__root--variant-default--is-selected-false',
    },
    {
      variant: 'ghost',
      isSelected: false,
      className: 'toggle-button__root--variant-ghost--is-selected-false',
    },
    {
      inGroup: true,
      groupFullWidth: true,
      className: 'toggle-button__root--in-group--group-full-width',
    },
  ],
  defaultVariants: {
    variant: 'default',
    isSelected: false,
    inAttachedGroup: false,
    inGroup: false,
    groupFullWidth: false,
  },
});
const label = tv({
  base: 'toggle-button__label',
  variants: {
    isSelected: {
      true: 'toggle-button__label--is-selected',
      false: 'toggle-button__label--is-selected-false',
    },
  },
  defaultVariants: {
    isSelected: false,
  },
});
export const toggleButtonClassNames = combineStyles({
  root,
  label,
});
