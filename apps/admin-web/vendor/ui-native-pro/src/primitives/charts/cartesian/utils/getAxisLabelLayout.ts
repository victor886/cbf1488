// @ts-nocheck
import { getTextLayout } from '../../utils/textLayout';
const normalizeDimension = (value) => (Number.isFinite(value) ? Math.max(0, value ?? 0) : 0);
export const getAxisLabelLayout = ({
  axis,
  orientation,
  value,
  text,
  index,
  font,
  labelRenderer,
}) => {
  if (labelRenderer) {
    const measurement = labelRenderer.measure({
      axis,
      orientation,
      value,
      text,
      index,
    });
    const fontSize = normalizeDimension(measurement.fontSize ?? font?.getSize());
    const lineHeight = normalizeDimension(
      measurement.lineHeight ?? measurement.fontSize ?? fontSize
    );
    return {
      axis,
      orientation,
      value,
      text,
      index,
      lines: [text],
      width: normalizeDimension(measurement.width),
      height: normalizeDimension(measurement.height),
      fontSize,
      lineHeight,
    };
  }
  const layout = getTextLayout(text, font);
  return {
    axis,
    orientation,
    value,
    text,
    index,
    ...layout,
  };
};
export const getMaxAxisLabelLayout = (labels) => {
  return labels.reduce(
    (max, label) => ({
      width: Math.max(max.width, label.width),
      height: Math.max(max.height, label.height),
      fontSize: label.fontSize,
      lineHeight: label.lineHeight,
    }),
    {
      width: 0,
      height: 0,
      fontSize: 0,
      lineHeight: 0,
    }
  );
};
