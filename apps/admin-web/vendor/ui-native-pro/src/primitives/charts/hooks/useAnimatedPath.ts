// @ts-nocheck
import * as React from 'react';
import {
  useDerivedValue,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Skia } from '../skia';
function isWithDecayConfig(config) {
  return config.type === 'decay';
}
function isWithTimingConfig(config) {
  return config.type === 'timing';
}
function isWithSpringConfig(config) {
  return config.type === 'spring';
}
export const useAnimatedPath = (
  currentPathProp,
  animConfig = {
    type: 'timing',
    duration: 300,
  }
) => {
  const progressSV = useSharedValue(0);
  // fromPathSV stores the SkPath object we are animating FROM. Initialized with a copy.
  const fromPathSV = useSharedValue(currentPathProp.copy());
  // targetPathSV stores the SkPath object we are animating TO. Initialized with a copy.
  const targetPathSV = useSharedValue(currentPathProp.copy());
  // This effect synchronizes prop changes to our shared values and triggers animations.
  React.useEffect(() => {
    // The current target was the target of the *previous* animation (or initial state).
    // This becomes the starting point for our new animation.
    // Ensure we use .copy() to avoid shared mutable object issues.
    fromPathSV.set(targetPathSV.get().copy());
    // The new `currentPathProp` is our new animation target.
    targetPathSV.set(currentPathProp.copy());
    // Reset progress and start animation
    progressSV.set(0);
    if (isWithTimingConfig(animConfig)) {
      progressSV.set(withTiming(1, animConfig));
    } else if (isWithSpringConfig(animConfig)) {
      progressSV.set(withSpring(1, animConfig));
    } else if (isWithDecayConfig(animConfig)) {
      progressSV.set(withDecay(animConfig));
    }
  }, [currentPathProp, animConfig]);
  const animatedPath = useDerivedValue(() => {
    const t = progressSV.get();
    const from = fromPathSV.get();
    const to = targetPathSV.get();
    if (t === 0) {
      return from;
    }
    if (t === 1) {
      return to;
    }
    // 1. Try direct Skia interpolation first (most performant and reliable)
    if (to && from && to.isInterpolatable(from)) {
      const interpolated = to.interpolate(from, t);
      if (interpolated) {
        return interpolated;
      }
    }
    // 2. Fallback: SVG string manipulation with precision normalization
    // This was identified as potentially problematic for pie charts if direct interpolation failed.
    const normalizePrecision = (svgPathStr) =>
      svgPathStr.replace(/(\d+\.\d+)/g, (match) => parseFloat(match).toFixed(3));
    const toSVG = to?.toSVGString();
    const fromSVG = from?.toSVGString();
    if (toSVG && fromSVG) {
      const toNormalized = Skia.Path.MakeFromSVGString(normalizePrecision(toSVG));
      const fromNormalized = Skia.Path.MakeFromSVGString(normalizePrecision(fromSVG));
      if (toNormalized && fromNormalized && toNormalized.isInterpolatable(fromNormalized)) {
        const interpolatedNormalized = toNormalized.interpolate(fromNormalized, t);
        if (interpolatedNormalized) {
          return interpolatedNormalized;
        }
      }
    }
    // 3. Final fallback: if all interpolation fails, snap to the closest path
    return t > 0.5 ? to : from;
  }, []);
  return animatedPath;
};
