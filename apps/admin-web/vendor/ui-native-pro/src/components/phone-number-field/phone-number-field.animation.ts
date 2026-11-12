// @ts-nocheck
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
/**
 * Root animation: respects `animation="disable-all"` like `DateField` / `TextField`.
 */
export function usePhoneNumberFieldRootAnimation(options) {
  const { animation } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  return {
    isAllAnimationsDisabled,
  };
}
