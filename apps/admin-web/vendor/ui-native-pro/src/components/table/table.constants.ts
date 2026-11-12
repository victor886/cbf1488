// @ts-nocheck
/**
 * Display names for all Table compound parts.
 */
export const DISPLAY_NAME = {
  ROOT: 'HeroUINative.Table',
  BACKGROUND: 'HeroUINative.Table.Background',
  SCROLL_CONTAINER: 'HeroUINative.Table.ScrollContainer',
  CONTENT: 'HeroUINative.Table.Content',
  HEADER: 'HeroUINative.Table.Header',
  COLUMN: 'HeroUINative.Table.Column',
  BODY: 'HeroUINative.Table.Body',
  ROW: 'HeroUINative.Table.Row',
  CELL: 'HeroUINative.Table.Cell',
  SELECT_ALL_CELL: 'HeroUINative.Table.SelectAllCell',
  SELECTION_CELL: 'HeroUINative.Table.SelectionCell',
  FOOTER: 'HeroUINative.Table.Footer',
};
/**
 * Default rotation endpoints for the sort indicator chevron, in degrees.
 * The glyph points up (ascending) at 0° and rotates half a turn for
 * descending. Rotation (not `scaleY`) keeps the sweep direction stable.
 */
export const SORT_INDICATOR_ROTATION = [0, 180];
/**
 * Default opacity endpoints for the sort indicator ([hidden, visible]).
 * The indicator fades in only for the column driving the active sort.
 */
export const SORT_INDICATOR_OPACITY = [0, 1];
/** Default timing duration (ms) for sort indicator transitions. */
export const SORT_INDICATOR_TIMING_DURATION = 150;
/** Rendered size (pt) of the default sort indicator chevron glyph. */
export const SORT_INDICATOR_SIZE = 12;
/**
 * Extra touch area around sortable column headers so the pressable area
 * meets the 44pt minimum despite the compact header row height.
 */
export const SORTABLE_COLUMN_HIT_SLOP = 8;
/**
 * Fixed width (pt) of the selection column hosting the checkboxes. Wide
 * enough for a 44pt-equivalent touch target once cell padding is included.
 */
export const SELECTION_COLUMN_WIDTH = 48;
/**
 * Check icon size (pt) inside the selection checkboxes. The table renders a
 * compact 20pt checkbox (see `.table__selection-checkbox`), so the default
 * 18pt icon is scaled down proportionally (18/24 of the box size).
 */
export const SELECTION_CHECKBOX_ICON_SIZE = 15;
