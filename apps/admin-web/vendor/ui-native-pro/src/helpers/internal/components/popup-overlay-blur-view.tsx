import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { interpolate, useAnimatedProps, useDerivedValue } from 'react-native-reanimated';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useUniwind } from 'uniwind';
import ExpoBlur from '../../../optional/expo-blur';
import type { PopupOverlayBlurViewProps } from '../types';
const AnimatedExpoBlurView = ExpoBlur
  ? Animated.createAnimatedComponent(ExpoBlur.BlurView)
  : undefined;
/** Default maximum blur intensity in light color scheme */
const MAX_INTENSITY_LIGHT = 50;
/** Default maximum blur intensity in dark color scheme */
const MAX_INTENSITY_DARK = 75;
/** Default blur tint in light color scheme (darkens the content behind) */
const TINT_LIGHT = 'systemUltraThinMaterialDark';
/** Default blur tint in dark color scheme */
const TINT_DARK = 'dark';
/** Progress value while the popup is closed / idle */
const PROGRESS_IDLE = 0;
/** Progress value once the open animation completes */
const PROGRESS_OPEN = 1;
/** Progress value the close animation runs towards */
const PROGRESS_CLOSE = 2;
/**
 * Blur backdrop layer rendered behind a popup overlay when the overlay
 * `variant` resolves to `blur`.
 *
 * Blur intensity mirrors the overlay's progress-driven opacity animation:
 * it interpolates [0, 1, 2] -> [0, max, 0]. Renders nothing when expo-blur is
 * not installed.
 *
 * @note The layer is never hit-testable: the overlay pressable is rendered
 * above it and owns press handling, including its own `pointerEvents` gating.
 * A hit-testable full-screen blur layer would block the UI behind it.
 */
export const PopupOverlayBlurView = ({ progress, blurViewProps }) => {
  const { theme } = useUniwind();
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const isDark = theme.endsWith('dark');
  const { intensity, tint, style, ...restBlurViewProps } = blurViewProps ?? {};
  const maxIntensity = intensity ?? (isDark ? MAX_INTENSITY_DARK : MAX_INTENSITY_LIGHT);
  const blurIntensity = useDerivedValue(() => {
    if (isAllAnimationsDisabled) {
      return progress.get() > PROGRESS_IDLE ? maxIntensity : 0;
    }
    return interpolate(
      progress.get(),
      [PROGRESS_IDLE, PROGRESS_OPEN, PROGRESS_CLOSE],
      [0, maxIntensity, 0]
    );
  });
  const animatedProps = useAnimatedProps(() => {
    return {
      intensity: blurIntensity.get(),
    };
  });
  if (!AnimatedExpoBlurView) {
    return null;
  }
  return (
    <AnimatedExpoBlurView
      animatedProps={animatedProps}
      tint={tint ?? (isDark ? TINT_DARK : TINT_LIGHT)}
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
      {...restBlurViewProps}
    />
  );
};

export interface PopupOverlayBlurProps {
  /**
   * Popup animation progress shared value (0=idle, 1=open, 2=close).
   */
  progress: SharedValue<number>;
  /**
   * Props forwarded to the underlying BlurView. `intensity` is treated as the
   * maximum (animated) intensity; `tint` and `style` override the defaults.
   */
  blurViewProps?: PopupOverlayBlurViewProps;
}
