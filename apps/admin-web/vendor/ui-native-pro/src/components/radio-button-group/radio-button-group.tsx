import { forwardRef } from 'react';
import { View } from 'react-native';
import {
  RadioGroup,
  ThemeBackground,
  useHasDefaultThemeBackground,
  useRadioGroup,
  useRadioGroupItem,
} from 'heroui-native';
import { DISPLAY_NAME } from './radio-button-group.constants';
import {
  radioButtonGroupClassNames,
  radioButtonGroupStyleSheet,
} from './radio-button-group.styles';
import type {
  UseRadioButtonGroupItemReturn,
  UseRadioButtonGroupReturn,
} from './radio-button-group.types';
// --------------------------------------------------
export const useRadioButtonGroup: () => UseRadioButtonGroupReturn = useRadioGroup;
export const useRadioButtonGroupItem: () => UseRadioButtonGroupItemReturn = useRadioGroupItem;
// --------------------------------------------------
const RadioButtonGroupRoot = forwardRef((props: any, ref: any) => {
  return <RadioGroup ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the item
 * surface. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const RadioButtonGroupItemBackground = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const itemBackgroundClassName = radioButtonGroupClassNames.itemBackground({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={itemBackgroundClassName}
      fallbackColor="default"
      {...restProps}
    />
  );
});
// --------------------------------------------------
const RadioButtonGroupItem = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    style,
    variant: variantProp,
    isDisabled: isDisabledProp,
    background,
    ...restProps
  } = props;
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const { value, variant: variantGroup, isDisabled: isDisabledGroup } = useRadioButtonGroup();
  const isSelected = value === restProps.value;
  const variant = variantProp ?? variantGroup ?? 'primary';
  const isDisabled = isDisabledProp ?? isDisabledGroup ?? false;
  const itemClassName = radioButtonGroupClassNames.item({
    className,
  });
  /**
   * Background layer rendered behind the item surface.
   * - `undefined`: theme-aware default for the unselected `secondary`
   *   variant (its background resolves to `--color-default`; selection
   *   paints an opaque accent-soft tint)
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground && variant === 'secondary' && !isSelected ? (
      <RadioButtonGroupItemBackground />
    ) : null;
  return (
    <RadioGroup.Item
      ref={ref}
      className={itemClassName}
      variant={variant === 'primary' ? 'secondary' : 'primary'}
      style={typeof style === 'function' ? style : [radioButtonGroupStyleSheet.item, style]}
      data-selected={isSelected}
      data-variant={variant}
      data-disabled={isDisabled}
      {...restProps}
    >
      {typeof children === 'function' ? (
        (renderProps) => (
          <>
            {backgroundElement}
            {children(renderProps)}
          </>
        )
      ) : (
        <>
          {backgroundElement}
          {children}
        </>
      )}
    </RadioGroup.Item>
  );
});
// --------------------------------------------------
const RadioButtonGroupItemContent = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const itemContentClassName = radioButtonGroupClassNames.itemContent({
    className,
  });
  return <View ref={ref} className={itemContentClassName} {...restProps} />;
});
// --------------------------------------------------
RadioButtonGroupRoot.displayName = DISPLAY_NAME.ROOT;
RadioButtonGroupItem.displayName = DISPLAY_NAME.ITEM;
RadioButtonGroupItemBackground.displayName = DISPLAY_NAME.ITEM_BACKGROUND;
RadioButtonGroupItemContent.displayName = DISPLAY_NAME.ITEM_CONTENT;
/**
 * Compound RadioButtonGroup component with sub-components
 *
 * @component RadioButtonGroup - Wraps HeroUI Native `RadioGroup`. Manages the selected value and
 * optional group `variant`. Use `useRadioButtonGroup` as an alias for `useRadioGroup` when reading
 * group state from items.
 *
 * @component RadioButtonGroup.Item - Wraps `RadioGroup.Item` with `data-selected` and `data-variant`
 * for Tailwind and aligns item `variant` with the group for styling the radio row.
 *
 * @component RadioButtonGroup.ItemBackground - Absolute-fill background container behind the item
 * surface. With no children, the active library theme decides the default content (e.g. a glass
 * blur layer); pass children to host custom content with the same positioning and clipping.
 *
 * @component RadioButtonGroup.ItemContent - Optional row container for label, description, and
 * `Radio` / `Radio.Indicator` (place the control inside the item as needed).
 *
 * Selection state flows from the root via RadioGroup context (`useRadioButtonGroup` /
 * `useRadioButtonGroupItem`).
 *
 */
const RadioButtonGroup = Object.assign(RadioButtonGroupRoot, {
  /** @optional Radio row; wraps `RadioGroup.Item` with selection and variant data attributes */
  Item: RadioButtonGroupItem,
  /** @optional Theme-aware background container behind the item surface */
  ItemBackground: RadioButtonGroupItemBackground,
  /** @optional Layout container for label and control within an item */
  ItemContent: RadioButtonGroupItemContent,
});
export default RadioButtonGroup;
