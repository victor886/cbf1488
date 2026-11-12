import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { colorKit, ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { useThemeColor } from 'heroui-native/hooks';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { resolveMaskHeight } from '../wheel-picker/wheel-picker.utils';
import { useWheelPickerGroupRootAnimation } from './wheel-picker-group.animation';
import {
  DISPLAY_NAME,
  GROUP_DEFAULT_ITEM_HEIGHT,
  GROUP_DEFAULT_VISIBLE_COUNT,
} from './wheel-picker-group.constants';
import { useWheelPickerGroup, WheelPickerGroupContext } from './wheel-picker-group.context';
import { styleSheet, wheelPickerGroupClassNames } from './wheel-picker-group.styles';
// --------------------------------------------------
const WheelPickerGroupRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    values: valuesProp,
    defaultValues,
    itemHeight = GROUP_DEFAULT_ITEM_HEIGHT,
    visibleCount = GROUP_DEFAULT_VISIBLE_COUNT,
    isDisabled = false,
    className,
    style,
    onValuesChange,
    onValuesCommit,
    animation,
    ...restProps
  } = props;
  const [values, setValues] = useControllableState({
    prop: valuesProp,
    defaultProp: defaultValues,
    onChange: onValuesChange,
  });
  const resolvedItemHeight = itemHeight > 0 ? itemHeight : GROUP_DEFAULT_ITEM_HEIGHT;
  const resolvedVisibleCount =
    visibleCount > 0 && visibleCount % 2 === 1 ? visibleCount : GROUP_DEFAULT_VISIBLE_COUNT;
  const viewportHeight = resolvedVisibleCount * resolvedItemHeight;
  const containerClassName = wheelPickerGroupClassNames.root({
    isDisabled,
    className,
  });
  const { isAllAnimationsDisabled } = useWheelPickerGroupRootAnimation({
    animation,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  // Mirror props through refs so the stable callbacks below see the
  // freshest values without forcing the context to depend on them
  // (which would re-render every wheel on each prop change).
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const onValuesCommitRef = useRef(onValuesCommit);
  onValuesCommitRef.current = onValuesCommit;
  // Count of wheels currently scrolling. Plain ref because coordination
  // is JS-thread only. The transition back to `0` fires `onValuesCommit`
  // exactly once per multi-wheel session.
  const activeScrollCountRef = useRef(0);
  const setValueByName = useCallback(
    (name, value) => {
      /**
       * Mirror the write synchronously into `valuesRef.current` so the
       * commit path (`notifyScrollState` → `onValuesCommit`) sees the
       * freshest values in the **same** JS tick — before React has had
       * a chance to flush the queued `setValues` re-render.
       *
       * This is critical for fast flings: `onMomentumEnd` schedules
       * `onIndexChange` (writes through here) and `onScrollingChange`
       * (reads `valuesRef.current` in the commit) back-to-back on the
       * JS thread. Without this mirror, the commit fires with the
       * pre-fling values because `valuesRef.current` is only refreshed
       * during the next render (line above), and React batches the
       * `setValues` update past the commit.
       */
      valuesRef.current = {
        ...(valuesRef.current ?? {}),
        [name]: value,
      };
      setValues((prev) => ({
        ...(prev ?? {}),
        [name]: value,
      }));
    },
    [setValues]
  );
  const notifyScrollState = useCallback((isScrolling) => {
    const delta = isScrolling ? 1 : -1;
    activeScrollCountRef.current = Math.max(0, activeScrollCountRef.current + delta);
    if (activeScrollCountRef.current === 0) {
      onValuesCommitRef.current?.(valuesRef.current ?? {});
    }
  }, []);
  const isAnyWheelScrolling = useCallback(() => activeScrollCountRef.current > 0, []);
  const contextValue = useMemo(
    () => ({
      itemHeight: resolvedItemHeight,
      visibleCount: resolvedVisibleCount,
      isDisabled,
      getValue: (name) => values?.[name],
      setValue: setValueByName,
      notifyScrollState,
      isAnyWheelScrolling,
    }),
    [
      resolvedItemHeight,
      resolvedVisibleCount,
      isDisabled,
      values,
      setValueByName,
      notifyScrollState,
      isAnyWheelScrolling,
    ]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <WheelPickerGroupContext.Provider value={contextValue}>
        <View
          ref={ref}
          className={containerClassName}
          style={[
            {
              height: viewportHeight,
            },
            style,
          ]}
          accessibilityRole="adjustable"
          accessibilityState={{
            disabled: isDisabled,
          }}
          {...restProps}
        >
          {children}
        </View>
      </WheelPickerGroupContext.Provider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the highlight
 * band's surface. With no `children`, the active library theme decides the
 * default content: `glass` renders a `GlassView` blur layer; other themes
 * render nothing. Pass `children` to host arbitrary content (gradients,
 * images) with the container's positioning and clipping applied.
 */
const WheelPickerGroupIndicatorBackground = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const indicatorBackgroundClassName = wheelPickerGroupClassNames.indicatorBackground({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={indicatorBackgroundClassName}
      fallbackColor="default"
      {...restProps}
    />
  );
});
// --------------------------------------------------
const WheelPickerGroupIndicator = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    classNames,
    styles: stylesProp,
    style,
    background,
    ...restProps
  } = props;
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const { itemHeight, visibleCount } = useWheelPickerGroup();
  const { wrapper: wrapperSlot, highlight: highlightSlot } = wheelPickerGroupClassNames.indicator();
  const wrapperClassName = wrapperSlot({
    className: [className, classNames?.wrapper],
  });
  const highlightClassName = highlightSlot({
    className: classNames?.highlight,
  });
  // Center the indicator on the group viewport: span one row, offset by
  // half of the rows above the center.
  const wrapperHeight = itemHeight;
  const wrapperTop = ((visibleCount - 1) / 2) * itemHeight;
  /**
   * Background layer rendered behind the highlight band's surface.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content (the band paints `--color-default`)
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <WheelPickerGroupIndicatorBackground />
    ) : null;
  return (
    <View
      ref={ref}
      className={wrapperClassName}
      style={[
        {
          top: wrapperTop,
          height: wrapperHeight,
        },
        stylesProp?.wrapper,
        style,
      ]}
      pointerEvents="none"
      {...restProps}
    >
      <View
        className={highlightClassName}
        style={[styleSheet.indicatorHighlight, stylesProp?.highlight]}
      >
        {backgroundElement}
        {children}
      </View>
    </View>
  );
});
// --------------------------------------------------
const WheelPickerGroupMask = forwardRef((props: any, ref: any) => {
  const { color, height, className, classNames, styles: stylesProp, style, ...restProps } = props;
  const { itemHeight, visibleCount } = useWheelPickerGroup();
  const { top: topSlot, bottom: bottomSlot } = wheelPickerGroupClassNames.mask();
  const topClassName = topSlot({
    className: [className, classNames?.top],
  });
  const bottomClassName = bottomSlot({
    className: [className, classNames?.bottom],
  });
  const halfMaskHeight = ((visibleCount - 1) / 2) * itemHeight;
  const baseMaskHeight = halfMaskHeight * 0.5;
  const resolvedHeight = resolveMaskHeight(height, baseMaskHeight);
  const themeBackground = useThemeColor('background');
  const baseColor = color ?? themeBackground;
  const { topGradient, bottomGradient } = useMemo(() => {
    const transparent = colorKit.setAlpha(baseColor, 0).hex();
    return {
      topGradient: `linear-gradient(to bottom, ${baseColor}, ${transparent})`,
      bottomGradient: `linear-gradient(to top, ${baseColor}, ${transparent})`,
    };
  }, [baseColor]);
  return (
    <View ref={ref} style={[StyleSheet.absoluteFill, style]} pointerEvents="none" {...restProps}>
      <View
        className={topClassName}
        style={[
          {
            experimental_backgroundImage: topGradient,
            height: resolvedHeight,
          },
          stylesProp?.top,
        ]}
        pointerEvents="none"
      />
      <View
        className={bottomClassName}
        style={[
          {
            experimental_backgroundImage: bottomGradient,
            height: resolvedHeight,
          },
          stylesProp?.bottom,
        ]}
        pointerEvents="none"
      />
    </View>
  );
});
// --------------------------------------------------
WheelPickerGroupRoot.displayName = DISPLAY_NAME.ROOT;
WheelPickerGroupIndicator.displayName = DISPLAY_NAME.INDICATOR;
WheelPickerGroupIndicatorBackground.displayName = DISPLAY_NAME.INDICATOR_BACKGROUND;
WheelPickerGroupMask.displayName = DISPLAY_NAME.MASK;
/**
 * Compound `WheelPickerGroup` component for coordinating multiple
 * `WheelPicker` instances (e.g. a date picker with year / month / day).
 *
 * @component WheelPickerGroup - Root container managing a shared
 * controllable `values` record. Provides `itemHeight`, `visibleCount`,
 * value getters/setters, and scroll coordination to child wheels via
 * context. Cascades `animation="disable-all"` to all children.
 *
 * @component WheelPickerGroup.Indicator - Optional shared selection band
 * spanning every wheel at the center of the group viewport. Replaces the
 * per-wheel indicator when a child `WheelPicker` is nested in the group.
 *
 * @component WheelPickerGroup.IndicatorBackground - Absolute-fill background
 * container behind the highlight band's surface. With no children, the
 * active library theme decides the default content (e.g. a glass blur
 * layer); pass children to host custom content with the same positioning
 * and clipping.
 *
 * @component WheelPickerGroup.Mask - Optional top / bottom fade overlays
 * that span the full group viewport.
 *
 * Children opt into the group by setting a `name` prop on each
 * `WheelPicker`. Wheels without a name still render but operate
 * independently. Wheels nested in a group automatically receive
 * `flex-1` so they distribute the row evenly; pass an explicit width
 * via `className` to override.
 *
 */
const WheelPickerGroup = Object.assign(WheelPickerGroupRoot, {
  /** @optional Shared selection band spanning every wheel */
  Indicator: WheelPickerGroupIndicator,
  /** @optional Theme-aware background layer behind the highlight band */
  IndicatorBackground: WheelPickerGroupIndicatorBackground,
  /** @optional Shared top / bottom fade overlays */
  Mask: WheelPickerGroupMask,
});
export default WheelPickerGroup;
export { useWheelPickerGroup };
