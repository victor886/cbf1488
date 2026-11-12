// @ts-nocheck
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { areValueListsEqual } from '../utils/index';
import { useControllableState } from './use-controllable-state';
/**
 * Selection, page registration, and lazy-mount state for a tabs root backed
 * by a native pager. The pager registers its page values; header parts and
 * pages read the returned state through the component's context.
 *
 * @param options - Root props plus the component name used in dev warnings
 * @returns Memoized {@link TabsPagerState}
 */
export function useTabsPagerState(options: any) {
  const {
    value: valueProp,
    defaultValue,
    lazy = false,
    renderLazyPlaceholder,
    onValueChange,
    componentName,
  } = options;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  /** Page values in pager order, registered by the pager. */
  const [values, setValuesState] = useState<any[]>([]);
  /** Values of lazy pages that have been shown at least once. */
  const [mountedValues, setMountedValues] = useState<any>(() => new Set());
  const pendingAnimatedRef = useRef<any>(undefined);
  /**
   * Continuous pager position (`position + offset`). Written on the UI
   * thread by the pager's scroll handler, and snapped by the pager for jumps
   * without a slide.
   */
  const progress = useSharedValue<any>(0);
  /**
   * Falls back to the first page when the value is unset (uncontrolled
   * without `defaultValue`) or matches no page. Before the pager registers
   * its pages the raw value passes through, so the pager can derive its
   * initial page from it.
   */
  const matchedIndex = value !== undefined ? values.indexOf(value) : -1;
  const selectedIndex = matchedIndex >= 0 ? matchedIndex : values.length > 0 ? 0 : -1;
  const resolvedValue = selectedIndex >= 0 ? values[selectedIndex] : value;
  const setValues = useCallback((nextValues: any) => {
    setValuesState((prev) => (areValueListsEqual(prev, nextValues) ? prev : nextValues));
  }, []);
  const mountValues = useCallback(
    (nextValues: any) => {
      if (!lazy) {
        return;
      }
      setMountedValues((prev) => {
        if (nextValues.every((nextValue) => prev.has(nextValue))) {
          return prev;
        }
        const next = new Set(prev);
        nextValues.forEach((nextValue) => next.add(nextValue));
        return next;
      });
    },
    [lazy]
  );
  /**
   * Mounts the selected page before paint so a lazy first page never
   * flashes its placeholder.
   */
  useLayoutEffect(() => {
    if (resolvedValue !== undefined) {
      mountValues([resolvedValue]);
    }
  }, [mountValues, resolvedValue]);
  const isMounted = useCallback(
    (pageValue: any) => !lazy || mountedValues.has(pageValue),
    [lazy, mountedValues]
  );
  const getIndex = useCallback((pageValue: any) => values.indexOf(pageValue), [values]);
  const goTo = useCallback(
    (targetValue: any, animated: any) => {
      if (!values.includes(targetValue)) {
        if (__DEV__) {
          console.warn(
            `[${componentName}] goTo("${targetValue}") ignored: no ${componentName}.Content has this value.`
          );
        }
        return;
      }
      mountValues([targetValue]);
      if (targetValue === resolvedValue) {
        return;
      }
      pendingAnimatedRef.current = animated;
      setValue(targetValue);
    },
    [componentName, mountValues, resolvedValue, setValue, values]
  );
  return useMemo(
    () => ({
      value: resolvedValue,
      values,
      selectedIndex,
      progress,
      pendingAnimatedRef,
      goTo,
      getIndex,
      isMounted,
      mountValues,
      setValues,
      renderLazyPlaceholder,
    }),
    [
      resolvedValue,
      values,
      selectedIndex,
      progress,
      goTo,
      getIndex,
      isMounted,
      mountValues,
      setValues,
      renderLazyPlaceholder,
    ]
  );
}
