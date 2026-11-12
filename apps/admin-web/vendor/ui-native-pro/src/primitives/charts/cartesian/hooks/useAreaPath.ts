// @ts-nocheck
import * as React from 'react';
import { area } from 'd3-shape';
import { Skia } from '../../skia';
import { cleanPointsArray } from '../../utils/cleanPointsArray';
import { groupPointsArray } from '../../utils/groupPointsArray';
import { stitchDataArray } from '../../utils/stitchDataArray';
import { CURVES } from '../utils/curves';
export const useAreaPath = (
  points,
  y0,
  { curveType = 'linear', connectMissingData = false } = {}
) => {
  const path = React.useMemo(() => {
    const groups = connectMissingData ? [cleanPointsArray(points)] : groupPointsArray(points);
    const p = Skia.PathBuilder.Make();
    groups.forEach((group) => {
      const svgPath = area().y0(y0)?.curve(CURVES[curveType])(stitchDataArray(group));
      if (!svgPath) return;
      p.addPath(Skia.Path.MakeFromSVGString(svgPath) ?? Skia.Path.Make());
    });
    return p.detach();
  }, [connectMissingData, points, y0, curveType]);
  return {
    path,
  };
};
