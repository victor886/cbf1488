import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'number-field__root',
});
/**
 * DecrementButton style definition
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The following property in the `contentContainer` slot is animated:
 * - `transform` (scale) - Animated for press feedback
 *
 * To customize, use the `animation` prop on `NumberField.DecrementButton`:
 * ```tsx
 * <NumberField.DecrementButton
 *   animation={{
 *     scale: { value: [1, 0.88], timingConfig: { duration: 150 } },
 *   }}
 * />
 * ```
 *
 * To disable, set `animation={false}` on `NumberField.DecrementButton`.
 */
const decrementButton = tv({
  slots: {
    container:
      'number-field__decrement-button-container data-[pressed=true]:bg-field-placeholder/5',
    contentContainer: 'number-field__decrement-button-content-container',
  },
  variants: {
    isDisabled: {
      true: {
        container: 'number-field__decrement-button-container--is-disabled',
      },
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * IncrementButton style definition
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The following property in the `contentContainer` slot is animated:
 * - `transform` (scale) - Animated for press feedback
 *
 * To customize, use the `animation` prop on `NumberField.IncrementButton`:
 * ```tsx
 * <NumberField.IncrementButton
 *   animation={{
 *     scale: { value: [1, 0.88], timingConfig: { duration: 150 } },
 *   }}
 * />
 * ```
 *
 * To disable, set `animation={false}` on `NumberField.IncrementButton`.
 */
const incrementButton = tv({
  slots: {
    container:
      'number-field__increment-button-container data-[pressed=true]:bg-field-placeholder/5',
    contentContainer: 'number-field__increment-button-content-container',
  },
  variants: {
    isDisabled: {
      true: {
        container: 'number-field__increment-button-container--is-disabled',
      },
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
export const numberFieldClassNames = combineStyles({
  root,
  decrementButton,
  incrementButton,
});
export const numberFieldStyleSheet = StyleSheet.create({
  buttonBorderCurve: {
    borderCurve: 'continuous',
  },
});

export type DecrementButtonSlots = keyof ReturnType<typeof decrementButton>;

export type IncrementButtonSlots = keyof ReturnType<typeof incrementButton>;
