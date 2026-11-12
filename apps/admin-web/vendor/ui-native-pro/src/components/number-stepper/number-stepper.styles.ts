import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'number-stepper__root',
  variants: {
    isDisabled: {
      true: 'number-stepper__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * To completely disable animated styles and apply your own via className or style prop,
 * set `isAnimatedStyleActive={false}` on `NumberStepper.DecrementButton` / `NumberStepper.IncrementButton`.
 */
const button = tv({
  base: 'number-stepper__button',
  variants: {
    isDisabled: {
      true: 'disabled:opacity-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * Button background style definition — absolute-fill container behind a
 * stepper button's content, hosting theme-specific layers (e.g. glass blur)
 * or custom content (gradients, images).
 */
const buttonBackground = tv({
  base: 'number-stepper__button-background',
});
/**
 * Root background style definition — absolute-fill container behind the
 * root surface, hosting theme-specific layers (e.g. glass blur) or custom
 * content (gradients, images).
 */
const rootBackground = tv({
  base: 'number-stepper__root-background',
});
const value = tv({
  base: 'number-stepper__value',
});
export const numberStepperClassNames = combineStyles({
  root,
  rootBackground,
  button,
  buttonBackground,
  value,
});
export const numberStepperStyleSheet = StyleSheet.create({
  button: {
    borderCurve: 'continuous',
  },
});
