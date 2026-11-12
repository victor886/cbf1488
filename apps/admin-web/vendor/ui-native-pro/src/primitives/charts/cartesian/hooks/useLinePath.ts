// @ts-nocheck
import * as React from 'react';
import { line } from 'd3-shape';
import { Skia } from '../../skia';
import { cleanPointsArray } from '../../utils/cleanPointsArray';
import { groupPointsArray } from '../../utils/groupPointsArray';
import { stitchDataArray } from '../../utils/stitchDataArray';
import { CURVES } from '../utils/curves';
export const useLinePath = (points, { curveType = 'linear', connectMissingData = false } = {}) => {
  const path = React.useMemo(() => {
    const groups = connectMissingData ? [cleanPointsArray(points)] : groupPointsArray(points);
    const p = Skia.PathBuilder.Make();
    groups.forEach((group) => {
      const svgPath = line().curve(CURVES[curveType])(stitchDataArray(group));
      if (!svgPath) return;
      p.addPath(Skia.Path.MakeFromSVGString(svgPath) ?? Skia.Path.Make());
    });
    return p.detach();
  }, [connectMissingData, points, curveType]);
  return {
    path,
  };
};
