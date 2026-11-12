import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition with two slots:
 *
 * - `container`: the outer `View` that lays out the prefix, value, and
 *   suffix inline.
 * - `value`: the `Text` rendering the formatted numeric string. Provides a
 *   default text color so the value is legible without extra styling.
 */
const root = tv({
  slots: {
    container: 'number-value__container',
    value: 'number-value__value',
  },
});
/**
 * Standalone alias for the root's `value` slot. Re-exporting the slot
 * callable through `combineStyles` keeps `NumberValueValue` decoupled from
 * the root's slot invocation while sharing the exact same base styles.
 */
const { value: rootValueSlot } = root();
const prefix = tv({
  base: '',
});
const suffix = tv({
  base: '',
});
/**
 * `NumberValue` class-name slots.
 *
 * Exposes the per-part `tv` instances so consumers can reuse them to build
 * variations that visually align with the default `NumberValue` styling.
 *
 * @example
 * ```tsx
 * import { numberValueClassNames } from 'heroui-native-pro';
 *
 * const { container, value } = numberValueClassNames.root();
 * ```
 */
export const numberValueClassNames = combineStyles({
  root,
  value: rootValueSlot,
  prefix,
  suffix,
});
/** Slot names available on the `root` tv instance. */

/** Slot names available on the `root` tv instance. */
export type RootSlots = keyof ReturnType<typeof root>;
