import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root wrapper around the trigger. Position the FAB by passing positioning
 * classes (e.g. `absolute bottom-6 right-6`) via `className` on `FAB`.
 */
const root = tv({
  base: 'fab__root',
});
/**
 * Trigger slots: the pressable button surface (`container`) and the inner
 * wrapper (`contentContainer`) that rotates with the shared progress.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The `contentContainer` slot animates the following:
 * - `transform` (rotate) - Animated for the open/close icon rotation
 *
 * To customize, use the `animation` prop on `FAB.Trigger`:
 * ```tsx
 * <FAB.Trigger animation={{ rotate: { value: [0, 135, 0] } }} />
 * ```
 *
 * To disable animated styles, set `isAnimatedStyleActive={false}`.
 */
const trigger = tv({
  slots: {
    container: 'fab__trigger-container',
    contentContainer: 'fab__trigger-content-container',
  },
  variants: {
    isDisabled: {
      true: {
        container: 'fab__trigger-container--is-disabled',
      },
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * Portal container filling the screen above other content. Uses
 * `pointerEvents="box-none"` in the component so touches pass through to
 * the app where no FAB content is rendered.
 */
const portal = tv({
  base: 'fab__portal',
});
/**
 * Overlay backdrop behind the FAB content. The `blur` variant drops the solid
 * backdrop color so the animated blur layer rendered behind the overlay shows
 * through.
 *
 * @note ANIMATED PROPERTIES (applied to an internal wrapper around the overlay):
 * - `opacity` - Animated for the overlay show/hide transitions (idle: 0, open: 1, close: 0)
 *
 * Values set via className/style compose with the wrapper animation
 * instead of overriding it (e.g. a className `opacity` multiplies with the
 * animated one).
 *
 * To customize, use the `animation` prop on `FAB.Overlay`:
 * ```tsx
 * <FAB.Overlay animation={{ opacity: { value: [0, 0.6, 0] } }} />
 * ```
 *
 * To disable animated styles, set `isAnimatedStyleActive={false}`.
 */
const overlay = tv({
  base: 'fab__overlay',
  variants: {
    variant: {
      default: '',
      blur: 'fab__overlay--variant-blur',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
/**
 * Positioned column of FAB items. Cross-axis alignment follows the resolved
 * `align` so items hug the trigger edge.
 */
const content = tv({
  base: 'fab__content',
  variants: {
    align: {
      start: 'fab__content--align-start',
      center: 'fab__content--align-center',
      end: 'fab__content--align-end',
    },
  },
  defaultVariants: {
    align: 'end',
  },
});
/**
 * Single FAB action row.
 *
 * @note ANIMATED PROPERTIES (applied to an internal wrapper around the row):
 * - `opacity` - Animated for the item show/hide transitions
 * - `transform` (translateX/translateY, scale) - Animated for the item appearing motion
 *
 * Values set via className/style compose with the wrapper animation
 * instead of overriding it (e.g. a className `opacity` multiplies with the
 * animated one).
 *
 * To customize, use the `animation` prop on `FAB.Item`:
 * ```tsx
 * <FAB.Item animation={{ translate: { value: 24 }, scale: { value: [0.8, 1] } }} />
 * ```
 *
 * To remove the animated wrapper styles, set `isAnimatedStyleActive={false}`.
 */
const item = tv({
  base: 'fab__item',
  variants: {
    isDisabled: {
      true: 'fab__item--is-disabled',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * Item background style definition — absolute-fill container behind the
 * item content, hosting theme-specific layers (e.g. glass blur) or custom
 * content (gradients, images).
 */
const itemBackground = tv({
  base: 'fab__item-background',
});
/**
 * Text label inside a FAB item.
 */
const itemLabel = tv({
  base: 'fab__item-label',
});
export const fabClassNames = combineStyles({
  root,
  trigger,
  portal,
  overlay,
  content,
  item,
  itemBackground,
  itemLabel,
});
export const fabStyleSheet = StyleSheet.create({
  item: {
    borderCurve: 'continuous',
  },
});

export type TriggerSlots = keyof ReturnType<typeof trigger>;
