import React, { forwardRef, useContext, useEffect, useId, useMemo, useState } from 'react';
import { BackHandler, Dimensions, type LayoutRectangle, Pressable, View } from 'react-native';
import { Portal as PrimitivePortal } from 'heroui-native/portal';
import type { LayoutPosition } from '../../helpers/internal/hooks';
import {
  useAugmentedRef,
  useControllableState,
  useRelativePosition,
} from '../../helpers/internal/hooks/index';
import * as Slot from '../slot/index';
import type { IRootContext } from './fab.types';
import { resolveAlign, resolvePlacement } from './fab.utils';
const RootContext = React.createContext<IRootContext | null>(null);
const useRootContext = () => {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error('FAB compound components cannot be rendered outside the FAB component');
  }
  return context;
};
// --------------------------------------------------
const Root = forwardRef(
  (
    {
      asChild,
      placement: placementProp = 'auto',
      align: alignProp = 'auto',
      isOpen: isOpenProp,
      isDefaultOpen,
      onOpenChange: onOpenChangeProp,
      isDisabled,
      ...viewProps
    }: any,
    ref: any
  ) => {
    const [isOpen = false, onOpenChange] = useControllableState({
      prop: isOpenProp,
      defaultProp: isDefaultOpen,
      onChange: onOpenChangeProp,
    });
    const [triggerPosition, setTriggerPosition] = useState<LayoutPosition | null>(null);
    const [contentLayout, setContentLayout] = useState<LayoutRectangle | null>(null);
    const nativeID = useId();
    const { placement, align } = useMemo(() => {
      const dimensions = Dimensions.get('screen');
      const resolvedPlacement = resolvePlacement(placementProp, triggerPosition, dimensions);
      return {
        placement: resolvedPlacement,
        align: resolveAlign(alignProp, resolvedPlacement, triggerPosition, dimensions),
      };
    }, [placementProp, alignProp, triggerPosition]);
    const Component = asChild ? Slot.View : View;
    return (
      <RootContext.Provider
        value={{
          isOpen,
          onOpenChange,
          isDefaultOpen,
          isDisabled,
          triggerPosition,
          setTriggerPosition,
          contentLayout,
          setContentLayout,
          nativeID,
          placement,
          align,
        }}
      >
        <Component ref={ref} {...viewProps} />
      </RootContext.Provider>
    );
  }
);
// --------------------------------------------------
const Trigger = forwardRef(
  ({ asChild, onPress: onPressProp, isDisabled = false, ...props }: any, ref: any) => {
    const {
      isOpen,
      onOpenChange,
      isDisabled: isDisabledRoot,
      setTriggerPosition,
    } = useRootContext();
    const isDisabledValue = isDisabled || (isDisabledRoot ?? false);
    const augmentedRef = useAugmentedRef<any>({
      ref,
      methods: {
        open: () => {
          augmentedRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
            setTriggerPosition({
              width,
              pageX,
              pageY,
              height,
            });
          });
          onOpenChange(true);
        },
        close: () => {
          onOpenChange(false);
        },
      },
      deps: [isOpen],
    });
    // Measure whenever the FAB opens — covers `isDefaultOpen` mounts and
    // programmatic/controlled opens that bypass `onPress` — so positioning
    // and auto placement can always resolve.
    useEffect(() => {
      if (!isOpen) {
        return undefined;
      }
      // Use setTimeout to ensure the component is mounted and can be measured
      const timeoutId = setTimeout(() => {
        augmentedRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
          setTriggerPosition({
            width,
            pageX,
            pageY,
            height,
          });
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    }, [isOpen]);
    function onPress(ev) {
      augmentedRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
        setTriggerPosition({
          width,
          pageX,
          pageY,
          height,
        });
      });
      onOpenChange(!isOpen);
      onPressProp?.(ev);
    }
    const Component = asChild ? Slot.Pressable : Pressable;
    return (
      <Component
        ref={augmentedRef}
        aria-disabled={isDisabledValue}
        aria-expanded={isOpen}
        role="button"
        onPress={onPress}
        disabled={isDisabledValue}
        {...props}
      />
    );
  }
);
// --------------------------------------------------
/**
 * @warning when using a custom `<PortalHost />`, you might have to adjust the Content's offset to account for nav elements like headers.
 */
