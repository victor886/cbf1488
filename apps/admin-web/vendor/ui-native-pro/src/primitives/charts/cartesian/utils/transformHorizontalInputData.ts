// @ts-nocheck
import { getOffsetFromAngle } from '../../utils/getOffsetFromAngle';
import { downsampleTicks, getDomainFromTicks } from '../../utils/tickHelpers';
import { getAxisLabelLayout, getMaxAxisLabelLayout } from './getAxisLabelLayout';
import { getAxisTitleLayout } from './getAxisTitleLayout';
import { getXAxisTicks } from './getXAxisTicks';
import { getYScaleInputBounds } from './getYScaleInputBounds';
import { makeScale } from './makeScale';
export const transformHorizontalInputData = ({
  data: _data,
  xKey,
  yKeys,
  outputWindow,
  domain,
  domainPadding,
  xAxis,
  yAxes,
  viewport,
  labelRotate,
  axisScales,
}) => {
  const data = [..._data];
  const { xAxisScale = 'linear' } = axisScales || {};
  const isNumericalData = data.every((datum) => typeof datum[xKey] === 'number');
  if (isNumericalData) {
    data.sort((a, b) => +a[xKey] - +b[xKey]);
  }
  const y = yKeys.reduce((acc, k) => {
    acc[k] = {
      i: [],
      o: [],
    };
    return acc;
  }, {});
  const ix = data.map((datum) => datum[xKey]);
  const categoryIndexes = ix.map((_, index) => index);
  const categoryAxisLayouts = yAxes.map((yAxis) => {
    const ticks = yAxis.tickValues
      ? downsampleTicks(yAxis.tickValues, yAxis.tickCount)
      : downsampleTicks(categoryIndexes, yAxis.tickCount);
    const labelLayouts = ticks.map((tick, index) => {
      const categoryValue = ix[tick];
      const labelValue = yAxis.formatYLabel
        ? yAxis.formatYLabel(categoryValue)
        : String(categoryValue ?? tick);
      return getAxisLabelLayout({
        axis: 'y',
        orientation: 'horizontal',
        value: categoryValue,
        text: String(labelValue),
        index,
        font: yAxis.font,
        labelRenderer: yAxis.labelRenderer,
      });
    });
    const maxLabelLayout = getMaxAxisLabelLayout(labelLayouts);
    const titleLayout = getAxisTitleLayout({
      title: yAxis.title,
      font: yAxis.font,
    });
    const titleOutset = titleLayout.hasContent ? titleLayout.height + titleLayout.offset : 0;
    return {
      ticks,
      maxLabelLayout,
      titleOutset,
    };
  });
  const valueTickValues = xAxis.tickValues;
  const valueTickCount = xAxis.tickCount;
  const tickDomainsX = getDomainFromTicks(valueTickValues);
  const valueInputBounds = getHorizontalValueInputBounds({
    data,
    yKeys: yKeys,
    domain: domain?.x,
    tickDomain: tickDomainsX,
    includeZero: !domain?.x && !tickDomainsX,
  });
  const rawChartWidth = outputWindow.xMax - outputWindow.xMin;
  const xTempScale = makeScale({
    inputBounds: valueInputBounds,
    outputBounds: [0, rawChartWidth],
    axisScale: xAxisScale,
  });
  const xTicksForLabelLayout = getXAxisTicks({
    isNumericalData: true,
    ix: [],
    tickCount: valueTickCount,
    tickValues: valueTickValues,
    xScale: xTempScale,
  });
  const xAxisLabelLayouts = xTicksForLabelLayout.map((xTick, index) => {
    const labelValue = xAxis.formatXLabel ? xAxis.formatXLabel(xTick) : String(xTick);
    return getAxisLabelLayout({
      axis: 'x',
      orientation: 'horizontal',
      value: xTick,
      text: String(labelValue),
      index,
      font: xAxis.font,
      labelRenderer: xAxis.labelRenderer,
    });
  });
  const maxXLabelLayout = getMaxAxisLabelLayout(xAxisLabelLayouts);
  const xAxisTitleLayout = getAxisTitleLayout({
    title: xAxis.title,
    font: xAxis.font,
  });
  const xAxisTitleOutset = xAxisTitleLayout.hasContent
    ? xAxisTitleLayout.height + xAxisTitleLayout.offset
    : 0;
  const adjustedOutputWindow = {
    ...outputWindow,
  };
  if (labelRotate && xAxis.labelPosition === 'outset') {
    const rotateOffset = Math.abs(maxXLabelLayout.width * getOffsetFromAngle(labelRotate));
    if (xAxis.axisSide === 'bottom') {
      adjustedOutputWindow.yMax -= rotateOffset;
    } else if (xAxis.axisSide === 'top') {
      adjustedOutputWindow.yMin += rotateOffset;
    }
  }
  const xRange = (() => {
    let xMinAdjustment = 0;
    let xMaxAdjustment = 0;
    yAxes.forEach((axis, index) => {
      const labelWidth = categoryAxisLayouts[index]?.maxLabelLayout.width ?? 0;
      const titleOutset = categoryAxisLayouts[index]?.titleOutset ?? 0;
      if (axis.axisSide === 'left') {
        xMinAdjustment += titleOutset;
        if (axis.labelPosition === 'outset' && axis.tickCount > 0 && labelWidth > 0) {
          xMinAdjustment += labelWidth + axis.labelOffset;
        }
      }
      if (axis.axisSide === 'right') {
        xMaxAdjustment -= titleOutset;
        if (axis.labelPosition === 'outset' && axis.tickCount > 0 && labelWidth > 0) {
          xMaxAdjustment -= labelWidth + axis.labelOffset;
        }
      }
    });
    return [adjustedOutputWindow.xMin + xMinAdjustment, adjustedOutputWindow.xMax + xMaxAdjustment];
  })();
  const categoryRange = (() => {
    const xLabelOffset = xAxis.labelOffset ?? 0;
    const xLabelOutset =
      valueTickCount > 0 && maxXLabelLayout.width > 0
        ? maxXLabelLayout.height + xLabelOffset * 2
        : 0;
    const xAxisOutset = xAxisTitleOutset + (xAxis.labelPosition === 'outset' ? xLabelOutset : 0);
    if (xAxis.axisSide === 'bottom') {
      return [adjustedOutputWindow.yMin, adjustedOutputWindow.yMax - xAxisOutset];
    }
    if (xAxis.axisSide === 'top') {
      return [adjustedOutputWindow.yMin + xAxisOutset, adjustedOutputWindow.yMax];
    }
    return [adjustedOutputWindow.yMin, adjustedOutputWindow.yMax];
  })();
  const xScale = makeScale({
    inputBounds: valueInputBounds,
    outputBounds: xRange,
    viewport: viewport?.x,
    padStart: typeof domainPadding === 'number' ? domainPadding : domainPadding?.left,
    padEnd: typeof domainPadding === 'number' ? domainPadding : domainPadding?.right,
    axisScale: xAxisScale,
  });
  const categoryInputBounds = getCategoryInputBounds(categoryIndexes);
  const yScale = makeScale({
    inputBounds: categoryInputBounds,
    outputBounds: categoryRange,
    viewport: viewport?.y,
    padStart: typeof domainPadding === 'number' ? domainPadding : domainPadding?.top,
    padEnd: typeof domainPadding === 'number' ? domainPadding : domainPadding?.bottom,
  });
  const yData = yKeys.reduce((acc, key) => {
    acc[key] = {
      i: data.map((datum) => datum[key]),
      o: data.map((datum) => (typeof datum[key] === 'number' ? xScale(datum[key]) : datum[key])),
    };
    return acc;
  }, {});
  yKeys.forEach((yKey) => {
    y[yKey].i = data.map((datum) => datum[yKey]);
    y[yKey].o = data.map((datum) =>
      typeof datum[yKey] === 'number' ? xScale(datum[yKey]) : datum[yKey]
    );
  });
  const ox = categoryIndexes.map((index) => yScale(index));
  const xTicksNormalized = getXAxisTicks({
    isNumericalData: true,
    ix: [],
    tickCount: valueTickCount,
    tickValues: valueTickValues,
    xScale,
  });
  const yAxesTransformed = yAxes.map((_, index) => ({
    yScale,
    yTicksNormalized: categoryAxisLayouts[index]?.ticks ?? [],
    yData,
    maxYLabel: categoryAxisLayouts[index]?.maxLabelLayout.width ?? 0,
  }));
  return {
    ix,
    y,
    isNumericalData,
    ox,
    xScale,
    xTicksNormalized,
    yAxes: [yAxesTransformed[0], ...yAxesTransformed.slice(1)],
  };
};
const getCategoryInputBounds = (indexes) => {
  const first = indexes.at(0) ?? 0;
  const last = indexes.at(-1) ?? 0;
  return first === last ? [first - 1, last + 1] : [first, last];
};
const getHorizontalValueInputBounds = ({ data, yKeys, domain, tickDomain, includeZero }) => {
  const { yMin, yMax } = getYScaleInputBounds({
    data,
    yKeys,
    domain,
    tickDomain,
  });
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
    return [-1, 1];
  }
  const valueMin = includeZero ? Math.min(0, yMin) : yMin;
  const valueMax = includeZero ? Math.max(0, yMax) : yMax;
  return valueMin === valueMax ? [valueMin - 1, valueMax + 1] : [valueMin, valueMax];
};
