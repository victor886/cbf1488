// @ts-nocheck
import { Gesture } from 'react-native-gesture-handler';
import { multiply4, scale, translate } from '../../skia';
import { applyPanTransformGestureConfig } from './applyPanTransformGestureConfig';
export const pinchTransformGesture = (state, _config = {}) => {
  const defaults = {
    enabled: true,
    dimensions: ['x', 'y'],
  };
  const config = {
    ...defaults,
    ..._config,
  };
  const dimensions = Array.isArray(config.dimensions) ? config.dimensions : [config.dimensions];
  const scaleX = dimensions.includes('x');
  const scaleY = dimensions.includes('y');
  const pinch = Gesture.Pinch()
    .onBegin((e) => {
      state.offset.set(state.matrix.get());
      state.origin.set({
        x: e.focalX,
        y: e.focalY,
      });
    })
    .onStart(() => {
      state.zoomActive.set(true);
    })
    .onChange((e) => {
      state.matrix.set(
        multiply4(
          state.offset.get(),
          scale(scaleX ? e.scale : 1, scaleY ? e.scale : 1, 1, state.origin.get())
        )
      );
    })
    .onEnd(() => {
      state.zoomActive.set(false);
    });
  return pinch;
};
export const panTransformGesture = (state, _config = {}) => {
  const defaults = {
    enabled: true,
    dimensions: ['x', 'y'],
  };
  const config = {
    ...defaults,
    ..._config,
  };
  const dimensions = Array.isArray(config.dimensions) ? config.dimensions : [config.dimensions];
  const panX = dimensions.includes('x');
  const panY = dimensions.includes('y');
  const pan = Gesture.Pan()
    .onStart(() => {
      state.panActive.set(true);
    })
    .onChange((e) => {
      state.matrix.set(
        multiply4(translate(panX ? e.changeX : 0, panY ? e.changeY : 0, 0), state.matrix.get())
      );
    })
    .onEnd(() => {
      state.panActive.set(false);
    });
  applyPanTransformGestureConfig({
    panGesture: pan,
    panConfig: config,
  });
  return pan;
};
