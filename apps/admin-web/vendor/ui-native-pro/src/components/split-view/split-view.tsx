import { forwardRef, useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import * as SplitViewPrimitives from '../../primitives/split-view/index';
import {
  useSplitViewDragHandleAnimation,
  useSplitViewRootAnimation,
  useSplitViewTopSectionAnimation,
} from './split-view.animation';
import { DEFAULT_SNAP_SPRING_CONFIG, DISPLAY_NAME } from './split-view.constants';
import { splitViewClassNames, splitViewStyleSheet } from './split-view.styles';
const AnimatedSplitViewTopSection = Animated.createAnimatedComponent(
  SplitViewPrimitives.TopSection
);
const AnimatedSplitViewDragHandle = Animated.createAnimatedComponent(
  SplitViewPrimitives.DragHandle
);
// --------------------------------------------------
const SplitViewRoot = forwardRef((props: any, ref: any) => {
  const { children, className, style, animation, ...restProps } = props;
  const { isAllAnimationsDisabled, snapSpringConfig } = useSplitViewRootAnimation({
    animation,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const rootClassName = splitViewClassNames.root({
    className,
  });
  const primitiveProps = {
    ...restProps,
    children,
    snapSpringConfig: snapSpringConfig ?? DEFAULT_SNAP_SPRING_CONFIG,
    isAllAnimationsDisabled,
    className: rootClassName,
    style: [splitViewStyleSheet.root, style],
  };
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <SplitViewPrimitives.Root ref={ref} {...primitiveProps} />
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const SplitViewTopSection = forwardRef((props: any, ref: any) => {
  const { children, className, style, ...restProps } = props;
  const ctx = SplitViewPrimitives.useSplitView();
  const { rTopStyle } = useSplitViewTopSectionAnimation({
    topSectionHeight: ctx.topSectionHeight,
  });
  const topSectionClassName = splitViewClassNames.topSection({
    className,
  });
  return (
    <AnimatedSplitViewTopSection
      ref={ref}
      className={topSectionClassName}
      style={[rTopStyle, style]}
      {...restProps}
    >
      {children}
    </AnimatedSplitViewTopSection>
  );
});
// --------------------------------------------------
const SplitViewBottomSection = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const bottomSectionClassName = splitViewClassNames.bottomSection({
    className,
  });
  return (
    <SplitViewPrimitives.BottomSection ref={ref} className={bottomSectionClassName} {...restProps}>
      {children}
    </SplitViewPrimitives.BottomSection>
  );
});
// --------------------------------------------------
const SplitViewDragArea = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const dragAreaClassName = splitViewClassNames.dragArea({
    className,
  });
  return (
    <SplitViewPrimitives.DragArea ref={ref} className={dragAreaClassName} {...restProps}>
      {children}
    </SplitViewPrimitives.DragArea>
  );
});
// --------------------------------------------------
const SplitViewDragHandle = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    style,
    animation,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const ctx = SplitViewPrimitives.useSplitView();
  const internal = SplitViewPrimitives.useSplitViewInternal();
  const { rHandleStyle } = useSplitViewDragHandleAnimation({
    animation,
    isDragging: ctx.isDragging,
    isAllAnimationsDisabled: internal.isAllAnimationsDisabled,
  });
  const dragHandleClassName = splitViewClassNames.dragHandle({
    className,
  });
  const handleStyle = isAnimatedStyleActive ? [rHandleStyle, style] : [style];
  return (
    <AnimatedSplitViewDragHandle
      ref={ref}
      className={dragHandleClassName}
      style={[splitViewStyleSheet.dragHandle, handleStyle]}
      {...restProps}
    >
      {children}
    </AnimatedSplitViewDragHandle>
  );
});
// --------------------------------------------------
SplitViewRoot.displayName = DISPLAY_NAME.ROOT;
SplitViewTopSection.displayName = DISPLAY_NAME.TOP_SECTION;
SplitViewDragArea.displayName = DISPLAY_NAME.DRAG_AREA;
SplitViewDragHandle.displayName = DISPLAY_NAME.DRAG_HANDLE;
SplitViewBottomSection.displayName = DISPLAY_NAME.BOTTOM_SECTION;
/**
 * Compound SplitView component with sub-components
 *
 * @component SplitView - Vertical split layout with a draggable divider between a top and bottom section.
 * Snap points may be ratios (`0`..`1`) or px. Uses `react-native-reanimated` and gesture handler.
 *
 * @component SplitView.TopSection - Top pane; height is animated from drag and snap state.
 *
 * @component SplitView.DragArea - Pan gesture region; use `SplitView.DragHandle` inside for the default pill.
 *
 * @component SplitView.DragHandle - Visual handle; scales slightly while dragging when animations are enabled.
 *
 * @component SplitView.BottomSection - Bottom pane; fills remaining space below the drag area.
 *
 * Props flow via context (`useSplitView`) for `topSectionHeight`, `snapIndex`, `resolvedSnapPoints`, and more.
 */
const SplitView = Object.assign(SplitViewRoot, {
  TopSection: SplitViewTopSection,
  DragArea: SplitViewDragArea,
  DragHandle: SplitViewDragHandle,
  BottomSection: SplitViewBottomSection,
});
export default SplitView;
export { useSplitView } from '../../primitives/split-view/index';
