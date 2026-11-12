// @ts-nocheck
import type { ReactElement, ReactNode } from 'react';
import type { FlatListProps, TextStyle, ViewProps, ViewStyle } from 'react-native';
import type { InputGroupInputProps } from 'heroui-native/input-group';
import type { SearchFieldInputProps, SearchFieldProps } from 'heroui-native/search-field';
import type {
  SelectContentBackgroundProps,
  SelectContentProps,
  SelectItemProps,
  SelectOverlayProps,
  SelectPortalProps,
  SelectRootProps,
  SelectTriggerProps,
} from 'heroui-native/select';
import type { AnimationRootDisableAll, ElementSlots } from '../../helpers/internal/types/index.js';
import type {
  PhoneNumberFieldCountryItemSlots,
  PhoneNumberFieldCountryListSlots,
  PhoneNumberFieldTriggerSlots,
} from './phone-number-field.styles.js';
/**
 * A single country entry consumed by the `PhoneNumberField` country picker.
 */
export interface PhoneNumberFieldCountry {
  /**
   * ISO 3166-1 alpha-2 country code (e.g. `"US"`).
   */
  code: string;
  /**
   * English display name of the country.
   */
  name: string;
  /**
   * International dial code including the leading plus sign (e.g. `"+44"`).
   */
  dialCode: string;
  /**
   * Flag emoji derived from the ISO code via regional indicator symbols.
   */
  flag: string;
}
/**
 * Payload passed to `onValueChange` whenever the phone number or country changes.
 */
export interface PhoneNumberFieldValueDetails {
  /**
   * National number digits without formatting (e.g. `"5551234567"`).
   */
  nationalNumber: string;
  /**
   * Formatted national number as displayed in the input (e.g. `"(555) 123-4567"`).
   */
  formattedNumber: string;
  /**
   * Full number in E.164 format (e.g. `"+15551234567"`); empty string when no digits are entered.
   */
  e164: string;
  /**
   * The currently selected country.
   */
  country: PhoneNumberFieldCountry;
  /**
   * Whether the number is valid for the selected country.
   * Uses `libphonenumber-js` numbering plans when the optional peer dependency
   * is installed, otherwise degrades to the `isComplete` heuristic.
   */
  isValid: boolean;
  /**
   * Whether the number has a plausible length for the selected country
   * (metadata length check with `libphonenumber-js`; mask digit count as the
   * minimum and the E.164 digit budget as the maximum without it).
   */
  isComplete: boolean;
}
/**
 * Props for the `PhoneNumberField` root.
 *
 * Managed selection uses `value` / `onValueChange` for the national number digits and
 * `country` / `onCountryChange` for the selected country, with **`PhoneNumberField.Select`**
 * driving the country picker open state through `isOpen` / `onOpenChange`.
 */
export interface PhoneNumberFieldRootProps extends ViewProps {
  /**
   * Child elements (typically `Label`, `PhoneNumberField.InputGroup`, `Description`, `FieldError`).
   */
  children?: ReactNode;
  /**
   * Controlled national number digits (unformatted, e.g. `"5551234567"`).
   */
  value?: string;
  /**
   * Uncontrolled initial national number digits.
   */
  defaultValue?: string;
  /**
   * Controlled selected country as an ISO 3166-1 alpha-2 code (e.g. `"US"`).
   */
  country?: string;
  /**
   * Uncontrolled initial country as an ISO 3166-1 alpha-2 code.
   * When omitted, the device locale region is used, falling back to `"US"`.
   */
  defaultCountry?: string;
  /**
   * Controlled open state for the country picker surface.
   */
  isOpen?: boolean;
  /**
   * Uncontrolled initial open state for the country picker surface.
   */
  isDefaultOpen?: boolean;
  /**
   * Whether the entire field is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the field is in an invalid state.
   * @default false
   */
  isInvalid?: boolean;
  /**
   * Whether the field is required (e.g. asterisk on the label).
   * @default false
   */
  isRequired?: boolean;
  /**
   * Additional CSS classes on the root container.
   */
  className?: string;
  /**
   * Custom country list. Defaults to the full built-in dataset.
   * Use to restrict, reorder, or relabel the available countries.
   */
  countries?: PhoneNumberFieldCountry[];
  /**
   * Called when the phone number or country changes with the full value details
   * (digits, formatted display, E.164, validity).
   */
  onValueChange?: (details: PhoneNumberFieldValueDetails) => void;
  /**
   * Called when the selected country changes (picker selection, smart paste, or dial code typing).
   */
  onCountryChange?: (country: PhoneNumberFieldCountry) => void;
  /**
   * Called when the country picker open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Animation configuration for the root component.
   * - `"disable-all"`: disable all animations including children (cascades to all child components).
   * - `undefined`: use default animations.
   */
  animation?: AnimationRootDisableAll;
}
/**
 * Context value shared by all `PhoneNumberField` compound parts.
 */
