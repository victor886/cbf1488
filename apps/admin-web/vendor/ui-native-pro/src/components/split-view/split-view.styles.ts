import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const root = tv({
  base: 'split-view__root',
});
/**
 * Top pane: fixed animated height; content should scroll internally if needed.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `height` - Driven by `topSectionHeight` shared value
 */
const topSection = tv({
  base: 'split-view__top-section',
});
/**
 * Bottom pane fills remaining space below the drag area.
 */
const bottomSection = tv({
  base: 'split-view__bottom-section',
});
/**
 * Drag hit target: wide touch area above/below the visible handle.
 */
const dragArea = tv({
  base: 'split-view__drag-area',
});
/**
 * Default pill indicator.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `transform` (`scale`) - Driven by drag state
 */
const dragHandle = tv({
  base: 'split-view__drag-handle',
});
export const splitViewClassNames = combineStyles({
  root,
  topSection,
  bottomSection,
  dragArea,
  dragHandle,
});
export const splitViewStyleSheet = StyleSheet.create({
  root: {
    borderCurve: 'continuous',
  },
  dragHandle: {
    borderCurve: 'continuous',
  },
});
