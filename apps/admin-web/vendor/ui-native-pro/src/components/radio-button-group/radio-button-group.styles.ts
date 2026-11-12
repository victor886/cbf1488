import { StyleSheet } from 'react-native';
import { cn } from 'heroui-native/utils';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const item = tv({
  base: cn(
    'radio-button-group__item',
    'data-[variant=primary]:bg-field data-[variant=primary]:border-field data-[variant=primary]:ios:shadow-field data-[variant=primary]:android:shadow-sm',
    'data-[variant=secondary]:bg-default data-[variant=secondary]:border-default',
    'data-[selected=true]:shadow-md data-[selected=true]:outline-accent data-[selected=true]:bg-accent-soft'
  ),
});
/**
 * Item background style definition.
 * Absolute-fill container rendered behind the item surface, matching its
 * border radius and clipping.
 */
const itemBackground = tv({
  base: 'radio-button-group__item-background',
});
const itemContent = tv({
  base: 'radio-button-group__item-content',
});
export const radioButtonGroupClassNames = combineStyles({
  item,
  itemBackground,
  itemContent,
});
export const radioButtonGroupStyleSheet = StyleSheet.create({
  item: {
    borderCurve: 'continuous',
  },
});
