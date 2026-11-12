// @ts-nocheck
export const resetChartPressState = (state) => {
  state.isActive.set(false);
  state.matchedIndex.set(-1);
  state.yIndex.set(-1);
  state.x.position.set(0);
  for (const key in state.y) {
    state.y[key].position.set(0);
  }
};