export interface PhoneNumberFieldContextValue {
  /**
   * The currently selected country.
   */
  country: PhoneNumberFieldCountry;
  /**
   * Full country list available in the picker.
   */
  countries: PhoneNumberFieldCountry[];
  /**
   * Country list filtered by the current search query.
   */
  filteredCountries: PhoneNumberFieldCountry[];
  /**
   * National number digits without formatting.
   */
  nationalNumber: string;
  /**
   * Formatted national number.
   */
  formattedNumber: string;
  /**
   * Text rendered by `PhoneNumberField.Input`. Matches `formattedNumber`,
   * except while an international prefix is being typed (`"+4"`), when the raw
   * text is echoed back until it resolves to a country.
   */
  inputValue: string;
  /**
   * Generated placeholder for the selected country (mask-derived).
   */
  placeholder: string;
  /**
   * Whether the country picker surface is open.
   */
  isOpen: boolean;
  /**
   * Current country search query.
   */
  searchQuery: string;
  /**
   * Whether the root field is disabled.
   */
  isDisabledRoot: boolean;
  /**
   * Commits raw text typed into the phone input (handles masking, smart paste, deletion).
   */
  onInputChangeText: (text: string) => void;
  /**
   * Commits a country selection from the picker.
   */
  onCountrySelect: (country: PhoneNumberFieldCountry) => void;
  /**
   * Changes the country picker open state.
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Changes the country search query.
   */
  onSearchQueryChange: (query: string) => void;
}
/**
 * Props for `PhoneNumberField.Select` — `Select` root without state props (wired from the root).
 * The country picker always uses the `"dialog"` presentation: the country list is a long,
 * searchable surface that does not fit a popover or bottom sheet.
 */
export type PhoneNumberFieldSelectProps = Omit<
  SelectRootProps<'single'>,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'isOpen'
  | 'isDefaultOpen'
  | 'onOpenChange'
  | 'selectionMode'
  | 'presentation'
>;
/**
 * Props for `PhoneNumberField.Portal` — pass-through to `Select.Portal` with context re-wrapping.
 */
export type PhoneNumberFieldPortalProps = SelectPortalProps;
/**
 * Props for `PhoneNumberField.Overlay` — pass-through to `Select.Overlay`.
 */
export type PhoneNumberFieldOverlayProps = SelectOverlayProps;
/**
 * Props for `PhoneNumberField.Content` — `Select.Content` with the `"dialog"`
 * presentation applied automatically. The surface is pinned below the top safe
 * area instead of being centered, keeping it clear of the keyboard raised by
 * the focused search input; `classNames.wrapper` and `styles.content` override
 * that placement.
 */
export type PhoneNumberFieldContentProps = Omit<
  Extract<
    SelectContentProps,
    {
      presentation: 'dialog';
    }
  >,
  'presentation'
>;
/**
 * Props for `PhoneNumberField.ContentBackground` — same as
 * `Select.ContentBackground`. Pass it to the `background` prop of
 * `PhoneNumberField.Content` to customize the theme-aware background layer
 * while keeping its absolute-fill and clipping behavior.
 */
export type PhoneNumberFieldContentBackgroundProps = SelectContentBackgroundProps;
/**
 * Props for `PhoneNumberField.ContentHandle` — a decorative drag-handle bar
 * signaling that the dialog content can be swiped to dismiss.
 */
export interface PhoneNumberFieldContentHandleProps extends ViewProps {
  /**
   * Additional CSS classes for the handle bar.
   */
  className?: string;
}
/**
 * Props for `PhoneNumberField.Trigger` — country picker trigger rendered inside the prefix.
 * Renders the selected country flag and dial code by default; pass `children` to override.
 */
export type PhoneNumberFieldTriggerProps = Omit<SelectTriggerProps, 'variant'> & {
  /**
   * Additional CSS classes for the individual trigger elements.
   */
  classNames?: ElementSlots<PhoneNumberFieldTriggerSlots>;
  /**
   * Styles for the individual trigger elements.
   * The `base` style is applied before the `style` prop, which takes precedence.
   */
  styles?: {
    base?: ViewStyle;
    flag?: TextStyle;
    dialCode?: TextStyle;
  };
};
/**
 * Props for `PhoneNumberField.SearchInput` — a `SearchField` filtering the country list.
 *
 * `value` / `onChange` are driven by the field context; the optional `onChange` prop runs
 * after the internal handler. Renders the default `SearchField.Group` anatomy
 * (`SearchIcon` + `Input` + `ClearButton`); pass `children` to compose the
 * `SearchField.*` parts yourself.
 */
