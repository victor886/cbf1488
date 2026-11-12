/**
 * Display name constants for the FlipCard compound component parts.
 *
 * Used both for `displayName` assignments and for React DevTools traces.
 */
export const DISPLAY_NAME = {
  ROOT: 'HeroUINative.FlipCard.Root',
  FRONT: 'HeroUINative.FlipCard.Front',
  BACK: 'HeroUINative.FlipCard.Back',
  FACE_BACKGROUND: 'HeroUINative.FlipCard.FaceBackground',
};
/**
 * Default spring configuration driving the flip progress. Tuned for a
 * weighty card feel with a gentle settle (no harsh overshoot).
 */
export const DEFAULT_FLIP_SPRING_CONFIG = {
  mass: 1.2,
  stiffness: 60,
  damping: 12,
};
/**
 * Perspective distance (in logical pixels) applied as the first transform
 * so the rotation reads as a 3D flip instead of a flat squash.
 */
export const FLIP_PERSPECTIVE = 1000;
/** Front face rotation range in degrees, mapped from progress [0, 1]. */
export const FRONT_ROTATION_RANGE = [0, 180];
/** Back face rotation range in degrees, mapped from progress [0, 1]. */
export const BACK_ROTATION_RANGE = [180, 360];
/**
 * Progress input range for the mid-flip scale dip. The card shrinks
 * slightly at the halfway point to sell the 3D rotation.
 */
export const FLIP_SCALE_INPUT_RANGE = [0, 0.5, 1];
/** Scale output range paired with {@link FLIP_SCALE_INPUT_RANGE}. */
export const FLIP_SCALE_OUTPUT_RANGE = [1, 0.95, 1];
/**
 * Progress threshold at which a face is considered "past" the flip.
 * Used for the snap (animation-disabled) branch of the face animation.
 */
export const FLIP_MIDPOINT = 0.5;
