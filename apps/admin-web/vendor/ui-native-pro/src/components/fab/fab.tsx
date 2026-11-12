import { Children, forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider, useAnimationSettings } from 'heroui-native/contexts';
import {
  FullWindowOverlay,
  HeroText,
  PopupOverlayBlurView,
} from '../../helpers/internal/components/index';
import { useControllableState, usePopupOverlayVariant } from '../../helpers/internal/hooks/index';
import { childrenToString, isStringifiableChildren } from '../../helpers/internal/utils/index';
import * as FABPrimitives from '../../primitives/fab/index';
import {
  useFABItemAnimation,
  useFABOverlayAnimation,
  useFABRootAnimation,
  useFABTriggerAnimation,
} from './fab.animation';
import { DEFAULT_CONTENT_OFFSET, DEFAULT_INSETS, DISPLAY_NAME } from './fab.constants';
import {
  FABAnimationProvider,
  FABItemIndexProvider,
  FABProvider,
  useFABAnimation,
  useFABContext,
  useFABItemIndex,
} from './fab.context';
import { fabClassNames, fabStyleSheet } from './fab.styles';
const useFAB = FABPrimitives.useRootContext;
// --------------------------------------------------
const FABRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    itemsAppearance = 'staggered',
    isOpen: isOpenProp,
    isDefaultOpen,
    className,
    onOpenChange: onOpenChangeProp,
    animation,
    ...restProps
  } = props;
  const [isOpen = false, onOpenChange] = useControllableState({
    prop: isOpenProp,
    defaultProp: isDefaultOpen,
    onChange: onOpenChangeProp,
  });
  const rootClassName = fabClassNames.root({
    className,
  });
  const { progress, isVisible, staggerItemWindow, isAllAnimationsDisabled } = useFABRootAnimation({
    animation,
    isOpen,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const animationContextValue = useMemo(
    () => ({
      progress,
    }),
    [progress]
  );
  const contextValue = useMemo(
    () => ({
      itemsAppearance,
      staggerItemWindow,
      isVisible,
    }),
    [itemsAppearance, staggerItemWindow, isVisible]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <FABAnimationProvider value={animationContextValue}>
        <FABProvider value={contextValue}>
          <FABPrimitives.Root
            ref={ref}
            className={rootClassName}
            isOpen={isOpen}
            isDefaultOpen={isDefaultOpen}
            onOpenChange={onOpenChange}
            {...restProps}
          >
            {children}
          </FABPrimitives.Root>
        </FABProvider>
      </FABAnimationProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const FABTrigger = forwardRef((props: any, ref: any) => {
  const {
    children,
    isDisabled = false,
    className,
    classNames,
    styles,
    style,
    animation,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const { isDisabled: isDisabledRoot } = useFAB();
  const { progress } = useFABAnimation();
  const isDisabledValue = isDisabled || (isDisabledRoot ?? false);
  const { container, contentContainer } = fabClassNames.trigger({
    isDisabled: isDisabledValue,
  });
  const containerClassName = container({
    className: [className, classNames?.container],
  });
  const contentContainerClassName = contentContainer({
    className: classNames?.contentContainer,
  });
  const { rContentContainerStyle } = useFABTriggerAnimation({
    animation,
    progress,
  });
  const containerStyle =
    typeof style === 'function'
      ? (state) => [styles?.container, style(state)]
      : [styles?.container, style].filter(Boolean);
  const contentContainerStyle = isAnimatedStyleActive
    ? [rContentContainerStyle, styles?.contentContainer]
    : styles?.contentContainer;
  return (
    <FABPrimitives.Trigger
      ref={ref}
      isDisabled={isDisabled}
      className={containerClassName}
      style={containerStyle}
      {...restProps}
    >
      <Animated.View
        className={contentContainerClassName}
        style={contentContainerStyle}
        pointerEvents="none"
      >
        {children}
      </Animated.View>
    </FABPrimitives.Trigger>
  );
});
// --------------------------------------------------
/**
 * `FAB.Portal` renders into a host via the portal system, which breaks React
 * context from the root. This wrapper re-provides the animation settings,
 * animation, and FAB contexts so portaled descendants (overlay, content,
 * items, and custom backdrops) can still consume them.
 *
 * The portal stays mounted while `isVisible` is `true`, which keeps the
 * content around until the close animation completes.
 */
const FABPortal = (props) => {
  const {
    children,
    className,
    forceMount,
    disableFullWindowOverlay = false,
    unstable_accessibilityContainerViewIsModal,
    ...restProps
  } = props;
  const animationSettingsContext = useAnimationSettings();
  const animationContext = useFABAnimation();
  const fabContext = useFABContext();
  const portalClassName = fabClassNames.portal({
    className,
  });
  if (!forceMount && !fabContext.isVisible) {
    return null;
  }
  return (
    <FABPrimitives.Portal forceMount {...restProps}>
      <AnimationSettingsProvider value={animationSettingsContext}>
        <FABAnimationProvider value={animationContext}>
          <FABProvider value={fabContext}>
            <FullWindowOverlay
              disableFullWindowOverlay={disableFullWindowOverlay}
              unstable_accessibilityContainerViewIsModal={
                unstable_accessibilityContainerViewIsModal
              }
            >
              <View className={portalClassName} pointerEvents="box-none">
                {children}
              </View>
            </FullWindowOverlay>
          </FABProvider>
        </FABAnimationProvider>
      </AnimationSettingsProvider>
    </FABPrimitives.Portal>
  );
};
// --------------------------------------------------
const FABOverlay = forwardRef((props: any, ref: any) => {
  const {
    className,
    style,
    animation,
    isAnimatedStyleActive,
    variant,
    blurViewProps,
    ...restProps
  } = props;
  const { isOpen } = useFAB();
  const { progress } = useFABAnimation();
  const { resolvedVariant, isBlurVariant } = usePopupOverlayVariant(variant);
  const overlayClassName = fabClassNames.overlay({
    variant: resolvedVariant,
    className,
  });
  const { rOverlayStyle } = useFABOverlayAnimation({
    animation,
    progress,
  });
  // The blur variant animates blur intensity instead of the overlay opacity
  const isAnimatedStyleResolved = isAnimatedStyleActive ?? !isBlurVariant;
  // The animated opacity lives on the wrapper so the primitive keeps a
  // plain (non-animated) ref type.
  const containerStyle = isAnimatedStyleResolved
    ? [StyleSheet.absoluteFill, rOverlayStyle]
    : StyleSheet.absoluteFill;
  return (
    <Animated.View style={containerStyle} pointerEvents="box-none">
      {isBlurVariant ? (
        <PopupOverlayBlurView progress={progress} blurViewProps={blurViewProps} />
      ) : null}
      <FABPrimitives.Overlay
        ref={ref}
        className={overlayClassName}
        style={style}
        forceMount
        pointerEvents={isOpen ? 'auto' : 'none'}
        {...restProps}
      />
    </Animated.View>
  );
});
// --------------------------------------------------
const FABContent = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    offset = DEFAULT_CONTENT_OFFSET,
    insets = DEFAULT_INSETS,
    ...restProps
  } = props;
  const { isOpen, placement, align } = useFAB();
  // Cross-axis alignment of the item column. For vertical placements the
  // resolved align applies directly; for horizontal placements the items
  // hug the trigger side instead (the resolved align positions the whole
  // column vertically via the positioning engine).
  const itemsAlign = placement === 'left' ? 'end' : placement === 'right' ? 'start' : align;
  const contentClassName = fabClassNames.content({
    align: itemsAlign,
    className,
  });
  const items = Children.toArray(children);
  const total = items.length;
  return (
    <FABPrimitives.Content
      ref={ref}
      forceMount
      className={contentClassName}
      offset={offset}
      insets={insets}
      pointerEvents={isOpen ? 'box-none' : 'none'}
      {...restProps}
    >
      {items.map((child, index) => (
        <FABItemIndexProvider
          key={index}
          value={{
            index,
            total,
          }}
        >
          {child}
        </FABItemIndexProvider>
      ))}
    </FABPrimitives.Content>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the item
 * content. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const FABItemBackground = forwardRef(({ className, ...props }: any, ref: any) => {
  const itemBackgroundClassName = fabClassNames.itemBackground({
    className,
  });
  return <ThemeBackground ref={ref} className={itemBackgroundClassName} {...props} />;
});
// --------------------------------------------------
const FABItem = forwardRef((props: any, ref: any) => {
  const {
    children,
    disabled,
    className,
    style,
    background,
    animation,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const { placement } = useFAB();
  const { itemsAppearance, staggerItemWindow } = useFABContext();
  const { progress } = useFABAnimation();
  const { index, total } = useFABItemIndex();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const itemClassName = fabClassNames.item({
    isDisabled: !!disabled,
    className,
  });
  const { rItemStyle } = useFABItemAnimation({
    animation,
    index,
    total,
    itemsAppearance,
    staggerItemWindow,
    placement,
    progress,
  });
  const resolvedChildren = isStringifiableChildren(children) ? (
    <FABItemLabel>{childrenToString(children)}</FABItemLabel>
  ) : (
    children
  );
  /**
   * Background layer rendered behind the item content.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <FABItemBackground />
    ) : null;
  const itemStyle =
    typeof style === 'function'
      ? (state) => [fabStyleSheet.item, style(state)]
      : [fabStyleSheet.item, style];
  // The animated appearing motion lives on a wrapper so the primitive
  // keeps a plain (non-animated) ref type.
  return (
    <Animated.View style={isAnimatedStyleActive ? rItemStyle : undefined}>
      <FABPrimitives.Item
        ref={ref}
        className={itemClassName}
        style={itemStyle}
        disabled={disabled}
        {...restProps}
      >
        {backgroundElement}
        {resolvedChildren}
      </FABPrimitives.Item>
    </Animated.View>
  );
});
// --------------------------------------------------
const FABItemLabel = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const itemLabelClassName = fabClassNames.itemLabel({
    className,
  });
  return (
    <HeroText ref={ref} className={itemLabelClassName} {...restProps}>
      {children}
    </HeroText>
  );
});
// --------------------------------------------------
FABRoot.displayName = DISPLAY_NAME.ROOT;
FABTrigger.displayName = DISPLAY_NAME.TRIGGER;
FABPortal.displayName = DISPLAY_NAME.PORTAL;
FABOverlay.displayName = DISPLAY_NAME.OVERLAY;
FABContent.displayName = DISPLAY_NAME.CONTENT;
FABItem.displayName = DISPLAY_NAME.ITEM;
FABItemBackground.displayName = DISPLAY_NAME.ITEM_BACKGROUND;
FABItemLabel.displayName = DISPLAY_NAME.ITEM_LABEL;
/**
 * Compound FAB (floating action button) component with sub-components.
 *
 * @component FAB - Root container that owns the open state (controlled via
 * `isOpen` + `onOpenChange` or uncontrolled via `isDefaultOpen`), resolves
 * the content placement/alignment — automatically from the trigger position
 * on screen by default (`placement="auto"`, `align="auto"`) — and drives the
 * shared open/close progress (0 = idle, 1 = open, 2 = close) that
 * orchestrates the overlay, items, and trigger rotation.
 *
 * @component FAB.Trigger - The floating button itself. Toggles the open
 * state on press, measures its own position for auto placement, and rotates
 * its content with the shared progress.
 *
 * @component FAB.Portal - Renders the overlay and content in a portal layer
 * above other content. Stays mounted while the close animation plays and
 * re-provides the FAB contexts to portaled descendants.
 *
 * @component FAB.Overlay - Optional backdrop behind the content. Fades with
 * the shared progress and closes the FAB when pressed. The `default` variant
 * paints a solid backdrop; the `blur` variant renders an animated blur layer
 * (iOS only, requires expo-blur) and is the default under the `glass` theme.
 * Replace it with a custom component (e.g. a backdrop built on
 * `useFABAnimation`) for fully custom backdrops.
 *
 * @component FAB.Content - Positioned column of items. Placement/alignment
 * follow the root resolution; provides each child its index so items can
 * stagger.
 *
 * @component FAB.Item - Single action row. Appears with the shared progress
 * (staggered by default, nearest to the trigger first) and closes the FAB on
 * press. String children are wrapped in `FAB.ItemLabel` automatically.
 *
 * @component FAB.ItemBackground - Absolute-fill background container behind
 * the item content. With no children, the active library theme decides the
 * content (glass theme renders a blur layer). Accepts children to host custom
 * content such as gradients with the container's positioning and clipping
 * applied. Replaceable via the `background` prop on FAB.Item.
 *
 * @component FAB.ItemLabel - Optional text label inside an item.
 *
 * Props flow from FAB to sub-components via context (resolved placement and
 * alignment, items appearance, and the shared open/close progress).
 *
 */
const FAB = Object.assign(FABRoot, {
  /** The floating button. Toggles the open state and measures itself for auto placement. */
  Trigger: FABTrigger,
  /** Portals the overlay and content above other content; keeps them mounted during the close animation. */
  Portal: FABPortal,
  /** @optional Backdrop behind the content, faded by the shared progress. */
  Overlay: FABOverlay,
  /** Positioned column of items with automatic placement and stagger indices. */
  Content: FABContent,
  /** @optional Single action row; staggered by default and closes the FAB on press. */
  Item: FABItem,
  /** @optional Theme-aware background container behind the item content. */
  ItemBackground: FABItemBackground,
  /** @optional Text label inside an item; applied automatically for string children. */
  ItemLabel: FABItemLabel,
});
export default FAB;
export { useFAB, useFABAnimation };
