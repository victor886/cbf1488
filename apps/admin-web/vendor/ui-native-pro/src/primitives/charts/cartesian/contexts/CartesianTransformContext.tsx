// @ts-nocheck
import { createContext, useContext, useEffect, useState } from 'react';
import { useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { getTransformComponents } from '../../utils/transform';
const CartesianTransformContext = createContext(undefined);
export const CartesianTransformValueProvider = ({ value, children }) => {
  return (
    <CartesianTransformContext.Provider value={value}>
      {children}
    </CartesianTransformContext.Provider>
  );
};
export const CartesianTransformProvider = ({ transformState, children }) => {
  const [transform, setTransform] = useState(() => {
    const components = getTransformComponents(undefined);
    return {
      k: components.scaleX,
      kx: components.scaleX,
      ky: components.scaleY,
      tx: components.translateX,
      ty: components.translateY,
    };
  });
  // This is done in a useEffect to prevent Reanimated warning
  // about setting shared value in the render phase
  useEffect(() => {
    if (transformState) {
      setTransform(() => {
        const components = getTransformComponents(transformState.matrix.get());
        return {
          k: components.scaleX,
          kx: components.scaleX,
          ky: components.scaleY,
          tx: components.translateX,
          ty: components.translateY,
        };
      });
    }
  }, []);
  useAnimatedReaction(
    () => {
      return getTransformComponents(transformState?.matrix.get());
    },
    (cv, pv) => {
      if (
        cv.scaleX !== pv?.scaleX ||
        cv.scaleY !== pv.scaleY ||
        cv.translateX !== pv.translateX ||
        cv.translateY !== pv.translateY
      ) {
        scheduleOnRN(setTransform, {
          k: cv.scaleX,
          kx: cv.scaleX,
          ky: cv.scaleY,
          tx: cv.translateX,
          ty: cv.translateY,
        });
      }
    }
  );
  return (
    <CartesianTransformValueProvider value={transform}>{children}</CartesianTransformValueProvider>
  );
};
export const useCartesianTransformContext = () => {
  const context = useContext(CartesianTransformContext);
  if (context === undefined) {
    throw new Error(
      'useCartesianTransformContext must be used within a CartesianTransformProvider'
    );
  }
  return context;
};
