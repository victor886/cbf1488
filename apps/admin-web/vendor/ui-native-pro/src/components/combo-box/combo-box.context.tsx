// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelect } from 'heroui-native/select';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { createContext } from '../../helpers/internal/utils/index';
const [ComboBoxProvider, useComboBox] = createContext({
  name: 'ComboBoxContext',
  strict: true,
  errorMessage: 'ComboBox compound components must be used within `ComboBox`.',
});
/**
 * Props for the internal `ComboBoxStateProvider` (wired by the `ComboBox` root).
 */
/**
 * Provides input text state, filtering, and open/commit behavior for the
 * `ComboBox` parts. Must render inside the wrapped `Select` root so it can
 * read the selection and open state from the `Select` context.
 *
 * Behavior summary:
 * - Single mode: selecting an item writes its label into the input; clearing
 *   the input clears the selection; closing the popover reverts the input to
 *   the selected label (custom values are not kept).
 * - Multiple mode: the input acts as a search field and is cleared when the
 *   popover closes; selection is displayed via `ComboBox.Value`.
 */
function ComboBoxStateProvider(props) {
  const {
    inputValue: inputValueProp,
    defaultInputValue,
    onInputChange: onInputChangeProp,
    menuTrigger,
    filter,
    onClear,
    isDisabledRoot,
    children,
  } = props;
  const { value, onValueChange, selectionMode, isOpen } = useSelect();
  const [inputState, setInputState] = useControllableState({
    prop: inputValueProp,
    defaultProp: defaultInputValue ?? '',
    onChange: onInputChangeProp,
  });
  const inputValue = inputState ?? '';
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  /** Label of the committed selection (single mode only). */
  const selectedLabel = useMemo(() => {
    if (selectionMode === 'multiple') {
      return '';
    }
    const single = Array.isArray(value) ? value[0] : value;
    return single?.label ?? '';
  }, [value, selectionMode]);
  const hasSelection = Array.isArray(value) ? value.length > 0 : Boolean(value?.value);
  /**
   * Sync the input text to the committed selection (single mode). Guarded by
   * a ref comparison — not effect dependencies — because `setInputState` has
   * an unstable identity while `inputValue` is controlled (it is memoized
   * against the current prop), which would re-run the effect on every
   * keystroke and stomp the draft text back to the selected label. The ref
   * starts empty so a `defaultValue` selection syncs on mount, while a bare
   * mount leaves `defaultInputValue` untouched.
   */
  const prevSelectedLabelRef = useRef('');
  useEffect(() => {
    if (selectionMode === 'multiple') {
      return;
    }
    if (prevSelectedLabelRef.current === selectedLabel) {
      return;
    }
    prevSelectedLabelRef.current = selectedLabel;
    setInputState(selectedLabel);
  }, [selectedLabel, selectionMode, setInputState]);
  /**
   * Commit when the popover closes: dismiss the keyboard, then revert the
   * input to the selected label (single) or clear it (multiple).
   */
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (!wasOpen || isOpen) {
      return;
    }
    inputRef.current?.blur();
    setInputState(selectionMode === 'multiple' ? '' : selectedLabel);
  }, [isOpen, selectionMode, selectedLabel, setInputState]);
  const handleInputChange = useCallback(
    (text) => {
      setInputState(text);
      /** Web parity: clearing the query clears the single-mode selection. */
      if (selectionMode !== 'multiple' && text === '' && hasSelection) {
        onValueChange(undefined);
      }
    },
    [setInputState, selectionMode, hasSelection, onValueChange]
  );
  const handleInputBlur = useCallback(() => {
    /** While open, the close effect commits instead (keeps the filter stable). */
    if (isOpen) {
      return;
    }
    setInputState(selectionMode === 'multiple' ? '' : selectedLabel);
  }, [isOpen, selectionMode, selectedLabel, setInputState]);
  const openMenu = useCallback(() => {
    if (isDisabledRoot || isOpen) {
      return;
    }
    triggerRef.current?.open();
  }, [isDisabledRoot, isOpen]);
  /**
   * Text driving item filtering. When the single-mode input shows the
   * committed selection label, filter with an empty query so reopening the
   * popover shows the full collection instead of a single item.
   */
  const filterText = useMemo(() => {
    if (selectionMode !== 'multiple' && inputValue !== '' && inputValue === selectedLabel) {
      return '';
    }
    return inputValue;
  }, [selectionMode, inputValue, selectedLabel]);
  /**
   * Registry of mounted items (`value` → filter text). Items register on
   * mount so the provider can compute the visible count for `ComboBox.Empty`.
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
    if (filterText.trim().length === 0) {
      return itemRegistry.size;
    }
    let count = 0;
    itemRegistry.forEach((textValue) => {
      if (filter(textValue, filterText)) {
        count += 1;
      }
    });
    return count;
  }, [itemRegistry, filterText, filter]);
  const contextValue = useMemo(
    () => ({
      inputValue,
      filterText,
      onInputChange: handleInputChange,
      onInputBlur: handleInputBlur,
      openMenu,
      menuTrigger,
      filter,
      registerItem,
      unregisterItem,
      visibleItemCount,
      onClear,
      isDisabledRoot,
      inputRef,
      triggerRef,
    }),
    [
      inputValue,
      filterText,
      handleInputChange,
      handleInputBlur,
      openMenu,
      menuTrigger,
      filter,
      registerItem,
      unregisterItem,
      visibleItemCount,
      onClear,
      isDisabledRoot,
    ]
  );
  return <ComboBoxProvider value={contextValue}>{children}</ComboBoxProvider>;
}
export { ComboBoxProvider, ComboBoxStateProvider, useComboBox };
