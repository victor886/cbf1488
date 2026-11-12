// @ts-nocheck
import React from 'react';
import { Group, Line, Text, vec } from '../../skia';
import { boundsToClip } from '../../utils/boundsToClip';
import { getAxisLabelLayout } from '../utils/getAxisLabelLayout';
import { getAxisTitleLayout, getRotatedYAxisTitleBaselineY } from '../utils/getAxisTitleLayout';
import { getCategoryYAxisLabelPosition } from '../utils/getCategoryYAxisLabelPosition';
export const CategoryYAxis = ({
  xScale,
  yScale,
  yTicksNormalized,
  axisSide,
  labelPosition,
  labelOffset,
  labelColor,
  lineWidth,
  lineColor,
  font,
  title,
  labelRenderer,
  formatYLabel = (label) => String(label),
  linePathEffect,
  chartBounds,
  ix,
}) => {
  const [x1 = 0, x2 = 0] = xScale.domain();
  const fontSize = font?.getSize() ?? 0;
  const yTickLabels = yTicksNormalized.map((tick, index) => {
    const categoryValue = ix[tick];
    const contentY =
      categoryValue === undefined ? String(tick) : String(formatYLabel(categoryValue));
    const labelLayout = getAxisLabelLayout({
      axis: 'y',
      orientation: 'horizontal',
      value: categoryValue,
      text: contentY,
      index,
      font,
      labelRenderer,
    });
    return {
      tick,
      labelLayout,
    };
  });
  const maxYLabelWidth = Math.max(0, ...yTickLabels.map(({ labelLayout }) => labelLayout.width));
  const labelOutset =
    labelPosition === 'outset' && yTickLabels.length > 0 && maxYLabelWidth > 0
      ? maxYLabelWidth + labelOffset
      : 0;
  const titleLayout = getAxisTitleLayout({
    title,
    font,
  });
  const titleFont = titleLayout.font;
  const titleBaselineY = getRotatedYAxisTitleBaselineY(titleLayout);
  const titleX =
    axisSide === 'left'
      ? chartBounds.left - labelOutset - titleLayout.offset
      : chartBounds.right + labelOutset + titleLayout.offset;
  const titleCenterY = (() => {
    if (titleLayout.position === 'start') {
      return chartBounds.top + titleLayout.width / 2;
    }
    if (titleLayout.position === 'end') {
      return chartBounds.bottom - titleLayout.width / 2;
    }
    return chartBounds.top + (chartBounds.bottom - chartBounds.top) / 2;
  })();
  const titleNodes =
    titleLayout.hasContent && titleFont
      ? titleLayout.lines.map((line, index) => (
          <Text
            key={`category-y-axis-title-line-${index}`}
            color={titleLayout.color ?? labelColor}
            text={line}
            font={titleFont}
            y={titleBaselineY + index * titleLayout.lineHeight}
            x={-titleLayout.width / 2}
          />
        ))
      : null;
  const yAxisNodes = yTickLabels.map(({ tick, labelLayout }) => {
    const labelWidth = labelLayout.width;
    const tickPosition = yScale(tick);
    const {
      x: labelX,
      y: labelY,
      canFitContent,
    } = getCategoryYAxisLabelPosition({
      axisSide,
      labelPosition,
      labelOffset,
      labelWidth,
      lineCount: labelLayout.lines.length,
      lineHeight: labelLayout.lineHeight,
      fontSize,
      tickPosition,
      chartBounds,
    });
    const customLabelTopY = tickPosition - labelLayout.height / 2;
    const canFitCustomLabel =
      customLabelTopY >= chartBounds.top &&
      customLabelTopY + labelLayout.height <= chartBounds.bottom;
    return (
      <React.Fragment key={`category-y-tick-${tick}`}>
        {lineWidth > 0 ? (
          <Group clip={boundsToClip(chartBounds)}>
            <Line
              p1={vec(xScale(x1), tickPosition)}
              p2={vec(xScale(x2), tickPosition)}
              color={lineColor}
              strokeWidth={lineWidth}
            >
              {linePathEffect ? linePathEffect : null}
            </Line>
          </Group>
        ) : null}
        {labelRenderer
          ? labelWidth > 0 && labelLayout.height > 0
            ? labelRenderer.render({
                axis: 'y',
                orientation: 'horizontal',
                value: labelLayout.value,
                text: labelLayout.text,
                index: labelLayout.index,
                x: labelX,
                y: customLabelTopY,
                width: labelLayout.width,
                height: labelLayout.height,
                fontSize: labelLayout.fontSize,
                lineHeight: labelLayout.lineHeight,
                color: labelColor,
                canFitContent: canFitCustomLabel,
                chartBounds,
              })
            : null
          : font
            ? canFitContent && (
                <>
                  {labelLayout.lines.map((line, index) => (
                    <Text
                      key={`category-y-tick-${tick}-label-line-${index}`}
                      color={labelColor}
                      text={line}
                      font={font}
                      y={labelY + index * labelLayout.lineHeight}
                      x={labelX}
                    />
                  ))}
                </>
              )
            : null}
      </React.Fragment>
    );
  });
  return (
    <>
      {yAxisNodes}
      {titleNodes ? (
        <Group
          transform={[
            {
              translateX: titleX,
            },
            {
              translateY: titleCenterY,
            },
            {
              rotate: axisSide === 'right' ? Math.PI / 2 : -Math.PI / 2,
            },
          ]}
        >
          {titleNodes}
        </Group>
      ) : null}
    </>
  );
};
