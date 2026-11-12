import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: '',
  variants: {
    orientation: {
      horizontal: 'toggle-button-group__root--orientation-horizontal',
      vertical: 'toggle-button-group__root--orientation-vertical',
    },
    isDetached: {
      true: 'toggle-button-group__root--is-detached',
      false: 'toggle-button-group__root--is-detached-false',
    },
    fullWidth: {
      true: 'toggle-button-group__root--full-width',
      false: '',
    },
    isDisabled: {
      true: 'toggle-button-group__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    fullWidth: false,
    isDisabled: false,
  },
});
export const toggleButtonGroupClassNames = combineStyles({
  root,
});
export const toggleButtonGroupStyleSheet = StyleSheet.create({
  root: {
    borderCurve: 'continuous',
  },
});
