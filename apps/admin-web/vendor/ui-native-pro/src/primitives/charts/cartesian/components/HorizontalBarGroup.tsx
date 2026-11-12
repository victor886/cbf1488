// @ts-nocheck
import * as React from 'react';
import { useFunctionRef } from '../../hooks/useFunctionRef';
import { Path } from '../../skia';
import { useCartesianChartContext } from '../contexts/CartesianChartContext';
import { useHorizontalBarGroupPaths } from '../hooks/useHorizontalBarGroupPaths';
import { AnimatedPath } from './AnimatedPath';
export function HorizontalBarGroup({
  betweenGroupPadding = 0.25,
  withinGroupPadding = 0.25,
  chartBounds,
  roundedCorners,
  children,
  onBarSizeChange,
  barWidth: customBarWidth,
  barCount,
}) {
  const { orientation } = useCartesianChartContext();
  const bars = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === HorizontalBarGroupBar) {
        bars.push(child.props);
      }
    }
  });
  const { paths, barWidth, groupWidth, gapWidth } = useHorizontalBarGroupPaths(
    bars.map((bar) => bar.points),
    chartBounds,
    betweenGroupPadding,
    withinGroupPadding,
    roundedCorners,
    customBarWidth,
    barCount
  );
  const onBarSizeChangeRef = useFunctionRef(onBarSizeChange);
  React.useEffect(() => {
    if (orientation !== 'horizontal') return;
    onBarSizeChangeRef.current?.({
      barWidth,
      groupWidth,
      gapWidth,
    });
  }, [orientation, barWidth, gapWidth, groupWidth, onBarSizeChangeRef]);
  if (orientation !== 'horizontal') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'HorizontalBarGroup must be rendered inside a CartesianChart with orientation="horizontal".'
      );
    }
    return null;
  }
  const firstBar = bars[0];
  if (!firstBar) return null;
  return (
    <>
      {bars.map((props, i) =>
        React.createElement(HorizontalBarGroupBar, {
          ...props,
          __path: paths[i],
          key: i,
        })
      )}
    </>
  );
}
HorizontalBarGroup.Bar = HorizontalBarGroupBar;
function HorizontalBarGroupBar(props) {
  const { animate, __path, ...rest } = props;
  const PathComponent = animate ? AnimatedPath : Path;
  if (!__path) return null;
  return React.createElement(PathComponent, {
    path: __path,
    style: 'fill',
    color: 'red',
    ...rest,
    ...(Boolean(animate) && {
      animate,
    }),
  });
}
