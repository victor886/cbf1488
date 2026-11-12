/**
 * Display name constants for the StackedMeter compound component parts.
 */
export const DISPLAY_NAME = {
  ROOT: 'HeroUINative.StackedMeter.Root',
  LABEL: 'HeroUINative.StackedMeter.Label',
  TRACK: 'HeroUINative.StackedMeter.Track',
  TRACK_BACKGROUND: 'HeroUINative.StackedMeter.TrackBackground',
  SEGMENT: 'HeroUINative.StackedMeter.Segment',
  REMAINDER: 'HeroUINative.StackedMeter.Remainder',
  LEGEND: 'HeroUINative.StackedMeter.Legend',
  LEGEND_ITEM: 'HeroUINative.StackedMeter.LegendItem',
  LEGEND_INDICATOR: 'HeroUINative.StackedMeter.LegendIndicator',
  LEGEND_LABEL: 'HeroUINative.StackedMeter.LegendLabel',
  LEGEND_VALUE: 'HeroUINative.StackedMeter.LegendValue',
};
/** Default size when the `size` prop is not provided. */
export const DEFAULT_SIZE = 'md';
/** Default format options for each segment's value text. */
export const DEFAULT_FORMAT_OPTIONS = {
  style: 'percent',
  maximumFractionDigits: 1,
};
/** Default duration for the segment share transition. */
export const DEFAULT_GROW_TIMING_DURATION = 300;
/**
 * Colors assigned in order to segments without an explicit `color`.
 * Cycles when there are more segments than entries.
 */
export const DEFAULT_COLOR_SEQUENCE = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
/** Fallback color when the sequence lookup yields nothing. */
export const FALLBACK_COLOR = 'chart-1';
/** Remainder share used when there is nothing to display (empty track). */
export const EMPTY_REMAINDER_PERCENTAGE = 100;
