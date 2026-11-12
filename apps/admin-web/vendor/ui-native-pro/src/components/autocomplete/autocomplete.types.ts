// @ts-nocheck
import type { ScrollViewProps, TextStyle, ViewProps, ViewStyle } from 'react-native';
import type { CloseButtonProps } from 'heroui-native/close-button';
import type { SearchFieldInputProps, SearchFieldProps } from 'heroui-native/search-field';
import type {
  SelectCloseProps,
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
import type { EmptySlots } from './autocomplete.styles.js';
/**
 * Selection mode for the autocomplete component.
 * - 'single': Only one option can be selected at a time (default)
 * - 'multiple': Multiple options can be selected simultaneously
 */
export type AutocompleteSelectionMode = SelectionMode;
/**
 * Option shape for `Autocomplete` (same shape as the `Select` value).
 */
export type AutocompleteOption = SelectOption;
/**
 * Resolves the value type based on selection mode.
 * - `'single'` → `AutocompleteOption`
 * - `'multiple'` → `AutocompleteOption[]`
 */
export type AutocompleteValueType<M extends AutocompleteSelectionMode> = SelectValueType<M>;
/**
 * Predicate deciding whether an item matches the current search text.
 *
 * @param textValue - Text representation of the item (item `textValue` prop,
 * falling back to `label`)
 * @param inputValue - Current search text typed into `Autocomplete.SearchField`
 * @returns `true` when the item should stay visible
 */
export type AutocompleteFilter = (textValue: string, inputValue: string) => boolean;
/**
 * Props for the `Autocomplete` root.
 *
 * Extends the `Select` root (selection, open state, and presentation are
 * managed at this level) and adds in-popover search filtering: `inputValue` /
 * `defaultInputValue` / `onInputChange` control the search text, `filter`
 * decides item visibility, and `onClear` reacts to
 * `Autocomplete.ClearButton` presses.
 */
export interface AutocompleteRootProps<M extends AutocompleteSelectionMode = 'single'> extends Omit<
  SelectRootProps<M>,
  'animation'
> {
  /**
   * Whether the field is in an invalid state (applies danger styling on the trigger)
   * @default false
   */
  isInvalid?: boolean;
  /**
   * Whether the field is required (e.g. asterisk in an associated label)
   * @default false
   */
  isRequired?: boolean;
  /**
   * Controlled search text shown in `Autocomplete.SearchField`.
   */
  inputValue?: string;
  /**
   * Uncontrolled initial search text.
   * @default ""
   */
  defaultInputValue?: string;
  /**
   * Called when the search text changes.
   */
  onInputChange?: (value: string) => void;
  /**
   * Predicate deciding whether an item matches the current search text.
   * Defaults to a case- and diacritic-insensitive "contains" match.
   */
  filter?: AutocompleteFilter;
  /**
   * Whether the search text resets to an empty string when the overlay closes.
   * @default true
   */
  clearInputOnClose?: boolean;
  /**
   * Called after `Autocomplete.ClearButton` clears the selection.
   */
  onClear?: () => void;
  /**
   * Animation configuration for the autocomplete root
   * - `"disable-all"`: Disable all animations including children (cascades down to all child components)
   * - `undefined`: Use default animations
   */
  animation?: AnimationRootDisableAll;
}
/**
 * Props for `Autocomplete.Trigger` — extends `Select.Trigger` with invalid border styling.
 */
export interface AutocompleteTriggerProps extends Omit<SelectTriggerProps, 'variant'> {
  /**
   * When `true`, applies a 1.5px danger border. When omitted, uses `FormField` context from `Autocomplete`.
   */
  isInvalid?: boolean;
}
/**
 * Props for `Autocomplete.Value` — extends `Select.Value` with a default placeholder.
 */
export type AutocompleteValueProps = Omit<SelectValueProps, 'placeholder'> & {
  /**
   * Shown when no option is selected
   * @default "Select an item"
   */
  placeholder?: string;
};
/**
 * Props for `Autocomplete.TriggerIndicator` — same as `Select.TriggerIndicator`
 * (animated chevron that rotates with the open state).
 */
export type AutocompleteTriggerIndicatorProps = SelectTriggerIndicatorProps;
/**
 * Props for `Autocomplete.ClearButton` — extends `CloseButton`.
 * Rendered inside the trigger row; hidden while nothing is selected.
 * Pressing it clears the selection and calls `onClear` from the root.
 */
export type AutocompleteClearButtonProps = CloseButtonProps;
/**
 * Props for `Autocomplete.Portal` — same as `Select.Portal`.
 */
export type AutocompletePortalProps = SelectPortalProps;
/**
 * Props for `Autocomplete.Overlay` — same as `Select.Overlay`.
 * The backdrop is tinted for the dialog and bottom-sheet presentations and
 * transparent for popovers (kept mounted for tap-outside dismissal only).
 */
export type AutocompleteOverlayProps = SelectOverlayProps;
/**
 * Props for `Autocomplete.Content` — same as `Select.Content`
 * (discriminated union on `presentation`: popover, bottom-sheet, dialog).
 *
 * @note For the bottom-sheet presentation, the sheet defaults to a fixed
 * `snapPoints={['90%']}` with `enableDynamicSizing={false}` — the search
 * input autofocuses on open, so the sheet must be tall enough from the
 * start to keep the content above the keyboard. Keyboard props default to
 * `keyboardBehavior="extend"`, `keyboardBlurBehavior="restore"`, and
 * `android_keyboardInputMode="adjustResize"`. Pass any of these props
 * explicitly to override.
 */
export type AutocompleteContentProps = SelectContentProps;
/**
 * Props for `Autocomplete.ContentBackground` — same as `Select.ContentBackground`.
 */
export type AutocompleteContentBackgroundProps = SelectContentBackgroundProps;
/**
 * Props for `Autocomplete.SearchField` — `SearchField` wired to the
 * autocomplete search text. `value` and `onChange` come from the root, so
 * they are omitted. When `children` are not provided, a default composition
 * (`Group > SearchIcon + Input + ClearButton`) is rendered.
 */
export interface AutocompleteSearchFieldProps extends Omit<SearchFieldProps, 'value' | 'onChange'> {
  /**
   * Placeholder for the default search input (ignored when `children` are provided)
   * @default "Search..."
   */
  placeholder?: string;
  /**
   * Whether the default search input focuses automatically when the overlay
   * opens (ignored when `children` are provided). Focus is driven by the
   * open state rather than mount-time `autoFocus`, so presentations that
   * keep their content mounted while closed (bottom sheet) do not summon
   * the keyboard early; the input also blurs when the overlay closes.
   * @default true
   */
  autoFocus?: boolean;
  /**
   * Delay in milliseconds between the overlay opening and the automatic
   * focus of the default search input. Gives the presentation (popover
   * positioning, sheet/dialog entering animation) time to settle so the
   * keyboard shows reliably. Ignored when `autoFocus` is `false` or
   * `children` are provided.
   * @default 150 for the popover and dialog presentations, 300 for bottom-sheet
   */
  autoFocusDelay?: number;
  /**
   * Extra props for the default `SearchField.Input` (ignored when `children`
   * are provided). The default input uses `variant="secondary"`; pass
   * `variant` here to override it.
   */
  inputProps?: SearchFieldInputProps;
}
/**
 * Props for `Autocomplete.List` — scrollable container for items.
 * Keeps taps working while the keyboard is open
 * (`keyboardShouldPersistTaps="handled"` by default).
 */
export interface AutocompleteListProps extends ScrollViewProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}
/**
 * Props for `Autocomplete.Item` — extends `Select.Item` with a filter text override.
 */
