import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  type ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Text, View } from 'react-native';
import * as Slot from '../slot/index';
import type { TimelineItemContextValue, TimelineRootContextValue } from './timeline.types';
// --------------------------------------------------
const TimelineRootContext = createContext<TimelineRootContextValue | null>(null);
const TimelineItemContext = createContext<TimelineItemContextValue | null>(null);
function useRootContext() {
  const ctx = useContext(TimelineRootContext);
  if (!ctx) {
    throw new Error('Timeline primitive compound components must be used within Timeline.Root');
  }
  return ctx;
}
function useItemContext() {
  const ctx = useContext(TimelineItemContext);
  if (!ctx) {
    throw new Error('Timeline primitive item subcomponents must be used within Timeline.Item');
  }
  return ctx;
}
// --------------------------------------------------
const Root = forwardRef(
  (
    {
      asChild,
      children,
      density = 'comfortable',
      itemAlign = 'start',
      size = 'md',
      skipInjectItemIndices = false,
      ...viewProps
    }: any,
    ref: any
  ) => {
    const [measurements, setMeasurements] = useState({});
    const setItemMeasurement = useCallback((index, partial) => {
      setMeasurements((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          ...partial,
        },
      }));
    }, []);
    const contextValue = useMemo(
      () => ({
        size,
        density,
        itemAlign,
        measurements,
        setItemMeasurement,
      }),
      [size, density, itemAlign, measurements, setItemMeasurement]
    );
    const enhancedChildren = useMemo(() => {
      if (skipInjectItemIndices) {
        return children;
      }
      const childArray = Children.toArray(children);
      const itemElements = childArray.filter(
        (child) => isValidElement(child) && child.type === Item
      );
      const totalItems = itemElements.length;
      let itemCounter = 0;
      return childArray.map((child) => {
        if (isValidElement(child) && child.type === Item) {
          const idx = itemCounter;
          itemCounter += 1;
          return cloneElement(child as ReactElement<any>, {
            _index: idx,
            _isLast: idx === totalItems - 1,
            key: child.key ?? `timeline-item-${idx}`,
          });
        }
        return child;
      });
    }, [children, skipInjectItemIndices]);
    const Component = asChild ? Slot.View : View;
    return (
      <TimelineRootContext.Provider value={contextValue}>
        <Component ref={ref} {...viewProps}>
          {enhancedChildren}
        </Component>
      </TimelineRootContext.Provider>
    );
  }
);
Root.displayName = 'HeroUINative.Primitive.Timeline.Root';
// --------------------------------------------------
const Item = forwardRef(
  (
    {
      asChild,
      children,
      _index: injectedIndex = 0,
      _isLast: injectedIsLast = false,
      align: alignProp,
      status = 'default',
      onLayout: onLayoutProp,
      ...restProps
    }: any,
    ref: any
  ) => {
    const { itemAlign, setItemMeasurement } = useRootContext();
    const align = alignProp ?? itemAlign;
    const itemCtx = useMemo(
      () => ({
        index: injectedIndex,
        isLast: injectedIsLast,
        status,
        align,
      }),
      [injectedIndex, injectedIsLast, status, align]
    );
    const handleLayout = useCallback(
      (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        const layout = {
          x,
          y,
          width,
          height,
        };
        setItemMeasurement(injectedIndex, {
          item: layout,
        });
        onLayoutProp?.(event);
      },
      [injectedIndex, onLayoutProp, setItemMeasurement]
    );
    const Component = asChild ? Slot.View : View;
    return (
      <TimelineItemContext.Provider value={itemCtx}>
        <Component
          ref={ref}
          onLayout={handleLayout}
          {...restProps}
          data-align={align}
          data-last={injectedIsLast || undefined}
          data-status={status}
        >
          {children}
        </Component>
      </TimelineItemContext.Provider>
    );
  }
);
Item.displayName = 'HeroUINative.Primitive.Timeline.Item';
// --------------------------------------------------
const Leading = forwardRef(({ asChild, children, ...restProps }: any, ref: any) => {
  const { align } = useItemContext();
  const Component = asChild ? Slot.View : View;
  return (
    <Component ref={ref} {...restProps} data-align={align}>
      {children}
    </Component>
  );
});
Leading.displayName = 'HeroUINative.Primitive.Timeline.Leading';
// --------------------------------------------------
const Rail = forwardRef(
  ({ asChild, children, onLayout: onLayoutProp, ...restProps }: any, ref: any) => {
    const { setItemMeasurement } = useRootContext();
    const { index } = useItemContext();
    const handleLayout = useCallback(
      (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        const layout = {
          x,
          y,
          width,
          height,
        };
        setItemMeasurement(index, {
          rail: layout,
        });
        onLayoutProp?.(event);
      },
      [index, onLayoutProp, setItemMeasurement]
    );
    const Component = asChild ? Slot.View : View;
    return (
      <Component ref={ref} onLayout={handleLayout} {...restProps}>
        {children}
      </Component>
    );
  }
);
Rail.displayName = 'HeroUINative.Primitive.Timeline.Rail';
// --------------------------------------------------
const Marker = forwardRef(({ asChild, children, ...restProps }: any, ref: any) => {
  const { status } = useItemContext();
  const Component = asChild ? Slot.View : View;
  return (
    <Component ref={ref} {...restProps} data-status={status}>
      {children}
    </Component>
  );
});
Marker.displayName = 'HeroUINative.Primitive.Timeline.Marker';
// --------------------------------------------------
const Connector = forwardRef(
  ({ asChild, force, onLayout: onLayoutProp, style, ...restProps }: any, ref: any) => {
    const { measurements, setItemMeasurement } = useRootContext();
    const { index, status } = useItemContext();
    const { rail, item, connector } = measurements[index] ?? {};
    const prevMeasurements = measurements[index - 1];
    const handleLayout = useCallback(
      (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        const layout = {
          x,
          y,
          width,
          height,
        };
        setItemMeasurement(index, {
          connector: layout,
        });
        onLayoutProp?.(event);
      },
      [index, onLayoutProp, setItemMeasurement]
    );
    /**
     * Absolutely position the connector so it spans from the previous item's
     * marker down to the current item's marker. Mirrors the vertical branch of
     * the Stepper primitive Separator: the connector overflows the rail upward
     * into the gap left by the previous item.
     */
    const absoluteStyle = useMemo(() => {
      if (!rail || !item) {
        return {
          opacity: 0,
        };
      }
      const halfW = connector ? connector.width / 2 : 0;
      const prevRailGap =
        prevMeasurements?.item && prevMeasurements?.rail
          ? prevMeasurements.item.height - prevMeasurements.rail.y - prevMeasurements.rail.height
          : 0;
      const computedHeight = prevRailGap + rail.y;
      return {
        position: 'absolute',
        left: rail.width / 2 - halfW,
        right: 0,
        top: -(prevRailGap + rail.y),
        height: computedHeight > 0 ? computedHeight : 0,
      };
    }, [connector, item, prevMeasurements?.item, prevMeasurements?.rail, rail]);
    if (index === 0 && !force) {
      return null;
    }
    const Component = asChild ? Slot.View : View;
    return (
      <Component
        ref={ref}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        onLayout={handleLayout}
        style={[absoluteStyle, style]}
        {...restProps}
        data-status={status}
      />
    );
  }
);
Connector.displayName = 'HeroUINative.Primitive.Timeline.Connector';
// --------------------------------------------------
const Content = forwardRef(({ asChild, children, ...restProps }: any, ref: any) => {
  const { align } = useItemContext();
  const Component = asChild ? Slot.View : View;
  return (
    <Component ref={ref} {...restProps} data-align={align}>
      {children}
    </Component>
  );
});
Content.displayName = 'HeroUINative.Primitive.Timeline.Content';
// --------------------------------------------------
const Title = forwardRef(({ asChild, children, ...restProps }: any, ref: any) => {
  const { status } = useItemContext();
  const Component = asChild ? Slot.Text : Text;
  return (
    <Component ref={ref} {...restProps} data-status={status}>
      {children}
    </Component>
  );
});
Title.displayName = 'HeroUINative.Primitive.Timeline.Title';
// --------------------------------------------------
const Description = forwardRef(({ asChild, children, ...restProps }: any, ref: any) => {
  const { status } = useItemContext();
  const Component = asChild ? Slot.Text : Text;
  return (
    <Component ref={ref} {...restProps} data-status={status}>
      {children}
    </Component>
  );
});
Description.displayName = 'HeroUINative.Primitive.Timeline.Description';
export {
  Connector,
  Content,
  Description,
  Item,
  Leading,
  Marker,
  Rail,
  Root,
  Title,
  useItemContext,
  useRootContext,
};
