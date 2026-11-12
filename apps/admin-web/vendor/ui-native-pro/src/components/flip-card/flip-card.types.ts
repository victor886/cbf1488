import type { ReactNode } from 'react';
import type { PressableProps, ViewProps } from 'react-native';
import type { SharedValue, WithSpringConfig } from 'react-native-reanimated';
import type {
  AnimationDisabled,
  AnimationRoot,
  AnimationValue,
  PressableRef,
  ViewRef,
} from '../../helpers/internal/types';
/**
 * Axis around which the card flips.
 * - `"horizontal"`: rotates around the Y axis (left/right flip).
 * - `"vertical"`: rotates around the X axis (top/bottom flip).
 */
export type FlipCardDirection = 'horizontal' | 'vertical';
/**
 * Spin direction of the flip around the chosen axis. Follows the CSS
 * `animation-direction` naming convention.
 * - `"normal"`: rotates towards positive angles (front `0deg` to `180deg`).
 * - `"reverse"`: rotates the opposite way (front `0deg` to `-180deg`).
 */
export type FlipCardRotation = 'normal' | 'reverse';
/**
 * Identifies which face of the card an animation hook drives.
 * With `rotation="normal"` the front face rotates from `0deg` to `180deg`
 * and the back face from `180deg` to `360deg`; with `rotation="reverse"`
 * the same ranges are negated.
 */
export type FlipCardSide = 'front' | 'back';
/**
 * Animation configuration for the {@link FlipCard} root component.
 *
 * - `true` or `undefined`: use default animations.
 * - `false` or `"disabled"`: disable only root animations (flip snaps
 *   instantly; children can still animate).
 * - `"disable-all"`: disable all animations including children (cascades
 *   down via `AnimationSettingsProvider`).
 * - `object`: custom animation configuration.
 */
export type FlipCardRootAnimation = AnimationRoot<{
  /**
   * Configuration for the flip progress spring animation.
   */
  progress?: AnimationValue<{
    /**
     * Spring configuration driving the flip progress (0 = front, 1 = back).
     *
     * @default { mass: 1.2, stiffness: 60, damping: 12 }
     */
    springConfig?: WithSpringConfig;
  }>;
}>;
/**
 * Animation configuration for a {@link FlipCard} face
 * ({@link FlipCardFront} / {@link FlipCardBack}).
 *
 * - `"disabled"` or `false`: the face snaps between its resting and flipped
 *   rotation without interpolating against the shared flip progress.
 * - `undefined`: use default animations.
 */
export type FlipCardFaceAnimation = AnimationDisabled;
/**
 * Props for the {@link FlipCard.FaceBackground} sub-component.
 * Generic absolute-fill container behind a card face's surface. When no
 * `children` are given, the active library theme decides the default
 * content (e.g. a frosted-glass blur layer when the theme is `glass`).
 */
export type FlipCardFaceBackgroundProps = ViewProps & {
  /** Additional CSS classes */
  className?: string;
};
/**
 * Context value shared between {@link FlipCard} compound parts.
 */
export interface FlipCardContextValue {
  /** Whether the card currently shows its back face. */
  isFlipped: boolean;
  /** Axis around which the card flips. */
  direction: FlipCardDirection;
  /** Spin direction of the flip around the chosen axis. */
  rotation: FlipCardRotation;
  /** Toggles the flipped state (respects controlled mode). */
  toggle: () => void;
}
/**
 * Animation context value shared between {@link FlipCard} compound parts.
 * Carries the shared flip progress so faces (and custom consumers via
 * `useFlipCardAnimation`) can build progress-driven animated styles.
 */
export interface FlipCardAnimationContextValue {
  /** Animated flip progress (0 = front visible, 1 = back visible). */
  progress: SharedValue<number>;
}
/**
 * Props for the {@link FlipCard} root component.
 *
 * A pressable container that flips between a front and a back face with a
 * 3D rotation. Supports uncontrolled (`defaultFlipped`) and controlled
 * (`isFlipped` + `onFlipChange`) usage. Tapping the card toggles the flip
 * unless `isPressDisabled` is set.
 */
