import type { ReactNode } from 'react';
import type { FlatListProps, PressableProps, TextProps, ViewProps } from 'react-native';
import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import type { Animation, AnimationValue } from '../../helpers/internal/types';
/**
 * Bounds of the month grid within the calendar root, used to position the year overlay.
 */
export interface YearPickerGridBounds {
  /**
   * Distance from the top of the calendar root to the top of the grid.
   */
  top: number;
  /**
   * Height of the grid area.
   */
  height: number;
}
/**
 * Context: year picker open state, grid layout, and setter for grid bounds from `Calendar.Grid`.
 */
export interface YearPickerContextValue {
  isYearPickerOpen: boolean;
  setIsYearPickerOpen: (open: boolean) => void;
  /**
   * Last measured layout of `Calendar.Grid` relative to the calendar root.
   */
  gridBounds: YearPickerGridBounds | null;
  /**
   * Called from styled `Calendar.Grid` / `RangeCalendar.Grid` `onLayout`.
   */
  setGridBounds: (bounds: YearPickerGridBounds | null) => void;
}
/**
 * Render props for the year picker trigger (heading + indicator).
 */
export interface YearPickerTriggerRenderProps {
  isOpen: boolean;
  monthYear: string;
  toggle: () => void;
}
/**
 * Animation config for the year picker trigger chevron rotation.
 */
export type YearPickerIndicatorAnimation = Animation<{
  /**
   * Rotation from closed to open in degrees `[closedDeg, openDeg]`.
   *
   * @default [0, 90]
   */
  rotation?: AnimationValue<{
    value?: [number, number];
    /**
     * @default INDICATOR_SPRING_CONFIG
     */
    springConfig?: WithSpringConfig;
  }>;
}>;
/**
 * Animation config for the year picker overlay opacity.
 */
export type YearPickerGridAnimation = Animation<{
  /**
   * Opacity when closed vs open.
   *
   * @default [0, 1]
   */
  opacity?: AnimationValue<{
    value?: [number, number];
    /**
     * @default { duration: 200 }
     */
    timingConfig?: WithTimingConfig;
  }>;
}>;
/**
 * Props for `CalendarYearPicker.Trigger` / `Calendar.YearPickerTrigger`.
 */
export interface YearPickerTriggerProps extends Omit<PressableProps, 'children'> {
  children?: ReactNode | ((values: YearPickerTriggerRenderProps) => ReactNode);
}
/**
 * Props for `CalendarYearPicker.TriggerHeading`.
 */
export interface YearPickerTriggerHeadingProps extends Omit<TextProps, 'children'> {
  children?: ReactNode | ((values: YearPickerTriggerRenderProps) => ReactNode);
}
/**
 * Props for `CalendarYearPicker.TriggerIndicator`.
 */
export interface YearPickerTriggerIndicatorProps extends Omit<ViewProps, 'children'> {
  children?: ReactNode | ((values: YearPickerTriggerRenderProps) => ReactNode);
  /**
   * Overrides for the default chevron (`size`, `color`).
   */
  iconProps?: {
    size?: number;
    color?: string;
  };
  /**
   * Rotation animation; accordion-style spring.
   */
  animation?: YearPickerIndicatorAnimation;
  /**
   * When `false`, animated rotation is skipped and `style` applies directly.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Render props for each year cell (from `GridBody` or `Cell`).
 */
export interface YearPickerCellRenderProps {
  year: number;
  formattedYear: string;
  isSelected: boolean;
  isCurrentYear: boolean;
  isOpen: boolean;
  selectYear: () => void;
}
/**
 * Props for `CalendarYearPicker.Grid` / `Calendar.YearPickerGrid`.
 */
export interface YearPickerGridProps extends ViewProps {
  /**
   * Opacity animation for open/close.
   */
  animation?: YearPickerGridAnimation;
  /**
   * Background layer rendered behind the year grid content.
   * - `undefined` (default): renders the grid background container when the
   *   active library theme registers default background content (e.g.
   *   `glass`); otherwise no layer
   * - custom node: replaces the default layer entirely
   * - `null`: removes the background layer
   */
  background?: ReactNode;
  /**
   * When `false`, animated opacity is skipped.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Props for the year grid background — generic absolute-fill container
 * behind the year grid content. When no `children` are given, the active
 * library theme decides the default content (e.g. a frosted-glass blur
 * layer when the theme is `glass`).
 */
export type YearPickerGridBackgroundProps = ViewProps & {
  /** Additional CSS classes */
  className?: string;
};
/**
 * Props for `CalendarYearPicker.GridBody` / `Calendar.YearPickerGridBody`.
 *
 * Extends `FlatList` props except fields controlled by the year grid (`data`,
 * `renderItem`, `keyExtractor`, `numColumns`, `columnWrapperStyle`) and
 * `children` (used for per-year render props instead of list children).
 */
export interface YearPickerGridBodyProps extends Omit<
  FlatListProps<number>,
  | 'children'
  | 'columnWrapperStyle'
  | 'data'
  | 'getItemLayout'
  | 'keyExtractor'
  | 'numColumns'
  | 'renderItem'
> {
  children?: (values: YearPickerCellRenderProps) => ReactNode;
  /**
   * Fixed height (in pixels) applied to each year cell. Used both for
   * `FlatList.getItemLayout` (to make virtualization + initial scroll offset
   * exact) and as an inline `height` on the default cell.
   *
   * @default {@link DEFAULT_YEAR_CELL_HEIGHT}
   */
  cellHeight?: number;
}
/**
 * Props for `CalendarYearPicker.Cell` / `Calendar.YearPickerCell`.
 */
export interface YearPickerCellProps extends Omit<PressableProps, 'children'> {
  year: number;
  /**
   * Passed from `GridBody` so cells do not subscribe to focused year in context (memo-friendly).
   */
  isSelected: boolean;
  children?: ReactNode | ((values: YearPickerCellRenderProps) => ReactNode);
}
/**
 * Internal trigger context for heading/indicator subcomponents.
 */
export interface YearPickerTriggerContextValue extends YearPickerTriggerRenderProps {
  monthYear: string;
}