export interface AutocompleteItemProps extends SelectItemProps {
  /**
   * Text used for filtering instead of `label` (e.g. include keywords or a
   * plain-text version of a custom-rendered label).
   */
  textValue?: string;
}
/**
 * Props for `Autocomplete.ItemLabel` — same as `Select.ItemLabel`.
 */
export type AutocompleteItemLabelProps = SelectItemLabelProps;
/**
 * Props for `Autocomplete.ItemDescription` — same as `Select.ItemDescription`.
 */
export type AutocompleteItemDescriptionProps = SelectItemDescriptionProps;
/**
 * Props for `Autocomplete.ItemIndicator` — same as `Select.ItemIndicator`.
 */
export type AutocompleteItemIndicatorProps = SelectItemIndicatorProps;
/**
 * Props for `Autocomplete.ListLabel` — same as `Select.ListLabel`.
 */
export type AutocompleteListLabelProps = SelectListLabelProps;
/**
 * Props for `Autocomplete.Close` — same as `Select.Close`.
 */
export type AutocompleteCloseProps = SelectCloseProps;
/**
 * Props for `Autocomplete.Empty` — fallback shown when no registered item
 * matches the current search text (also covers an empty item collection).
 * String (or omitted) `children` render inside a styled text element;
 * custom nodes render as-is.
 */
export interface AutocompleteEmptyProps extends ViewProps {
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
