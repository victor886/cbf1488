// @ts-nocheck
import * as React from 'react';
import { usePolarChartContext } from '../polar/contexts/PolarChartContext';
import { PieSliceProvider } from './contexts/PieSliceContext';
import { PieSlice } from './PieSlice';
import { handleTranslateInnerRadius } from './utils/innerRadius';
import { getPieLayout } from './utils/pieLayout';
const CIRCLE_SWEEP_DEGREES = 360;
export const PieChart = (props) => {
  const {
    innerRadius = 0,
    circleSweepDegrees = CIRCLE_SWEEP_DEGREES,
    startAngle: _startAngle = 0,
    children,
    size,
  } = props;
  const { canvasSize, data: _data, labelKey, valueKey, colorKey } = usePolarChartContext();
  // The sum all the slices' values
  const totalCircleValue = _data.reduce((sum, entry) => sum + Number(entry[valueKey]), 0);
  const { center, radius } = getPieLayout({
    canvasSize,
    size,
  });
  const data = React.useMemo(() => {
    let startAngle = _startAngle; // Initialize the start angle for the first slice
    const enhanced = _data.map((datum) => {
      const sliceValue = datum[valueKey];
      const sliceLabel = datum[labelKey];
      const sliceColor = datum[colorKey];
      const initialStartAngle = startAngle; // grab the initial start angle
      const sweepAngle = (sliceValue / totalCircleValue) * circleSweepDegrees; // Calculate the sweep angle for the slice as a part of the entire pie
      const endAngle = initialStartAngle + sweepAngle; // the sum of sweep + start
      startAngle += sweepAngle; // the next startAngle is the accumulation of each sweep
      return {
        value: sliceValue,
        label: sliceLabel,
        color: sliceColor,
        innerRadius: handleTranslateInnerRadius(innerRadius, radius),
        startAngle: initialStartAngle,
        endAngle: endAngle,
        sweepAngle,
        sliceIsEntireCircle: sweepAngle === CIRCLE_SWEEP_DEGREES || _data.length === 1,
        radius,
        center,
      };
    });
    return enhanced;
  }, [
    valueKey,
    _data,
    totalCircleValue,
    colorKey,
    labelKey,
    radius,
    center,
    innerRadius,
    circleSweepDegrees,
    _startAngle,
  ]);
  return (
    <>
      {data.map((slice, index) => {
        return (
          <PieSliceProvider key={index} slice={slice}>
            {children ? (
              children({
                slice,
              })
            ) : (
              <PieSlice />
            )}
          </PieSliceProvider>
        );
      })}
    </>
  );
};
