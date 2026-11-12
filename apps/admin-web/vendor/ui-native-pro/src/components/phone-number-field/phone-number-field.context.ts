// @ts-nocheck
import { createContext } from '../../helpers/internal/utils/index';
const [PhoneNumberFieldProvider, usePhoneNumberField] = createContext({
  name: 'PhoneNumberFieldContext',
  strict: true,
  errorMessage:
    'PhoneNumberField compound components must be used within `PhoneNumberField` (for example `PhoneNumberField.Input`).',
});
export { PhoneNumberFieldProvider, usePhoneNumberField };
