// @ts-nocheck
import { createContext, useContext } from 'react';
const CartesianChartContext = createContext(undefined);
export const CartesianChartProvider = (props) => {
  const { children, xScale, yScale, orientation = 'vertical' } = props;
  return (
    <CartesianChartContext.Provider
      value={{
        xScale,
        yScale,
        orientation,
      }}
    >
      {children}
    </CartesianChartContext.Provider>
  );
};
export const useCartesianChartContext = () => {
  const context = useContext(CartesianChartContext);
  if (context === undefined) {
    throw new Error('useCartesianChartContext must be used within a CartesianChartProvider');
  }
  return context;
};
