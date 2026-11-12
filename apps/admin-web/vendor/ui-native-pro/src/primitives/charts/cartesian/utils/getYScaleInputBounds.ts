// @ts-nocheck
export const getYScaleInputBounds = ({ data, yKeys, domain, tickDomain }) => {
  const yMin =
    domain?.[0] ??
    tickDomain?.[0] ??
    Math.min(
      ...yKeys.map((key) => {
        return data.reduce((min, curr) => {
          if (typeof curr[key] !== 'number') return min;
          return Math.min(min, curr[key]);
        }, Infinity);
      })
    );
  const yMax =
    domain?.[1] ??
    tickDomain?.[1] ??
    Math.max(
      ...yKeys.map((key) => {
        return data.reduce((max, curr) => {
          if (typeof curr[key] !== 'number') return max;
          return Math.max(max, curr[key]);
        }, -Infinity);
      })
    );
  return {
    yMin,
    yMax,
  };
};
