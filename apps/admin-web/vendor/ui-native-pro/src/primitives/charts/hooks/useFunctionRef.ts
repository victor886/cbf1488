// @ts-nocheck
import * as React from 'react';
export const useFunctionRef = (fn) => {
  const fnRef = React.useRef(fn);
  React.useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  return fnRef;
};
