import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition.
 */
const root = tv({
  base: 'morph-tabs__root',
});
/**
 * List (header row) style definition.
 */
const list = tv({
  base: 'morph-tabs__list',
});
/**
 * Trigger (pill) style definition.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `flexGrow` - Interpolated from the pager position so the active pill
 *   fills the leftover row space
 *
 * To customize, use the `animation` prop on `MorphTabs.Trigger`:
 * ```tsx
 * <MorphTabs.Trigger value="home" animation={{ flexGrow: { value: [0, 2] } }} />
 * ```
 *
 * To disable animated styles, set `isAnimatedStyleActive={false}`.
 */
const trigger = tv({
  base: 'morph-tabs__trigger',
  variants: {
    isDisabled: {
      true: 'morph-tabs__trigger--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * Trigger background (theme layer) style definition.
 */
const triggerBackground = tv({
  base: 'morph-tabs__trigger-background',
});
/**
 * Icon wrapper style definition.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `opacity` - Interpolated from the pager position (inactive to active)
 *
 * To customize, use the `animation` prop on `MorphTabs.Icon`. To disable
 * animated styles, set `isAnimatedStyleActive={false}`.
 */
const icon = tv({
  base: 'morph-tabs__icon',
});
/**
 * Label style definition (clipping container + text).
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The `container` slot animates the following:
 * - `opacity` - Interpolated from the pager position (inactive to active)
 * - `maxWidth` - Grows from `0` to the measured label width, so a collapsed
 *   pill holds only the centered icon
 *
 * To customize, use the `animation` prop on `MorphTabs.Label`. To disable,
 * set `isAnimatedStyleActive={false}`.
 */
const label = tv({
  slots: {
    container: 'morph-tabs__label-container',
    text: 'morph-tabs__label',
  },
});
/**
 * Invisible measuring host for the label's natural width (internal).
 */
const labelMeasure = tv({
  base: 'morph-tabs__label-measure',
});
/**
 * Pager container style definition.
 */
const pager = tv({
  base: 'morph-tabs__pager',
});
/**
 * Content (page) style definition.
 */
const content = tv({
  base: 'morph-tabs__content',
});
export const morphTabsClassNames = combineStyles({
  root,
  list,
  trigger,
  triggerBackground,
  icon,
  label,
  labelMeasure,
  pager,
  content,
});
export const morphTabsStyleSheet = StyleSheet.create({
  trigger: {
    borderCurve: 'continuous',
  },
});

export type MorphTabsLabelSlots = keyof ReturnType<typeof label>;
