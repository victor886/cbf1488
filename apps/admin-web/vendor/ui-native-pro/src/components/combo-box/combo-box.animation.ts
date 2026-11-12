// @ts-nocheck
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
/**
 * Root animation: respects `animation="disable-all"` like `Autocomplete` /
 * `DateField`. The returned flag is cascaded to descendants via
 * `AnimationSettingsProvider` in the `ComboBox` root.
 */
export function useComboBoxRootAnimation(options) {
  const { animation } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  return {
    isAllAnimationsDisabled,
  };
}
