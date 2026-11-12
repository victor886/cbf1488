// @ts-nocheck
import { Path } from '../../skia';
import { useCartesianChartContext } from '../contexts/CartesianChartContext';
import { useHorizontalBarPath } from '../hooks/useHorizontalBarPath';
import { AnimatedPath } from './AnimatedPath';
import { BarGraphLabels } from './BarGraphLabels';
const HorizontalBarGraph = (props) => {
  const { options, ...pathProps } = props;
  const PathComponent = pathProps.animate ? AnimatedPath : Path;
  return <PathComponent style="fill" {...pathProps} {...options} />;
};
export const HorizontalBar = ({
  points,
  chartBounds,
  animate,
  innerPadding = 0.25,
  roundedCorners,
  barWidth,
  barCount,
  labels,
  ...ops
}) => {
  const { orientation } = useCartesianChartContext();
  const { path, barWidth: bw } = useHorizontalBarPath(
    points,
    chartBounds,
    innerPadding,
    roundedCorners,
    barWidth,
    barCount
  );
  if (orientation !== 'horizontal') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'HorizontalBar must be rendered inside a CartesianChart with orientation="horizontal".'
      );
    }
    return null;
  }
  return (
    <>
      {labels && (
        <BarGraphLabels
          points={points}
          chartBounds={chartBounds}
          barWidth={barWidth ?? bw}
          options={labels}
        />
      )}
      <HorizontalBarGraph path={path} animate={animate} options={ops} />
    </>
  );
};
