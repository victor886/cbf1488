import type { ReactNode, RefObject } from 'react';
import type { PressableProps, TextProps, ViewProps } from 'react-native';
import type { GestureType } from 'react-native-gesture-handler';
import type { SharedValue, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import type {
  Animation,
  AnimationRoot,
  AnimationValue,
  PressableRef,
  TextRef,
  ViewRef,
} from '../../helpers/internal/types/index.js';
/** Logical side whose actions are revealed by the row. */
export type SwipeableRowSide = 'start' | 'end';
/** Current open side. `null` means that the row is closed. */
export type SwipeableRowOpenSide = SwipeableRowSide | null;
/**
 * Row layout treatment.
 * - `standalone`: a rounded, elevated card, for rows spaced apart.
 * - `inline`: a square, flat row for gapless lists; its corners round to the
 *   standalone radius while it is dragged.
 */
export type SwipeableRowVariant = 'standalone' | 'inline';
/** Visual treatment for a swipe action. */
export type SwipeableRowActionVariant = 'default' | 'accent' | 'success' | 'danger';
/** Options accepted by imperative open and close methods. */
export interface SwipeableRowTransitionOptions {
  /** Whether to animate to the requested position. @default true */
  animated?: boolean;
}
/** Imperative controls exposed by the SwipeableRow root ref. */
export interface SwipeableRowImperativeMethods {
  /** Reveal the actions on a logical side. */
  open: (side: SwipeableRowSide, options?: SwipeableRowTransitionOptions) => void;
  /** Close the currently revealed actions. */
  close: (options?: SwipeableRowTransitionOptions) => void;
  /** Immediately clear the translation and gesture state. */
  reset: () => void;
}
/** Ref type combining the native root view with imperative row controls. */
export type SwipeableRowRootRef = ViewRef & SwipeableRowImperativeMethods;
/** Gesture relation accepted by the root's pan and close-tap gestures. */
export type SwipeableRowGestureRelation = GestureType | RefObject<GestureType | undefined>;
/** Animation configuration for the SwipeableRow root. */
export type SwipeableRowRootAnimation = AnimationRoot<{
  /**
   * Spring used when the row settles open or closed.
   *
   * @default `{ mass: 2, damping: 1000, stiffness: 700, overshootClamping: true }`
   */
  springConfig?: WithSpringConfig;
  /**
   * `inline` variant only: content corner radius driven by the drag
   * distance, so a square list row becomes a rounded card as it moves.
   */
  borderRadius?: AnimationValue<{
    /**
     * Radius in points at `[rest, dragged]`.
     * @default [0, the standalone card radius from the active theme]
     */
    value?: [number, number];
    /**
     * Drag distance in points over which the radius goes from rest to
     * dragged.
     * @default 32
     */
    distance?: number;
  }>;
}>;
/**
 * Animation configuration for `SwipeableRow.Action`. The action content
 * slides out from the card, zooms, and fades in as the action's own reveal
 * progress goes from `0` to `1`. That progress spans only the travel during
 * which the card uncovers this action, so actions sharing a rail animate in
 * turn, outermost first.
 */
export type SwipeableRowActionAnimation = Animation<{
  /** Content slide driven by the action's reveal progress. */
  translateX?: AnimationValue<{
    /**
     * Offset in points toward the card at `[hidden, fully revealed]`
     * progress. Logical: for end actions it moves left-to-right in LTR, and
     * it mirrors for start actions and in RTL.
     * @default [15, 0]
     */
    value?: [number, number];
  }>;
  /** Content scale driven by the action's reveal progress. */
  scale?: AnimationValue<{
    /**
     * Scale at `[hidden, fully revealed]` progress.
     * @default [0.5, 1]
     */
    value?: [number, number];
  }>;
  /** Content opacity driven by the action's reveal progress. */
  opacity?: AnimationValue<{
    /**
     * Opacity at `[hidden, fully revealed]` progress.
     * @default [0, 1]
     */
    value?: [number, number];
  }>;
  /** Subtle scale of the whole action button while it is pressed. */
  pressScale?: AnimationValue<{
    /**
     * Button scale while pressed. Use `1` to turn the press feedback off
     * while keeping the reveal animation.
     * @default 0.95
     */
    value?: number;
    /**
     * Timing of the press-in and press-out transitions.
     * @default { duration: 150 }
     */
    timingConfig?: WithTimingConfig;
  }>;
}>;
/** Public context returned by {@link useSwipeableRow}. */
export interface SwipeableRowContextValue extends SwipeableRowImperativeMethods {
  /** Current logical open side. */
  openSide: SwipeableRowOpenSide;
  /** Layout treatment of the row. */
  variant: SwipeableRowVariant;
  /** Whether row interaction is disabled. */
  isDisabled: boolean;
  /**
   * Logical horizontal translation in points. Positive reveals `start` and
   * negative reveals `end`, in both LTR and RTL.
   */
  translation: SharedValue<number>;
  /** Normalized start-actions reveal progress, clamped to `0...1`. */
  startProgress: SharedValue<number>;
  /** Normalized end-actions reveal progress, clamped to `0...1`. */
  endProgress: SharedValue<number>;
}
/** Props for the SwipeableRow root component. */
export interface SwipeableRowRootProps extends Omit<ViewProps, 'children'> {
  /**
   * Compound children, typically two `SwipeableRow.Actions` rails and one
   * `SwipeableRow.Content` part.
   */
  children?: ReactNode;
  /**
   * Controlled logical side to keep open. `null` closes the row. A side
   * without a mounted, non-empty rail keeps the row closed until one appears.
   */
  openSide?: SwipeableRowOpenSide;
  /** Initial logical side in uncontrolled mode. @default null */
  defaultOpenSide?: SwipeableRowOpenSide;
  /**
   * Layout treatment. Use `standalone` for rows spaced apart and `inline`
   * for rows stacked without gaps inside a list.
   *
   * @default 'standalone'
   */
  variant?: SwipeableRowVariant;
  /**
   * Whether swipe and action interaction is disabled. Disabling an open row
   * closes it.
   *
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Fraction of an action rail's width that must be crossed to open it.
   * Values are clamped to `0...1`.
   *
   * @default 0.5
   */
  openThreshold?: number;
  /**
   * Horizontal movement required before the pan gesture activates.
   *
   * @default 10
   */
  activationThreshold?: number;
  /**
   * Vertical movement that makes the horizontal pan gesture fail, allowing
   * a parent list to scroll.
   *
   * @default [-10, 10]
   */
  failOffsetY?: number | [number, number];
  /**
   * Ratio between finger movement and row movement. Higher values feel
   * heavier. Values below `1` are treated as `1`.
   *
   * @default 1
   */
  friction?: number;
  /**
   * Whether the content can be pulled past the action width. A side without
   * actions then rubber-bands with the same resistance instead of stopping.
   *
   * @default true
   */
  overshoot?: boolean;
  /**
   * Resistance applied after crossing an action width, or from the resting
   * position on a side without actions. Values below `1` are treated as `1`.
   *
   * @default 8
   */
  overshootFriction?: number;
  /** Whether tapping revealed content closes the row. @default true */
  closeOnContentPress?: boolean;
  /** Localized screen-reader label for revealing start actions. */
  accessibilityOpenStartActionsLabel?: string;
  /** Localized screen-reader label for revealing end actions. */
  accessibilityOpenEndActionsLabel?: string;
  /** Localized screen-reader label for closing revealed actions. */
  accessibilityCloseActionsLabel?: string;
  /** Enable two-finger trackpad swipes on supported iPadOS devices. @default false */
  enableTrackpadTwoFingerGesture?: boolean;
  /** Gesture or gestures allowed to recognize simultaneously with the row. */
  simultaneousWithExternalGesture?: SwipeableRowGestureRelation | SwipeableRowGestureRelation[];
  /** Gesture or gestures that must fail before the row can recognize. */
  requireExternalGestureToFail?: SwipeableRowGestureRelation | SwipeableRowGestureRelation[];
  /** Gesture or gestures blocked while the row gesture is active. */
  blocksExternalGesture?: SwipeableRowGestureRelation | SwipeableRowGestureRelation[];
  /**
   * Additional CSS classes for the root container.
   *
   * @note The root does not clip, so the content card can travel past the
   * row bounds while swiping. Add `overflow-hidden` to clip it at the row
   * edges instead.
   */
  className?: string;
  /** Called when the requested open side changes. */
  onOpenSideChange?: (side: SwipeableRowOpenSide) => void;
  /**
   * Animation configuration for settling the row.
   * Set to `"disable-all"` to disable this animation and cascade the setting
   * to animated descendants.
   */
  animation?: SwipeableRowRootAnimation;
}
/** Render state supplied to function children of `SwipeableRow.Actions`. */
export interface SwipeableRowActionsRenderProps {
  /** Logical side owned by this action rail. */
  side: SwipeableRowSide;
  /** Normalized reveal progress for this rail, clamped to `0...1`. */
  progress: SharedValue<number>;
  /** Logical row translation in points. */
  translation: SharedValue<number>;
  /** Whether this rail is the settled open side. */
  isOpen: boolean;
  /** Close the row. */
  close: SwipeableRowImperativeMethods['close'];
}
/** Props for the `SwipeableRow.Actions` rail. */
export interface SwipeableRowActionsProps extends Omit<
  ViewProps,
  'children' | 'pointerEvents' | 'accessibilityElementsHidden' | 'importantForAccessibility'
> {
  /** Action controls or a render function receiving live reveal values. */
  children?: ReactNode | ((props: SwipeableRowActionsRenderProps) => ReactNode);
  /** Logical edge where the rail is anchored. */
  side: SwipeableRowSide;
  /** Additional CSS classes for the action rail. */
  className?: string;
}
/**
 * Ref type for a `SwipeableRow.Actions` rail.
 *
 * @note Under a theme with a translucent card (e.g. `glass`), the action row
 * is unmounted while the card covers it, so the ref is `null` until the row
 * is uncovered.
 */
export type SwipeableRowActionsRef = ViewRef;
/** Props for the draggable `SwipeableRow.Content` card. */
export interface SwipeableRowContentProps extends Omit<
  ViewProps,
  'pointerEvents' | 'accessible' | 'accessibilityElementsHidden' | 'importantForAccessibility'
> {
  /** Row content. */
  children?: ReactNode;
  /**
   * Additional CSS classes for the content card.
   *
   * @note `transform` is owned by the swipe animation and cannot be set via
   * `className` or `style`.
   */
  className?: string;
  /**
   * Background layer rendered behind the content card.
   * - `undefined` (default): renders `SwipeableRow.ContentBackground` when
   *   the active library theme registers default background content (e.g.
   *   `glass`); otherwise no layer
   * - custom node: replaces the default layer entirely (wrap content in
   *   `SwipeableRow.ContentBackground` to keep the absolute-fill and clipping)
   * - `null`: removes the background layer
   */
  background?: ReactNode;
}
/** Ref type for `SwipeableRow.Content`. */
export type SwipeableRowContentRef = ViewRef;
/**
 * Props for the `SwipeableRow.ContentBackground` part.
 * Generic absolute-fill container behind the content card. When no
 * `children` are given, the active library theme decides the default
 * content (e.g. a frosted-glass blur layer when the theme is `glass`).
 */
export type SwipeableRowContentBackgroundProps = ViewProps & {
  /** Additional CSS classes */
  className?: string;
};
/** Ref type for `SwipeableRow.ContentBackground`. */
export type SwipeableRowContentBackgroundRef = ViewRef;
/** Props for an individual `SwipeableRow.Action`. */
export interface SwipeableRowActionProps extends Omit<PressableProps, 'children'> {
  /**
   * Action content. Plain strings and numbers are wrapped in
   * `SwipeableRow.ActionLabel` automatically.
   */
  children?: ReactNode;
  /** Visual treatment for the action. @default "default" */
  variant?: SwipeableRowActionVariant;
  /** Whether pressing the action closes the row. @default true */
  closeOnPress?: boolean;
  /** Additional CSS classes for the action button. */
  className?: string;
  /**
   * Zoom animation applied to the action content while its rail is revealed.
   * Set to `false` or `"disabled"` to keep the content static.
   */
  animation?: SwipeableRowActionAnimation;
}
/** Ref type for `SwipeableRow.Action`. */
export type SwipeableRowActionRef = PressableRef;
/** Props for `SwipeableRow.ActionLabel`. */
export interface SwipeableRowActionLabelProps extends TextProps {
  /** Label content. */
  children?: ReactNode;
  /** Additional CSS classes for the action label. */
  className?: string;
}
/** Ref type for `SwipeableRow.ActionLabel`. */
export type SwipeableRowActionLabelRef = TextRef;
