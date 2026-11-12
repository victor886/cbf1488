import { Platform } from 'react-native';
import { useIsGlassTheme } from 'heroui-native';
import ExpoBlur from '../../../optional/expo-blur';
/**
 * The blur backdrop requires expo-blur and is only rendered on iOS.
 * On other platforms (or when expo-blur is not installed) the overlay
 * falls back to the `default` solid backdrop.
 */
const IS_BLUR_SUPPORTED = Platform.OS === 'ios' && Boolean(ExpoBlur);
/**
 * Resolves the effective overlay variant for components whose overlay paints
 * a solid backdrop (e.g. FAB).
 *
 * When `variant` is omitted, the `glass` library theme defaults to `blur`;
 * every other theme defaults to `default`. A requested `blur` variant is
 * downgraded to `default` when blur is unsupported (non-iOS or expo-blur
 * missing).
 *
 * @param variant - Requested overlay variant, or `undefined` to derive it
 * from the active library theme.
 * @returns The resolved variant and a convenience `isBlurVariant` flag.
 */
export function usePopupOverlayVariant(variant) {
  const isGlassTheme = useIsGlassTheme();
  const requestedVariant = variant ?? (isGlassTheme ? 'blur' : 'default');
  const resolvedVariant = requestedVariant === 'blur' && IS_BLUR_SUPPORTED ? 'blur' : 'default';
  return {
    resolvedVariant,
    isBlurVariant: resolvedVariant === 'blur',
  };
}
