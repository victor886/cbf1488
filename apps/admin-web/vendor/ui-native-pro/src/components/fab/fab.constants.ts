/**
 * Display name constants for the FAB compound component parts.
 *
 * Used both for `displayName` assignments and for React DevTools traces.
 */
export const DISPLAY_NAME = {
  ROOT: 'HeroUINative.FAB.Root',
  TRIGGER: 'HeroUINative.FAB.Trigger',
  PORTAL: 'HeroUINative.FAB.Portal',
  OVERLAY: 'HeroUINative.FAB.Overlay',
  CONTENT: 'HeroUINative.FAB.Content',
  ITEM: 'HeroUINative.FAB.Item',
  ITEM_BACKGROUND: 'HeroUINative.FAB.ItemBackground',
  ITEM_LABEL: 'HeroUINative.FAB.ItemLabel',
};
/** Progress value while the FAB is closed / idle. */
export const PROGRESS_IDLE = 0;
/** Progress value once the open animation completes. */
export const PROGRESS_OPEN = 1;
/** Progress value the close animation runs towards (then resets to idle). */
export const PROGRESS_CLOSE = 2;
/**
 * Default spring configuration driving the shared open/close progress.
 * Heavy mass with high stiffness and damping gives a fast, settled motion
 * without overshoot artifacts in the [0, 1, 2] progress interpolations.
 */
export const DEFAULT_PROGRESS_SPRING_CONFIG = {
  mass: 4,
  stiffness: 1000,
  damping: 120,
};
/**
 * Default rotation (degrees) of the trigger content for the
 * [idle, open, close] progress states. Turns a plus icon into a
 * diagonal close affordance while open.
 */
export const DEFAULT_TRIGGER_ROTATION = [0, 45, 0];
/**
 * Default overlay opacity for the [idle, open, close] progress states.
 */
export const DEFAULT_OVERLAY_OPACITY = [0, 1, 0];
/**
 * Default distance (px) an item travels from the trigger direction while
 * appearing.
 */
export const DEFAULT_ITEM_TRANSLATE_DISTANCE = 16;
/**
 * Default item scale for the [hidden, visible] states.
 */
export const DEFAULT_ITEM_SCALE = [0.9, 1];
/**
 * Default fraction of the progress range one item's appearing animation
 * occupies in staggered mode. The remaining range is distributed as
 * per-item delays, so with N items each item starts
 * `(1 - WINDOW) / (N - 1)` after the previous. Customizable via the root
 * `animation.stagger.itemWindow` config.
 */
export const DEFAULT_STAGGER_ITEM_WINDOW = 0.5;
/**
 * Lower clamp for `animation.stagger.itemWindow`. Prevents zero/negative
 * windows that would make items pop in with no animation.
 */
export const MIN_STAGGER_ITEM_WINDOW = 0.05;
/**
 * Progress midpoint between open and close phases. Used by the
 * animation-disabled branches to decide whether a snapped progress value
 * represents the open state.
 */
export const PROGRESS_OPEN_LOWER_BOUND = 0.5;
/**
 * Upper bound of the "open" band on the progress scale (values above this
 * belong to the close phase tail). Used by animation-disabled branches.
 */
export const PROGRESS_OPEN_UPPER_BOUND = 1.5;
/**
 * Default gap between the trigger and the content, in pixels.
 */
export const DEFAULT_CONTENT_OFFSET = 12;
/**
 * Default screen edge insets respected when positioning the content.
 */
export const DEFAULT_INSETS = {
  top: 12,
  bottom: 12,
  left: 12,
  right: 12,
};
