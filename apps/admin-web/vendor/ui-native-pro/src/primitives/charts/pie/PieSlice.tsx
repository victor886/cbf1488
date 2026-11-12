// @ts-nocheck
import React from 'react';
import { AnimatedPath } from '../cartesian/components/AnimatedPath';
import { Path } from '../skia';
import { usePieSliceContext } from './contexts/PieSliceContext';
import { useSlicePath } from './hooks/useSlicePath';
import PieLabel from './PieLabel';
export const PieSlice = ({ children, animate, ...rest }) => {
  const { slice } = usePieSliceContext();
  const path = useSlicePath({
    slice,
  });
  let label;
  const childrenArray = React.Children.toArray(children);
  const labelIndex = childrenArray.findIndex((child) => child.type === PieLabel);
  if (labelIndex > -1) {
    label = childrenArray.splice(labelIndex, 1);
  }
  const Component = animate ? AnimatedPath : Path;
  return (
    <>
      <Component path={path} style="fill" color={slice.color} animate={animate} {...rest}>
        {childrenArray}
      </Component>
      {label}
    </>
  );
};
