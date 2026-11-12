// @ts-nocheck
import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import type {
  TabsLabelProps,
  TabsListBackgroundProps,
  TabsListProps,
  TabsScrollViewProps,
  TabsSeparatorProps,
  TabsTriggerProps,
  TabsTriggerRenderProps,
} from 'heroui-native';
import type {
  AnimationDisabled,
  AnimationRootDisableAll,
  TabsPagerBaseProps,
  TabsPagerContentBaseProps,
  TabsPagerMethods,
  TabsPagerRef,
  TabsPagerState,
  TabsPagerStateOptions,
  ViewRef,
} from '../../helpers/internal/types/index';
/**
 * Visual variant of the tab list, forwarded to heroui-native `Tabs`.
 * - `"primary"`: segmented pill list with a raised indicator.
 * - `"secondary"`: underlined list with a bottom-border indicator.
 */
export type SwipeableTabsVariant = 'primary' | 'secondary';
/**
 * Props for the SwipeableTabs root component.
 * Owns the selected value, the continuous pager position, and lazy-mount
 * bookkeeping, and renders heroui-native `Tabs` for the list parts.
 * `value`, `defaultValue`, `lazy`, `renderLazyPlaceholder`, and
 * `onValueChange` come from {@link TabsPagerStateOptions}.
 */
export interface SwipeableTabsRootProps extends ViewProps, TabsPagerStateOptions {
  /**
   * Compound children, typically `SwipeableTabs.List` and
   * `SwipeableTabs.Pager` in any order.
   */
  children?: ReactNode;
  /**
   * Visual variant of the tab list.
   *
   * @default "primary"
   */
  variant?: SwipeableTabsVariant;
  /**
   * Additional CSS classes for the root container.
   */
  className?: string;
  /**
   * Animation configuration for the root component.
   * - `"disable-all"`: disable all animations including children (cascades to
   *   all child components, including the heroui-native list parts) and
   *   switch pages without the native slide.
   * - `undefined`: use default animations.
   */
  animation?: AnimationRootDisableAll;
}
/**
 * Imperative methods merged onto the SwipeableTabs root `View` ref
 * (`goTo(value, animated?)`).
 */
export type SwipeableTabsRootMethods = TabsPagerMethods;
/**
 * Ref type for the SwipeableTabs root: the root `View` plus
 * {@link SwipeableTabsRootMethods}.
 */
export type SwipeableTabsRootRef = ViewRef & SwipeableTabsRootMethods;
/**
 * Props for `SwipeableTabs.List` (heroui-native `Tabs.List`).
 */
export type SwipeableTabsListProps = TabsListProps;
/**
 * Props for `SwipeableTabs.ListBackground` (heroui-native
 * `Tabs.ListBackground`).
 */
export type SwipeableTabsListBackgroundProps = TabsListBackgroundProps;
/**
 * Props for `SwipeableTabs.ScrollView` (heroui-native `Tabs.ScrollView`).
 */
export type SwipeableTabsScrollViewProps = TabsScrollViewProps;
/**
 * Props for `SwipeableTabs.Trigger` (heroui-native `Tabs.Trigger`).
 */
export type SwipeableTabsTriggerProps = TabsTriggerProps;
/**
 * Render-function props for `SwipeableTabs.Trigger` children.
 */
export type SwipeableTabsTriggerRenderProps = TabsTriggerRenderProps;
/**
 * Props for `SwipeableTabs.Label` (heroui-native `Tabs.Label`).
 */
export type SwipeableTabsLabelProps = TabsLabelProps;
/**
 * Props for `SwipeableTabs.Separator` (heroui-native `Tabs.Separator`).
 */
export type SwipeableTabsSeparatorProps = TabsSeparatorProps;
/**
 * Animation configuration for `SwipeableTabs.Indicator`.
 * - `false` or `"disabled"`: the indicator snaps to the selected trigger
 *   instead of following the swipe.
 */
export type SwipeableTabsIndicatorAnimation = AnimationDisabled;
/**
 * Props for the SwipeableTabs.Indicator component.
 * Highlight behind (primary) or under (secondary) the triggers. Its position
 * and size are interpolated between the measured triggers from the
 * continuous pager position, so it follows the swipe frame by frame.
 */
export interface SwipeableTabsIndicatorProps extends ViewProps {
  /**
   * Optional content rendered inside the indicator.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the indicator.
   *
   * @note The following style properties are occupied by animations and cannot be set via className:
   * - `width` - Interpolated between the measured widths of the triggers on
   *   either side of the pager position
   * - `height` - Interpolated between the measured trigger heights
   * - `transform` (`translateX`) - Interpolated between the measured trigger
   *   offsets
   * - `opacity` - `0` until the triggers have been measured, `1` afterwards
   *
   * To stop following the swipe, pass `animation="disabled"`. To disable
   * animated styles entirely and use your own, set `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Animation configuration for the indicator.
   * - `false` or `"disabled"`: snap to the selected trigger
   * - `true` or `undefined`: follow the pager position
   */
  animation?: SwipeableTabsIndicatorAnimation;
  /**
   * When `false`, animated styles are not applied.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Ref type for the SwipeableTabs.Indicator component.
 */
export type SwipeableTabsIndicatorRef = ViewRef;
/**
 * Props for the SwipeableTabs.Pager component.
 * Native swipeable pager (`react-native-pager-view`). Each direct
 * `SwipeableTabs.Content` child is one page, in order.
 */
export type SwipeableTabsPagerProps = TabsPagerBaseProps;
/**
 * Ref type for the SwipeableTabs.Pager component (the `PagerView` instance,
 * exposing `setPage` / `setPageWithoutAnimation`).
 */
export type SwipeableTabsPagerRef = TabsPagerRef;
/**
 * Props for the SwipeableTabs.Content component.
 * One page of the pager, matched against `SwipeableTabs.Trigger` values.
 * Host a plain `ScrollView` / `FlatList` inside for vertically scrollable
 * content.
 */
export type SwipeableTabsContentProps = TabsPagerContentBaseProps;
/**
 * Ref type for the SwipeableTabs.Content component.
 */
export type SwipeableTabsContentRef = ViewRef;
/**
 * Context value shared between SwipeableTabs parts: the shared tabs pager
 * state (selected value, page values, pager position, `goTo`, lazy-mount
 * state).
 */
export type SwipeableTabsContextValue = TabsPagerState;
