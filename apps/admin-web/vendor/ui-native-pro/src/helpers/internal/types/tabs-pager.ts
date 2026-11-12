// @ts-nocheck
import type { MutableRefObject, ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import type PagerView from 'react-native-pager-view';
import type { PagerViewProps } from 'react-native-pager-view';
import type { SharedValue } from 'react-native-reanimated';
/**
 * Selection, page registration, and lazy-mount state shared by a tabs root,
 * its header parts, and its native pager (`MorphTabs`, `SwipeableTabs`).
 */
export interface TabsPagerState {
  /**
   * Selected page value. Falls back to the first page when the root value
   * is unset or does not match a page.
   */
  value: string | undefined;
  /** Page values in pager order, registered by the pager */
  values: string[];
  /** Page index of `value` (`-1` before any page registers) */
  selectedIndex: number;
  /**
   * Continuous pager position (`position + offset`) as a logical page index,
   * written on the UI thread during swipes and page animations.
   */
  progress: SharedValue<number>;
  /**
   * One-shot override of the page slide for the next programmatic page
   * change (set by `goTo(value, animated)`, consumed by the pager).
   */
  pendingAnimatedRef: MutableRefObject<boolean | undefined>;
  /** Selects the page with the given value */
  goTo: (value: string, animated?: boolean) => void;
  /** Returns the page index of a value (`-1` when unknown) */
  getIndex: (value: string) => number;
  /** Whether a page's content should render (always `true` unless `lazy`) */
  isMounted: (value: string) => boolean;
  /** Marks pages as mounted (no-op when not `lazy`) */
  mountValues: (values: string[]) => void;
  /** Registers the pager's ordered page values */
  setValues: (values: string[]) => void;
  /** Rendered in place of a lazy page's content until it mounts */
  renderLazyPlaceholder: ((value: string) => ReactNode) | undefined;
}
/**
 * Root props driving a {@link TabsPagerState}.
 */
export interface TabsPagerStateOptions {
  /**
   * Selected page value (controlled mode).
   */
  value?: string;
  /**
   * Initially selected page value (uncontrolled mode). Falls back to the
   * first page when omitted.
   */
  defaultValue?: string;
  /**
   * Whether pages mount only when first shown. The selected page, the
   * neighbours of a dragged page, and the target of a tap are always mounted;
   * visited pages stay mounted.
   *
   * @default false
   */
  lazy?: boolean;
  /**
   * Rendered in place of a lazy page's content until it mounts.
   */
  renderLazyPlaceholder?: (value: string) => ReactNode;
  /**
   * Callback fired when the selected page changes (tap, swipe, or `goTo`).
   */
  onValueChange?: (value: string) => void;
}
/**
 * Imperative methods merged onto a tabs root `View` ref.
 */
export interface TabsPagerMethods {
  /**
   * Selects the page with the given value.
   *
   * @param value - Value of the target page
   * @param animated - Whether the pager slides to the page. Defaults to the
   *   pager's `isPageAnimationEnabled`.
   */
  goTo: (value: string, animated?: boolean) => void;
}
/**
 * Public props of a tabs `Pager` part: the native swipeable pager
 * (`react-native-pager-view`). Each direct `Content` child is one page, in
 * order.
 */
export interface TabsPagerBaseProps extends Omit<
  PagerViewProps,
  | 'children'
  | 'initialPage'
  | 'layoutDirection'
  | 'scrollEnabled'
  | 'onPageScroll'
  | 'onPageSelected'
  | 'onPageScrollStateChanged'
> {
  /**
   * Pages. Only direct `Content` children with a string `value` are rendered.
   */
  children?: ReactNode;
  /**
   * Whether the user can swipe between pages.
   *
   * @default true
   */
  swipeEnabled?: boolean;
  /**
   * Whether trigger presses and `value` changes slide to the target page.
   * When `false`, the pager jumps without the native slide.
   *
   * @default true
   */
  isPageAnimationEnabled?: boolean;
  /**
   * Additional CSS classes for the pager container.
   */
  className?: string;
  /**
   * Callback fired when the user starts dragging the pager.
   */
  onSwipeStart?: () => void;
  /**
   * Callback fired when the pager settles after a drag.
   */
  onSwipeEnd?: () => void;
}
/**
 * Ref type of a tabs `Pager` part (the `PagerView` instance, exposing
 * `setPage` / `setPageWithoutAnimation`).
 */
export type TabsPagerRef = PagerView;
/**
 * Public props of a tabs `Content` part: one page of the pager. Host a plain
 * `ScrollView` / `FlatList` inside for vertically scrollable content.
 */
export interface TabsPagerContentBaseProps extends ViewProps {
  /**
   * Page content.
   */
  children?: ReactNode;
  /**
   * Value identifying this page; matched against the trigger values.
   */
  value: string;
  /**
   * Additional CSS classes for the page container.
   */
  className?: string;
}
