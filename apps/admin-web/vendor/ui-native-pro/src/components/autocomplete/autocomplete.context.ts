// @ts-nocheck
import { createContext } from '../../helpers/internal/utils/index';
/**
 * Context for `Autocomplete` managed search text and item filtering.
 * Selection and open state stay in the wrapped `Select` (read them via
 * `useSelect` from `heroui-native/select` when needed).
 */
const [AutocompleteProvider, useAutocomplete] = createContext({
  name: 'AutocompleteContext',
  strict: true,
  errorMessage: 'Autocomplete compound components must be used within `Autocomplete`.',
});
export { AutocompleteProvider, useAutocomplete };
