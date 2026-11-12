// @ts-nocheck
import { getTextLayout } from '../../utils/textLayout';
export const DEFAULT_AXIS_TITLE_OFFSET = 4;
const DEFAULT_AXIS_TITLE_POSITION = 'center';
export const getAxisTitleLayout = ({ title, font }) => {
  const titleFont = title?.font !== undefined ? title.font : font;
  const text = title?.text ?? '';
  const layout = getTextLayout(text, titleFont);
  return {
    ...layout,
    text,
    font: titleFont,
    color: title?.color,
    offset: title?.offset ?? DEFAULT_AXIS_TITLE_OFFSET,
    position: title?.position ?? DEFAULT_AXIS_TITLE_POSITION,
    hasContent: Boolean(titleFont && text && layout.width > 0),
  };
};
export const getRotatedYAxisTitleBaselineY = ({ height, fontSize }) => {
  const multilineOffset = height - fontSize;
  return multilineOffset > 0 ? -multilineOffset : 0;
};
