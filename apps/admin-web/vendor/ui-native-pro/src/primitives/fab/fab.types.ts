import type { LayoutRectangle } from 'react-native';
import type { LayoutPosition } from '../../helpers/internal/hooks';
import type {
  ForceMountable,
  Insets,
  PressableRef,
  SlottablePressableProps,
  SlottableViewProps,
  ViewRef,
} from '../../helpers/internal/types';
/**
 * Side of the trigger on which the FAB content is rendered.
 */
export type Placement = 'top' | 'bottom' | 'left' | 'right';
/**
 * Alignment of the FAB content along the axis perpendicular to the placement.
 */
export type Align = 'start' | 'center' | 'end';
/**
 * Placement prop value accepted by the FAB root. `"auto"` resolves the
 * placement from the trigger position on screen (trigger in the bottom half
 * opens upwards, trigger in the top half opens downwards).
 */
export type AutoPlacement = Placement | 'auto';
/**
 * Align prop value accepted by the FAB root. `"auto"` resolves the alignment
 * from the trigger position on screen (e.g. a trigger near the right edge
 * aligns content to its end).
 */
export type AutoAlign = Align | 'auto';
/**
 * Internal context interface for managing FAB state and positioning.
 */
export interface IRootContext {
  /**
   * Whether the FAB is currently open.
   */
  isOpen: boolean;
  /**
   * Callback to change the open state of the FAB.
   */
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Whether the FAB should be open by default (uncontrolled mode).
   */
  isDefaultOpen?: boolean;
  /**
   * Whether the FAB is disabled.
   */
  isDisabled?: boolean;
  /**
   * The position of the trigger element relative to the viewport.
   * Unlike popup primitives, this is kept after close so exit animations
   * can play while the content is still mounted.
   */
  triggerPosition: LayoutPosition | null;
  /**
   * Updates the trigger element's position.
   */
  setTriggerPosition: (triggerPosition: LayoutPosition | null) => void;
  /**
   * The layout measurements of the FAB content.
   */
  contentLayout: LayoutRectangle | null;
  /**
   * Updates the content layout measurements.
   */
  setContentLayout: (contentLayout: LayoutRectangle | null) => void;
  /**
   * Unique identifier for the FAB instance.
   */
  nativeID: string;
  /**
   * Resolved placement of the content relative to the trigger.
   * When the root `placement` prop is `"auto"`, this is derived from the
   * measured trigger position; otherwise it mirrors the prop.
   */
  placement: Placement;
  /**
   * Resolved alignment of the content relative to the trigger.
   * When the root `align` prop is `"auto"`, this is derived from the
   * measured trigger position; otherwise it mirrors the prop.
   */
  align: Align;
}
/**
 * Props for the FAB Root primitive.
 */
export type RootProps = SlottableViewProps & {
  /**
   * Preferred placement of the content relative to the trigger.
   * `"auto"` resolves from the trigger position on screen.
   * @default 'auto'
   */
  placement?: AutoPlacement;
  /**
   * Alignment of the content along the perpendicular axis.
   * `"auto"` resolves from the trigger position on screen.
   * @default 'auto'
   */
  align?: AutoAlign;
  /**
   * The controlled open state of the FAB.
   */
  isOpen?: boolean;
  /**
   * The open state of the FAB when initially rendered (uncontrolled).
   */
  isDefaultOpen?: boolean;
  /**
   * Whether the FAB is disabled.
   */
  isDisabled?: boolean;
  /**
   * Callback fired when the FAB open state changes.
   * @param isOpen - Whether the FAB is open or closed
   */
  onOpenChange?: (isOpen: boolean) => void;
};
/**
 * Props for the FAB Trigger primitive.
 */
export type TriggerProps = Omit<SlottablePressableProps, 'disabled'> & {
  /**
   * Whether the trigger is disabled.
   */
  isDisabled?: boolean;
};
/**
 * Props for the FAB Portal primitive.
 */
export interface PortalProps extends ForceMountable {
  /**
   * The content to render within the portal.
   */
  children: React.ReactNode;
  /**
   * Optional name of the host element for the portal.
   */
  hostName?: string;
}
/**
 * Props for the FAB Overlay primitive.
 */
export type OverlayProps = ForceMountable &
  SlottablePressableProps & {
    /**
     * Whether to close the FAB when the overlay is pressed.
     * @default true
     */
    closeOnPress?: boolean;
  };
/**
 * Props for the FAB Content primitive.
 * Placement and alignment come from the root context (resolved from the
 * root `placement` / `align` props), so only fine-tuning props live here.
 */
export type ContentProps = SlottableViewProps &
  ForceMountable & {
    /**
     * Offset from the trigger element in pixels.
     * @default 0
     */
    offset?: number;
    /**
     * Offset along the alignment axis in pixels.
     * @default 0
     */
    alignOffset?: number;
    /**
     * Screen edge insets to respect when positioning.
     */
    insets?: Insets;
    /**
     * Whether to automatically adjust position to avoid screen edges.
     * @default true
     */
    avoidCollisions?: boolean;
    /**
     * Whether to disable the automatic positioning styles.
     * Useful when you want to handle positioning manually.
     * @default false
     */
    disablePositioningStyle?: boolean;
  };
/**
 * Props for the FAB Item primitive.
 */
export type ItemProps = SlottablePressableProps & {
  /**
   * Whether to close the FAB when the item is pressed.
   * @default true
   */
  closeOnPress?: boolean;
};
/**
 * Ref type for the FAB Root primitive.
 */
export type RootRef = ViewRef;
/**
 * Ref type for the FAB Trigger primitive.
 */
export type TriggerRef = PressableRef & {
  /**
   * Programmatically open the FAB.
   */
  open: () => void;
  /**
   * Programmatically close the FAB.
   */
  close: () => void;
};
/**
 * Ref type for the FAB Overlay primitive.
 */
export type OverlayRef = PressableRef;
/**
 * Ref type for the FAB Content primitive.
 */
export type ContentRef = ViewRef;
/**
 * Ref type for the FAB Item primitive.
 */
export type ItemRef = PressableRef;
