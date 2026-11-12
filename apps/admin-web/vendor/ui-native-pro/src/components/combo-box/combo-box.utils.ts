// @ts-nocheck
/**
 * Normalizes text for filtering: lowercases and strips combining diacritical
 * marks so that e.g. "São" matches "sao".
 *
 * @param text - Raw text to normalize
 * @returns Normalized text suitable for case- and diacritic-insensitive comparison
 */
function normalizeFilterText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
/**
 * Default filter for `ComboBox`: a case- and diacritic-insensitive
 * "contains" match between the item text and the input text.
 *
 * @param textValue - Text representation of the item
 * @param inputValue - Current input text
 * @returns `true` when the normalized item text contains the normalized input text
 */
export function defaultComboBoxFilter(textValue, inputValue) {
  return normalizeFilterText(textValue).includes(normalizeFilterText(inputValue.trim()));
}
