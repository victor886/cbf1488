import { cloneElement, forwardRef, isValidElement, type ReactElement, type Ref } from 'react';
import { composeRefs, isTextChildren, mergeProps } from './utils';

type ElementWithRef = ReactElement & { ref?: Ref<any> };

const Pressable = forwardRef((props: any, forwardedRef: any) => {
  const { children, ...pressableSlotProps } = props;
  if (!isValidElement(children)) {
    console.log('Slot.Pressable - Invalid asChild element', children);
    return null;
  }
  const child = children as ElementWithRef;
  return cloneElement(isTextChildren(child) ? <></> : child, {
    ...mergeProps(pressableSlotProps, child.props as any),
    ref: forwardedRef ? composeRefs(forwardedRef, child.ref) : child.ref,
  } as any);
});
Pressable.displayName = 'HeroUINative.Primitive.Slot.Pressable';
// --------------------------------------------------
const View = forwardRef((props: any, forwardedRef: any) => {
  const { children, ...viewSlotProps } = props;
  if (!isValidElement(children)) {
    console.log('Slot.View - Invalid asChild element', children);
    return null;
  }
  const child = children as ElementWithRef;
  return cloneElement(isTextChildren(child) ? <></> : child, {
    ...mergeProps(viewSlotProps, child.props as any),
    ref: forwardedRef ? composeRefs(forwardedRef, child.ref) : child.ref,
  } as any);
});
View.displayName = 'HeroUINative.Primitive.Slot.View';
// --------------------------------------------------
const Text = forwardRef((props: any, forwardedRef: any) => {
  const { children, ...textSlotProps } = props;
  if (!isValidElement(children)) {
    console.log('Slot.Text - Invalid asChild element', children);
    return null;
  }
  const child = children as ElementWithRef;
  return cloneElement(isTextChildren(child) ? <></> : child, {
    ...mergeProps(textSlotProps, child.props as any),
    ref: forwardedRef ? composeRefs(forwardedRef, child.ref) : child.ref,
  } as any);
});
Text.displayName = 'HeroUINative.Primitive.Slot.Text';
// --------------------------------------------------
const Image = forwardRef((props: any, forwardedRef: any) => {
  const { children, ...imageSlotProps } = props;
  if (!isValidElement(children)) {
    console.log('Slot.Image - Invalid asChild element', children);
    return null;
  }
  const child = children as ElementWithRef;
  return cloneElement(isTextChildren(child) ? <></> : child, {
    ...mergeProps(imageSlotProps, child.props as any),
    ref: forwardedRef ? composeRefs(forwardedRef, child.ref) : child.ref,
  } as any);
});
Image.displayName = 'HeroUINative.Primitive.Slot.Image';
export { Image, Pressable, Text, View };
