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
 * Default filter for `Autocomplete`: a case- and diacritic-insensitive
 * "contains" match between the item text and the search text.
 *
 * @param textValue - Text representation of the item
 * @param inputValue - Current search text
 * @returns `true` when the normalized item text contains the normalized search text
 */
export function defaultAutocompleteFilter(textValue, inputValue) {
  return normalizeFilterText(textValue).includes(normalizeFilterText(inputValue.trim()));
}
