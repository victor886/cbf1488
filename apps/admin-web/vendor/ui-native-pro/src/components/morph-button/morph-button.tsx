// @ts-nocheck
import { Children, forwardRef, isValidElement, useCallback, useMemo } from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { createContext } from '../../helpers/internal/utils/index';
import {
  useMorphButtonCollapsedContentAnimation,
  useMorphButtonExpandedContentAnimation,
  useMorphButtonRootAnimation,
} from './morph-button.animation';
import { DISPLAY_NAME } from './morph-button.constants';
import { morphButtonClassNames, morphButtonStyleSheet } from './morph-button.styles';
const [MorphButtonProvider, useMorphButton] = createContext({
  name: 'MorphButtonContext',
});
// --------------------------------------------------
const MorphButtonRoot = forwardRef((props, ref) => {
  const {
    children,
    direction = 'top',
    variant = 'primary',
    isOpen: isOpenProp,
    defaultOpen = false,
    isDisabled = false,
    className,
    classNames,
    styles,
    style,
    onOpenChange,
    onPress,
    animation,
    ...restProps
  } = props;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [isOpen = false, setIsOpen] = useControllableState({
    prop: isOpenProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });
  const { container, surface } = morphButtonClassNames.root({
    variant,
    isDisabled,
  });
  const containerClassName = container({
    className: [className, classNames?.container],
  });
  const surfaceClassName = surface({
    className: classNames?.surface,
  });
  const expandedHostClassName = morphButtonClassNames.expandedHost({
    direction,
  });
  const {
    isAllAnimationsDisabled,
    isOpenValue,
    collapsedWidth,
    collapsedHeight,
    expandedWidth,
    expandedHeight,
    surfaceWidth,
    surfaceHeight,
    rSurfaceStyle,
    rExpandedHostStyle,
  } = useMorphButtonRootAnimation({
    animation,
    isOpen,
    direction,
    windowWidth,
    windowHeight,
  });
  const open = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);
  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, [setIsOpen]);
  /** Toggles the open state, then forwards the consumer callback */
  const handlePress = useCallback(
    (event) => {
      toggle();
      onPress?.(event);
    },
    [toggle, onPress]
  );
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const contextValue = useMemo(
    () => ({
      isOpen,
      isOpenValue,
      direction,
      variant,
      isDisabled,
      collapsedWidth,
      collapsedHeight,
      expandedWidth,
      expandedHeight,
      surfaceWidth,
      surfaceHeight,
      open,
      close,
      toggle,
    }),
    [
      isOpen,
      isOpenValue,
      direction,
      variant,
      isDisabled,
      collapsedWidth,
      collapsedHeight,
      expandedWidth,
      expandedHeight,
      surfaceWidth,
      surfaceHeight,
      open,
      close,
      toggle,
    ]
  );
  /**
   * ExpandedContent children render inside the surface's measuring host so
   * they are clipped by the morphing surface; everything else (typically
   * CollapsedContent) stays in the root flow, where its natural size
   * defines the root footprint.
   */
  const { expandedChildren, flowChildren } = useMemo(() => {
    const expanded = [];
    const flow = [];
    Children.toArray(children).forEach((child) => {
      if (isValidElement(child) && child.type === MorphButtonExpandedContent) {
        expanded.push(child);
      } else {
        flow.push(child);
      }
    });
    return {
      expandedChildren: expanded,
      flowChildren: flow,
    };
  }, [children]);
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <MorphButtonProvider value={contextValue}>
        <Pressable
          ref={ref}
          className={containerClassName}
          style={[styles?.container, style]}
          disabled={isDisabled}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityState={{
            expanded: isOpen,
            disabled: isDisabled,
          }}
          {...restProps}
        >
          <Animated.View
            className={surfaceClassName}
            style={[morphButtonStyleSheet.surface, rSurfaceStyle, styles?.surface]}
          >
            <Animated.View
              className={expandedHostClassName}
              style={rExpandedHostStyle}
              pointerEvents={isOpen ? 'box-none' : 'none'}
            >
              {expandedChildren}
            </Animated.View>
          </Animated.View>
          {flowChildren}
        </Pressable>
      </MorphButtonProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const MorphButtonCollapsedContent = forwardRef((props, ref) => {
  const {
    children,
    className,
    style,
    animation,
    isAnimatedStyleActive = true,
    onLayout,
    ...restProps
  } = props;
  const ctx = useMorphButton();
  const collapsedContentClassName = morphButtonClassNames.collapsedContent({
    className,
  });
  const { rContentStyle } = useMorphButtonCollapsedContentAnimation({
    animation,
    isOpenValue: ctx.isOpenValue,
  });
  /** Feeds the collapsed morph target, then forwards the consumer callback */
  const handleLayout = useCallback(
    (event) => {
      ctx.collapsedWidth.set(event.nativeEvent.layout.width);
      ctx.collapsedHeight.set(event.nativeEvent.layout.height);
      onLayout?.(event);
    },
    [ctx.collapsedWidth, ctx.collapsedHeight, onLayout]
  );
  return (
    <Animated.View
      ref={ref}
      className={collapsedContentClassName}
      style={isAnimatedStyleActive ? [rContentStyle, style] : style}
      onLayout={handleLayout}
      pointerEvents={ctx.isOpen ? 'none' : 'auto'}
      accessibilityElementsHidden={ctx.isOpen}
      importantForAccessibility={ctx.isOpen ? 'no-hide-descendants' : 'auto'}
      {...restProps}
    >
      {children}
    </Animated.View>
  );
});
// --------------------------------------------------
const MorphButtonExpandedContent = forwardRef((props, ref) => {
  const {
    children,
    className,
    style,
    animation,
    isAnimatedStyleActive = true,
    onLayout,
    ...restProps
  } = props;
  const ctx = useMorphButton();
  const expandedContentClassName = morphButtonClassNames.expandedContent({
    className,
  });
  const { rContentStyle } = useMorphButtonExpandedContentAnimation({
    animation,
    isOpenValue: ctx.isOpenValue,
  });
  /** Feeds the expanded morph target, then forwards the consumer callback */
  const handleLayout = useCallback(
    (event) => {
      ctx.expandedWidth.set(event.nativeEvent.layout.width);
      ctx.expandedHeight.set(event.nativeEvent.layout.height);
      onLayout?.(event);
    },
    [ctx.expandedWidth, ctx.expandedHeight, onLayout]
  );
  return (
    <Animated.View
      ref={ref}
      className={expandedContentClassName}
      style={isAnimatedStyleActive ? [rContentStyle, style] : style}
      onLayout={handleLayout}
      accessibilityElementsHidden={!ctx.isOpen}
      importantForAccessibility={!ctx.isOpen ? 'no-hide-descendants' : 'auto'}
      {...restProps}
    >
      {children}
    </Animated.View>
  );
});
// --------------------------------------------------
MorphButtonRoot.displayName = DISPLAY_NAME.ROOT;
MorphButtonCollapsedContent.displayName = DISPLAY_NAME.COLLAPSED_CONTENT;
MorphButtonExpandedContent.displayName = DISPLAY_NAME.EXPANDED_CONTENT;
/**
 * Compound MorphButton component with sub-components
 *
 * @component MorphButton - Root container managing the open state. A
 * pressable, consumer-positioned anchor whose layout footprint always equals
 * the collapsed content; the morphing surface is absolutely anchored inside
 * it and springs between the measured collapsed and expanded content sizes,
 * growing toward `direction` while the opposite corner/edge stays pinned.
 * Both content parts stay mounted, so the expanded size is measured in
 * advance and opening never starts from an unknown size.
 *
 * @component MorphButton.CollapsedContent - In-flow content shown while
 * collapsed. Its natural size defines the root footprint and the collapsed
 * morph target. Fades/scales out while open.
 *
 * @component MorphButton.ExpandedContent - Always-mounted panel content
 * measured at its natural size while hidden (window-sized wrapping
 * constraint, so it never reflows mid-morph). Fades/scales in while open.
 * Set an explicit width via `className` (e.g. `w-72`) for panel layouts.
 *
 * Props flow from MorphButton to sub-components via context
 * (isOpen, isOpenValue, direction, variant, measured sizes, animated
 * surface size, open/close/toggle).
 *
 * @note RTL: fully logical. The surface and the expanded host anchor via
 * `start` offsets and logical flex alignment (`align-items` cross-axis start
 * = inline start), and the `start` / `end` direction values are logical by
 * definition, so all eight growth directions mirror in RTL without any JS
 * direction checks.
 */
const MorphButton = Object.assign(MorphButtonRoot, {
  /** @optional In-flow collapsed content defining the root footprint */
  CollapsedContent: MorphButtonCollapsedContent,
  /** @optional Always-mounted expanded panel content, pre-measured while hidden */
  ExpandedContent: MorphButtonExpandedContent,
});
export default MorphButton;
export { useMorphButton };
