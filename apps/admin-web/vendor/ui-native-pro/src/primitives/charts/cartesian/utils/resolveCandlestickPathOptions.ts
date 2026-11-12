// @ts-nocheck
export const resolveCandlestickPathOptions = ({ color, wickStrokeWidth, options }) => ({
  bodyOptions: {
    ...options.body,
    color: options.body?.color ?? color,
  },
  wickOptions: {
    ...options.wick,
    color: options.wick?.color ?? color,
    strokeWidth: options.wick?.strokeWidth ?? wickStrokeWidth,
  },
});
