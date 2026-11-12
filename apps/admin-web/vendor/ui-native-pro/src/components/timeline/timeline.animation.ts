import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
// --------------------------------------------------
/**
 * Animation hook for the {@link Timeline} root component.
 *
 * Timeline is a static, presentation-focused component and does not animate its
 * own styles. This hook still owns the `disable-all` cascade so consumers can
 * pass `animation="disable-all"` on the root and have it propagate to any
 * animated descendants rendered inside the timeline via `AnimationSettingsProvider`.
 */
export function useTimelineRootAnimation(options) {
  const { animation } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  return {
    isAllAnimationsDisabled,
  };
}