export interface FlipCardRootProps extends Omit<PressableProps, 'children'> {
  /**
   * Compound parts to render inside the card. Typical composition is
   * `FlipCard.Front` + `FlipCard.Back`.
   */
  children?: ReactNode;
  /**
   * Axis around which the card flips.
   *
   * @default "horizontal"
   */
  direction?: FlipCardDirection;
  /**
   * Spin direction of the flip around the chosen axis.
   * - `"normal"`: rotates towards positive angles.
   * - `"reverse"`: rotates the opposite way.
   *
   * @default "normal"
   */
  rotation?: FlipCardRotation;
  /**
   * Whether the card shows its back face (controlled mode).
   */
  isFlipped?: boolean;
  /**
   * Default flipped state for uncontrolled mode.
   *
   * @default false
   */
  defaultFlipped?: boolean;
  /**
   * When `true`, tapping the card does not toggle the flip. Use this to
   * drive the flip externally (e.g. from a button) while keeping the
   * card itself non-interactive.
   *
   * @default false
   */
  isPressDisabled?: boolean;
  /**
   * Additional CSS classes for the root container.
   */
  className?: string;
  /**
   * Callback fired when the flipped state changes.
   */
  onFlipChange?: (isFlipped: boolean) => void;
  /**
   * Animation configuration for the flip.
   * - `true` or `undefined`: use default animations.
   * - `false` or `"disabled"`: flip snaps instantly (children can still animate).
   * - `"disable-all"`: disable all animations including children (cascades down).
   * - `object`: pass `progress.springConfig` to customize the flip spring.
   */
  animation?: FlipCardRootAnimation;
}
/**
 * Imperative ref type for the {@link FlipCard} root element.
 */
export type FlipCardRootRef = PressableRef;
/**
 * Props for the {@link FlipCardFront} compound part.
 *
 * The face visible at rest (progress 0). Rotates from `0deg` to `180deg`
 * as the card flips and hides via `backfaceVisibility` once past the
 * flip midpoint. Hit testing is disabled (`pointerEvents="none"`) while
 * the card is flipped so the hidden face cannot intercept touches.
 */
export interface FlipCardFrontProps extends ViewProps {
  /** Content rendered on the front face. */
  children?: ReactNode;
  /**
   * Additional CSS classes for the front face.
   *
   * @note The following style properties are occupied by animations and cannot be set via className:
   * - `transform` (perspective, rotateY/rotateX, scale) - Animated for the 3D flip
   * - `backfaceVisibility` - Set to `hidden` so the face disappears mid-flip
   *
   * To customize the flip spring, use the `animation` prop on `FlipCard`.
   * To disable animated styles entirely and use your own, set `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Animation configuration for the front face.
   * - `"disabled"` or `false`: the face snaps between rotations.
   * - `undefined`: use default animations.
   */
  animation?: FlipCardFaceAnimation;
  /**
   * Whether animated styles (react-native-reanimated) are active.
   * When `false`, the animated flip transform is removed from the face.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
  /**
   * Background layer rendered behind the face surface.
   * - `undefined` (default): renders `FlipCard.FaceBackground` when the
   *   active library theme registers default background content (e.g.
   *   `glass`); otherwise no layer
   * - custom node: replaces the default layer entirely (wrap content in
   *   `FlipCard.FaceBackground` to keep the absolute-fill and clipping)
   * - `null`: removes the background layer
   */
  background?: ReactNode;
}
/**
 * Imperative ref type for the {@link FlipCardFront} element.
 */
export type FlipCardFrontRef = ViewRef;
/**
 * Props for the {@link FlipCardBack} compound part.
 *
 * The face revealed when the card is flipped (progress 1). Positioned
 * absolutely over the front face and rotates from `180deg` to `360deg`
 * as the card flips. Hit testing is disabled (`pointerEvents="none"`)
 * while the front is visible so hidden interactive content (e.g. a
 * button on the back) cannot intercept touches through the overlay.
 */
export interface FlipCardBackProps extends ViewProps {
  /** Content rendered on the back face. */
  children?: ReactNode;
  /**
   * Additional CSS classes for the back face.
   *
   * @note The following style properties are occupied by animations and cannot be set via className:
   * - `transform` (perspective, rotateY/rotateX, scale) - Animated for the 3D flip
   * - `backfaceVisibility` - Set to `hidden` so the face disappears mid-flip
   *
   * To customize the flip spring, use the `animation` prop on `FlipCard`.
   * To disable animated styles entirely and use your own, set `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Animation configuration for the back face.
   * - `"disabled"` or `false`: the face snaps between rotations.
   * - `undefined`: use default animations.
   */
  animation?: FlipCardFaceAnimation;
  /**
   * Whether animated styles (react-native-reanimated) are active.
   * When `false`, the animated flip transform is removed from the face.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
  /**
   * Background layer rendered behind the face surface.
   * - `undefined` (default): renders `FlipCard.FaceBackground` when the
   *   active library theme registers default background content (e.g.
   *   `glass`); otherwise no layer
   * - custom node: replaces the default layer entirely (wrap content in
   *   `FlipCard.FaceBackground` to keep the absolute-fill and clipping)
   * - `null`: removes the background layer
   */
  background?: ReactNode;
}
/**
 * Imperative ref type for the {@link FlipCardBack} element.
 */
export type FlipCardBackRef = ViewRef;
