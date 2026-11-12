// @ts-nocheck
import { createContext, useContext } from 'react';
const PieSliceContext = createContext(undefined);
export const PieSliceProvider = ({ children, slice: _slice }) => {
  return (
    <PieSliceContext.Provider
      value={{
        slice: _slice,
      }}
    >
      {children}
    </PieSliceContext.Provider>
  );
};
export const usePieSliceContext = () => {
  const context = useContext(PieSliceContext);
  if (context === undefined) {
    throw new Error('usePieSliceContext must be used within a PieSliceProvider');
  }
  return context;
};
