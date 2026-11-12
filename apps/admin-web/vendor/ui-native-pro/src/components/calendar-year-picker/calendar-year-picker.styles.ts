import { StyleSheet } from 'react-native';
import { cn } from 'heroui-native/utils';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Pressable trigger (month + year + chevron).
 */
const trigger = tv({
  base: 'calendar-year-picker__trigger',
});
/**
 * Month + year label inside the trigger.
 */
const triggerHeading = tv({
  base: 'calendar-year-picker__trigger-heading',
});
/**
 * Chevron wrapper (animated rotation).
 */
const triggerIndicator = tv({
  base: 'calendar-year-picker__trigger-indicator',
});
/**
 * Absolutely positioned overlay over the month grid.
 */
const yearGrid = tv({
  base: 'calendar-year-picker__year-grid',
});
/**
 * Grid background style definition — absolute-fill container behind the
 * year grid content, hosting theme-specific layers (e.g. glass blur) or
 * custom content (gradients, images).
 */
const yearGridBackground = tv({
  base: 'calendar-year-picker__year-grid-background',
});
/**
 * Scroll content wrapper for the year `FlatList` (`contentContainerClassName`).
 */
const yearGridBodyContent = tv({
  base: 'calendar-year-picker__year-grid-body-content',
});
/**
 * Single year cell (pressable).
 */
/**
 * Single year cell. Vertical margins are intentionally omitted: the row
 * stride rendered by `FlatList` must equal the `cellHeight` reported from
 * `getItemLayout` for `scrollToOffset` math to land on the correct row.
 * Any vertical margin here would silently inflate the rendered row height
 * and shift the scroll target by `marginY * rowIndex` pixels.
 */
const yearCell = tv({
  base: cn(
    'calendar-year-picker__year-cell',
    'data-[pressed=true]:bg-default-hover/50',
    'data-[selected=true]:bg-accent data-[selected=true]:shadow-sm',
    'data-[current-year=true]:border data-[current-year=true]:border-border'
  ),
});
/**
 * Year label text.
 */
const yearCellLabel = tv({
  base: cn('calendar-year-picker__year-cell-label', 'data-[selected=true]:text-accent-foreground'),
});
export const calendarYearPickerClassNames = combineStyles({
  trigger,
  triggerHeading,
  triggerIndicator,
  yearGrid,
  yearGridBackground,
  yearGridBodyContent,
  yearCell,
  yearCellLabel,
});
export default calendarYearPickerClassNames;
export const calendarYearPickerStyleSheet = StyleSheet.create({
  borderCurve: {
    borderCurve: 'continuous',
  },
  flatListColumnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
