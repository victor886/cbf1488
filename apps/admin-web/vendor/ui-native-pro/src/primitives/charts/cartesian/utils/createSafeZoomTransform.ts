// @ts-nocheck
import { ZoomTransform } from 'd3-zoom';
const getSafeZoomScale = (scale) => (scale === 0 || !Number.isFinite(scale) ? 1 : scale);
export const createSafeZoomTransform = (scale, translateX, translateY) =>
  new ZoomTransform(getSafeZoomScale(scale), translateX, translateY);
