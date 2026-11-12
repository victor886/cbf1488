// @ts-nocheck
import { forwardRef, useCallback, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { CloseButton } from 'heroui-native/close-button';
import { AnimationSettingsProvider, FormFieldProvider } from 'heroui-native/contexts';
import { InputGroup } from 'heroui-native/input-group';
import { Select, useSelect } from 'heroui-native/select';
import { HeroText } from '../../helpers/internal/components/index';
import { composeRefs } from '../../primitives/slot/utils';
import { useComboBoxRootAnimation } from './combo-box.animation';
import { DEFAULT_CONTENT_OFFSET, DISPLAY_NAME } from './combo-box.constants';
import { ComboBoxProvider, ComboBoxStateProvider, useComboBox } from './combo-box.context';
import { comboBoxClassNames } from './combo-box.styles';
import { defaultComboBoxFilter } from './combo-box.utils';
function ComboBoxRoot(props) {
  const {
    ref,
    children,
    className,
    isDisabled = false,
    isInvalid = false,
    isRequired = false,
    inputValue,
    defaultInputValue,
    onInputChange,
    menuTrigger = 'focus',
    filter = defaultComboBoxFilter,
    onClear,
    animation,
    ...restProps
  } = props;
  const rootClassName = comboBoxClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useComboBoxRootAnimation({
    animation,
  });
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
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <FormFieldProvider value={formFieldContextValue}>
        <Select ref={ref} className={rootClassName} isDisabled={isDisabled} {...restProps}>
          <ComboBoxStateProvider
            inputValue={inputValue}
            defaultInputValue={defaultInputValue}
            onInputChange={onInputChange}
            menuTrigger={menuTrigger}
            filter={filter}
            onClear={onClear}
            isDisabledRoot={isDisabled}
          >
            {children}
          </ComboBoxStateProvider>
        </Select>
      </FormFieldProvider>
    </AnimationSettingsProvider>
  );
}
// --------------------------------------------------
const ComboBoxInputGroup = forwardRef(({ isDisabled: isDisabledProp, ...props }, ref) => {
  const { isDisabledRoot } = useComboBox();
  return <InputGroup ref={ref} isDisabled={isDisabledProp ?? isDisabledRoot} {...props} />;
});
// --------------------------------------------------
const ComboBoxInput = forwardRef((props, ref) => {
  const {
    isDisabled: isDisabledProp,
    onChangeText: onChangeTextProp,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...restProps
  } = props;
  const {
    inputValue,
    onInputChange,
    onInputBlur,
    openMenu,
    menuTrigger,
    isDisabledRoot,
    inputRef,
  } = useComboBox();
  const composedRef = useMemo(() => composeRefs(ref, inputRef), [ref, inputRef]);
  const isDisabled = isDisabledProp !== undefined ? isDisabledProp : isDisabledRoot;
  const handleChangeText = useCallback(
    (text) => {
      onInputChange(text);
      if (menuTrigger !== 'manual') {
        openMenu();
      }
      onChangeTextProp?.(text);
    },
    [onInputChange, menuTrigger, openMenu, onChangeTextProp]
  );
  const handleFocus = useCallback(
    (event) => {
      if (menuTrigger === 'focus') {
        openMenu();
      }
      onFocusProp?.(event);
    },
    [menuTrigger, openMenu, onFocusProp]
  );
  const handleBlur = useCallback(
    (event) => {
      onInputBlur();
      onBlurProp?.(event);
    },
    [onInputBlur, onBlurProp]
  );
  return (
    <InputGroup.Input
      ref={composedRef}
      value={inputValue}
      isDisabled={isDisabled}
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...restProps}
    />
  );
});
// --------------------------------------------------
const ComboBoxPrefix = forwardRef((props, ref) => {
  return <InputGroup.Prefix ref={ref} {...props} />;
});
// --------------------------------------------------
const ComboBoxSuffix = forwardRef((props, ref) => {
  return <InputGroup.Suffix ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Wraps the input group so the popover anchors to (and can match) the full
 * input width. Taps on the text input still focus it; taps elsewhere on the
 * group (e.g. the chevron suffix) toggle the popover.
 */
const ComboBoxTrigger = forwardRef((props, ref) => {
  const { triggerRef } = useComboBox();
  const composedRef = useMemo(() => composeRefs(ref, triggerRef), [ref, triggerRef]);
  return <Select.Trigger ref={composedRef} {...props} variant="unstyled" />;
});
// --------------------------------------------------
const ComboBoxTriggerIndicator = forwardRef((props, ref) => {
  return <Select.TriggerIndicator ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Rendered inside the input group suffix, before the trigger indicator.
 * Hidden while there is no selection and the input is empty. Pressing it
 * clears the selection (`undefined` in single mode, `[]` in multiple mode)
 * and the input text, then calls `onClear` from the `ComboBox` root. Being
 * its own pressable, it does not toggle the popover.
 */
const ComboBoxClearButton = forwardRef((props, ref) => {
  const {
    className,
    isDisabled: isDisabledProp,
    accessibilityLabel = 'Clear selection',
    onPress,
    ...restProps
  } = props;
  const { value, onValueChange, selectionMode, isDisabled } = useSelect();
  const { inputValue, onInputChange, onClear } = useComboBox();
  const hasSelection = Array.isArray(value) ? value.length > 0 : Boolean(value?.value);
  const clearButtonClassName = comboBoxClassNames.clearButton({
    className,
  });
  const handlePress = (event) => {
    onValueChange(selectionMode === 'multiple' ? [] : undefined);
    onInputChange('');
    onClear?.();
    if (typeof onPress === 'function') {
      onPress(event);
    }
  };
  if (!hasSelection && inputValue === '') {
    return null;
  }
  return (
    <CloseButton
      ref={ref}
      className={clearButtonClassName}
      isDisabled={isDisabledProp ?? isDisabled}
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      {...restProps}
    />
  );
});
// --------------------------------------------------
const ComboBoxValue = forwardRef(
  ({ placeholder = 'No items selected', className, ...props }, ref) => {
    const valueClassName = comboBoxClassNames.value({
      className,
    });
    return (
      <Select.Value ref={ref} placeholder={placeholder} className={valueClassName} {...props} />
    );
  }
);
// --------------------------------------------------
/**
 * `Select.Portal` renders into a host via the portal system, which breaks
 * React context from ancestors. Re-wrap `children` with `ComboBoxProvider`
 * so `ComboBox.Item` / `ComboBox.Empty` can still call `useComboBox()` when
 * portaled.
 */
function ComboBoxPortal(props) {
  const { children, ...rest } = props;
  const ctx = useComboBox();
  return (
    <Select.Portal {...rest}>
      <ComboBoxProvider value={ctx}>{children}</ComboBoxProvider>
    </Select.Portal>
  );
}
// --------------------------------------------------
const ComboBoxOverlay = forwardRef(({ className, ...props }, ref) => {
  const overlayClassName = comboBoxClassNames.overlay({
    className,
  });
  return <Select.Overlay ref={ref} className={overlayClassName} {...props} />;
});
// --------------------------------------------------
/**
 * Popover-only content: `presentation` is fixed to `"popover"`, `width`
 * defaults to `"trigger"` so the popover matches the input group width, and
 * a small default `offset` separates it from the input.
 */
const ComboBoxContent = forwardRef(
  ({ width = 'trigger', offset = DEFAULT_CONTENT_OFFSET, ...props }, ref) => {
    return (
      <Select.Content ref={ref} width={width} offset={offset} {...props} presentation="popover" />
    );
  }
);
// --------------------------------------------------
const ComboBoxContentBackground = forwardRef((props, ref) => {
  return <Select.ContentBackground ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Scrollable container for items. `keyboardShouldPersistTaps="handled"` keeps
 * item presses working in a single tap while the keyboard is open.
 */
const ComboBoxList = forwardRef((props, ref) => {
  const { children, className, keyboardShouldPersistTaps = 'handled', ...restProps } = props;
  const listClassName = comboBoxClassNames.list({
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
 * `Select.Item` filtered by the current input text. The item registers its
 * filter text (`textValue` falling back to `label`) with the provider so
 * `ComboBox.Empty` knows when nothing matches, and renders `null` while it
 * does not match.
 */
const ComboBoxItem = forwardRef((props, ref) => {
  const { className, value, label, textValue, ...restProps } = props;
  const { filterText, filter, registerItem, unregisterItem } = useComboBox();
  const itemFilterText = textValue ?? label;
  const itemClassName = comboBoxClassNames.item({
    className,
  });
  useEffect(() => {
    registerItem(value, itemFilterText);
    return () => {
      unregisterItem(value);
    };
  }, [value, itemFilterText, registerItem, unregisterItem]);
  const isVisible = filterText.trim().length === 0 || filter(itemFilterText, filterText);
  if (!isVisible) {
    return null;
  }
  return (
    <Select.Item ref={ref} className={itemClassName} value={value} label={label} {...restProps} />
  );
});
// --------------------------------------------------
const ComboBoxItemLabel = forwardRef((props, ref) => {
  return <Select.ItemLabel ref={ref} {...props} />;
});
// --------------------------------------------------
const ComboBoxItemDescription = forwardRef((props, ref) => {
  return <Select.ItemDescription ref={ref} {...props} />;
});
// --------------------------------------------------
const ComboBoxItemIndicator = forwardRef((props, ref) => {
  return <Select.ItemIndicator ref={ref} {...props} />;
});
// --------------------------------------------------
const ComboBoxListLabel = forwardRef((props, ref) => {
  return <Select.ListLabel ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Fallback shown when no registered item matches the current input text
 * (also covers an empty item collection). String (or omitted) `children`
 * render inside a styled text element; custom nodes render as-is.
 */
const ComboBoxEmpty = forwardRef((props, ref) => {
  const { children, className, classNames, styles, style, ...restProps } = props;
  const { visibleItemCount } = useComboBox();
  const { container, text } = comboBoxClassNames.empty();
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
ComboBoxRoot.displayName = DISPLAY_NAME.ROOT;
ComboBoxInputGroup.displayName = DISPLAY_NAME.INPUT_GROUP;
ComboBoxInput.displayName = DISPLAY_NAME.INPUT;
ComboBoxPrefix.displayName = DISPLAY_NAME.PREFIX;
ComboBoxSuffix.displayName = DISPLAY_NAME.SUFFIX;
ComboBoxTrigger.displayName = DISPLAY_NAME.TRIGGER;
ComboBoxTriggerIndicator.displayName = DISPLAY_NAME.TRIGGER_INDICATOR;
ComboBoxClearButton.displayName = DISPLAY_NAME.CLEAR_BUTTON;
ComboBoxValue.displayName = DISPLAY_NAME.VALUE;
ComboBoxPortal.displayName = DISPLAY_NAME.PORTAL;
ComboBoxOverlay.displayName = DISPLAY_NAME.OVERLAY;
ComboBoxContent.displayName = DISPLAY_NAME.CONTENT;
ComboBoxContentBackground.displayName = DISPLAY_NAME.CONTENT_BACKGROUND;
ComboBoxList.displayName = DISPLAY_NAME.LIST;
ComboBoxListLabel.displayName = DISPLAY_NAME.LIST_LABEL;
ComboBoxItem.displayName = DISPLAY_NAME.ITEM;
ComboBoxItemLabel.displayName = DISPLAY_NAME.ITEM_LABEL;
ComboBoxItemDescription.displayName = DISPLAY_NAME.ITEM_DESCRIPTION;
ComboBoxItemIndicator.displayName = DISPLAY_NAME.ITEM_INDICATOR;
ComboBoxEmpty.displayName = DISPLAY_NAME.EMPTY;
/**
 * Static parts attached to the root. We assign properties explicitly instead
 * of only using `Object.assign`: some Metro / Hermes bundles do not reliably
 * retain every key on `forwardRef` results (see the same note on `DateField`).
 */
const ComboBox = ComboBoxRoot;
ComboBox.InputGroup = ComboBoxInputGroup;
ComboBox.Input = ComboBoxInput;
ComboBox.Prefix = ComboBoxPrefix;
ComboBox.Suffix = ComboBoxSuffix;
ComboBox.Trigger = ComboBoxTrigger;
ComboBox.TriggerIndicator = ComboBoxTriggerIndicator;
ComboBox.ClearButton = ComboBoxClearButton;
ComboBox.Value = ComboBoxValue;
ComboBox.Portal = ComboBoxPortal;
ComboBox.Overlay = ComboBoxOverlay;
ComboBox.Content = ComboBoxContent;
ComboBox.ContentBackground = ComboBoxContentBackground;
ComboBox.List = ComboBoxList;
ComboBox.ListLabel = ComboBoxListLabel;
ComboBox.Item = ComboBoxItem;
ComboBox.ItemLabel = ComboBoxItemLabel;
ComboBox.ItemDescription = ComboBoxItemDescription;
ComboBox.ItemIndicator = ComboBoxItemIndicator;
ComboBox.Empty = ComboBoxEmpty;
/**
 * `ComboBox` — a text input combined with a listbox popover, letting users
 * filter a collection of options to items matching a query. Composes the
 * heroui-native `Select` (popover presentation only) and `InputGroup`,
 * mirroring the HeroUI web ComboBox anatomy.
 *
 * @note RTL: fully inherited. The input group (measured affix widths as
 * `paddingStart`/`paddingEnd`, `rtl:text-right` on the `TextInput`), the
 * popover start/end alignment, and the trigger indicator are all handled by
 * the underlying heroui-native `InputGroup` and `Select`. The component's own
 * styles only use logical or symmetric properties, so there is nothing
 * directional to override here.
 *
 * @component ComboBox - Root that wraps `Select` and manages the input text,
 * item filtering, popover opening, and form field context. Accepts all
 * `Select` root props (selection modes, open state) plus `inputValue` /
 * `onInputChange`, `menuTrigger`, and `filter`. The popover presentation is
 * fixed.
 *
 * @component ComboBox.Trigger - Unstyled pressable that wraps the input
 * group so the popover anchors to the full input width.
 *
 * @component ComboBox.InputGroup - Input group wrapper containing the text
 * input and optional prefix/suffix slots. Inherits `isDisabled` from the root.
 *
 * @component ComboBox.Input - Text input wired to the combo box. Typing
 * filters the items; focus/typing opens the popover per `menuTrigger`.
 *
 * @component ComboBox.Prefix - Optional leading slot inside the input group.
 * @optional
 *
 * @component ComboBox.Suffix - Optional trailing slot inside the input
 * group; typically holds the trigger indicator. @optional
 *
 * @component ComboBox.TriggerIndicator - Chevron indicator that rotates with
 * the open state. @optional
 *
 * @component ComboBox.ClearButton - Optional close button inside the input
 * group suffix that clears the selection and input text, then calls
 * `onClear`. Hidden while there is no selection and the input is empty.
 * @optional
 *
 * @component ComboBox.Value - Selected labels or placeholder (primarily for
 * multiple mode). @optional
 *
 * @component ComboBox.Portal - Portals the overlay and content above the app
 * content, re-providing the combo box context.
 *
 * @component ComboBox.Overlay - Backdrop behind the popover; transparent by
 * default and dismisses on press. @optional
 *
 * @component ComboBox.Content - Popover content container (`width` defaults
 * to `"trigger"`).
 *
 * @component ComboBox.ContentBackground - Theme-aware background layer
 * behind the content. @optional
 *
 * @component ComboBox.List - Scrollable list container that keeps item taps
 * working while the keyboard is open.
 *
 * @component ComboBox.ListLabel - Section label for grouped items. @optional
 *
 * @component ComboBox.Item - Selectable option filtered by the input text
 * (`textValue` overrides `label` for matching).
 *
 * @component ComboBox.ItemLabel - Label text for an item. @optional
 *
 * @component ComboBox.ItemDescription - Muted description text for an item.
 * @optional
 *
 * @component ComboBox.ItemIndicator - Check indicator for selected items.
 * @optional
 *
 * @component ComboBox.Empty - Fallback shown when no item matches the input
 * text. @optional
 *
 * Props flow from ComboBox to sub-components via context.
 */
export default ComboBox;
