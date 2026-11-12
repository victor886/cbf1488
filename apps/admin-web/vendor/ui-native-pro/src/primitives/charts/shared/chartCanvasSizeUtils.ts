// @ts-nocheck
export function getInitialChartCanvasSizeState(explicitSize) {
  return {
    size: explicitSize ?? {
      width: 0,
      height: 0,
    },
    hasMeasuredLayoutSize: Boolean(explicitSize),
  };
}
export function resolveChartCanvasSizeState(layoutSizeState, explicitSize) {
  return explicitSize ? getInitialChartCanvasSizeState(explicitSize) : layoutSizeState;
}
export function isChartHeadless(headless, explicitSize) {
  return Boolean(headless && explicitSize);
}
export function shouldWarnMissingHeadlessExplicitSize(headless, explicitSize) {
  return Boolean(headless && !explicitSize);
}
export function applyChartLayoutChange(explicitSize, layout) {
  if (explicitSize) {
    return null;
  }
  return {
    size: layout,
    hasMeasuredLayoutSize: true,
  };
}
