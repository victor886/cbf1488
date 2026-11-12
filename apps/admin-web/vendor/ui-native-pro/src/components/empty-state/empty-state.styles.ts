import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'empty-state__root',
});
const header = tv({
  base: 'empty-state__header',
});
const media = tv({
  base: 'empty-state__media',
  variants: {
    variant: {
      default: '',
      icon: 'empty-state__media--variant-icon',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
/**
 * Media background style definition.
 * Absolute-fill container rendered behind the icon media circle, matching
 * its pill radius and clipping.
 */
const mediaBackground = tv({
  base: 'empty-state__media-background',
});
const title = tv({
  base: 'empty-state__title',
});
const description = tv({
  base: 'empty-state__description',
});
const content = tv({
  base: 'empty-state__content',
});
export const emptyStateClassNames = combineStyles({
  root,
  header,
  media,
  mediaBackground,
  title,
  description,
  content,
});
export default emptyStateClassNames;
