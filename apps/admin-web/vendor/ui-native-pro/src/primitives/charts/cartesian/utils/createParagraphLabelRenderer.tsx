// @ts-nocheck
import { Paragraph, Skia } from '../../skia';
const DEFAULT_PARAGRAPH_LAYOUT_WIDTH = 1000000;
const normalizeDimension = (value) => (Number.isFinite(value) ? Math.max(0, value ?? 0) : 0);
export const createParagraphLabelRenderer = ({
  paragraphStyle,
  textStyle,
  typefaceFontProvider,
  maxWidth,
} = {}) => {
  const resolvedTypefaceFontProvider = typefaceFontProvider ?? Skia.TypefaceFontProvider.Make();
  const getLayoutWidth = (args) => {
    const width = typeof maxWidth === 'function' ? maxWidth(args) : maxWidth;
    return normalizeDimension(width ?? DEFAULT_PARAGRAPH_LAYOUT_WIDTH);
  };
  const buildParagraph = (args, color) => {
    const builder = Skia.ParagraphBuilder.Make(paragraphStyle ?? {}, resolvedTypefaceFontProvider);
    const resolvedTextStyle =
      color && !textStyle?.color
        ? {
            ...textStyle,
            color: Skia.Color(color),
          }
        : textStyle;
    builder.pushStyle(resolvedTextStyle ?? {});
    builder.addText(args.text);
    builder.pop();
    const paragraph = builder.build();
    const layoutWidth = getLayoutWidth(args);
    paragraph.layout(layoutWidth);
    return {
      paragraph,
      layoutWidth,
    };
  };
  const measure = (args) => {
    const { paragraph, layoutWidth } = buildParagraph(args);
    const longestLine = normalizeDimension(paragraph.getLongestLine());
    const maxIntrinsicWidth = normalizeDimension(paragraph.getMaxIntrinsicWidth());
    const measuredWidth = Math.max(longestLine, maxIntrinsicWidth);
    const height = normalizeDimension(paragraph.getHeight());
    return {
      width: maxWidth === undefined ? measuredWidth : layoutWidth,
      height,
      fontSize: normalizeDimension(textStyle?.fontSize),
      lineHeight: height,
    };
  };
  const render = (args) => {
    const { paragraph } = buildParagraph(args, args.color);
    return <Paragraph paragraph={paragraph} x={args.x} y={args.y} width={args.width} />;
  };
  return {
    measure,
    render,
  };
};
