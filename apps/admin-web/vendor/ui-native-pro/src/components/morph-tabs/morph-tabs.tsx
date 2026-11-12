// @ts-nocheck
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { HeroText, TabsPager, TabsPagerContent } from '../../helpers/internal/components/index';
import { useTabsPagerState } from '../../helpers/internal/hooks/index';
import { createContext } from '../../helpers/internal/utils/index';
import {
  useMorphTabsIconAnimation,
  useMorphTabsLabelAnimation,
  useMorphTabsRootAnimation,
  useMorphTabsTriggerAnimation,
} from './morph-tabs.animation';
import { COMPONENT_NAME, DISPLAY_NAME } from './morph-tabs.constants';
import { morphTabsClassNames, morphTabsStyleSheet } from './morph-tabs.styles';
import { findLabelText } from './morph-tabs.utils';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const [MorphTabsProvider, useMorphTabs] = createContext<any>({
  name: 'MorphTabsContext',
});
const [MorphTabsTriggerProvider, useMorphTabsTrigger] = createContext<any>({
  name: 'MorphTabsTriggerContext',
});
// --------------------------------------------------
const MorphTabsRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    value: valueProp,
    defaultValue,
    lazy = false,
    renderLazyPlaceholder,
    className,
    onValueChange,
    animation,
    ...restProps
  } = props;
  const contextValue = useTabsPagerState({
    value: valueProp,
    defaultValue,
    lazy,
    renderLazyPlaceholder,
    onValueChange,
    componentName: COMPONENT_NAME,
  });
  const nativeRef = useRef(null);
  const rootClassName = morphTabsClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useMorphTabsRootAnimation({
    animation,
  });
  const { goTo } = contextValue;
  useImperativeHandle(
    ref,
    () =>
      Object.assign(nativeRef.current ?? {}, {
        goTo,
      }),
    [goTo]
  );
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <MorphTabsProvider value={contextValue}>
        <View ref={nativeRef} className={rootClassName} {...restProps}>
          {children}
        </View>
      </MorphTabsProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const MorphTabsList = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const listClassName = morphTabsClassNames.list({
    className,
  });
  return (
    <View ref={ref} className={listClassName} accessibilityRole="tablist" {...restProps}>
      {children}
    </View>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind a trigger
 * pill. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const MorphTabsTriggerBackground = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const triggerBackgroundClassName = morphTabsClassNames.triggerBackground({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={triggerBackgroundClassName}
      fallbackColor="default"
      {...restProps}
    />
  );
});
// --------------------------------------------------
const MorphTabsTrigger = forwardRef((props: any, ref: any) => {
  const {
    children,
    value,
    isDisabled = false,
    className,
    style,
    background,
    accessibilityLabel,
    accessibilityState,
    onPress,
    animation,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const { value: selectedValue, progress, getIndex, goTo } = useMorphTabs();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const index = getIndex(value);
  const isSelected = selectedValue === value;
  const triggerClassName = morphTabsClassNames.trigger({
    isDisabled,
    className,
  });
  const { rContainerStyle } = useMorphTabsTriggerAnimation({
    animation,
    index,
    isSelected,
    progress,
  });
  /** Selects the trigger's page, then forwards the consumer callback */
  const handlePress = useCallback(
    (event) => {
      goTo(value);
      onPress?.(event);
    },
    [goTo, onPress, value]
  );
  const triggerContextValue = useMemo(
    () => ({
      value,
      index,
      isSelected,
      isDisabled,
    }),
    [value, index, isSelected, isDisabled]
  );
  const renderProps = {
    isSelected,
    value,
    index,
    isDisabled,
  };
  const content = typeof children === 'function' ? children(renderProps) : children;
  /**
   * Collapsed pills show only the icon, so the label text (always mounted,
   * just faded and clipped) names the tab for screen readers.
   */
  const resolvedAccessibilityLabel = accessibilityLabel ?? findLabelText(content) ?? undefined;
  /**
   * Background layer rendered behind the pill surface.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content (the pill paints the translucent
   *   `--color-default` under glass)
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <MorphTabsTriggerBackground />
    ) : null;
  return (
    <MorphTabsTriggerProvider value={triggerContextValue}>
      <AnimatedPressable
        ref={ref}
        className={triggerClassName}
        style={[
          morphTabsStyleSheet.trigger,
          isAnimatedStyleActive ? rContainerStyle : undefined,
          style,
        ]}
        disabled={isDisabled}
        onPress={handlePress}
        accessibilityRole="tab"
        accessibilityLabel={resolvedAccessibilityLabel}
        accessibilityState={{
          ...accessibilityState,
          selected: isSelected,
          disabled: isDisabled,
        }}
        {...restProps}
      >
        {backgroundElement}
        {content}
      </AnimatedPressable>
    </MorphTabsTriggerProvider>
  );
});
// --------------------------------------------------
const MorphTabsIcon = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    style,
    animation,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const { progress } = useMorphTabs();
  const { index, isSelected } = useMorphTabsTrigger();
  const iconClassName = morphTabsClassNames.icon({
    className,
  });
  const { rContainerStyle } = useMorphTabsIconAnimation({
    animation,
    index,
    isSelected,
    progress,
  });
  return (
    <Animated.View
      ref={ref}
      className={iconClassName}
      style={isAnimatedStyleActive ? [rContainerStyle, style] : style}
      {...restProps}
    >
      {children}
    </Animated.View>
  );
});
// --------------------------------------------------
const MorphTabsLabel = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    classNames,
    styles,
    style,
    numberOfLines = 1,
    ellipsizeMode = 'clip',
    animation,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const { progress } = useMorphTabs();
  const { index, isSelected } = useMorphTabsTrigger();
  const { width: windowWidth } = useWindowDimensions();
  const { container, text } = morphTabsClassNames.label();
  const containerClassName = container({
    className: classNames?.container,
  });
  const textClassName = text({
    className: [className, classNames?.text],
  });
  const labelMeasureClassName = morphTabsClassNames.labelMeasure();
  const { rContainerStyle, labelWidth } = useMorphTabsLabelAnimation({
    animation,
    index,
    isSelected,
    progress,
  });
  /** Feeds the label's natural width to the `maxWidth` reveal */
  const handleMeasureLayout = useCallback(
    (event) => {
      labelWidth.set(event.nativeEvent.layout.width);
    },
    [labelWidth]
  );
  return (
    <>
      <Animated.View
        className={containerClassName}
        style={isAnimatedStyleActive ? [rContainerStyle, styles?.container] : styles?.container}
      >
        <HeroText
          ref={ref}
          className={textClassName}
          style={[styles?.text, style]}
          numberOfLines={numberOfLines}
          ellipsizeMode={ellipsizeMode}
          {...restProps}
        >
          {children}
        </HeroText>
      </Animated.View>
      <View
        className={labelMeasureClassName}
        style={{
          width: windowWidth,
        }}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <HeroText
          className={textClassName}
          style={[styles?.text, style]}
          numberOfLines={1}
          accessible={false}
          onLayout={handleMeasureLayout}
        >
          {children}
        </HeroText>
      </View>
    </>
  );
});
// --------------------------------------------------
const MorphTabsPager = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const state = useMorphTabs();
  const pagerClassName = morphTabsClassNames.pager({
    className,
  });
  return (
    <TabsPager
      ref={ref}
      state={state}
      contentDisplayName={DISPLAY_NAME.CONTENT}
      componentName={COMPONENT_NAME}
      className={pagerClassName}
      {...restProps}
    >
      {children}
    </TabsPager>
  );
});
// --------------------------------------------------
const MorphTabsContent = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const state = useMorphTabs();
  const contentClassName = morphTabsClassNames.content({
    className,
  });
  return (
    <TabsPagerContent ref={ref} state={state} className={contentClassName} {...restProps}>
      {children}
    </TabsPagerContent>
  );
});
// --------------------------------------------------
MorphTabsRoot.displayName = DISPLAY_NAME.ROOT;
MorphTabsList.displayName = DISPLAY_NAME.LIST;
MorphTabsTrigger.displayName = DISPLAY_NAME.TRIGGER;
MorphTabsTriggerBackground.displayName = DISPLAY_NAME.TRIGGER_BACKGROUND;
MorphTabsIcon.displayName = DISPLAY_NAME.ICON;
MorphTabsLabel.displayName = DISPLAY_NAME.LABEL;
MorphTabsPager.displayName = DISPLAY_NAME.PAGER;
MorphTabsContent.displayName = DISPLAY_NAME.CONTENT;
/**
 * Compound MorphTabs component with sub-components
 *
 * @component MorphTabs - Root container owning the selected value
 * (controlled or uncontrolled), the continuous pager position shared by the
 * header morph, and lazy-mount bookkeeping. Its ref is the root `View` with a
 * merged `goTo(value, animated?)` method.
 *
 * @component MorphTabs.List - Header row (`tablist`). Hosts the triggers and
 * any other content (e.g. an avatar), which keeps its natural size. Place it
 * above or below `MorphTabs.Pager`.
 *
 * @component MorphTabs.Trigger - Pill (`tab`) that selects its page. Its
 * `flexGrow` is interpolated from the pager position, so the active pill
 * fills the leftover row space and neighbouring pills split it mid-swipe.
 *
 * @component MorphTabs.TriggerBackground - @optional Absolute-fill
 * background container behind a pill. With no children, the active library
 * theme decides the default content (e.g. a glass blur layer); replaceable
 * via the `background` prop on `MorphTabs.Trigger`.
 *
 * @component MorphTabs.Icon - Trigger icon wrapper; brightens as its page
 * becomes active.
 *
 * @component MorphTabs.Label - Single-line trigger label inside a clipping
 * container that shrinks to zero in a collapsed pill; fades in as the pill
 * expands and doubles as the trigger's accessibility label.
 *
 * @component MorphTabs.Pager - Native swipeable pager
 * (`react-native-pager-view`, an optional peer dependency). Its
 * `onPageScroll` worklet writes the pager position on the UI thread.
 *
 * @component MorphTabs.Content - One page per value, rendered as a direct
 * child of `MorphTabs.Pager`. Shows `renderLazyPlaceholder` until first
 * shown when the root is `lazy`.
 *
 * Props flow from MorphTabs to sub-components via context (selected value,
 * page values, pager position, `goTo`, lazy-mount state).
 *
 * @note RTL: fully logical. The header row mirrors with `flex-direction: row`,
 * the CSS uses logical properties only, and the pager's `layoutDirection`
 * follows `useIsRTL()`, so both app-wide RTL and provider `isRTL` flip the
 * page order. The morph progress is kept as a logical page index: iOS
 * pager-view reports physical scroll positions under RTL, so the shared
 * `useTabsPagerScrollHandler` mirrors them there. User-supplied icons
 * are never mirrored.
 */
const MorphTabs = Object.assign(MorphTabsRoot, {
  /** Header row hosting the triggers */
  List: MorphTabsList,
  /** Morphing pill that selects its page */
  Trigger: MorphTabsTrigger,
  /** @optional Theme-aware background container behind a pill */
  TriggerBackground: MorphTabsTriggerBackground,
  /** @optional Trigger icon, brightens when active */
  Icon: MorphTabsIcon,
  /** @optional Trigger label, revealed as the pill expands */
  Label: MorphTabsLabel,
  /** Native swipeable pager hosting the pages */
  Pager: MorphTabsPager,
  /** One page of the pager */
  Content: MorphTabsContent,
});
export default MorphTabs;
export { useMorphTabs, useMorphTabsTrigger };
