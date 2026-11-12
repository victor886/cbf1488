import type { ReactNode } from 'react';
import type { TextProps, ViewProps, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type {
  Animation,
  AnimationRoot,
  AnimationValue,
  ElementSlots,
  PopupOverlayBlurViewProps,
  PopupOverlayVariant,
  PressableRef,
  SpringAnimationConfig,
  TextRef,
  TimingAnimationConfig,
} from '../../helpers/internal/types';
import type * as FABPrimitivesTypes from '../../primitives/fab/fab.types';
import type { TriggerSlots } from './fab.styles';
/**
 * Side of the trigger on which the FAB content is rendered.
 */
export type FABPlacement = FABPrimitivesTypes.Placement;
/**
 * Alignment of the FAB content along the axis perpendicular to the placement.
 */
export type FABAlign = FABPrimitivesTypes.Align;
/**
 * Placement prop value accepted by the FAB root. `"auto"` resolves the
 * placement from the trigger position on screen: a trigger in the bottom
 * half of the screen opens upwards, a trigger in the top half opens
 * downwards.
 */
export type FABAutoPlacement = FABPrimitivesTypes.AutoPlacement;
/**
 * Align prop value accepted by the FAB root. `"auto"` resolves the alignment
 * from the trigger position on screen: e.g. a trigger near the right screen
 * edge aligns content to its end, a centered trigger aligns to center.
 */
export type FABAutoAlign = FABPrimitivesTypes.AutoAlign;
/**
 * Appearing mode for the FAB items.
 * - `"staggered"`: items appear one after another, starting from the item
 *   nearest to the trigger; the order is reversed on close.
 * - `"normal"`: all items appear and disappear together.
 */
export type FABItemsAppearance = 'normal' | 'staggered';
/**
 * Animation configuration for the {@link FAB} root component.
 *
 * - `true` or `undefined`: use default animations.
 * - `false` or `"disabled"`: disable only root animations (open/close snaps
 *   instantly; children can still animate).
 * - `"disable-all"`: disable all animations including children (cascades
 *   down via `AnimationSettingsProvider`).
 * - `object`: custom animation configuration.
 */
export type FABRootAnimation = AnimationRoot<{
  /**
   * Animation driving the shared open/close progress
   * (0 = idle, 1 = open, 2 = close).
   * - `type`: `"spring"` or `"timing"` driver.
   * - `config`: `WithSpringConfig` when `type` is `"spring"` (replaces the
   *   default spring config), `WithTimingConfig` when `type` is `"timing"`
   *   (Reanimated timing defaults when omitted).
   *
   * @default { type: "spring", config: { mass: 3, stiffness: 1200, damping: 90 } }
   */
  progress?: AnimationValue<SpringAnimationConfig | TimingAnimationConfig>;
  /**
   * Configuration for the item stagger. Only takes effect when
   * `itemsAppearance` is `"staggered"`.
   */
  stagger?: AnimationValue<{
    /**
     * Fraction of the progress range each item's appearing animation
     * occupies, clamped to `(0, 1]`. The remaining range is distributed as
     * per-item delays: with N items each item starts
     * `(1 - itemWindow) / (N - 1)` after the previous one. Smaller values
     * produce a more pronounced, sequential stagger; `1` makes all items
     * animate together (equivalent to `itemsAppearance="normal"`).
     *
     * @default 0.5
     */
    itemWindow?: number;
  }>;
}>;
/**
 * Animation configuration for the {@link FAB.Trigger} compound part.
 *
 * - `true` or `undefined`: use default animations.
 * - `false` or `"disabled"`: the trigger content snaps between rotations.
 * - `object`: custom animation configuration.
 */
export type FABTriggerAnimation = Animation<{
  /**
   * Rotation of the trigger content, in degrees, driven by the shared
   * progress.
   */
  rotate?: AnimationValue<{
    /**
     * Rotation values (degrees) for the [idle, open, close] progress states.
     *
     * @default [0, 45, 0]
     */
    value?: [number, number, number];
  }>;
}>;
/**
 * Animation configuration for the {@link FAB.Overlay} compound part.
 *
 * - `true` or `undefined`: use default animations.
 * - `false` or `"disabled"`: the overlay opacity snaps between states.
 * - `object`: custom animation configuration.
 */
export type FABOverlayAnimation = Animation<{
  /**
   * Opacity of the overlay, driven by the shared progress.
   */
  opacity?: AnimationValue<{
    /**
     * Opacity values for the [idle, open, close] progress states.
     *
     * @default [0, 1, 0]
     */
    value?: [number, number, number];
  }>;
}>;
/**
 * Animation configuration for a {@link FAB.Item} compound part.
 *
 * - `true` or `undefined`: use default animations.
 * - `false` or `"disabled"`: the item snaps between hidden and visible.
 * - `object`: custom animation configuration.
 */
export type FABItemAnimation = Animation<{
  /**
   * Translation of the item towards the trigger while hidden.
   */
  translate?: AnimationValue<{
    /**
     * Distance in pixels the item travels from the trigger direction while
     * appearing.
     *
     * @default 16
     */
    value?: number;
  }>;
  /**
   * Scale of the item while appearing.
   */
  scale?: AnimationValue<{
    /**
     * Scale values for the [hidden, visible] states.
     *
     * @default [0.9, 1]
     */
    value?: [number, number];
  }>;
}>;
/**
 * Context value shared between {@link FAB} compound parts.
 */
export interface FABContextValue {
  /** Appearing mode for the FAB items. */
  itemsAppearance: FABItemsAppearance;
  /**
   * Fraction of the progress range each item's appearing animation occupies
   * in staggered mode (from the root `animation.stagger.itemWindow` config,
   * clamped to `(0, 1]`).
   */
  staggerItemWindow: number;
  /**
   * Whether the portaled content should stay mounted. Stays `true` while
   * the close animation plays, then flips to `false` to unmount.
   */
  isVisible: boolean;
}
/**
 * Animation context value shared between {@link FAB} compound parts.
 * Carries the shared open/close progress so parts (and custom consumers via
 * `useFABAnimation`, e.g. a blur backdrop) can build progress-driven
 * animated styles.
 */
export interface FABAnimationContextValue {
  /**
   * Animated open/close progress (0 = idle/closed, 1 = open, 2 = close
   * animation target; resets to 0 once the close animation completes).
   */
  progress: SharedValue<number>;
}
/**
 * Context value provided by {@link FAB.Content} to each of its children so
 * {@link FAB.Item} parts can compute their staggered animation window.
 */
export interface FABItemIndexContextValue {
  /** Zero-based index of the item within the content. */
  index: number;
  /** Total number of children rendered by the content. */
  total: number;
}
/**
 * Return type of the {@link useFAB} hook (the FAB root context).
 */
export type UseFABReturn = FABPrimitivesTypes.IRootContext;
/**
 * Return type of the {@link useFABAnimation} hook.
 */
export type UseFABAnimationReturn = FABAnimationContextValue;
/**
 * Props for the {@link FAB} root component.
 *
 * Owns the open state, resolves the content placement/alignment (manually or
 * automatically from the trigger position on screen), and drives the shared
 * open/close progress used to orchestrate the overlay, items, and trigger.
 */
export interface FABRootProps extends FABPrimitivesTypes.RootProps {
  /**
   * Compound parts to render. Typical composition is `FAB.Trigger` +
   * `FAB.Portal` (containing `FAB.Overlay` and `FAB.Content`).
   */
  children?: ReactNode;
  /**
   * Appearing mode for the FAB items.
   *
   * @default "staggered"
   */
  itemsAppearance?: FABItemsAppearance;
  /**
   * Additional CSS classes for the root container.
   */
  className?: string;
  /**
   * Animation configuration for the open/close progress.
   * - `true` or `undefined`: use default animations.
   * - `false` or `"disabled"`: open/close snaps instantly (children can still animate).
   * - `"disable-all"`: disable all animations including children (cascades down).
   * - `object`: pass `progress` (`type` + `config`) to customize the
   *   progress driver and `stagger.itemWindow` to tune the item stagger.
   */
  animation?: FABRootAnimation;
}
/**
 * Imperative ref type for the {@link FAB} root element.
 */
export type FABRootRef = FABPrimitivesTypes.RootRef;
/**
 * Props for the {@link FAB.Trigger} compound part.
 *
 * The floating action button itself. Toggles the open state on press and
 * measures its own position so auto placement can resolve.
 */
export interface FABTriggerProps extends FABPrimitivesTypes.TriggerProps {
  /** Content rendered inside the trigger (typically an icon). */
  children?: ReactNode;
  /**
   * Additional CSS classes for the trigger container.
   */
  className?: string;
  /**
   * Additional CSS classes for the trigger slots.
   *
   * @note The `contentContainer` slot has the following animated style
   * properties that cannot be set via className:
   * - `transform` (rotate) - Animated for the open/close icon rotation
   *
   * To customize, use the `animation` prop. To disable animated styles,
   * set `isAnimatedStyleActive={false}`.
   */
  classNames?: ElementSlots<TriggerSlots>;
  /**
   * Additional styles for the trigger slots.
   */
  styles?: Partial<Record<TriggerSlots, ViewStyle>>;
  /**
   * Animation configuration for the trigger content rotation.
   * - `true` or `undefined`: use default animations.
   * - `false` or `"disabled"`: the content snaps between rotations.
   * - `object`: pass `rotate.value` to customize the rotation.
   */
  animation?: FABTriggerAnimation;
  /**
   * When `false`, animated styles are not applied.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Imperative ref type for the {@link FAB.Trigger} element.
 * Exposes `open()` and `close()` for programmatic control.
 */
export type FABTriggerRef = FABPrimitivesTypes.TriggerRef;
/**
 * Props for the {@link FAB.Portal} compound part.
 *
 * Renders the overlay and content in a portal layer above other content and
 * re-provides the FAB contexts so portaled descendants can consume them.
 * Content stays mounted while the close animation plays.
 */
export interface FABPortalProps extends FABPrimitivesTypes.PortalProps {
  /**
   * When true, uses a regular View instead of FullWindowOverlay on iOS.
   * Enables element inspector but overlay content won't appear above native modals.
   *
   * @default false
   */
  disableFullWindowOverlay?: boolean;
  /**
   * Controls whether VoiceOver treats the overlay window as a modal container.
   * When `false`, VoiceOver can still access elements behind the overlay.
   *
   * @default false
   * @platform ios
   */
  unstable_accessibilityContainerViewIsModal?: boolean;
  /**
   * Additional CSS classes for the portal container.
   */
  className?: string;
}
/**
 * Visual variant of the {@link FAB.Overlay} compound part.
 */
export type FABOverlayVariant = PopupOverlayVariant;
/**
 * Props forwarded to the BlurView rendered by the `blur` overlay variant.
 */
export type FABOverlayBlurViewProps = PopupOverlayBlurViewProps;
/**
 * Props for the {@link FAB.Overlay} compound part.
 *
 * Backdrop behind the FAB content. Its opacity is driven by the shared
 * progress; pressing it closes the FAB by default.
 */
export interface FABOverlayProps extends Omit<FABPrimitivesTypes.OverlayProps, 'asChild'> {
  /**
   * Additional CSS classes for the overlay.
   *
   * @note `opacity` is animated for the overlay show/hide transitions
   * (idle: 0, open: 1, close: 0) on an internal wrapper around the overlay;
   * className/style values compose with it instead of overriding it.
   *
   * To customize, use the `animation` prop. To remove the animated wrapper
   * styles, set `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Animation configuration for the overlay opacity.
   * - `true` or `undefined`: use default animations.
   * - `false` or `"disabled"`: the opacity snaps between states.
   * - `object`: pass `opacity.value` to customize the opacity range.
   */
  animation?: FABOverlayAnimation;
  /**
   * When `false`, animated styles are not applied.
   *
   * @default true for the `default` variant, false for the `blur` variant
   * (the animated blur intensity replaces the opacity animation)
   */
  isAnimatedStyleActive?: boolean;
  /**
   * Visual variant of the overlay.
   * - `default`: solid backdrop colored by the `--color-backdrop` token
   * - `blur`: blur backdrop (iOS only, requires expo-blur; falls back to
   *   `default` otherwise)
   *
   * @default 'blur' when the library theme is `glass`, otherwise 'default'
   */
  variant?: FABOverlayVariant;
  /**
   * Props forwarded to the BlurView rendered by the `blur` variant.
   * `intensity` is treated as the maximum (animated) blur intensity.
   */
  blurViewProps?: FABOverlayBlurViewProps;
}
/**
 * Imperative ref type for the {@link FAB.Overlay} element.
 */
export type FABOverlayRef = FABPrimitivesTypes.OverlayRef;
/**
 * Props for the {@link FAB.Content} compound part.
 *
 * Positioned container for the FAB items. Placement and alignment come from
 * the root (resolved automatically by default); the content also provides
 * each child its index so items can stagger.
 */
export interface FABContentProps extends FABPrimitivesTypes.ContentProps {
  /** Items to render, typically `FAB.Item` parts. */
  children?: ReactNode;
  /**
   * Additional CSS classes for the content container.
   */
  className?: string;
}
/**
 * Imperative ref type for the {@link FAB.Content} element.
 */
export type FABContentRef = FABPrimitivesTypes.ContentRef;
/**
 * Props for the {@link FAB.Item} compound part.
 *
 * A single action row. Appears/disappears with the shared progress
 * (staggered by default) and closes the FAB on press unless `closeOnPress`
 * is set to `false`. String children are automatically wrapped in
 * `FAB.ItemLabel`.
 */
export interface FABItemProps extends Omit<FABPrimitivesTypes.ItemProps, 'asChild'> {
  /**
   * Item content. Plain strings/numbers are wrapped in `FAB.ItemLabel`
   * automatically; pass elements (e.g. an icon + `FAB.ItemLabel`) for
   * custom layouts.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the item container.
   *
   * @note `opacity` and `transform` (translateX/translateY, scale) are
   * animated for the item appearing motion on an internal wrapper around
   * the row; className/style values compose with it instead of overriding it.
   *
   * To customize, use the `animation` prop. To remove the animated wrapper
   * styles, set `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Background layer rendered behind the item content.
   * - `undefined` (default): renders `FAB.ItemBackground` when the active
   *   library theme registers default background content (e.g. `glass`);
   *   otherwise no layer
   * - custom node: replaces the default layer entirely (wrap content in
   *   `FAB.ItemBackground` to keep the absolute-fill and clipping)
   * - `null`: removes the background layer
   */
  background?: ReactNode;
  /**
   * Animation configuration for the item appearing motion.
   * - `true` or `undefined`: use default animations.
   * - `false` or `"disabled"`: the item snaps between hidden and visible.
   * - `object`: pass `translate.value` / `scale.value` to customize the motion.
   */
  animation?: FABItemAnimation;
  /**
   * When `false`, animated styles are not applied.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Imperative ref type for the {@link FAB.Item} element.
 */
export type FABItemRef = PressableRef;
/**
 * Props for the {@link FAB.ItemBackground} compound part.
 * Generic absolute-fill container behind the item content. When no
 * `children` are given, the active library theme decides the default
 * content (e.g. a frosted-glass blur layer when the theme is `glass`).
 */
export type FABItemBackgroundProps = ViewProps & {
  /** Additional CSS classes */
  className?: string;
};
/**
 * Props for the {@link FAB.ItemLabel} compound part.
 */
export interface FABItemLabelProps extends TextProps {
  /** Label text. */
  children?: ReactNode;
  /**
   * Additional CSS classes for the label.
   */
  className?: string;
}
/**
 * Imperative ref type for the {@link FAB.ItemLabel} element.
 */
export type FABItemLabelRef = TextRef;
