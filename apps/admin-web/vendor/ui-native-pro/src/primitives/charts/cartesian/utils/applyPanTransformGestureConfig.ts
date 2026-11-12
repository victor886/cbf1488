// @ts-nocheck
export const applyPanTransformGestureConfig = ({ panGesture, panConfig }) => {
  if (panConfig.activateAfterLongPress !== undefined) {
    panGesture.activateAfterLongPress(panConfig.activateAfterLongPress);
  }
  if (panConfig.activeOffsetX !== undefined) {
    panGesture.activeOffsetX(panConfig.activeOffsetX);
  }
  if (panConfig.activeOffsetY !== undefined) {
    panGesture.activeOffsetY(panConfig.activeOffsetY);
  }
  if (panConfig.failOffsetX !== undefined) {
    panGesture.failOffsetX(panConfig.failOffsetX);
  }
  if (panConfig.failOffsetY !== undefined) {
    panGesture.failOffsetY(panConfig.failOffsetY);
  }
};
