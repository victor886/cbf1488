import { createContext } from '../../helpers/internal/utils/create-context';
import type { YearPickerContextValue } from './calendar-year-picker.types';
const [YearPickerContextProvider, useYearPicker, YearPickerContext] =
  createContext<YearPickerContextValue>({
    name: 'HeroUINative.YearPicker',
    errorMessage:
      'useYearPicker must be used within Calendar or RangeCalendar (year picker enabled).',
  });
export { useYearPicker, YearPickerContext, YearPickerContextProvider };
