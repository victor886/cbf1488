// @ts-nocheck
const hasReleasedTouchId = (touchId, changedTouches) => {
  'worklet';
  for (let i = 0; i < changedTouches.length; i++) {
    if (changedTouches[i]?.id === touchId) return true;
  }
  return false;
};
export const pruneChartPressBootstrap = ({ bootstrap, changedTouches, numberOfTouches }) => {
  'worklet';
  if (numberOfTouches === 0) return [];
  const nextBootstrap = [];
  for (let i = 0; i < bootstrap.length; i++) {
    const entry = bootstrap[i];
    const touchId = entry?.touch.id;
    if (typeof touchId === 'number' && hasReleasedTouchId(touchId, changedTouches)) {
      continue;
    }
    if (entry) nextBootstrap.push(entry);
  }
  return nextBootstrap;
};
