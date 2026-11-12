// @ts-nocheck
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
export function useAutocompleteRootAnimation(options) {
  const { animation } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  return {
    isAllAnimationsDisabled,
  };
}
