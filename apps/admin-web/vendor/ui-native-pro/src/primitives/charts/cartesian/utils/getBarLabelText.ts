// @ts-nocheck
export const getBarLabelText = (value, formatLabel) => {
  if (formatLabel) return formatLabel(value);
  return value == null ? '' : String(value);
};
