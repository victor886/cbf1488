// @ts-nocheck
import { Path } from '../../skia';
import { useBarPath } from '../hooks/useBarPath';
import { AnimatedPath } from './AnimatedPath';
import { BarGraphLabels } from './BarGraphLabels';
const BarGraph = (props) => {
  const { options, ...pathProps } = props;
  const PathComponent = pathProps.animate ? AnimatedPath : Path;
  return <PathComponent style="fill" {...pathProps} {...options} />;
};
export const Bar = ({
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
  const { path, barWidth: bw } = useBarPath(
    points,
    chartBounds,
    innerPadding,
    roundedCorners,
    barWidth,
    barCount
  );
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
      <BarGraph path={path} animate={animate} options={ops} />
    </>
  );
};
