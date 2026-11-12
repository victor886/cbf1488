// @ts-nocheck
import { useEffect, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { scale } from '../../skia';
import { identity4 } from '../../utils/transform';
export const useChartTransformState = (config) => {
  const panActive = useSharedValue(false);
  const zoomActive = useSharedValue(false);
  const origin = useSharedValue({
    x: 0,
    y: 0,
  });
  const matrix = useSharedValue(identity4);
  const offset = useSharedValue(identity4);
  // This is done in a useEffect to prevent Reanimated warning
  // about setting shared value in the render phase
  useEffect(() => {
    matrix.set(scale(config?.scaleX ?? 1, config?.scaleY ?? 1));
  }, []);
  return useMemo(
    () => ({
      state: {
        panActive,
        zoomActive,
        origin,
        matrix,
        offset,
      },
    }),
    [panActive, zoomActive, origin, matrix, offset]
  );
};
