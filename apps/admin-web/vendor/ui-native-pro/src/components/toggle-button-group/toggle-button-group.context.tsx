import { createContext, useContext } from 'react';
import type { ButtonSize } from 'heroui-native';
import type { ToggleButtonGroupOrientation } from './toggle-button-group.types';
/**
 * Context value shared by a {@link ToggleButtonGroup} with its descendants.
 * Allows consumers (e.g. a child `ToggleButton` or a custom item) to read
 * the current group state without prop drilling.
 */
/**
 * React context propagating group state to descendants.
 * Set to `null` outside a {@link ToggleButtonGroup} so {@link useToggleGroup}
 * can throw a meaningful error instead of yielding undefined values.
 */
export const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextValue | null>(null);
/**
 * Read the parent {@link ToggleButtonGroup} state.
 *
 * @throws Error when used outside a `ToggleButtonGroup`.
 */
export function useToggleGroup() {
  const ctx = useContext(ToggleButtonGroupContext);
  if (ctx === null) {
    throw new Error('useToggleGroup must be used within a <ToggleButtonGroup> component.');
  }
  return ctx;
}

/**
 * Context value shared by a {@link ToggleButtonGroup} with its descendants.
 * Allows consumers (e.g. a child `ToggleButton` or a custom item) to read
 * the current group state without prop drilling.
 */
export interface ToggleButtonGroupContextValue {
  /** Set of currently selected keys */
  selectedKeys: Set<string>;
  /** Callback when a toggle button is pressed */
  onToggle: (key: string) => void;
  /** Size cascaded to children */
  size: ButtonSize;
  /** Layout orientation */
  orientation: ToggleButtonGroupOrientation;
  /** Whether buttons are visually separated */
  isDetached: boolean;
  /** Whether the group fills available width (cascaded to children for `flex-1`) */
  fullWidth: boolean;
  /** Whether the group is disabled */
  isDisabled: boolean;
}
