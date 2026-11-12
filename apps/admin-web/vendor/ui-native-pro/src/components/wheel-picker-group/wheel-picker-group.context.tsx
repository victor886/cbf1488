import { createContext, useContext } from 'react';
import type { WheelPickerGroupContextValue } from './wheel-picker-group.types';
/**
 * Internal context shared between {@link WheelPickerGroup} and its child
 * `WheelPicker` instances. Intentionally non-strict (defaults to `null`)
 * because a standalone `<WheelPicker />` outside a group is the primary
 * use case — the optional consumer hook returns `null` instead of
 * throwing.
 */
export const WheelPickerGroupContext = createContext<WheelPickerGroupContextValue | null>(null);
WheelPickerGroupContext.displayName = 'WheelPickerGroupContext';
/**
 * Strict consumer hook for {@link WheelPickerGroup} compound parts. Throws
 * when called outside a group provider.
 */
export function useWheelPickerGroup() {
  const ctx = useContext(WheelPickerGroupContext);
  if (!ctx) {
    throw new Error('useWheelPickerGroup must be used inside <WheelPickerGroup>.');
  }
  return ctx;
}
/**
 * Optional consumer hook used by `WheelPicker` to detect whether it is
 * being rendered inside a {@link WheelPickerGroup}. Returns `null` when
 * no group is present.
 */
export function useOptionalWheelPickerGroup() {
  return useContext(WheelPickerGroupContext);
}
