// @ts-nocheck
import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition (with slots for the footprint container and the
 * morphing surface).
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The `surface` slot animates the following:
 * - `width` / `height` - Springed between the measured collapsed and
 *   expanded content sizes
 * - `top` / `start` - Computed anchor offsets pinning the surface per
 *   `direction`
 *
 * To customize the morph spring, use the `animation` prop on `MorphButton`.
 */
const root = tv({
  slots: {
    container: 'morph-button__root',
    surface: 'morph-button__surface',
  },
  variants: {
    variant: {
      primary: {
        surface: 'morph-button__surface--variant-primary',
      },
      secondary: {
        surface: 'morph-button__surface--variant-secondary',
      },
    },
    isDisabled: {
      true: {
        container: 'morph-button__root--is-disabled',
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'primary',
    isDisabled: false,
  },
});
/**
 * Expanded-content measuring host style definition.
 * Fixed window-sized box anchored to the surface's pinned corner; direction
 * modifiers align the content toward that corner/edge.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `top` / `start` - Computed anchor offsets following the animated surface
 *   size
 * - `width` / `height` - Fixed to the window size as a stable measuring
 *   constraint
 */
const expandedHost = tv({
  base: 'morph-button__expanded-host',
  variants: {
    direction: {
      'top': 'morph-button__expanded-host--direction-top',
      'top-end': 'morph-button__expanded-host--direction-top-end',
      'end': 'morph-button__expanded-host--direction-end',
      'bottom-end': 'morph-button__expanded-host--direction-bottom-end',
      'bottom': 'morph-button__expanded-host--direction-bottom',
      'bottom-start': 'morph-button__expanded-host--direction-bottom-start',
      'start': 'morph-button__expanded-host--direction-start',
      'top-start': 'morph-button__expanded-host--direction-top-start',
    },
  },
  defaultVariants: {
    direction: 'top',
  },
});
/**
 * CollapsedContent style definition.
 * In-flow row that defines the root footprint and the collapsed morph target.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `opacity` - Animated for the collapsed/expanded cross-fade
 * - `transform` (`scale`) - Animated for the collapsed/expanded transition
 */
const collapsedContent = tv({
  base: 'morph-button__collapsed-content',
});
/**
 * ExpandedContent style definition.
 * Always-mounted panel content measured at its natural size while hidden.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `opacity` - Animated for the collapsed/expanded cross-fade
 * - `transform` (`scale`) - Animated for the collapsed/expanded transition
 */
const expandedContent = tv({
  base: 'morph-button__expanded-content',
});
export const morphButtonClassNames = combineStyles({
  root,
  expandedHost,
  collapsedContent,
  expandedContent,
});
export const morphButtonStyleSheet = StyleSheet.create({
  surface: {
    borderCurve: 'continuous',
  },
});
