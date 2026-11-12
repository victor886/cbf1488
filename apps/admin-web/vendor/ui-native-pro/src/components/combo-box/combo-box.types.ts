// @ts-nocheck
import type { ScrollViewProps, TextStyle, ViewProps, ViewStyle } from 'react-native';
import type { CloseButtonProps } from 'heroui-native/close-button';
import type {
  InputGroupInputProps,
  InputGroupPrefixProps,
  InputGroupProps,
  InputGroupSuffixProps,
} from 'heroui-native/input-group';
import type {
  SelectContentBackgroundProps,
  SelectContentProps,
  SelectItemDescriptionProps,
  SelectItemIndicatorProps,
  SelectItemLabelProps,
  SelectItemProps,
  SelectListLabelProps,
  SelectOverlayProps,
  SelectPortalProps,
  SelectRootProps,
  SelectTriggerIndicatorProps,
  SelectTriggerProps,
  SelectValueProps,
} from 'heroui-native/select';
import type { AnimationRootDisableAll, ElementSlots } from '../../helpers/internal/types/index.js';
import type {
  SelectionMode,
  SelectOption,
  SelectValueType,
} from '../../primitives/select/index.js';
import type { EmptySlots } from './combo-box.styles.js';
/**
 * Selection mode for the combo box component.
 * - 'single': Only one option can be selected at a time (default)
 * - 'multiple': Multiple options can be selected simultaneously
 */
export type ComboBoxSelectionMode = SelectionMode;
/**
 * Option shape for `ComboBox` (same shape as the `Select` value).
 */
export type ComboBoxOption = SelectOption;
/**
 * Resolves the value type based on selection mode.
 * - `'single'` → `ComboBoxOption`
 * - `'multiple'` → `ComboBoxOption[]`
 */
export type ComboBoxValueType<M extends ComboBoxSelectionMode> = SelectValueType<M>;
/**
 * Interaction that opens the combo box popover.
 * - `'focus'`: opens when the input gains focus (and while typing)
 * - `'input'`: opens while typing into the input
 * - `'manual'`: opens only from `ComboBox.Trigger` presses (e.g. the chevron area)
 */
export type ComboBoxMenuTrigger = 'focus' | 'input' | 'manual';
/**
 * Predicate deciding whether an item matches the current input text.
 *
 * @param textValue - Text representation of the item (item `textValue` prop,
 * falling back to `label`)
 * @param inputValue - Current text typed into `ComboBox.Input`
 * @returns `true` when the item should stay visible
 */
export type ComboBoxFilter = (textValue: string, inputValue: string) => boolean;
/**
 * Props for the `ComboBox` root.
 *
 * Extends the `Select` root (selection and open state are managed at this
 * level) with an inline text input that filters items: `inputValue` /
 * `defaultInputValue` / `onInputChange` control the input text, `filter`
 * decides item visibility, and `menuTrigger` decides when the popover opens.
 * The popover presentation is fixed — `presentation` is not configurable.
 *
 * In single mode, selecting an item writes its label into the input and
 * clearing the input clears the selection; closing the popover reverts the
 * input text to the selected label (custom values are not kept). In multiple
 * mode, the input acts as a search field and is cleared when the popover
 * closes — display selections with `ComboBox.Value`.
 */
export interface ComboBoxRootProps<M extends ComboBoxSelectionMode = 'single'> extends Omit<
  SelectRootProps<M>,
  'animation' | 'presentation'
> {
  /**
   * Whether the field is in an invalid state (applies danger styling on the input)
   * @default false
   */
  isInvalid?: boolean;
  /**
   * Whether the field is required (e.g. asterisk in an associated label)
   * @default false
   */
  isRequired?: boolean;
  /**
   * Controlled text shown in `ComboBox.Input`.
   */
  inputValue?: string;
  /**
   * Uncontrolled initial input text.
   * @default ""
   */
  defaultInputValue?: string;
  /**
   * Called when the input text changes.
   */
  onInputChange?: (value: string) => void;
  /**
   * Interaction that opens the popover.
   * @default "focus"
   */
  menuTrigger?: ComboBoxMenuTrigger;
  /**
   * Predicate deciding whether an item matches the current input text.
   * Defaults to a case- and diacritic-insensitive "contains" match.
   */
  filter?: ComboBoxFilter;
  /**
   * Called after `ComboBox.ClearButton` clears the selection and input text.
   */
  onClear?: () => void;
  /**
   * Animation configuration for the combo box root
   * - `"disable-all"`: Disable all animations including children (cascades down to all child components)
   * - `undefined`: Use default animations
   */
  animation?: AnimationRootDisableAll;
}
/**
 * Props for `ComboBox.InputGroup` — same as `InputGroup`.
 * `isDisabled` defaults to the `ComboBox` root `isDisabled` when omitted.
 */
