import { StyleSheet } from 'react-native';
import { cn } from 'heroui-native/utils';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root container for the calendar.
 *
 * @note All `data-[...]:` prefixed utilities in this file stay here: data
 * selectors are Tailwind variants and cannot be applied to custom CSS
 * classes. Plain base styles live in `styles/components/calendar.css`.
 */
const root = tv({
  base: 'calendar__root',
});
/**
 * Header row: navigation + title region.
 */
const header = tv({
  base: 'calendar__header',
});
/**
 * Month / year title text.
 */
const heading = tv({
  base: 'calendar__heading',
});
/**
 * Previous / next control.
 */
const navButton = tv({
  base: cn(
    'calendar__nav-button',
    'data-[pressed-not-disabled=true]:bg-default-hover/50',
    'data-[disabled=true]:opacity-disabled'
  ),
});
/**
 * Month grid wrapper.
 */
const grid = tv({
  base: 'data-[readonly=true]:opacity-100',
});
/**
 * Weekday header cell.
 */
const headerCell = tv({
  base: 'calendar__header-cell',
});
/**
 * Weekday label text inside `headerCell`.
 */
const headerCellLabel = tv({
  base: 'calendar__header-cell-label',
});
/**
 * Day cell.
 */
const cell = tv({
  base: cn(
    'calendar__cell',
    'data-[unavailable=true]:opacity-disabled',
    'data-[disabled=true]:opacity-disabled',
    'data-[readonly=true]:pointer-events-none'
  ),
});
/**
 * Inner body of a day cell.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The following properties are animated and cannot be overridden using Tailwind classes:
 * - `transform` (scale) - Animated for press feedback when the day cell is pressed
 *
 * To customize these properties, use the `animation` prop on `Calendar.CellBody`:
 * ```tsx
 * <Calendar.CellBody
 *   animation={{
 *     scale: {
 *       value: [1, 0.9],
 *       timingConfig: { duration: 120 },
 *     },
 *   }}
 * />
 * ```
 *
 * To completely disable animated styles and apply your own via className or style prop,
 * set `isAnimatedStyleActive={false}` on `Calendar.CellBody`.
 */
const cellBody = tv({
  base: cn(
    'calendar__cell-body',
    'data-[today=true]:bg-accent-soft',
    'data-[pressed=true]:bg-default-hover/50',
    'data-[selected=true]:bg-accent data-[selected=true]:shadow-sm'
  ),
});
/**
 * Day label.
 */
const cellLabel = tv({
  base: cn(
    'calendar__cell-label',
    'data-[today=true]:text-accent-soft-foreground',
    'data-[outside-month=true]:text-muted',
    'data-[selected=true]:text-accent-foreground'
  ),
});
/**
 * Event / dot marker under a day.
 */
const cellIndicator = tv({
  base: cn('calendar__cell-indicator', 'data-[selected=true]:bg-accent-foreground'),
});
export const calendarClassNames = combineStyles({
  root,
  header,
  heading,
  navButton,
  grid,
  headerCell,
  cell,
  cellBody,
  cellLabel,
  cellIndicator,
  headerCellLabel,
});
export default calendarClassNames;
export const calendarStyleSheet = StyleSheet.create({
  borderCurve: {
    borderCurve: 'continuous',
  },
});
