// @ts-nocheck
import { rect } from '../skia';
export const boundsToClip = (bounds) =>
  rect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
