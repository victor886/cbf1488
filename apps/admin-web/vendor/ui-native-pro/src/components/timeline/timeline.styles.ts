import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'timeline__root',
});
const item = tv({
  base: 'timeline__item',
  variants: {
    align: {
      start: 'timeline__item--align-start',
      center: 'timeline__item--align-center',
    },
    density: {
      comfortable: '',
      compact: '',
    },
    isLast: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      density: 'comfortable',
      isLast: false,
      className: 'timeline__item--density-comfortable--is-last-false',
    },
    {
      density: 'compact',
      isLast: false,
      className: 'timeline__item--density-compact--is-last-false',
    },
  ],
  defaultVariants: {
    align: 'start',
    density: 'comfortable',
    isLast: false,
  },
});
const leading = tv({
  base: 'timeline__leading',
});
const rail = tv({
  base: 'timeline__rail',
});
const marker = tv({
  base: 'timeline__marker',
  variants: {
    size: {
      sm: 'timeline__marker--size-sm',
      md: 'timeline__marker--size-md',
      lg: 'timeline__marker--size-lg',
    },
    status: {
      default: 'timeline__marker--status-default',
      muted: 'timeline__marker--status-muted',
      current: 'timeline__marker--status-current',
      success: 'timeline__marker--status-success',
      warning: 'timeline__marker--status-warning',
      danger: 'timeline__marker--status-danger',
    },
  },
  defaultVariants: {
    size: 'md',
    status: 'default',
  },
});
const connector = tv({
  base: 'timeline__connector',
});
const content = tv({
  base: 'timeline__content',
});
const title = tv({
  base: 'timeline__title',
  variants: {
    size: {
      sm: 'timeline__title--size-sm',
      md: 'timeline__title--size-md',
      lg: 'timeline__title--size-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
const description = tv({
  base: 'timeline__description',
  variants: {
    size: {
      sm: 'timeline__description--size-sm',
      md: 'timeline__description--size-md',
      lg: 'timeline__description--size-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
export const timelineClassNames = combineStyles({
  root,
  item,
  leading,
  rail,
  marker,
  connector,
  content,
  title,
  description,
});
