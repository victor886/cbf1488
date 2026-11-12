// @ts-nocheck
import { AnimatedPath } from '../cartesian/components/AnimatedPath';
import { Path } from '../skia';
import { usePieSliceContext } from './contexts/PieSliceContext';
import { useSliceAngularInsetPath } from './hooks/useSliceAngularInsetPath';
export const PieSliceAngularInset = (props) => {
  const { angularInset, children, animate, ...rest } = props;
  const { slice } = usePieSliceContext();
  const [path, insetPaint] = useSliceAngularInsetPath({
    slice,
    angularInset,
  });
  // If the path is empty, don't render anything
  if (path.toSVGString() === 'M0 0L0 0M0 0L0 0') {
    return null;
  }
  if (angularInset.angularStrokeWidth === 0) {
    return null;
  }
  const Component = animate ? AnimatedPath : Path;
  return (
    <Component path={path} paint={insetPaint} animate={animate} {...rest}>
      {children}
    </Component>
  );
};
