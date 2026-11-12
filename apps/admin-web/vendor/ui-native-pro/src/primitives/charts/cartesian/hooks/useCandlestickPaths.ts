// @ts-nocheck
import * as React from 'react';
import { Skia } from '../../skia';
import { getBarWidth } from '../utils/getBarWidth';
import { getCandlestickGeometry } from '../utils/getCandlestickGeometry';
import { resolveCandlestickPathOptions } from '../utils/resolveCandlestickPathOptions';
const DEFAULT_CANDLE_COLORS = {
  positive: '#26a69a',
  negative: '#ef5350',
  neutral: '#737375',
};
const clampCandleRatio = (candleRatio) => Math.max(0, Math.min(1, candleRatio));
const getOptionsContext = (geometry) => ({
  ...geometry,
  isPositive: geometry.status === 'positive',
  isNegative: geometry.status === 'negative',
  isNeutral: geometry.status === 'neutral',
});
const getStatusColor = (status, candleColors) =>
  candleColors?.[status] ?? DEFAULT_CANDLE_COLORS[status];
const addGeometryToPaths = (geometry, bodyPath, wickPath) => {
  wickPath.moveTo(geometry.wick.x, geometry.wick.y1);
  wickPath.lineTo(geometry.wick.x, geometry.wick.y2);
  if (geometry.body.width <= 0 || geometry.body.height <= 0) return;
  bodyPath.addRect(
    Skia.XYWHRect(geometry.body.x, geometry.body.y, geometry.body.width, geometry.body.height)
  );
};
const makeEmptyGroups = (candleColors, wickStrokeWidth = 1) =>
  ['positive', 'negative', 'neutral'].map((status) => {
    const color = getStatusColor(status, candleColors);
    return {
      key: status,
      status,
      bodyPath: Skia.PathBuilder.Make(),
      wickPath: Skia.PathBuilder.Make(),
      bodyOptions: {
        color,
      },
      wickOptions: {
        color,
        strokeWidth: wickStrokeWidth,
      },
    };
  });
const detachGroup = (group) => ({
  ...group,
  bodyPath: group.bodyPath.detach(),
  wickPath: group.wickPath.detach(),
});
export const useCandlestickPaths = ({
  openPoints,
  highPoints,
  lowPoints,
  closePoints,
  chartBounds,
  candleWidth: customCandleWidth,
  candleRatio = 0.6,
  candleCount,
  minBodyHeight = 1,
  candleColors,
  wickStrokeWidth = 1,
  candleOptions,
}) => {
  const normalizedCandleRatio = clampCandleRatio(candleRatio);
  const candleWidth = getBarWidth({
    points: openPoints,
    chartBounds,
    innerPadding: 1 - normalizedCandleRatio,
    customBarWidth: customCandleWidth,
    barCount: candleCount,
  });
  const geometry = React.useMemo(
    () =>
      getCandlestickGeometry({
        openPoints,
        highPoints,
        lowPoints,
        closePoints,
        candleWidth,
        minBodyHeight,
      }),
    [candleWidth, closePoints, highPoints, lowPoints, minBodyHeight, openPoints]
  );
  return React.useMemo(() => {
    if (candleOptions) {
      return {
        mode: 'custom',
        candleWidth,
        geometry,
        candles: geometry.map((candle) => {
          const color = getStatusColor(candle.status, candleColors);
          const options = candleOptions(getOptionsContext(candle));
          const bodyPath = Skia.PathBuilder.Make();
          const wickPath = Skia.PathBuilder.Make();
          addGeometryToPaths(candle, bodyPath, wickPath);
          const { bodyOptions, wickOptions } = resolveCandlestickPathOptions({
            color,
            wickStrokeWidth,
            options,
          });
          return {
            key: `candlestick-${candle.datumIndex}`,
            geometry: candle,
            bodyPath: bodyPath.detach(),
            wickPath: wickPath.detach(),
            bodyOptions,
            wickOptions,
          };
        }),
      };
    }
    const groups = makeEmptyGroups(candleColors, wickStrokeWidth);
    const groupByStatus = groups.reduce((acc, group) => {
      acc[group.status] = group;
      return acc;
    }, {});
    geometry.forEach((candle) => {
      const group = groupByStatus[candle.status];
      addGeometryToPaths(candle, group.bodyPath, group.wickPath);
    });
    return {
      mode: 'grouped',
      candleWidth,
      geometry,
      groups: groups.map(detachGroup),
    };
  }, [candleColors, candleOptions, candleWidth, geometry, wickStrokeWidth]);
};
