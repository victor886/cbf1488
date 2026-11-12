// @ts-nocheck
import { createContext, useContext } from 'react';
const PolarChartContext = createContext(undefined);
export const PolarChartProvider = (props) => {
  const { children, data, canvasSize, labelKey, valueKey, colorKey } = props;
  return (
    <PolarChartContext.Provider
      value={{
        data,
        canvasSize,
        labelKey,
        valueKey,
        colorKey,
      }}
    >
      {children}
    </PolarChartContext.Provider>
  );
};
export const usePolarChartContext = () => {
  const context = useContext(PolarChartContext);
  if (context === undefined) {
    throw new Error('usePolarChartContext must be used within a PolarChartProvider');
  }
  return context;
};
