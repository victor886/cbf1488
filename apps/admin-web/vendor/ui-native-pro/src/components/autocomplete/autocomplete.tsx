// @ts-nocheck
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { CloseButton } from 'heroui-native/close-button';
import { AnimationSettingsProvider, FormFieldProvider, useFormField } from 'heroui-native/contexts';
import { useBottomSheetAwareHandlers } from 'heroui-native/hooks';
import { SearchField } from 'heroui-native/search-field';
import { Select, useSelect } from 'heroui-native/select';
import { HeroText } from '../../helpers/internal/components/index';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { useAutocompleteRootAnimation } from './autocomplete.animation';
import {
  BOTTOM_SHEET_SNAP_POINTS,
  DISPLAY_NAME,
  SEARCH_FIELD_AUTO_FOCUS_DELAY_MAP,
} from './autocomplete.constants';
import { AutocompleteProvider, useAutocomplete } from './autocomplete.context';
import { autocompleteClassNames } from './autocomplete.styles';
import { defaultAutocompleteFilter } from './autocomplete.utils';
function AutocompleteRoot(props) {
  const {
    ref,
    children,
    className,
    isDisabled = false,
    isInvalid = false,
    isRequired = false,
    inputValue: inputValueProp,
    defaultInputValue,
    onInputChange: onInputChangeProp,
    filter = defaultAutocompleteFilter,
    clearInputOnClose = true,
    onClear,
    onOpenChange: onOpenChangeProp,
    animation,
    ...restProps
  } = props;
  const rootClassName = autocompleteClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useAutocompleteRootAnimation({
    animation,
  });
  const [inputState, setInputState] = useControllableState({
    prop: inputValueProp,
    defaultProp: defaultInputValue ?? '',
    onChange: onInputChangeProp,
  });
  const inputValue = inputState ?? '';
  /**
   * Registry of mounted items (`value` → filter text). Items register on
   * mount so the root can compute the visible count for `Autocomplete.Empty`.
   */
  const [itemRegistry, setItemRegistry] = useState(() => new Map());
  const registerItem = useCallback((itemValue, textValue) => {
    setItemRegistry((prev) => {
      if (prev.get(itemValue) === textValue) {
        return prev;
      }
      const next = new Map(prev);
      next.set(itemValue, textValue);
      return next;
    });
  }, []);
  const unregisterItem = useCallback((itemValue) => {
    setItemRegistry((prev) => {
      if (!prev.has(itemValue)) {
        return prev;
      }
      const next = new Map(prev);
      next.delete(itemValue);
      return next;
    });
  }, []);
  const visibleItemCount = useMemo(() => {
    if (inputValue.trim().length === 0) {
      return itemRegistry.size;
    }
    let count = 0;
    itemRegistry.forEach((textValue) => {
      if (filter(textValue, inputValue)) {
        count += 1;
      }
    });
    return count;
  }, [itemRegistry, inputValue, filter]);
  const onInputChange = useCallback(
    (value) => {
      setInputState(value);
    },
    [setInputState]
  );
  const handleOpenChange = useCallback(
    (open) => {
      if (!open && clearInputOnClose) {
        setInputState('');
      }
      onOpenChangeProp?.(open);
    },
    [clearInputOnClose, setInputState, onOpenChangeProp]
  );
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const formFieldContextValue = useMemo(
    () => ({
      isDisabled,
      isInvalid,
      isRequired,
      hasFieldPadding: true,
    }),
    [isDisabled, isInvalid, isRequired]
  );
  const autocompleteContextValue = useMemo(
    () => ({
      inputValue,
      onInputChange,
      filter,
      registerItem,
      unregisterItem,
      visibleItemCount,
      onClear,
      isDisabledRoot: isDisabled,
    }),
    [
      inputValue,
      onInputChange,
      filter,
      registerItem,
      unregisterItem,
      visibleItemCount,
      onClear,
      isDisabled,
    ]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <FormFieldProvider value={formFieldContextValue}>
        <AutocompleteProvider value={autocompleteContextValue}>
          <Select
            ref={ref}
            className={rootClassName}
            isDisabled={isDisabled}
            onOpenChange={handleOpenChange}
            {...restProps}
          >
            {children}
          </Select>
        </AutocompleteProvider>
      </FormFieldProvider>
    </AnimationSettingsProvider>
  );
}
// --------------------------------------------------
const AutocompleteTrigger = forwardRef(
  ({ className, isInvalid: localIsInvalid, ...props }, ref) => {
    const formField = useFormField();
    const isInvalid =
      localIsInvalid !== undefined ? localIsInvalid : (formField?.isInvalid ?? false);
    const triggerClassName = autocompleteClassNames.trigger({
      isInvalid,
      className,
    });
    return <Select.Trigger ref={ref} className={triggerClassName} {...props} variant="default" />;
  }
);
// --------------------------------------------------
const AutocompleteValue = forwardRef(({ placeholder = 'Select an item', ...props }, ref) => {
  return <Select.Value ref={ref} placeholder={placeholder} {...props} />;
});
// --------------------------------------------------
const AutocompleteTriggerIndicator = forwardRef((props, ref) => {
  return <Select.TriggerIndicator ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Rendered inside the trigger row, between the value and the indicator.
 * Hidden while nothing is selected. Pressing it clears the selection
 * (`undefined` in single mode, `[]` in multiple mode) and calls `onClear`
 * from the `Autocomplete` root.
 */
const AutocompleteClearButton = forwardRef((props, ref) => {
  const {
    className,
    isDisabled: isDisabledProp,
    accessibilityLabel = 'Clear selection',
    iconProps,
    hitSlop = 10,
    onPress,
    ...restProps
  } = props;
  const { value, onValueChange, selectionMode, isDisabled } = useSelect();
  const { onClear } = useAutocomplete();
  const hasSelection = Array.isArray(value) ? value.length > 0 : Boolean(value?.value);
  const clearButtonClassName = autocompleteClassNames.clearButton({
    className,
  });
  const handlePress = (event) => {
    onValueChange(selectionMode === 'multiple' ? [] : undefined);
    onClear?.();
    if (typeof onPress === 'function') {
      onPress(event);
    }
  };
  if (!hasSelection) {
    return null;
  }
  return (
    <CloseButton
      ref={ref}
      className={clearButtonClassName}
      isDisabled={isDisabledProp ?? isDisabled}
      accessibilityLabel={accessibilityLabel}
      iconProps={{
        size: 14,
        ...iconProps,
      }}
      hitSlop={hitSlop}
      onPress={handlePress}
      {...restProps}
    />
  );
});
// --------------------------------------------------
/**
 * `Select.Portal` renders into a host via the portal system, which breaks
 * React context from ancestors. Re-wrap `children` with `AutocompleteProvider`
 * so `Autocomplete.SearchField` / `Autocomplete.Item` / `Autocomplete.Empty`
 * can still call `useAutocomplete()` when portaled.
 */
function AutocompletePortal(props) {
  const { children, ...rest } = props;
  const ctx = useAutocomplete();
  return (
    <Select.Portal {...rest}>
      <AutocompleteProvider value={ctx}>{children}</AutocompleteProvider>
    </Select.Portal>
  );
}
// --------------------------------------------------
/**
 * Backdrop behind the portaled content. Tinted for the dialog and
 * bottom-sheet presentations; transparent for popovers, where it only
 * provides tap-outside dismissal.
 */
const AutocompleteOverlay = forwardRef(({ className, ...props }, ref) => {
  const { presentation } = useSelect();
  const overlayClassName = autocompleteClassNames.overlay({
    presentation,
    className,
  });
  return <Select.Overlay ref={ref} className={overlayClassName} {...props} />;
});
// --------------------------------------------------
/**
 * For the bottom-sheet presentation, the sheet uses a fixed 90% snap point
 * (dynamic sizing disabled): the search input autofocuses on open, so the
 * sheet must be tall enough from the start to keep the content above the
 * keyboard. Keyboard props default to `"extend"` mode (pairs with the
 * sheet-aware focus/blur handlers wired in `Autocomplete.SearchField`).
 */
const AutocompleteContent = forwardRef((props, ref) => {
  if (props.presentation === 'bottom-sheet') {
    const {
      snapPoints = BOTTOM_SHEET_SNAP_POINTS,
      enableDynamicSizing = false,
      keyboardBehavior = 'extend',
      keyboardBlurBehavior = 'restore',
      android_keyboardInputMode = 'adjustResize',
      ...restProps
    } = props;
    return (
      <Select.Content
        ref={ref}
        snapPoints={snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        android_keyboardInputMode={android_keyboardInputMode}
        {...restProps}
      />
    );
  }
  return <Select.Content ref={ref} {...props} />;
});
// --------------------------------------------------
const AutocompleteContentBackground = forwardRef((props, ref) => {
  return <Select.ContentBackground ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * `SearchField` wired to the autocomplete search text. Renders a default
 * composition (`Group > SearchIcon + Input + ClearButton`) when no
 * `children` are given. The default input uses the `secondary` variant and
 * wires bottom-sheet-aware focus/blur handlers so the keyboard is managed
 * when the content uses the bottom-sheet presentation (no-ops elsewhere).
 *
 * Autofocus is driven by the overlay open state instead of the native
 * mount-time `autoFocus` prop: the bottom-sheet presentation keeps its
 * content mounted while closed, so mount-time autofocus would summon the
 * keyboard before the overlay is even opened. The input is focused when the
 * overlay opens and blurred when it closes.
 */
const AutocompleteSearchField = forwardRef((props, ref) => {
  const {
    children,
    className,
    placeholder,
    autoFocus = true,
    autoFocusDelay,
    inputProps,
    isDisabled: isDisabledProp,
    ...restProps
  } = props;
  const { inputValue, onInputChange, isDisabledRoot } = useAutocomplete();
  const { isOpen, presentation } = useSelect();
  const resolvedAutoFocusDelay = autoFocusDelay ?? SEARCH_FIELD_AUTO_FOCUS_DELAY_MAP[presentation];
  const { onFocus: onSheetAwareFocus, onBlur: onSheetAwareBlur } = useBottomSheetAwareHandlers();
  const inputRef = useRef(null);
  const searchFieldClassName = autocompleteClassNames.searchField({
    className,
  });
  useEffect(() => {
    if (!autoFocus) {
      return undefined;
    }
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, resolvedAutoFocusDelay);
      return () => clearTimeout(timeoutId);
    }
    inputRef.current?.blur();
    return undefined;
  }, [isOpen, autoFocus, resolvedAutoFocusDelay]);
  const handleInputFocus = (event) => {
    onSheetAwareFocus(event);
    inputProps?.onFocus?.(event);
  };
  const handleInputBlur = (event) => {
    onSheetAwareBlur(event);
    inputProps?.onBlur?.(event);
  };
  return (
    <SearchField
      ref={ref}
      className={searchFieldClassName}
      value={inputValue}
      onChange={onInputChange}
      isDisabled={isDisabledProp ?? isDisabledRoot}
      {...restProps}
    >
      {children ?? (
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            ref={inputRef}
            variant="secondary"
            placeholder={placeholder}
            {...inputProps}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
      )}
    </SearchField>
  );
});
// --------------------------------------------------
/**
 * Scrollable container for items. `keyboardShouldPersistTaps="handled"` keeps
 * item presses working in a single tap while the search keyboard is open.
 */
const AutocompleteList = forwardRef((props, ref) => {
  const { children, className, keyboardShouldPersistTaps = 'handled', ...restProps } = props;
  const listClassName = autocompleteClassNames.list({
    className,
  });
  return (
    <ScrollView
      ref={ref}
      className={listClassName}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      nestedScrollEnabled
      {...restProps}
    >
      {children}
    </ScrollView>
  );
});
// --------------------------------------------------
/**
 * `Select.Item` filtered by the current search text. The item registers its
 * filter text (`textValue` falling back to `label`) with the root so
 * `Autocomplete.Empty` knows when nothing matches, and renders `null` while
 * it does not match. When a press closes the overlay (`closeOnPress`,
 * defaulting to single mode), the search keyboard is dismissed with it.
 */
const AutocompleteItem = forwardRef((props, ref) => {
  const { className, value, label, textValue, closeOnPress, onPress, ...restProps } = props;
  const { inputValue, filter, registerItem, unregisterItem } = useAutocomplete();
  const { selectionMode } = useSelect();
  const filterText = textValue ?? label;
  const itemClassName = autocompleteClassNames.item({
    className,
  });
  useEffect(() => {
    registerItem(value, filterText);
    return () => {
      unregisterItem(value);
    };
  }, [value, filterText, registerItem, unregisterItem]);
  const isVisible = inputValue.trim().length === 0 || filter(filterText, inputValue);
  const closesOverlayOnPress = closeOnPress ?? selectionMode === 'single';
  const handlePress = (event) => {
    if (closesOverlayOnPress) {
      Keyboard.dismiss();
    }
    if (typeof onPress === 'function') {
      onPress(event);
    }
  };
  if (!isVisible) {
    return null;
  }
  return (
    <Select.Item
      ref={ref}
      className={itemClassName}
      value={value}
      label={label}
      closeOnPress={closeOnPress}
      onPress={handlePress}
      {...restProps}
    />
  );
});
// --------------------------------------------------
const AutocompleteItemLabel = forwardRef((props, ref) => {
  return <Select.ItemLabel ref={ref} {...props} />;
});
// --------------------------------------------------
const AutocompleteItemDescription = forwardRef((props, ref) => {
  return <Select.ItemDescription ref={ref} {...props} />;
});
// --------------------------------------------------
const AutocompleteItemIndicator = forwardRef((props, ref) => {
  return <Select.ItemIndicator ref={ref} {...props} />;
});
// --------------------------------------------------
const AutocompleteListLabel = forwardRef((props, ref) => {
  return <Select.ListLabel ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Fallback shown when no registered item matches the current search text
 * (also covers an empty item collection). String (or omitted) `children`
 * render inside a styled text element; custom nodes render as-is.
 */
const AutocompleteEmpty = forwardRef((props, ref) => {
  const { children, className, classNames, styles, style, ...restProps } = props;
  const { visibleItemCount } = useAutocomplete();
  const { container, text } = autocompleteClassNames.empty();
  const containerClassName = container({
    className: [className, classNames?.container],
  });
  const textClassName = text({
    className: classNames?.text,
  });
  if (visibleItemCount > 0) {
    return null;
  }
  const content =
    children === undefined || typeof children === 'string' ? (
      <HeroText className={textClassName} style={styles?.text}>
        {children ?? 'No results found.'}
      </HeroText>
    ) : (
      children
    );
  return (
    <View
      ref={ref}
      className={containerClassName}
      style={[styles?.container, style]}
      {...restProps}
    >
      {content}
    </View>
  );
});
// --------------------------------------------------
const AutocompleteClose = forwardRef((props, ref) => {
  return <Select.Close ref={ref} {...props} />;
});
// --------------------------------------------------
AutocompleteRoot.displayName = DISPLAY_NAME.ROOT;
AutocompleteTrigger.displayName = DISPLAY_NAME.TRIGGER;
AutocompleteValue.displayName = DISPLAY_NAME.VALUE;
AutocompleteTriggerIndicator.displayName = DISPLAY_NAME.TRIGGER_INDICATOR;
AutocompleteClearButton.displayName = DISPLAY_NAME.CLEAR_BUTTON;
AutocompletePortal.displayName = DISPLAY_NAME.PORTAL;
AutocompleteOverlay.displayName = DISPLAY_NAME.OVERLAY;
AutocompleteContent.displayName = DISPLAY_NAME.CONTENT;
AutocompleteContentBackground.displayName = DISPLAY_NAME.CONTENT_BACKGROUND;
AutocompleteSearchField.displayName = DISPLAY_NAME.SEARCH_FIELD;
AutocompleteList.displayName = DISPLAY_NAME.LIST;
AutocompleteItem.displayName = DISPLAY_NAME.ITEM;
AutocompleteItemLabel.displayName = DISPLAY_NAME.ITEM_LABEL;
AutocompleteItemDescription.displayName = DISPLAY_NAME.ITEM_DESCRIPTION;
AutocompleteItemIndicator.displayName = DISPLAY_NAME.ITEM_INDICATOR;
AutocompleteListLabel.displayName = DISPLAY_NAME.LIST_LABEL;
AutocompleteEmpty.displayName = DISPLAY_NAME.EMPTY;
AutocompleteClose.displayName = DISPLAY_NAME.CLOSE;
/**
 * Autocomplete — a searchable `Select`: selection lives on the trigger while
 * filtering happens through a `SearchField` rendered inside the portaled
 * content. Mirrors the HeroUI web Autocomplete anatomy on top of the
 * heroui-native `Select` and `SearchField` components.
 *
 * @note RTL: fully inherited. Trigger row order, popover start/end alignment,
 * the chevron indicator, and the search input (icon mirroring, `rtl:text-right`
 * on the `TextInput`) are all handled by the underlying heroui-native `Select`
 * and `SearchField`. The component's own styles only use logical
 * (`padding-inline`) or symmetric properties, so there is nothing directional
 * to override here.
 *
 * @component Autocomplete - Root that wraps `Select` and manages the search
 * text, item filtering, and clear behavior. Accepts all `Select` root props
 * (selection modes, open state, presentation) plus `inputValue` /
 * `onInputChange`, `filter`, `clearInputOnClose`, and `onClear`.
 *
 * @component Autocomplete.Trigger - Pressable field surface that toggles the
 * overlay. Applies a danger border when the field is invalid.
 *
 * @component Autocomplete.Value - Selected label(s) or placeholder
 * (defaults to "Select an item").
 *
 * @component Autocomplete.TriggerIndicator - Optional chevron indicator that
 * rotates with the open state. @optional
 *
 * @component Autocomplete.ClearButton - Optional close button inside the
 * trigger row that clears the selection and calls `onClear`. Hidden while
 * nothing is selected. @optional
 *
 * @component Autocomplete.Portal - Portals the overlay and content above the
 * app content, re-providing the autocomplete context.
 *
 * @component Autocomplete.Overlay - Backdrop behind the content. @optional
 *
 * @component Autocomplete.Content - Content container with popover (default),
 * bottom-sheet, or dialog presentation.
 *
 * @component Autocomplete.ContentBackground - Theme-aware background layer
 * behind the content. @optional
 *
 * @component Autocomplete.SearchField - Search input wired to the
 * autocomplete search text, rendered at the top of the content.
 *
 * @component Autocomplete.List - Scrollable list container that keeps item
 * taps working while the keyboard is open.
 *
 * @component Autocomplete.Item - Selectable option filtered by the search
 * text (`textValue` overrides `label` for matching).
 *
 * @component Autocomplete.ItemLabel - Label text for an item. @optional
 *
 * @component Autocomplete.ItemDescription - Muted description text for an
 * item. @optional
 *
 * @component Autocomplete.ItemIndicator - Check indicator for selected
 * items. @optional
 *
 * @component Autocomplete.ListLabel - Section label for grouped items.
 * @optional
 *
 * @component Autocomplete.Empty - Fallback shown when no item matches the
 * search text. @optional
 *
 * @component Autocomplete.Close - Close button for the overlay (useful in
 * bottom-sheet and dialog presentations). @optional
 *
 * Props flow from Autocomplete to sub-components via context.
 */
const Autocomplete = Object.assign(AutocompleteRoot, {
  Trigger: AutocompleteTrigger,
  Value: AutocompleteValue,
  /** @optional Chevron indicator that rotates with the open state. */
  TriggerIndicator: AutocompleteTriggerIndicator,
  /** @optional Clears the selection; hidden while nothing is selected. */
  ClearButton: AutocompleteClearButton,
  Portal: AutocompletePortal,
  /** @optional Backdrop behind the portaled content. */
  Overlay: AutocompleteOverlay,
  Content: AutocompleteContent,
  /** @optional Theme-aware background layer behind the content. */
  ContentBackground: AutocompleteContentBackground,
  SearchField: AutocompleteSearchField,
  List: AutocompleteList,
  Item: AutocompleteItem,
  /** @optional Label text for an item. */
  ItemLabel: AutocompleteItemLabel,
  /** @optional Muted description text for an item. */
  ItemDescription: AutocompleteItemDescription,
  /** @optional Check indicator for selected items. */
  ItemIndicator: AutocompleteItemIndicator,
  /** @optional Section label for grouped items. */
  ListLabel: AutocompleteListLabel,
  /** @optional Fallback shown when no item matches the search text. */
  Empty: AutocompleteEmpty,
  /** @optional Close button for the overlay. */
  Close: AutocompleteClose,
});
export default Autocomplete;