function Portal({ forceMount, hostName, children }) {
  const value = useRootContext();
  if (!value.triggerPosition) {
    return null;
  }
  if (!forceMount && !value.isOpen) {
    return null;
  }
  return (
    <PrimitivePortal hostName={hostName} name={`${value.nativeID}_portal`}>
      <RootContext.Provider value={value}>{children}</RootContext.Provider>
    </PrimitivePortal>
  );
}
// --------------------------------------------------
const Overlay = forwardRef(
  ({ asChild, forceMount, onPress: onPressProp, closeOnPress = true, ...props }: any, ref: any) => {
    const { isOpen, onOpenChange } = useRootContext();
    function onPress(ev) {
      if (closeOnPress) {
        onOpenChange(false);
      }
      onPressProp?.(ev);
    }
    if (!forceMount && !isOpen) {
      return null;
    }
    const Component = asChild ? Slot.Pressable : Pressable;
    return <Component ref={ref} onPress={onPress} {...props} />;
  }
);
// --------------------------------------------------
/**
 * @info `position`, `top`, `left`, and `maxWidth` style properties are controlled internally. Opt out of this behavior by setting `disablePositioningStyle` to `true`.
 */
const Content = forwardRef(
  (
    {
      asChild = false,
      forceMount,
      offset = 0,
      alignOffset = 0,
      insets,
      avoidCollisions = true,
      disablePositioningStyle,
      onLayout: onLayoutProp,
      style,
      ...props
    }: any,
    ref: any
  ) => {
    const {
      isOpen,
      onOpenChange,
      triggerPosition,
      contentLayout,
      setContentLayout,
      nativeID,
      placement,
      align,
    } = useRootContext();
    // Only intercept the hardware back press while the FAB is open. With
    // `forceMount`, the content stays mounted through the close animation
    // (and beyond, when the portal is force-mounted), so a mount-scoped
    // listener would keep swallowing back presses after the FAB closed.
    useEffect(() => {
      if (!isOpen) {
        return undefined;
      }
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onOpenChange(false);
        return true;
      });
      return () => {
        backHandler.remove();
      };
    }, [isOpen, onOpenChange]);
    useEffect(() => {
      return () => {
        setContentLayout(null);
      };
    }, []);
    const positionStyle = useRelativePosition({
      align,
      avoidCollisions,
      triggerPosition,
      contentLayout,
      alignOffset,
      insets,
      offset,
      placement,
      disablePositioningStyle,
    });
    function onLayout(event) {
      setContentLayout(event.nativeEvent.layout);
      onLayoutProp?.(event);
    }
    if (!forceMount && !isOpen) {
      return null;
    }
    const Component = asChild ? Slot.View : View;
    return (
      <Component
        ref={ref}
        role="menu"
        nativeID={nativeID}
        style={[positionStyle, style]}
        onLayout={onLayout}
        {...props}
      />
    );
  }
);
// --------------------------------------------------
const Item = forwardRef(
  ({ asChild, onPress: onPressProp, closeOnPress = true, disabled, ...props }: any, ref: any) => {
    const { onOpenChange } = useRootContext();
    function onPress(ev) {
      if (closeOnPress) {
        onOpenChange(false);
      }
      onPressProp?.(ev);
    }
    const Component = asChild ? Slot.Pressable : Pressable;
    return (
      <Component
        ref={ref}
        role="menuitem"
        aria-disabled={disabled ?? undefined}
        accessibilityState={{
          disabled: !!disabled,
        }}
        onPress={onPress}
        disabled={disabled ?? undefined}
        {...props}
      />
    );
  }
);
// --------------------------------------------------
Root.displayName = 'HeroUINative.Primitive.FAB.Root';
Trigger.displayName = 'HeroUINative.Primitive.FAB.Trigger';
Overlay.displayName = 'HeroUINative.Primitive.FAB.Overlay';
Content.displayName = 'HeroUINative.Primitive.FAB.Content';
Item.displayName = 'HeroUINative.Primitive.FAB.Item';
export { Content, Item, Overlay, Portal, Root, Trigger, useRootContext };
