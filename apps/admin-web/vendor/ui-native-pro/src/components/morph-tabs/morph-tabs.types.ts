// @ts-nocheck
import type { ReactNode } from 'react';
import type {
  PressableProps,
  StyleProp,
  TextProps,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native';
import type {
  Animation,
  AnimationRootDisableAll,
  AnimationValue,
  ElementSlots,
  PressableRef,
  TabsPagerBaseProps,
  TabsPagerContentBaseProps,
  TabsPagerMethods,
  TabsPagerRef,
  TabsPagerState,
  TabsPagerStateOptions,
  TextRef,
  ViewRef,
} from '../../helpers/internal/types/index';
import type { MorphTabsLabelSlots } from './morph-tabs.styles';
/**
 * Render-function props passed to `MorphTabs.Trigger` children.
 */
export interface MorphTabsTriggerRenderProps {
  /** Whether this trigger's page is the selected one */
  isSelected: boolean;
  /** The value identifying this trigger's page */
  value: string;
  /** Page index of this trigger (`-1` when no `MorphTabs.Content` matches) */
  index: number;
  /** Whether the trigger is disabled */
  isDisabled: boolean;
}
/**
 * Animation configuration for `MorphTabs.Trigger`.
 * The value tuple reads `[inactive, active]` and is interpolated against the
 * continuous pager position, so the pill grows with the swipe.
 */
export type MorphTabsTriggerAnimation = Animation<{
  /**
   * `flexGrow` values `[inactive, active]`. The active pill fills the
   * leftover row space; during a swipe neighbouring pills split it.
   *
   * @default [0, 1]
   */
  flexGrow?: AnimationValue<{
    value?: [number, number];
  }>;
}>;
/**
 * Animation configuration for `MorphTabs.Icon`.
 * The value tuple reads `[inactive, active]`.
 */
export type MorphTabsIconAnimation = Animation<{
  /**
   * Icon opacity values `[inactive, active]`.
   *
   * @default [0.5, 1]
   */
  opacity?: AnimationValue<{
    value?: [number, number];
  }>;
}>;
/**
 * Animation configuration for `MorphTabs.Label`.
 * The value tuple reads `[inactive, active]`.
 */
export type MorphTabsLabelAnimation = Animation<{
  /**
   * Label opacity values `[inactive, active]`.
   *
   * @default [0, 1]
   */
  opacity?: AnimationValue<{
    value?: [number, number];
  }>;
}>;
/**
 * Props for the MorphTabs root component.
 * Owns the selected value, the continuous pager position, and lazy-mount
 * bookkeeping shared by the header (`MorphTabs.List`) and the pages
 * (`MorphTabs.Pager`). `value`, `defaultValue`, `lazy`,
 * `renderLazyPlaceholder`, and `onValueChange` come from
 * {@link TabsPagerStateOptions}.
 */
export interface MorphTabsRootProps extends ViewProps, TabsPagerStateOptions {
  /**
   * Compound children, typically `MorphTabs.List` and `MorphTabs.Pager`
   * in any order (list above or below the pager).
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the root container.
   */
  className?: string;
  /**
   * Animation configuration for the root component.
   * - `"disable-all"`: disable all animations including children (cascades to
   *   all child components) and switch pages without the native slide.
   * - `undefined`: use default animations.
   */
  animation?: AnimationRootDisableAll;
}
/**
 * Imperative methods merged onto the MorphTabs root `View` ref
 * (`goTo(value, animated?)`).
 */
export type MorphTabsRootMethods = TabsPagerMethods;
/**
 * Ref type for the MorphTabs root: the root `View` plus
 * {@link MorphTabsRootMethods}.
 */
export type MorphTabsRootRef = ViewRef & MorphTabsRootMethods;
/**
 * Props for the MorphTabs.List component.
 * Horizontal header row. Hosts `MorphTabs.Trigger` pills and any other
 * content (e.g. an avatar), which keeps its natural size.
 */
export interface MorphTabsListProps extends ViewProps {
  /**
   * Header content, typically `MorphTabs.Trigger` elements.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the list row.
   */
  className?: string;
}
/**
 * Ref type for the MorphTabs.List component.
 */
export type MorphTabsListRef = ViewRef;
/**
 * Props for the MorphTabs.Trigger component.
 * A pill that morphs from icon-only to icon + label as its page comes into
 * view, and selects that page on press.
 */
export interface MorphTabsTriggerProps extends Omit<
  PressableProps,
  'children' | 'style' | 'disabled'
> {
  /**
   * Trigger content (typically `MorphTabs.Icon` + `MorphTabs.Label`), or a
   * render function receiving the trigger state.
   */
  children?: ReactNode | ((props: MorphTabsTriggerRenderProps) => ReactNode);
  /**
   * Value of the `MorphTabs.Content` page this trigger selects.
   */
  value: string;
  /**
   * Whether the trigger is disabled. A disabled page can still be reached by
   * swiping; set `swipeEnabled={false}` on `MorphTabs.Pager` to prevent that.
   *
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Additional CSS classes for the pill.
   *
   * @note The following style properties are occupied by animations and cannot be set via className:
   * - `flexGrow` - Interpolated from the pager position so the active pill
   *   fills the leftover row space
   *
   * To customize these properties, use the `animation` prop:
   * ```tsx
   * <MorphTabs.Trigger
   *   value="home"
   *   animation={{ flexGrow: { value: [0, 2] } }}
   * />
   * ```
   *
   * To disable animated styles entirely and use your own, set `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Style for the pill. The Pressable function form is not supported because
   * the style composes into a static array with the animated style.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Background layer rendered behind the pill surface.
   * - `undefined` (default): renders `MorphTabs.TriggerBackground` when the
   *   active library theme registers default background content (e.g.
   *   `glass`); otherwise no layer
   * - custom node: replaces the default layer entirely (wrap content in
   *   `MorphTabs.TriggerBackground` to keep the absolute-fill and clipping)
   * - `null`: removes the background layer
   */
  background?: ReactNode;
  /**
   * Animation configuration for the pill morph.
   * - `false` or `"disabled"`: pills snap to the selected state
   * - `true` or `undefined`: follow the pager position
   * - `object`: custom `flexGrow` values
   */
  animation?: MorphTabsTriggerAnimation;
  /**
   * When `false`, animated styles are not applied.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Ref type for the MorphTabs.Trigger component.
 */
export type MorphTabsTriggerRef = PressableRef;
/**
 * Props for the MorphTabs.TriggerBackground component.
 * Generic absolute-fill container behind a trigger pill. When no `children`
 * are given, the active library theme decides the default content (e.g. a
 * frosted-glass blur layer when the theme is `glass`).
 */
export interface MorphTabsTriggerBackgroundProps extends ViewProps {
  /**
   * Additional CSS classes for the background container.
   */
  className?: string;
}
/**
 * Ref type for the MorphTabs.TriggerBackground component.
 */
export type MorphTabsTriggerBackgroundRef = ViewRef;
/**
 * Props for the MorphTabs.Icon component.
 * Wraps the trigger's icon; stays visible in both states and brightens as
 * the page becomes active.
 */
export interface MorphTabsIconProps extends ViewProps {
  /**
   * Icon element. The icon is user-supplied and never mirrored in RTL.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the icon wrapper.
   *
   * @note The following style properties are occupied by animations and cannot be set via className:
   * - `opacity` - Interpolated from the pager position (inactive to active)
   *
   * To customize these properties, use the `animation` prop:
   * ```tsx
   * <MorphTabs.Icon animation={{ opacity: { value: [0.4, 1] } }} />
   * ```
   *
   * To disable animated styles entirely and use your own, set `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Animation configuration for the icon opacity.
   * - `false` or `"disabled"`: snap to the selected state
   * - `true` or `undefined`: follow the pager position
   * - `object`: custom opacity values
   */
  animation?: MorphTabsIconAnimation;
  /**
   * When `false`, animated styles are not applied.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Ref type for the MorphTabs.Icon component.
 */
export type MorphTabsIconRef = ViewRef;
/**
 * Props for the MorphTabs.Label component.
 * Single-line label inside a clipping container. The container shrinks to
 * zero width in a collapsed pill and the label fades in as the pill expands.
 * Its text also becomes the trigger's accessibility label.
 */
export interface MorphTabsLabelProps extends TextProps {
  /**
   * Label text.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the label text.
   */
  className?: string;
  /**
   * Additional CSS classes for individual slots.
   *
   * @note The `container` slot has the following animated style properties that cannot be set via className:
   * - `opacity` - Interpolated from the pager position (inactive to active)
   * - `maxWidth` - Grows from `0` to the measured label width, so a collapsed
   *   pill holds only the centered icon
   *
   * To customize, use the `animation` prop. To disable animated styles, set `isAnimatedStyleActive={false}`.
   */
  classNames?: ElementSlots<MorphTabsLabelSlots>;
  /**
   * Styles for individual slots.
   */
  styles?: {
    container?: ViewStyle;
    text?: TextStyle;
  };
  /**
   * Animation configuration for the label opacity.
   * - `false` or `"disabled"`: snap to the selected state
   * - `true` or `undefined`: follow the pager position
   * - `object`: custom opacity values
   */
  animation?: MorphTabsLabelAnimation;
  /**
   * When `false`, animated styles are not applied.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Ref type for the MorphTabs.Label component (the text element).
 */
export type MorphTabsLabelRef = TextRef;
/**
 * Props for the MorphTabs.Pager component.
 * Native swipeable pager (`react-native-pager-view`). Each direct
 * `MorphTabs.Content` child is one page, in order.
 */
export type MorphTabsPagerProps = TabsPagerBaseProps;
/**
 * Ref type for the MorphTabs.Pager component (the `PagerView` instance,
 * exposing `setPage` / `setPageWithoutAnimation`).
 */
export type MorphTabsPagerRef = TabsPagerRef;
/**
 * Props for the MorphTabs.Content component.
 * One page of the pager, matched against `MorphTabs.Trigger` values. Host a
 * plain `ScrollView` / `FlatList` inside for vertically scrollable content.
 */
export type MorphTabsContentProps = TabsPagerContentBaseProps;
/**
 * Ref type for the MorphTabs.Content component.
 */
export type MorphTabsContentRef = ViewRef;
/**
 * Context value shared between MorphTabs compound parts: the shared tabs
 * pager state (selected value, page values, pager position, `goTo`,
 * lazy-mount state).
 */
export type MorphTabsContextValue = TabsPagerState;
/**
 * Context value shared by a `MorphTabs.Trigger` with its `Icon` and `Label`.
 */
export interface MorphTabsTriggerContextValue {
  /** Value of the trigger's page */
  value: string;
  /** Page index of the trigger (`-1` when no page matches) */
  index: number;
  /** Whether the trigger's page is selected */
  isSelected: boolean;
  /** Whether the trigger is disabled */
  isDisabled: boolean;
}
