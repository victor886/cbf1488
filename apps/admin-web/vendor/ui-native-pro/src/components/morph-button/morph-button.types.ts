// @ts-nocheck
import type { PressableProps, StyleProp, ViewProps, ViewStyle } from 'react-native';
import type { SharedValue, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import type {
  Animation,
  AnimationRoot,
  AnimationValue,
  ElementSlots,
  PressableRef,
  ViewRef,
} from '../../helpers/internal/types/index.js';
import type { MorphButtonRootSlots } from './morph-button.styles.js';
/**
 * Logical direction the surface grows toward when expanding.
 * The opposite corner/edge stays pinned to the collapsed button:
 * - `"top"` / `"bottom"`: grows vertically, centered on the horizontal axis.
 * - `"start"` / `"end"`: grows horizontally (inline start/end, mirrored in
 *   RTL), centered on the vertical axis.
 * - Corner values pin the opposite corner (e.g. `"top-end"` pins the
 *   bottom-start corner).
 */
export type MorphButtonDirection =
  'top' | 'top-end' | 'end' | 'bottom-end' | 'bottom' | 'bottom-start' | 'start' | 'top-start';
/**
 * Visual variant for the MorphButton surface.
 * - `"primary"`: high-contrast inverted surface (`--color-default-foreground`)
 *   for floating buttons over app content. Pair content with
 *   `text-background`.
 * - `"secondary"`: `--color-surface-secondary` surface that reads clearly
 *   when placed on a `surface` card. Pair content with
 *   `text-surface-secondary-foreground`.
 */
export type MorphButtonVariant = 'primary' | 'secondary';
/**
 * Context value shared between MorphButton compound parts.
 * Provides open state (React and UI-thread), direction, measured content
 * sizes, and the animated surface size to all children.
 */
export interface MorphButtonContextValue {
  /** Whether the button is expanded */
  isOpen: boolean;
  /**
   * UI-thread mirror of `isOpen`. Written during render so the surface
   * morph and the content cross-fade share the same frame as the React
   * state update.
   */
  isOpenValue: SharedValue<boolean>;
  /** Logical direction the surface grows toward */
  direction: MorphButtonDirection;
  /** Visual variant applied to the surface */
  variant: MorphButtonVariant;
  /** Whether the toggle interaction is disabled */
  isDisabled: boolean;
  /** Measured natural width of the collapsed content */
  collapsedWidth: SharedValue<number>;
  /** Measured natural height of the collapsed content */
  collapsedHeight: SharedValue<number>;
  /** Measured natural width of the expanded content */
  expandedWidth: SharedValue<number>;
  /** Measured natural height of the expanded content */
  expandedHeight: SharedValue<number>;
  /** Current animated width of the morphing surface */
  surfaceWidth: SharedValue<number>;
  /** Current animated height of the morphing surface */
  surfaceHeight: SharedValue<number>;
  /** Programmatically expand the button */
  open: () => void;
  /** Programmatically collapse the button */
  close: () => void;
  /** Programmatically toggle the open state */
  toggle: () => void;
}
/**
 * Animation configuration for the MorphButton root.
 * Extends `AnimationRoot` with a spring config for the width/height morph.
 */
export type MorphButtonRootAnimation = AnimationRoot<{
  /**
   * Spring used when morphing the surface between the measured collapsed and
   * expanded sizes.
   *
   * @default `{ damping: 25, stiffness: 300, mass: 0.8, overshootClamping: false, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 }`
   */
  morphSpringConfig?: AnimationValue<WithSpringConfig>;
}>;
/**
 * Animation configuration for MorphButton content parts
 * (`MorphButton.CollapsedContent` and `MorphButton.ExpandedContent`).
 * Both value tuples read `[closed, open]`.
 */
export type MorphButtonContentAnimation = Animation<{
  /**
   * Opacity values `[closed, open]`.
   *
   * @default [1, 0] for `CollapsedContent`, [0, 1] for `ExpandedContent`
   */
  opacity?: AnimationValue<{
    value?: [number, number];
    timingConfig?: WithTimingConfig;
  }>;
  /**
   * Scale values `[closed, open]`.
   *
   * @default [1, 0.96] for `CollapsedContent`, [0.97, 1] for `ExpandedContent`
   */
  scale?: AnimationValue<{
    value?: [number, number];
    timingConfig?: WithTimingConfig;
  }>;
}>;
/**
 * Props for the MorphButton root component.
 * A pressable surface that morphs between its measured collapsed and
 * expanded content sizes, growing toward `direction` while the opposite
 * corner/edge stays pinned. The root's layout footprint always equals the
 * collapsed content, so the expanded surface overflows without shifting
 * surrounding layout.
 */
export interface MorphButtonRootProps extends Omit<PressableProps, 'children' | 'style'> {
  /**
   * Compound children, typically `MorphButton.CollapsedContent` and
   * `MorphButton.ExpandedContent`.
   */
  children?: React.ReactNode;
  /**
   * Logical direction the surface grows toward when expanding.
   *
   * @default "top"
   */
  direction?: MorphButtonDirection;
  /**
   * Visual variant controlling the surface color scheme.
   *
   * @default "primary"
   */
  variant?: MorphButtonVariant;
  /**
   * Whether the button is expanded (controlled mode).
   */
  isOpen?: boolean;
  /**
   * Default expanded state for uncontrolled mode.
   *
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Whether the toggle interaction is disabled.
   *
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Additional CSS classes for the root container (the collapsed-size
   * footprint that the consumer positions).
   */
  className?: string;
  /**
   * Additional CSS classes for individual slots.
   *
   * @note The `surface` slot has the following animated style properties that
   * cannot be set via className:
   * - `width` / `height` - Springed between the measured collapsed and
   *   expanded content sizes
   * - `top` / `start` - Computed anchor offsets pinning the surface per
   *   `direction`
   *
   * To customize the morph spring, use the `animation` prop.
   */
  classNames?: ElementSlots<MorphButtonRootSlots>;
  /**
   * Styles for individual slots.
   */
  styles?: {
    container?: ViewStyle;
    surface?: ViewStyle;
  };
  /**
   * Style for the root container. The Pressable function form is not
   * supported because the style composes into a static array with the slot
   * styles.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Animation configuration for the root component.
   * Set to `"disable-all"` to cascade animation disabling to all children.
   * Pass an object to customize the morph spring.
   */
  animation?: MorphButtonRootAnimation;
}
/**
 * Ref type for the MorphButton root component.
 */
export type MorphButtonRootRef = PressableRef;
/**
 * Props for the MorphButton.CollapsedContent component.
 * In-flow content shown while collapsed. Its natural size defines the root's
 * layout footprint and the surface's collapsed morph target.
 */
export interface MorphButtonCollapsedContentProps extends ViewProps {
  /**
   * Content to display while collapsed.
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes for the collapsed content container.
   *
   * @note The following style properties are occupied by animations and cannot be set via className:
   * - `opacity` - Animated for the collapsed/expanded cross-fade
   * - `transform` (`scale`) - Animated for the collapsed/expanded transition
   *
   * To customize, use the `animation` prop. To disable animated styles, set
   * `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Animation configuration for the cross-fade and scale transition.
   */
  animation?: MorphButtonContentAnimation;
  /**
   * When `false`, animated styles are not applied.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Ref type for the MorphButton.CollapsedContent component.
 */
export type MorphButtonCollapsedContentRef = ViewRef;
/**
 * Props for the MorphButton.ExpandedContent component.
 * Always-mounted content measured at its natural size while hidden, so the
 * expanded morph target is known before the first open (no first-open jump).
 */
export interface MorphButtonExpandedContentProps extends ViewProps {
  /**
   * Content to display while expanded.
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes for the expanded content container.
   * Set an explicit width here (e.g. `w-72`) for panel layouts; height flows
   * from the content.
   *
   * @note The following style properties are occupied by animations and cannot be set via className:
   * - `opacity` - Animated for the collapsed/expanded cross-fade
   * - `transform` (`scale`) - Animated for the collapsed/expanded transition
   *
   * To customize, use the `animation` prop. To disable animated styles, set
   * `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Animation configuration for the cross-fade and scale transition.
   */
  animation?: MorphButtonContentAnimation;
  /**
   * When `false`, animated styles are not applied.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Ref type for the MorphButton.ExpandedContent component.
 */
export type MorphButtonExpandedContentRef = ViewRef;
