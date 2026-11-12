// @ts-nocheck
import { findClosestPoint } from '../../utils/findClosestPoint';
export const getClosestDatumIndex = ({ orientation, categoryPositions, touchX, touchY }) => {
  'worklet';
  return findClosestPoint(categoryPositions, orientation === 'horizontal' ? touchY : touchX);
};
