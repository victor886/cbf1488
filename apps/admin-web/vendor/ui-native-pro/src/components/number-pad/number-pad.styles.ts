import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/** Root grid container — vertical stack of key rows. */
const root = tv({
  base: 'number-pad__root',
  variants: {
    isDisabled: {
      true: 'number-pad__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/** Row container — distributes its cells evenly across the width. */
const row = tv({
  base: 'number-pad__row',
});
/**
 * Pressable key surface.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (scale) - Animated for press feedback
 *
 * To customize, use the `animation` prop on `NumberPad.Key`.
 * To disable animated styles, set `isAnimatedStyleActive={false}`.
 */
const key = tv({
  base: [
    'number-pad__key',
    'data-[disabled=true]:opacity-disabled',
    'data-[disabled=true]:pointer-events-none',
  ],
});
/**
 * Key background style definition — absolute-fill container behind the key
 * surface, hosting theme-specific layers (e.g. glass blur) or custom
 * content (gradients, images).
 */
const keyBackground = tv({
  base: 'number-pad__key-background',
});
/** Digit label text rendered inside a key. */
const keyLabel = tv({
  base: 'number-pad__key-label',
});
/** Backspace key surface — transparent background over the key base. */
const backspace = tv({
  base: 'number-pad__backspace',
});
/** Spacer rendered as a key (has children) — transparent background. */
const spacerActive = tv({
  base: 'number-pad__spacer-active',
});
/** Inert spacer cell occupying one grid column. */
const spacerInactive = tv({
  base: 'number-pad__spacer-inactive',
});
/** Combined Tailwind class definitions for all NumberPad parts. */
export const numberPadClassNames = combineStyles({
  root,
  row,
  key,
  keyBackground,
  keyLabel,
  backspace,
  spacerActive,
  spacerInactive,
});
export const numberPadStyleSheet = StyleSheet.create({
  keyContainer: {
    borderCurve: 'continuous',
  },
});
