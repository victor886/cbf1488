// @ts-nocheck
import * as React from 'react';
import { Path } from '../../skia';
import { useCandlestickPaths } from '../hooks/useCandlestickPaths';
import { AnimatedPath } from './AnimatedPath';
const CandlestickPath = ({ path, style, options, sharedOptions, animate }) => {
  const { children, ...pathOptions } = options;
  if (animate) {
    return (
      <AnimatedPath path={path} style={style} {...sharedOptions} {...pathOptions} animate={animate}>
        {children}
      </AnimatedPath>
    );
  }
  return (
    <Path path={path} style={style} {...sharedOptions} {...pathOptions}>
      {children}
    </Path>
  );
};
export const Candlestick = ({
  openPoints,
  highPoints,
  lowPoints,
  closePoints,
  chartBounds,
  candleWidth,
  candleRatio,
  candleCount,
  minBodyHeight,
  candleColors,
  wickStrokeWidth,
  candleOptions,
  animate,
  blendMode,
  opacity,
  antiAlias,
}) => {
  const paths = useCandlestickPaths({
    openPoints,
    highPoints,
    lowPoints,
    closePoints,
    chartBounds,
    candleWidth,
    candleRatio,
    candleCount,
    minBodyHeight,
    candleColors,
    wickStrokeWidth,
    candleOptions,
  });
  const sharedOptions = {
    blendMode,
    opacity,
    antiAlias,
  };
  if (paths.mode === 'custom') {
    return (
      <>
        {paths.candles.map((candle) => (
          <React.Fragment key={candle.key}>
            <CandlestickPath
              key={`${candle.key}-wick`}
              path={candle.wickPath}
              style="stroke"
              options={candle.wickOptions}
              sharedOptions={sharedOptions}
              animate={animate}
            />
            <CandlestickPath
              key={`${candle.key}-body`}
              path={candle.bodyPath}
              style="fill"
              options={candle.bodyOptions}
              sharedOptions={sharedOptions}
              animate={animate}
            />
          </React.Fragment>
        ))}
      </>
    );
  }
  return (
    <>
      {paths.groups.map((group) => (
        <React.Fragment key={group.key}>
          <CandlestickPath
            key={`${group.key}-wick`}
            path={group.wickPath}
            style="stroke"
            options={group.wickOptions}
            sharedOptions={sharedOptions}
            animate={animate}
          />
          <CandlestickPath
            key={`${group.key}-body`}
            path={group.bodyPath}
            style="fill"
            options={group.bodyOptions}
            sharedOptions={sharedOptions}
            animate={animate}
          />
        </React.Fragment>
      ))}
    </>
  );
};
