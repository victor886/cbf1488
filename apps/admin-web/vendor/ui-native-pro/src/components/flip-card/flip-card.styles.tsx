import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'flip-card__root',
});
/**
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (perspective, rotateY/rotateX, scale) - Animated for the 3D flip
 * - `backfaceVisibility` - Set to `hidden` so the face disappears mid-flip
 *
 * To customize the flip spring, use the `animation` prop on `FlipCard`:
 * ```tsx
 * <FlipCard
 *   animation={{
 *     progress: { springConfig: { stiffness: 90, damping: 14 } },
 *   }}
 * />
 * ```
 *
 * To disable animated styles, set `isAnimatedStyleActive={false}` on the face.
 */
const front = tv({
  base: 'flip-card__front',
});
/**
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (perspective, rotateY/rotateX, scale) - Animated for the 3D flip
 * - `backfaceVisibility` - Set to `hidden` so the face disappears mid-flip
 *
 * To customize the flip spring, use the `animation` prop on `FlipCard`.
 * To disable animated styles, set `isAnimatedStyleActive={false}` on the face.
 */
const back = tv({
  base: 'flip-card__back',
});
/**
 * Face background style definition — absolute-fill container behind a
 * card face's surface, hosting theme-specific layers (e.g. glass blur) or
 * custom content (gradients, images).
 */
const faceBackground = tv({
  base: 'flip-card__face-background',
});
export const flipCardClassNames = combineStyles({
  root,
  front,
  back,
  faceBackground,
});
/**
 * Native-only style sheet for properties Tailwind cannot express. The
 * `face` entry applies the iOS continuous (squircle) corner curve to both
 * card faces.
 */
export const flipCardStyleSheet = StyleSheet.create({
  face: {
    borderCurve: 'continuous',
  },
});
export default flipCardClassNames;