export type ComboBoxInputGroupProps = InputGroupProps;
/**
 * Props for `ComboBox.Input` — `InputGroup.Input` wired to the combo box
 * input text. `value` is driven by the root, so it is omitted along with
 * `defaultValue`. The optional `onChangeText` runs after the internal
 * handler; `onFocus` / `onBlur` run after the internal open/commit logic.
 *
 * `isDisabled` defaults to the `ComboBox` root `isDisabled` when omitted.
 */
export type ComboBoxInputProps = Omit<
  InputGroupInputProps,
  'value' | 'defaultValue' | 'onChangeText'
> & {
  onChangeText?: InputGroupInputProps['onChangeText'];
};
/**
 * Props for `ComboBox.Prefix` — same as `InputGroup.Prefix`.
 */
export type ComboBoxPrefixProps = InputGroupPrefixProps;
/**
 * Props for `ComboBox.Suffix` — same as `InputGroup.Suffix`.
 */
export type ComboBoxSuffixProps = InputGroupSuffixProps;
/**
 * Props for `ComboBox.Trigger` — pass-through to `Select.Trigger` (always
 * `unstyled`; the input carries the field styling). Wraps the input group so
 * the popover anchors to the full input width.
 */
export type ComboBoxTriggerProps = Omit<SelectTriggerProps, 'variant'>;
/**
 * Props for `ComboBox.TriggerIndicator` — same as `Select.TriggerIndicator`
 * (animated chevron that rotates with the open state).
 */
export type ComboBoxTriggerIndicatorProps = SelectTriggerIndicatorProps;
/**
 * Props for `ComboBox.ClearButton` — extends `CloseButton`.
 * Rendered inside the input group suffix; hidden while there is no selection
 * and the input is empty. Pressing it clears the selection and the input
 * text, then calls `onClear` from the root.
 */
export type ComboBoxClearButtonProps = CloseButtonProps;
/**
 * Props for `ComboBox.Value` — extends `Select.Value` with a default
 * placeholder. Primarily used in multiple mode to display the selected
 * labels (the input itself shows the selection in single mode).
 */
export type ComboBoxValueProps = Omit<SelectValueProps, 'placeholder'> & {
  /**
   * Shown when no option is selected
   * @default "No items selected"
   */
  placeholder?: string;
};
/**
 * Props for `ComboBox.Portal` — same as `Select.Portal`.
 */
export type ComboBoxPortalProps = SelectPortalProps;
/**
 * Props for `ComboBox.Overlay` — same as `Select.Overlay`.
 * Transparent by default (the input stays visible while the popover is
 * open); it still dismisses the popover when pressed.
 */
export type ComboBoxOverlayProps = SelectOverlayProps;
/**
 * Props for `ComboBox.Content` — the popover subset of `Select.Content`
 * (`presentation` is fixed to `"popover"`). `width` defaults to `"trigger"`
 * so the popover matches the input group width.
 */
export type ComboBoxContentProps = Omit<
  Extract<
    SelectContentProps,
    {
      presentation: 'popover';
    }
  >,
  'presentation'
>;
/**
 * Props for `ComboBox.ContentBackground` — same as `Select.ContentBackground`.
 */
export type ComboBoxContentBackgroundProps = SelectContentBackgroundProps;
/**
 * Props for `ComboBox.List` — scrollable container for items.
 * Keeps taps working while the keyboard is open
 * (`keyboardShouldPersistTaps="handled"` by default).
 */
export interface ComboBoxListProps extends ScrollViewProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}
/**
 * Props for `ComboBox.Item` — extends `Select.Item` with a filter text override.
 */
export interface ComboBoxItemProps extends SelectItemProps {
  /**
   * Text used for filtering instead of `label` (e.g. include keywords or a
   * plain-text version of a custom-rendered label).
   */
  textValue?: string;
}
/**
 * Props for `ComboBox.ItemLabel` — same as `Select.ItemLabel`.
 */
export type ComboBoxItemLabelProps = SelectItemLabelProps;
/**
 * Props for `ComboBox.ItemDescription` — same as `Select.ItemDescription`.
 */
export type ComboBoxItemDescriptionProps = SelectItemDescriptionProps;
/**
 * Props for `ComboBox.ItemIndicator` — same as `Select.ItemIndicator`.
 */
export type ComboBoxItemIndicatorProps = SelectItemIndicatorProps;
/**
 * Props for `ComboBox.ListLabel` — same as `Select.ListLabel`.
 */
export type ComboBoxListLabelProps = SelectListLabelProps;
/**
 * Props for `ComboBox.Empty` — fallback shown when no registered item
 * matches the current input text (also covers an empty item collection).
 * String (or omitted) `children` render inside a styled text element;
 * custom nodes render as-is.
 */
export interface ComboBoxEmptyProps extends ViewProps {
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Additional CSS classes for the container and text slots
   */
  classNames?: ElementSlots<EmptySlots>;
  /**
   * Styles for the container and text slots
   */
  styles?: {
    container?: ViewStyle;
    text?: TextStyle;
  };
}
