// @ts-nocheck
import { asNumber } from '../../utils/asNumber';
export const getXScaleInputBounds = ({ isNumericalData, ixNum, domain, tickDomain }) => {
  const ixMin = isNumericalData ? asNumber(domain?.[0] ?? tickDomain?.[0] ?? ixNum.at(0)) : 0;
  const ixMax = isNumericalData
    ? asNumber(domain?.[1] ?? tickDomain?.[1] ?? ixNum.at(-1))
    : ixNum.length - 1;
  return ixMin === ixMax ? [ixMin - 1, ixMax + 1] : [ixMin, ixMax];
};
