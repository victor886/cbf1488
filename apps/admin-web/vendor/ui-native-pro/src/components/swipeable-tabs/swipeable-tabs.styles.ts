import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition. Passed to heroui-native `Tabs` as `className`, so
 * it composes after the `tabs__root` base.
 *
 * `SwipeableTabs.Indicator` has no definition here: it reuses heroui-native's
 * `tabsClassNames.indicator` so it matches `Tabs.Indicator` in every theme.
 */
const root = tv({
  base: 'swipeable-tabs__root',
});
/**
 * Pager container style definition.
 */
const pager = tv({
  base: 'swipeable-tabs__pager',
});
/**
 * Content (page) style definition.
 */
const content = tv({
  base: 'swipeable-tabs__content',
});
export const swipeableTabsClassNames = combineStyles({
  root,
  pager,
  content,
});
