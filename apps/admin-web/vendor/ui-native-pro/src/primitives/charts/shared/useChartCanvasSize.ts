// @ts-nocheck
import * as React from 'react';
import {
  applyChartLayoutChange,
  isChartHeadless,
  resolveChartCanvasSizeState,
  shouldWarnMissingHeadlessExplicitSize,
} from './chartCanvasSizeUtils';
/** Runtime layout args after prop destructuring (wider than {@link ChartLayoutModeProps}). */
export {
  applyChartLayoutChange,
  getInitialChartCanvasSizeState,
  isChartHeadless,
  resolveChartCanvasSizeState,
  shouldWarnMissingHeadlessExplicitSize,
} from './chartCanvasSizeUtils';
export function useChartCanvasSize({ explicitSize, headless }) {
  const [size, setSize] = React.useState({
    width: 0,
    height: 0,
  });
  const [hasMeasuredLayoutSize, setHasMeasuredLayoutSize] = React.useState(false);
  const isHeadless = isChartHeadless(headless, explicitSize);
  const resolvedChartCanvasSizeState = resolveChartCanvasSizeState(
    {
      size,
      hasMeasuredLayoutSize,
    },
    explicitSize
  );
  React.useEffect(() => {
    if (!shouldWarnMissingHeadlessExplicitSize(headless, explicitSize)) {
      return;
    }
    console.warn('`headless` requires `explicitSize`. Falling back to layout-measured rendering.');
  }, [headless, explicitSize]);
  const onLayout = React.useCallback(
    ({ nativeEvent: { layout } }) => {
      const result = applyChartLayoutChange(explicitSize, layout);
      if (!result) {
        return;
      }
      setHasMeasuredLayoutSize(result.hasMeasuredLayoutSize);
      setSize(result.size);
    },
    [explicitSize]
  );
  return {
    ...resolvedChartCanvasSizeState,
    onLayout,
    isHeadless,
  };
}
