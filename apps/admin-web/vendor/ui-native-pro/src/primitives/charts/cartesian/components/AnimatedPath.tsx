// @ts-nocheck
import * as React from 'react';
import isEqual from 'react-fast-compare';
import { isSharedValue, makeMutable } from 'react-native-reanimated';
import { useAnimatedPath } from '../../hooks/useAnimatedPath';
import { Path } from '../../skia';
import { usePrevious } from '../../utils/usePrevious';
/**
 * IMPORTANT!
 * For some reason, Skia doesn't like mixing shared and non-shared values?
 * Things seem to crash if you mix a derived value for the path with e.g. strings for color.
 * We do a little bit of gymnastics to make sure that all props are shared values.
 */
export function AnimatedPath({ path, animate, children, ...rest }) {
  const p = useAnimatedPath(path, animate);
  const animProps = React.useMemo(() => {
    const vals = {};
    syncPropsToSharedValues(rest, vals);
    return vals;
  }, []);
  const prevRest = usePrevious(rest);
  // Sync props to shared values when values change
  React.useEffect(() => {
    if (!isEqual(rest, prevRest)) {
      syncPropsToSharedValues(rest, animProps);
    }
  }, [rest, prevRest, animProps]);
  return (
    <Path path={p} {...animProps}>
      {children}
    </Path>
  );
}
/**
 * Sync prop values to a map of prop -> shared values
 */
const syncPropsToSharedValues = (props, sharedValues) => {
  const keysToRemove = new Set(Object.keys(sharedValues));
  for (const key in props) {
    keysToRemove.delete(key);
    const propVal = props[key];
    const shareVal = sharedValues[key];
    // Shared value missing, create it
    if (!shareVal) {
      sharedValues[key] = isSharedValue(propVal) ? propVal : makeMutable(propVal);
    }
    // Shared value exists, update it if not already a shared value
    else if (!isSharedValue(propVal)) {
      shareVal.set(propVal);
    }
  }
  // Remove keys that didn't get passed in props
  keysToRemove.forEach((key) => {
    delete sharedValues[key];
  });
};
