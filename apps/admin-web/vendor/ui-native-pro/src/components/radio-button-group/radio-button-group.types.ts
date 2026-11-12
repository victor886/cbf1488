import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import type {
  RadioGroupItemContextValue,
  RadioGroupItemProps,
  RadioGroupProps,
} from 'heroui-native';
/**
 * Return type of the `useRadioButtonGroup` hook.
 *
 * Mirrors the context provided by the underlying `RadioGroup` primitive. Defined explicitly so
 * the generated `.d.ts` does not reference internal `heroui-native` module paths (TS2742).
 */
export interface UseRadioButtonGroupReturn {
  /** The currently selected value of the radio group */
  value: string | undefined;
  /** Callback fired when the selected value changes */
  onValueChange: (val: string) => void;
  /** Whether the entire radio group is disabled */
  isDisabled?: boolean;
  /** Whether the radio group is invalid */
  isInvalid?: boolean;
  /** Variant style for the radio group */
  variant?: 'primary' | 'secondary';
}
/**
 * Return type of the `useRadioButtonGroupItem` hook.
 *
 * Re-exported from `heroui-native` so the declaration file can reference a public type.
 */
export type UseRadioButtonGroupItemReturn = RadioGroupItemContextValue | undefined;
/**
 * Props for the `RadioButtonGroup` root.
 *
 * Extends HeroUI Native `RadioGroup` props (`RadioGroupProps`). Controls the selected value,
 * field `name`, and optional group `variant`; child items read the same context unless they override
 * `variant` locally.
 */
export type RadioButtonGroupProps = RadioGroupProps;
/**
 * Props for `RadioButtonGroup.Item`.
 *
 * Extends HeroUI Native `RadioGroup.Item` props (`RadioGroupItemProps`). Each item corresponds to
 * one selectable option (`value`) and receives `data-selected` / `data-variant` for styling.
 */
export type RadioButtonGroupItemProps = RadioGroupItemProps & {
  /**
   * Background layer rendered behind the item surface.
   * - `undefined` (default): renders `RadioButtonGroup.ItemBackground` for
   *   the unselected `secondary` variant when the active library theme
   *   registers default background content (e.g. `glass`); otherwise no
   *   layer
   * - custom node: replaces the default layer entirely
   * - `null`: removes the background layer
   */
  background?: ReactNode;
};
/**
 * Props for `RadioButtonGroup.ItemBackground`.
 *
 * Absolute-fill container rendered behind the item surface. With no
 * children, the active library theme decides the default content (e.g. a
 * glass blur layer); pass children to host custom content with the same
 * positioning and clipping.
 */
export type RadioButtonGroupItemBackgroundProps = ViewProps & {
  /**
   * Custom content to render inside the background container.
   * When omitted, the active library theme's default background content is
   * rendered.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes (Uniwind/Tailwind).
   */
  className?: string;
};
/**
 * Props for `RadioButtonGroup.ItemContent`.
 *
 * Row container for label and radio control. Extends React Native `View` props with an optional
 * `className` for Uniwind/Tailwind.
 */
export type RadioButtonGroupItemContentProps = ViewProps & {
  /**
   * Additional CSS classes (Uniwind/Tailwind).
   */
  className?: string;
};
