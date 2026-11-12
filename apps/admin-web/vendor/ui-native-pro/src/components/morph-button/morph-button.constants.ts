// @ts-nocheck
/**
 * Display name constants for the MorphButton compound component parts.
 */
export const DISPLAY_NAME = {
  ROOT: 'HeroUINative.MorphButton.Root',
  COLLAPSED_CONTENT: 'HeroUINative.MorphButton.CollapsedContent',
  EXPANDED_CONTENT: 'HeroUINative.MorphButton.ExpandedContent',
};
/** Default spring configuration for the surface width/height morph. */
export const DEFAULT_MORPH_SPRING_CONFIG = {
  damping: 25,
  stiffness: 300,
  mass: 0.8,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};
/** Default duration for the content cross-fade and scale timing animations. */
export const DEFAULT_CONTENT_TIMING_DURATION = 200;
/** Default collapsed-content opacity values `[closed, open]`. */
export const DEFAULT_COLLAPSED_OPACITY = [1, 0];
/** Default collapsed-content scale values `[closed, open]`. */
export const DEFAULT_COLLAPSED_SCALE = [1, 0.96];
/** Default expanded-content opacity values `[closed, open]`. */
export const DEFAULT_EXPANDED_OPACITY = [0, 1];
/** Default expanded-content scale values `[closed, open]`. */
export const DEFAULT_EXPANDED_SCALE = [0.97, 1];
/**
 * Anchor factors per direction, used by the surface/host animated styles.
 * Offsets are computed as `(reference - animated) * factor`:
 * - `vertical`: share of vertical growth going toward the top
 *   (`1` = grows up, `0` = grows down, `0.5` = vertically centered).
 * - `horizontal`: share of horizontal growth going toward the inline start
 *   (`1` = grows toward start, `0` = grows toward end, `0.5` = centered).
 * Horizontal offsets are written to the logical `start` inset, so the
 * physical growth side mirrors automatically in RTL.
 */
export const DIRECTION_ANCHOR_MAP = {
  'top': {
    vertical: 1,
    horizontal: 0.5,
  },
  'top-end': {
    vertical: 1,
    horizontal: 0,
  },
  'end': {
    vertical: 0.5,
    horizontal: 0,
  },
  'bottom-end': {
    vertical: 0,
    horizontal: 0,
  },
  'bottom': {
    vertical: 0,
    horizontal: 0.5,
  },
  'bottom-start': {
    vertical: 0,
    horizontal: 1,
  },
  'start': {
    vertical: 0.5,
    horizontal: 1,
  },
  'top-start': {
    vertical: 1,
    horizontal: 1,
  },
};
