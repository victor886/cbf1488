import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * @note The `translate-x-*` / `translate-y-*` utilities in `placement` stay
 * here: Tailwind implements them through the composable `translate`
 * mechanism, which has no single-declaration equivalent in the uniwind CSS
 * parser. All other styles live in `styles/components/badge.css`.
 */
const root = tv({
  base: 'badge__root',
  variants: {
    size: {
      sm: 'badge__root--size-sm',
      md: 'badge__root--size-md',
      lg: 'badge__root--size-lg',
    },
    color: {
      default: '',
      accent: '',
      success: '',
      warning: '',
      danger: '',
    },
    variant: {
      primary: '',
      secondary: 'badge__root--variant-secondary',
      soft: '',
    },
    placement: {
      'top-right': 'badge__root--placement-top-right translate-x-1/6 -translate-y-1/6',
      'top-left': 'badge__root--placement-top-left -translate-x-1/6 -translate-y-1/6',
      'bottom-right': 'badge__root--placement-bottom-right translate-x-1/6 translate-y-1/6',
      'bottom-left': 'badge__root--placement-bottom-left -translate-x-1/6 translate-y-1/6',
    },
    isDot: {
      true: 'badge__root--is-dot',
      false: '',
    },
  },
  compoundVariants: [
    // Primary + color
    {
      variant: 'primary',
      color: 'default',
      className: 'badge__root--variant-primary--color-default',
    },
    {
      variant: 'primary',
      color: 'accent',
      className: 'badge__root--variant-primary--color-accent',
    },
    {
      variant: 'primary',
      color: 'success',
      className: 'badge__root--variant-primary--color-success',
    },
    {
      variant: 'primary',
      color: 'warning',
      className: 'badge__root--variant-primary--color-warning',
    },
    {
      variant: 'primary',
      color: 'danger',
      className: 'badge__root--variant-primary--color-danger',
    },
    // Soft + color
    {
      variant: 'soft',
      color: 'default',
      className: 'badge__root--variant-soft--color-default',
    },
    {
      variant: 'soft',
      color: 'accent',
      className: 'badge__root--variant-soft--color-accent',
    },
    {
      variant: 'soft',
      color: 'success',
      className: 'badge__root--variant-soft--color-success',
    },
    {
      variant: 'soft',
      color: 'warning',
      className: 'badge__root--variant-soft--color-warning',
    },
    {
      variant: 'soft',
      color: 'danger',
      className: 'badge__root--variant-soft--color-danger',
    },
  ],
  defaultVariants: {
    size: 'md',
    color: 'default',
    variant: 'primary',
    placement: 'top-right',
    isDot: false,
  },
});
/**
 * Background style definition.
 * Absolute-fill container rendered behind the badge surface, matching the
 * root's border radius and clipping.
 */
const background = tv({
  base: 'badge__background',
});
const label = tv({
  base: 'badge__label',
  variants: {
    size: {
      sm: 'badge__label--size-sm',
      md: 'badge__label--size-md',
      lg: 'badge__label--size-lg',
    },
    color: {
      default: '',
      accent: '',
      success: '',
      warning: '',
      danger: '',
    },
    variant: {
      primary: '',
      secondary: '',
      soft: '',
    },
  },
  compoundVariants: [
    // Primary + color -> foreground text
    {
      variant: 'primary',
      color: 'default',
      className: 'badge__label--variant-primary--color-default',
    },
    {
      variant: 'primary',
      color: 'accent',
      className: 'badge__label--variant-primary--color-accent',
    },
    {
      variant: 'primary',
      color: 'success',
      className: 'badge__label--variant-primary--color-success',
    },
    {
      variant: 'primary',
      color: 'warning',
      className: 'badge__label--variant-primary--color-warning',
    },
    {
      variant: 'primary',
      color: 'danger',
      className: 'badge__label--variant-primary--color-danger',
    },
    // Secondary + color -> colored text on default bg
    {
      variant: 'secondary',
      color: 'default',
      className: 'badge__label--variant-secondary--color-default',
    },
    {
      variant: 'secondary',
      color: 'accent',
      className: 'badge__label--variant-secondary--color-accent',
    },
    {
      variant: 'secondary',
      color: 'success',
      className: 'badge__label--variant-secondary--color-success',
    },
    {
      variant: 'secondary',
      color: 'warning',
      className: 'badge__label--variant-secondary--color-warning',
    },
    {
      variant: 'secondary',
      color: 'danger',
      className: 'badge__label--variant-secondary--color-danger',
    },
    // Soft + color -> colored text on soft bg
    {
      variant: 'soft',
      color: 'default',
      className: 'badge__label--variant-soft--color-default',
    },
    {
      variant: 'soft',
      color: 'accent',
      className: 'badge__label--variant-soft--color-accent',
    },
    {
      variant: 'soft',
      color: 'success',
      className: 'badge__label--variant-soft--color-success',
    },
    {
      variant: 'soft',
      color: 'warning',
      className: 'badge__label--variant-soft--color-warning',
    },
    {
      variant: 'soft',
      color: 'danger',
      className: 'badge__label--variant-soft--color-danger',
    },
  ],
  defaultVariants: {
    size: 'md',
    color: 'default',
    variant: 'primary',
  },
});
export const badgeClassNames = combineStyles({
  root,
  background,
  label,
});
export const badgeStyleSheet = StyleSheet.create({
  root: {
    borderCurve: 'continuous',
  },
});