export type PhoneNumberFieldSearchInputProps = Omit<SearchFieldProps, 'value' | 'onChange'> & {
  /**
   * Called after the internal search query update with the new text.
   */
  onChange?: SearchFieldProps['onChange'];
  /**
   * Whether the default search input focuses when the picker opens, so the
   * keyboard is ready for typing right away (ignored when `children` are
   * provided). The dialog portal unmounts its content on close, so this is a
   * plain mount-time focus that repeats on every open.
   * @default true
   */
  autoFocus?: boolean;
  /**
   * Props forwarded to the default `SearchField.Input` (ignored when `children` are provided).
   * The input `variant` defaults to `"secondary"`.
   */
  inputProps?: SearchFieldInputProps;
};
/**
 * Render info passed to `renderCountry` on `PhoneNumberField.CountryList`.
 */
export interface PhoneNumberFieldCountryRenderInfo {
  /**
   * The country entry for this row.
   */
  country: PhoneNumberFieldCountry;
  /**
   * The row index within the (filtered) list.
   */
  index: number;
}
/**
 * Props for `PhoneNumberField.CountryList` — virtualized (`FlatList`),
 * search-filtered country list.
 *
 * `initialScrollIndex` defaults to the row of the selected country, so the
 * picker opens centred on the current selection; pass `null` to open at the
 * top. `getItemLayout` defaults to the height of an invisible probe row —
 * measured before the list mounts — applied to every row, which is what lets
 * the list open hundreds of rows deep with its virtualization metrics intact;
 * pass your own for rows that vary in height, and the list mounts without the
 * measuring frame.
 */
export type PhoneNumberFieldCountryListProps = Omit<
  FlatListProps<PhoneNumberFieldCountry>,
  'data' | 'renderItem'
> & {
  /**
   * Custom data source. Defaults to the search-filtered country list from context.
   */
  countries?: PhoneNumberFieldCountry[];
  /**
   * Custom row renderer. Defaults to `PhoneNumberField.CountryItem`.
   */
  renderCountry?: (info: PhoneNumberFieldCountryRenderInfo) => ReactElement | null;
  /**
   * Message displayed when the search query matches no countries.
   * @default "No countries found"
   */
  emptyText?: string;
  /**
   * Additional CSS classes for the list container.
   */
  className?: string;
  /**
   * Additional CSS classes for the individual list elements.
   */
  classNames?: ElementSlots<PhoneNumberFieldCountryListSlots>;
  /**
   * Styles for the individual list elements.
   * The `base` style is applied before the `style` prop, which takes precedence.
   */
  styles?: {
    base?: ViewStyle;
    empty?: ViewStyle;
    emptyText?: TextStyle;
  };
};
/**
 * Props for `PhoneNumberField.CountryItem` — a single selectable country row.
 * Renders flag, dial code, name, and a selection indicator by default; pass `children` to override.
 */
export type PhoneNumberFieldCountryItemProps = Omit<
  SelectItemProps,
  'value' | 'label' | 'children'
> & {
  /**
   * The country entry rendered by this row.
   */
  country: PhoneNumberFieldCountry;
  /**
   * Custom row content replacing the default flag / dial code / name layout.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the individual row elements.
   */
  classNames?: ElementSlots<PhoneNumberFieldCountryItemSlots>;
  /**
   * Styles for the individual row elements.
   */
  styles?: {
    flag?: TextStyle;
    dialCode?: TextStyle;
    name?: TextStyle;
  };
};
/**
 * Props for `PhoneNumberField.InputGroup` / `PhoneNumberField.Prefix` /
 * `PhoneNumberField.Suffix` — pass-through to the `InputGroup` parts.
 */
export type {
  InputGroupProps as PhoneNumberFieldInputGroupProps,
  InputGroupPrefixProps as PhoneNumberFieldPrefixProps,
  InputGroupSuffixProps as PhoneNumberFieldSuffixProps,
} from 'heroui-native/input-group';
/**
 * Props for `PhoneNumberField.Input` — `value` / `onChangeText` are driven by the field context.
 * Optional `onChangeText` runs after the internal handler.
 *
 * `isDisabled` defaults to the `PhoneNumberField` root `isDisabled` when omitted, and
 * `placeholder` defaults to a mask-derived example for the selected country.
 *
 * `maxLength` defaults to the selected country's maximum national number
 * length (formatting characters included) once the number can no longer grow,
 * which keeps the platform from painting keystrokes the field would trim away.
 * Passing `maxLength` replaces that behavior with a fixed limit.
 */
export type PhoneNumberFieldInputProps = Omit<InputGroupInputProps, 'value' | 'onChangeText'> & {
  onChangeText?: InputGroupInputProps['onChangeText'];
};
