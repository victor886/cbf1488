// @ts-nocheck
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
import {
  getAnimationState,
  getAnimationValueProperty,
  getIsAnimationDisabledValue,
  getPageActivity,
} from '../../helpers/internal/utils/index';
import {
  DEFAULT_ICON_OPACITY,
  DEFAULT_LABEL_OPACITY,
  DEFAULT_TRIGGER_FLEX_GROW,
} from './morph-tabs.constants';
// --------------------------------------------------
/**
 * Animation hook for the MorphTabs root component.
 * Cascades `disable-all` to the morphing parts and the pager. The continuous
 * pager position they interpolate against lives in the shared tabs pager
 * state.
 */
export function useMorphTabsRootAnimation(options) {
  const { animation } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  return {
    isAllAnimationsDisabled,
  };
}
// --------------------------------------------------
/**
 * Animation hook for `MorphTabs.Trigger`.
 * Interpolates `flexGrow` against the pager position: the active pill fills
 * the leftover row space and neighbouring pills split it mid-swipe. When
 * animations are disabled the pill snaps to the selected state.
 */
export function useMorphTabsTriggerAnimation(options) {
  const { animation, index, isSelected, progress } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const flexGrowValue = getAnimationValueProperty({
    animationValue: animationConfig?.flexGrow,
    property: 'value',
    defaultValue: DEFAULT_TRIGGER_FLEX_GROW,
  });
  const rContainerStyle = useAnimatedStyle(() => {
    const [inactive, active] = flexGrowValue;
    if (isAnimationDisabledValue) {
      return {
        flexGrow: isSelected ? active : inactive,
      };
    }
    const activity = getPageActivity(progress.get(), index);
    return {
      flexGrow: inactive + (active - inactive) * activity,
    };
  }, [flexGrowValue, index, isAnimationDisabledValue, isSelected, progress]);
  return {
    rContainerStyle,
  };
}
// --------------------------------------------------
/**
 * Shared opacity morph for the trigger's icon and label. Value tuples read
 * `[inactive, active]`; the part-specific hooks below only differ in their
 * defaults.
 */
function useMorphTabsOpacityAnimation(options) {
  const { animation, index, isSelected, progress, defaultOpacity } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const opacityValue = getAnimationValueProperty({
    animationValue: animationConfig?.opacity,
    property: 'value',
    defaultValue: defaultOpacity,
  });
  const rContainerStyle = useAnimatedStyle(() => {
    const [inactive, active] = opacityValue;
    if (isAnimationDisabledValue) {
      return {
        opacity: isSelected ? active : inactive,
      };
    }
    const activity = getPageActivity(progress.get(), index);
    return {
      opacity: inactive + (active - inactive) * activity,
    };
  }, [index, isAnimationDisabledValue, isSelected, opacityValue, progress]);
  return {
    rContainerStyle,
  };
}
// --------------------------------------------------
/**
 * Animation hook for `MorphTabs.Icon`.
 * Brightens the icon as its page becomes active.
 */
export function useMorphTabsIconAnimation(options) {
  return useMorphTabsOpacityAnimation({
    ...options,
    defaultOpacity: DEFAULT_ICON_OPACITY,
  });
}
// --------------------------------------------------
/**
 * Animation hook for `MorphTabs.Label`.
 * Reveals the label as its pill expands: the clipping container's `maxWidth`
 * grows from `0` to the label's measured natural width, so a collapsed pill
 * holds only the (centered) icon, and the text fades in alongside.
 */
export function useMorphTabsLabelAnimation(options) {
  const { animation, index, isSelected, progress } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const opacityValue = getAnimationValueProperty({
    animationValue: animationConfig?.opacity,
    property: 'value',
    defaultValue: DEFAULT_LABEL_OPACITY,
  });
  /** Natural single-line width of the label, measured off-layout. */
  const labelWidth = useSharedValue(0);
  const rContainerStyle = useAnimatedStyle(() => {
    const [inactive, active] = opacityValue;
    const width = labelWidth.get();
    if (isAnimationDisabledValue) {
      return {
        opacity: isSelected ? active : inactive,
        maxWidth: isSelected ? width : 0,
      };
    }
    const activity = getPageActivity(progress.get(), index);
    return {
      opacity: inactive + (active - inactive) * activity,
      maxWidth: width * activity,
    };
  }, [index, isAnimationDisabledValue, isSelected, labelWidth, opacityValue, progress]);
  return {
    rContainerStyle,
    labelWidth,
  };
}
