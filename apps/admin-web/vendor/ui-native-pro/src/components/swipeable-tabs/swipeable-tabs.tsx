// @ts-nocheck
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { Tabs, tabsClassNames, useTabsMeasurements } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { TabsPager, TabsPagerContent } from '../../helpers/internal/components/index';
import { useTabsPagerState } from '../../helpers/internal/hooks/index';
import { createContext } from '../../helpers/internal/utils/index';
import {
  useSwipeableTabsIndicatorAnimation,
  useSwipeableTabsRootAnimation,
} from './swipeable-tabs.animation';
import { COMPONENT_NAME, DISPLAY_NAME } from './swipeable-tabs.constants';
import { swipeableTabsClassNames } from './swipeable-tabs.styles';
const [SwipeableTabsProvider, useSwipeableTabs] = createContext<any>({
  name: 'SwipeableTabsContext',
});
// --------------------------------------------------
const SwipeableTabsRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    value: valueProp,
    defaultValue,
    lazy = false,
    renderLazyPlaceholder,
    variant = 'primary',
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
  const rootClassName = swipeableTabsClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useSwipeableTabsRootAnimation({
    animation,
  });
  const { value, goTo } = contextValue;
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
  /**
   * heroui-native `Tabs` drives the list parts: its `value` mirrors the
   * resolved selection (empty for the single pre-registration render), and
   * trigger presses route through `goTo` so the pager slides to the page.
   */
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <SwipeableTabsProvider value={contextValue}>
        <Tabs
          ref={nativeRef}
          value={value ?? ''}
          onValueChange={goTo}
          variant={variant}
          className={rootClassName}
          animation={animation}
          {...restProps}
        >
          {children}
        </Tabs>
      </SwipeableTabsProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const SwipeableTabsIndicator = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    style,
    animation,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const { progress, values, selectedIndex } = useSwipeableTabs();
  const { variant, isScrollView } = useTabsMeasurements();
  const indicatorClassName = tabsClassNames.indicator({
    variant,
    isScrollView,
    className,
  });
  const { rContainerStyle } = useSwipeableTabsIndicatorAnimation({
    animation,
    progress,
    values,
    selectedIndex,
  });
  return (
    <Animated.View
      ref={ref}
      className={indicatorClassName}
      style={isAnimatedStyleActive ? [rContainerStyle, style] : style}
      role="presentation"
      aria-hidden={true}
      pointerEvents="none"
      {...restProps}
    >
      {children}
    </Animated.View>
  );
});
// --------------------------------------------------
const SwipeableTabsPager = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const state = useSwipeableTabs();
  const pagerClassName = swipeableTabsClassNames.pager({
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
const SwipeableTabsContent = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const state = useSwipeableTabs();
  const contentClassName = swipeableTabsClassNames.content({
    className,
  });
  return (
    <TabsPagerContent ref={ref} state={state} className={contentClassName} {...restProps}>
      {children}
    </TabsPagerContent>
  );
});
// --------------------------------------------------
SwipeableTabsRoot.displayName = DISPLAY_NAME.ROOT;
SwipeableTabsIndicator.displayName = DISPLAY_NAME.INDICATOR;
SwipeableTabsPager.displayName = DISPLAY_NAME.PAGER;
SwipeableTabsContent.displayName = DISPLAY_NAME.CONTENT;
/**
 * Compound SwipeableTabs component with sub-components
 *
 * @component SwipeableTabs - Root owning the selected value (controlled or
 * uncontrolled), the continuous pager position, and lazy-mount bookkeeping.
 * Renders heroui-native `Tabs` (with `variant`) around its children. Its ref
 * is the root `View` with a merged `goTo(value, animated?)` method.
 *
 * @component SwipeableTabs.List - heroui-native `Tabs.List`.
 *
 * @component SwipeableTabs.ListBackground - @optional heroui-native
 * `Tabs.ListBackground` (theme layer behind the primary list surface).
 *
 * @component SwipeableTabs.ScrollView - @optional heroui-native
 * `Tabs.ScrollView` for lists wider than the screen.
 *
 * @component SwipeableTabs.Trigger - heroui-native `Tabs.Trigger`; pressing
 * it slides the pager to its page.
 *
 * @component SwipeableTabs.Label - heroui-native `Tabs.Label`.
 *
 * @component SwipeableTabs.Separator - @optional heroui-native
 * `Tabs.Separator`.
 *
 * @component SwipeableTabs.Indicator - Highlight that follows the pager
 * position frame by frame, interpolating between the measured triggers.
 * Styled with heroui-native's `tabsClassNames.indicator`, so it matches
 * `Tabs.Indicator`.
 *
 * @component SwipeableTabs.Pager - Native swipeable pager
 * (`react-native-pager-view`, an optional peer dependency).
 *
 * @component SwipeableTabs.Content - One page per value, rendered as a direct
 * child of `SwipeableTabs.Pager`.
 *
 * The list parts are heroui-native `Tabs` parts assigned as-is (not wrapped):
 * `Tabs.List` detects `Tabs.ScrollView` by display name, and their themes
 * (including the pro brutalism `tabs.css` override and the glass list
 * background) apply unchanged, so this component ships no theme overrides of
 * its own.
 *
 * @note RTL: list layout, trigger order, and scroll alignment are inherited
 * from heroui-native `Tabs`. The indicator interpolates physical `onLayout`
 * offsets and re-bases them when app-wide RTL re-anchors its `left: 0`
 * (mirroring `Tabs.Indicator`). The pager follows `useIsRTL()` through its
 * `layoutDirection`, and the shared scroll handler keeps the pager position
 * a logical page index on iOS.
 */
const SwipeableTabs = Object.assign(SwipeableTabsRoot, {
  /** Tab list container (heroui-native `Tabs.List`) */
  List: Tabs.List,
  /** @optional Theme layer behind the primary list surface */
  ListBackground: Tabs.ListBackground,
  /** @optional Horizontally scrollable tab list */
  ScrollView: Tabs.ScrollView,
  /** Tab button selecting its page */
  Trigger: Tabs.Trigger,
  /** Trigger label */
  Label: Tabs.Label,
  /** @optional Separator between triggers */
  Separator: Tabs.Separator,
  /** Indicator following the pager position */
  Indicator: SwipeableTabsIndicator,
  /** Native swipeable pager hosting the pages */
  Pager: SwipeableTabsPager,
  /** One page of the pager */
  Content: SwipeableTabsContent,
});
export default SwipeableTabs;
export { useSwipeableTabs };
