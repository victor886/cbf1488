import { ReduceMotion } from 'react-native-reanimated';
/** Display names for the SwipeableRow compound parts. */
export const DISPLAY_NAME = {
  ROOT: 'HeroUINative.SwipeableRow.Root',
  ACTIONS: 'HeroUINative.SwipeableRow.Actions',
  CONTENT: 'HeroUINative.SwipeableRow.Content',
  CONTENT_BACKGROUND: 'HeroUINative.SwipeableRow.ContentBackground',
  ACTION: 'HeroUINative.SwipeableRow.Action',
  ACTION_LABEL: 'HeroUINative.SwipeableRow.ActionLabel',
};
/** Fraction of the action width required to settle the rail open. */
export const DEFAULT_OPEN_THRESHOLD = 0.5;
/** Horizontal distance in points required to activate the pan gesture. */
export const DEFAULT_ACTIVATION_THRESHOLD = 10;
/** Vertical movement range reserved for identifying a horizontal swipe. */
export const DEFAULT_FAIL_OFFSET_Y = [-10, 10];
/** Ratio between finger travel and content travel. */
export const DEFAULT_FRICTION = 1;
/** Resistance applied after dragging beyond an action rail's width. */
export const DEFAULT_OVERSHOOT_FRICTION = 8;
/** Internal names used by the foreground's screen-reader actions. */
export const ACCESSIBILITY_ACTION_NAME_MAP = {
  OPEN_START: 'swipeable-row-open-start',
  OPEN_END: 'swipeable-row-open-end',
  CLOSE: 'swipeable-row-close',
};
/** Default screen-reader labels. Consumers can localize these through root props. */
export const DEFAULT_ACCESSIBILITY_ACTION_LABEL_MAP = {
  OPEN_START: 'Open start actions',
  OPEN_END: 'Open end actions',
  CLOSE: 'Close actions',
};
/** Action content scale at `[hidden, fully revealed]` action reveal progress. */
export const DEFAULT_ACTION_CONTENT_SCALE_RANGE = [0.5, 1];
/**
 * Action content offset in points toward the card at
 * `[hidden, fully revealed]` action reveal progress.
 */
export const DEFAULT_ACTION_CONTENT_TRANSLATE_X_RANGE = [15, 0];
/** Action content opacity at `[hidden, fully revealed]` action reveal progress. */
export const DEFAULT_ACTION_CONTENT_OPACITY_RANGE = [0, 1];
/** Action button scale while pressed. */
export const DEFAULT_ACTION_PRESS_SCALE = 0.95;
/** Duration in milliseconds of the action press-in and press-out scale. */
export const DEFAULT_ACTION_PRESS_DURATION = 150;
/**
 * Duration in milliseconds of the fade an action rail mounts and unmounts
 * with while the active theme renders a translucent card (e.g. `glass`).
 */
export const DEFAULT_ACTIONS_FADE_DURATION = 200;
/** Drag distance in points over which an inline row's corners fully round. */
export const DEFAULT_INLINE_BORDER_RADIUS_DISTANCE = 32;
/** Inline dragged radius used when the theme's standalone radius can't be read. */
export const FALLBACK_STANDALONE_BORDER_RADIUS = 24;
/** Velocity projection window used when selecting a settle target. */
export const DRAG_TOSS = 0.05;
/** Default spring used when the row settles open or closed. */
export const DEFAULT_SPRING_CONFIG = {
  mass: 2,
  damping: 1000,
  stiffness: 700,
  overshootClamping: true,
  reduceMotion: ReduceMotion.System,
};
