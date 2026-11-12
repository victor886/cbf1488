import {
  DEFAULT_COLOR_SEQUENCE,
  DEFAULT_FORMAT_OPTIONS,
  EMPTY_REMAINDER_PERCENTAGE,
  FALLBACK_COLOR,
} from './stacked-meter.constants';
/**
 * Normalizes a raw segment value: negative and non-finite values become `0`.
 */
export const sanitizeSegmentValue = (value) => (Number.isFinite(value) && value > 0 ? value : 0);
/**
 * Resolves a segment's color: the explicit `color` when provided, otherwise
 * the entry of the default `chart-*` sequence at the segment's index
 * (cycling when there are more segments than entries).
 */
export const resolveSegmentColor = (index, color) => {
  if (color !== undefined) return color;
  const sequenceLength = DEFAULT_COLOR_SEQUENCE.length;
  if (sequenceLength === 0 || !Number.isInteger(index) || index < 0) {
    return FALLBACK_COLOR;
  }
  return DEFAULT_COLOR_SEQUENCE[index % sequenceLength] ?? FALLBACK_COLOR;
};
/**
 * Creates a formatter for segment values. Falls back to plain string
 * conversion when `Intl.NumberFormat` rejects the options (e.g. a `currency`
 * style without a `currency` code).
 */
const createValueFormatter = (formatOptions) => {
  try {
    const formatter = new Intl.NumberFormat(undefined, formatOptions);
    return (value) => formatter.format(value);
  } catch {
    return (value) => String(value);
  }
};
/**
 * Computes every segment's share of the total along with the empty
 * remainder.
 *
 * The total is the sum of the sanitized values, or `maxValue` when it is a
 * finite number larger than that sum. With nothing to display (total `0`),
 * every share is `0` and the remainder fills the whole track.
 *
 * Value text: with `style: 'percent'` the share of the total is formatted
 * (converted to the 0–1 range `Intl.NumberFormat` expects); otherwise the
 * raw value is.
 */
export const computeSegmentStates = (
  segments,
  maxValue,
  formatOptions = DEFAULT_FORMAT_OPTIONS
) => {
  const safeSegments = Array.isArray(segments) ? segments : [];
  const values = safeSegments.map((segment) => sanitizeSegmentValue(segment.value));
  const sum = values.reduce((acc, value) => acc + value, 0);
  const total =
    maxValue !== undefined && Number.isFinite(maxValue) && maxValue > sum ? maxValue : sum;
  const format = createValueFormatter(formatOptions);
  const isPercentFormat = formatOptions.style === 'percent';
  const states = safeSegments.map((segment, index) => {
    const value = values[index] ?? 0;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return {
      ...segment,
      value,
      index,
      percentage,
      valueText: isPercentFormat ? format(percentage / 100) : format(value),
      color: resolveSegmentColor(index, segment.color),
    };
  });
  const remainderPercentage =
    total > 0 ? ((total - sum) / total) * 100 : EMPTY_REMAINDER_PERCENTAGE;
  return {
    segments: states,
    total,
    remainderPercentage,
  };
};
/**
 * Builds the combined text summary of all segments, used as the track's
 * default accessibility label (e.g. "TypeScript 96.3%, CSS 2.6%").
 */
export const buildMeterSummaryText = (segments) =>
  segments.map((segment) => `${segment.label} ${segment.valueText}`).join(', ');
