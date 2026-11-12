// @ts-nocheck
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
const label = tv({
  base: 'chart-crosshair__label',
});
/**
 * RN value overlay: `container` hosts animated layout; `label` styles the default label slot classes.
 *
 * {@link ChartCrosshair.Value} must be rendered under {@link ChartCrosshair.Anchor}; the container is
 * always absolutely positioned.
 *
 * @note ANIMATED PROPERTIES (cannot be set via `className` / container slot):
 * The `container` slot receives animated styles from `ChartCrosshair.Value` for:
 * - `opacity` — driven by `isActive` from anchor context
 * - Vertical edge — `placement="top"` uses animated `bottom: -measuredHeight` (+ `offset`) so the pill sits
 *   above the anchor; `placement="bottom"` uses `top: '100%'` plus `translateY` from `offset`.
 * - `transform` — `translateX` from crosshair `x`, horizontal `offset`, and optional `chartBounds`
 *   clamp (see {@link ChartCrosshairValueProps}); with `placement="bottom"`, `translateY` from vertical `offset`.
 *
 * To nudge vertical or horizontal placement without fighting the animated style, use the `offset` prop on
 * `ChartCrosshair.Value` (`{ top, bottom, left, right }`, CSS-like additive). Avoid overriding `top` /
 * `bottom` or `transform` via `classNames.container` / `styles.container` — those are owned by the
 * animated style and will be overwritten on every frame.
 */
const value = tv({
  slots: {
    container: 'chart-crosshair__value-container',
    label: 'chart-crosshair__value-label',
  },
  variants: {
    variant: {
      default: {
        container: 'chart-crosshair__value-container--variant-default',
      },
      ghost: {
        container: 'chart-crosshair__value-container--variant-ghost',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
/**
 * Value background style definition.
 * Absolute-fill container rendered behind the value pill surface, matching
 * the default variant's border radius and clipping.
 */
const valueBackground = tv({
  base: 'chart-crosshair__value-background',
});
export const chartCrosshairClassNames = combineStyles({
  value,
  valueBackground,
  label,
});
