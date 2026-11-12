import { forwardRef, useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { createContext } from '../../helpers/internal/utils/index';
import {
  FlipCardAnimationProvider,
  useFlipCardAnimation,
  useFlipCardFaceAnimation,
  useFlipCardRootAnimation,
} from './flip-card.animation';
import { DISPLAY_NAME } from './flip-card.constants';
import { flipCardClassNames, flipCardStyleSheet } from './flip-card.styles';
import type { FlipCardContextValue } from './flip-card.types';
const [FlipCardProvider, useFlipCard] = createContext<FlipCardContextValue>({
  name: 'FlipCardContext',
});
// --------------------------------------------------
const FlipCardRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    direction = 'horizontal',
    rotation = 'normal',
    isFlipped: isFlippedProp,
    defaultFlipped = false,
    isPressDisabled = false,
    className,
    onFlipChange,
    onPress,
    animation,
    ...restProps
  } = props;
  const [isFlipped = false, setIsFlipped] = useControllableState({
    prop: isFlippedProp,
    defaultProp: defaultFlipped,
    onChange: onFlipChange,
  });
  const rootClassName = flipCardClassNames.root({
    className,
  });
  const { progress, isAllAnimationsDisabled } = useFlipCardRootAnimation({
    animation,
    isFlipped,
  });
  const toggle = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, [setIsFlipped]);
  const handlePress = useCallback(
    (event) => {
      onPress?.(event);
      if (!isPressDisabled) {
        toggle();
      }
    },
    [onPress, isPressDisabled, toggle]
  );
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
      isFlipped,
      direction,
      rotation,
      toggle,
    }),
    [isFlipped, direction, rotation, toggle]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <FlipCardAnimationProvider value={animationContextValue}>
        <FlipCardProvider value={contextValue}>
          <Pressable
            ref={ref}
            className={rootClassName}
            accessibilityRole="button"
            accessibilityState={{
              selected: isFlipped,
            }}
            onPress={handlePress}
            {...restProps}
          >
            {children}
          </Pressable>
        </FlipCardProvider>
      </FlipCardAnimationProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind a card face's
 * surface. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const FlipCardFaceBackground = forwardRef(({ className, ...props }: any, ref: any) => {
  const faceBackgroundClassName = flipCardClassNames.faceBackground({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={faceBackgroundClassName}
      fallbackColor="surface"
      {...props}
    />
  );
});
// --------------------------------------------------
const FlipCardFront = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    style,
    animation,
    isAnimatedStyleActive = true,
    background,
    ...restProps
  } = props;
  const { isFlipped, direction, rotation } = useFlipCard();
  const { progress } = useFlipCardAnimation();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const frontClassName = flipCardClassNames.front({
    className,
  });
  /**
   * Background layer rendered behind the front face surface. `undefined`
   * falls back to the theme-aware default; `null` removes the layer.
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <FlipCardFaceBackground />
    ) : null;
  const { rFaceStyle } = useFlipCardFaceAnimation({
    animation,
    side: 'front',
    direction,
    rotation,
    progress,
  });
  const frontStyle = isAnimatedStyleActive
    ? [flipCardStyleSheet.face, rFaceStyle, style]
    : [flipCardStyleSheet.face, style];
  return (
    <Animated.View
      ref={ref}
      className={frontClassName}
      style={frontStyle}
      accessibilityElementsHidden={isFlipped}
      importantForAccessibility={isFlipped ? 'no-hide-descendants' : 'auto'}
      pointerEvents={isFlipped ? 'none' : 'auto'}
      {...restProps}
    >
      {backgroundElement}
      {children}
    </Animated.View>
  );
});
// --------------------------------------------------
const FlipCardBack = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    style,
    animation,
    isAnimatedStyleActive = true,
    background,
    ...restProps
  } = props;
  const { isFlipped, direction, rotation } = useFlipCard();
  const { progress } = useFlipCardAnimation();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const backClassName = flipCardClassNames.back({
    className,
  });
  /**
   * Background layer rendered behind the back face surface. `undefined`
   * falls back to the theme-aware default; `null` removes the layer.
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <FlipCardFaceBackground />
    ) : null;
  const { rFaceStyle } = useFlipCardFaceAnimation({
    animation,
    side: 'back',
    direction,
    rotation,
    progress,
  });
  const backStyle = isAnimatedStyleActive
    ? [flipCardStyleSheet.face, rFaceStyle, style]
    : [flipCardStyleSheet.face, style];
  return (
    <Animated.View
      ref={ref}
      className={backClassName}
      style={backStyle}
      accessibilityElementsHidden={!isFlipped}
      importantForAccessibility={isFlipped ? 'auto' : 'no-hide-descendants'}
      pointerEvents={isFlipped ? 'auto' : 'none'}
      {...restProps}
    >
      {backgroundElement}
      {children}
    </Animated.View>
  );
});
// --------------------------------------------------
FlipCardRoot.displayName = DISPLAY_NAME.ROOT;
FlipCardFront.displayName = DISPLAY_NAME.FRONT;
FlipCardBack.displayName = DISPLAY_NAME.BACK;
FlipCardFaceBackground.displayName = DISPLAY_NAME.FACE_BACKGROUND;
/**
 * Compound FlipCard component with sub-components.
 *
 * @component FlipCard - Pressable root container that flips between a
 * front and a back face with a spring-driven 3D rotation. Supports
 * controlled (`isFlipped` + `onFlipChange`) and uncontrolled
 * (`defaultFlipped`) usage; tapping toggles the flip unless
 * `isPressDisabled` is set. Flip axis follows `direction`
 * (`"horizontal"` = rotateY, `"vertical"` = rotateX) and the spin
 * direction follows `rotation` (`"normal"` or `"reverse"`).
 *
 * @component FlipCard.Front - Face visible at rest. Rotates from 0deg to
 * 180deg as the card flips; hides mid-flip via `backfaceVisibility`.
 * Stops receiving touches while the card is flipped.
 *
 * @component FlipCard.Back - Face revealed when flipped. Positioned
 * absolutely over the front and rotates from 180deg to 360deg. Only
 * receives touches while the card is flipped, so hidden interactive
 * content cannot intercept presses meant for the front face.
 *
 * @component FlipCard.FaceBackground - Absolute-fill background container
 * behind a face's surface. With no children, the active library theme
 * decides the content (glass theme renders a blur layer with a
 * surface-matched fallback). Accepts children to host custom content such
 * as gradients with the container's positioning and clipping applied.
 * Replaceable via the `background` prop on each face.
 *
 * Props flow from FlipCard to sub-components via context
 * (isFlipped, direction, toggle, and the shared flip progress).
 *
 */
const FlipCard = Object.assign(FlipCardRoot, {
  /** @optional Face visible at rest (progress 0). */
  Front: FlipCardFront,
  /** @optional Face revealed when the card is flipped (progress 1). */
  Back: FlipCardBack,
  /** @optional Theme-aware background container behind a face surface. */
  FaceBackground: FlipCardFaceBackground,
});
export default FlipCard;
export { useFlipCard, useFlipCardAnimation };
