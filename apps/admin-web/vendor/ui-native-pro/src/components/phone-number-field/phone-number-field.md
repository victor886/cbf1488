# PhoneNumberField

An international phone number field with per-country as-you-type formatting, validation, E.164 output, smart paste, and a searchable country picker.

> `PhoneNumberField` extends the heroui-native `InputGroup` (the input row), `Select` (the country picker, always in the `"dialog"` presentation), and `SearchField` (country filtering). Formatting follows per-country masks generated from `libphonenumber-js` metadata; validation, E.164 output and length limits use `libphonenumber-js` when the optional peer dependency is installed.

## Import

```tsx
import { PhoneNumberField } from 'heroui-native-pro';
```

## Anatomy

```tsx
<PhoneNumberField>
  <Label>...</Label>
  <PhoneNumberField.InputGroup>
    <PhoneNumberField.Prefix>
      <PhoneNumberField.Select>
        <PhoneNumberField.Trigger />
        <PhoneNumberField.Portal>
          <PhoneNumberField.Overlay />
          <PhoneNumberField.Content>
            <PhoneNumberField.ContentHandle />
            <PhoneNumberField.SearchInput />
            <PhoneNumberField.CountryList />
          </PhoneNumberField.Content>
        </PhoneNumberField.Portal>
      </PhoneNumberField.Select>
    </PhoneNumberField.Prefix>
    <PhoneNumberField.Input />
    <PhoneNumberField.Suffix>...</PhoneNumberField.Suffix>
  </PhoneNumberField.InputGroup>
  <Description>...</Description>
  <FieldError>...</FieldError>
</PhoneNumberField>
```

- **PhoneNumberField**: Root container. Owns the number, country, and picker open state; provides form field context (for Label, Description, FieldError). Controlled and uncontrolled modes for all three states.
- **PhoneNumberField.InputGroup**: Layout container for the input row (re-exported `InputGroup`).
- **PhoneNumberField.Prefix**: Leading slot of the input row hosting the country picker trigger.
- **PhoneNumberField.Suffix**: Optional trailing slot for custom decorators.
- **PhoneNumberField.Input**: Masked national number input. `value` / `onChangeText` are driven by context; the placeholder defaults to a mask-derived example for the selected country.
- **PhoneNumberField.Select**: Country picker `Select` root wired to the field state (dialog presentation, single selection).
- **PhoneNumberField.Trigger**: Picker trigger. Renders the selected country flag and dial code by default; pass `children` to override.
- **PhoneNumberField.Portal**: Portal wrapper that re-provides the field context across the portal boundary.
- **PhoneNumberField.Overlay**: Backdrop behind the picker surface.
- **PhoneNumberField.Content**: Dialog picker surface (swipeable to dismiss).
- **PhoneNumberField.ContentBackground**: Theme-aware background layer of the picker surface (re-exported from `Select.ContentBackground`); pass a customized instance to the `background` prop of `PhoneNumberField.Content`.
- **PhoneNumberField.ContentHandle**: Decorative drag-handle bar signaling the dialog can be swiped to dismiss.
- **PhoneNumberField.SearchInput**: `SearchField` filtering the country list by name, ISO code, or dial code.
- **PhoneNumberField.CountryList**: Virtualized (`FlatList`), search-filtered country list with default rows and an empty fallback.
- **PhoneNumberField.CountryItem**: Single selectable country row — flag, dial code, name, and a selection indicator by default.

## Usage

### Basic Usage

The field resolves its initial country from `defaultCountry`, then the device locale region, then `"US"`. Typing formats the number as-you-type for the selected country.

```tsx
<PhoneNumberField>
  <Label>Phone number</Label>
  <PhoneNumberField.InputGroup>
    <PhoneNumberField.Prefix>
      <PhoneNumberField.Select>
        <PhoneNumberField.Trigger />
        <PhoneNumberField.Portal>
          <PhoneNumberField.Overlay />
          <PhoneNumberField.Content>
            <PhoneNumberField.SearchInput />
            <PhoneNumberField.CountryList />
          </PhoneNumberField.Content>
        </PhoneNumberField.Portal>
      </PhoneNumberField.Select>
    </PhoneNumberField.Prefix>
    <PhoneNumberField.Input />
  </PhoneNumberField.InputGroup>
</PhoneNumberField>
```

### Value Details and Validation

`onValueChange` receives the full value details on every change — unformatted digits, the formatted display value, the E.164 representation, the selected country, and validity flags.

```tsx
const [details, setDetails] = useState<PhoneNumberFieldValueDetails>();

const isInvalid = details !== undefined && details.nationalNumber !== '' && !details.isValid;

<PhoneNumberField isRequired isInvalid={isInvalid} onValueChange={setDetails}>
  <Label>Phone number</Label>
  <PhoneNumberField.InputGroup>...</PhoneNumberField.InputGroup>
  <Description hideOnInvalid>We'll text a verification code.</Description>
  <FieldError>Enter a valid phone number</FieldError>
</PhoneNumberField>;
```

### Picking a Country

The picker opens with the selected country centred in the visible area, and picking a different one clears the number: a national number only means something inside its own numbering plan, so keeping the digits would leave a number that formats as valid while belonging to neither country. Both `onCountryChange` and `onValueChange` fire, the latter with empty digits.

Country changes that come from the number itself — smart paste and dial code typing — keep the digits, since those already belong to the detected country.

### Smart Paste

Text that starts with a `+` is read as an international number: the country is detected from the dial code and the remainder is kept as the national number. Pasting `+49 30 901820` switches the field to Germany and fills `30 901820`.

Typing works the same way. A dial code that is still ambiguous (`+`, `+3`) stays visible as typed until enough digits identify a country, at which point the field switches and the remaining digits continue as the national number.

### Controlled

The national number digits, the country, and the picker open state can each be controlled independently.

```tsx
const [digits, setDigits] = useState('');
const [country, setCountry] = useState('DE');
const [isOpen, setIsOpen] = useState(false);

<PhoneNumberField
  value={digits}
  country={country}
  isOpen={isOpen}
  onValueChange={(details) => setDigits(details.nationalNumber)}
  onCountryChange={(next) => setCountry(next.code)}
  onOpenChange={setIsOpen}
>
  ...
</PhoneNumberField>;
```

### Restricting the Country List

Pass a filtered `countries` array to restrict, reorder, or relabel the available countries. The full built-in dataset is exported as `PHONE_NUMBER_FIELD_COUNTRIES`.

```tsx
import { PHONE_NUMBER_FIELD_COUNTRIES } from 'heroui-native-pro';

const NORTH_AMERICA = PHONE_NUMBER_FIELD_COUNTRIES.filter((country) =>
  ['US', 'CA', 'MX'].includes(country.code)
);

<PhoneNumberField defaultCountry="CA" countries={NORTH_AMERICA}>
  ...
</PhoneNumberField>;
```

### Custom Trigger and Rows

`PhoneNumberField.Trigger` and `PhoneNumberField.CountryItem` accept `children` to replace the default content; `PhoneNumberField.CountryList` accepts `renderCountry` to replace the default rows.

```tsx
<PhoneNumberField.CountryList
  renderCountry={({ country }) => (
    <PhoneNumberField.CountryItem country={country}>
      <AppText>{country.flag}</AppText>
      <AppText className="flex-1">{country.name}</AppText>
      <AppText className="text-muted">{country.dialCode}</AppText>
    </PhoneNumberField.CountryItem>
  )}
/>
```

### libphonenumber-js

Install the optional peer dependency for metadata-driven validation, E.164 output, region detection from a pasted number, and per-prefix length limits:

```sh
npm install libphonenumber-js
```

Without it, `isValid` degrades to a completeness check, `e164` is the dial code with the digits appended, and lengths are capped by the country mask and the 15-digit E.164 budget. Formatting is the same either way, since it comes from the built-in `#`-template masks.

The masks are generated from `libphonenumber-js` metadata, so a country groups its digits the same way with or without the package installed, and the placeholder matches the value the user types: Ukraine reads `00 000 0000` and formats to `50 123 4567`, keystroke by keystroke. A literal appears exactly when the official formatting reveals it — a bracket once the group it wraps is full (`20` stays bare, `201` becomes `(201)`), a separator once the next group receives a digit. Regenerate the table with `node scripts/generate-phone-number-masks.js` after upgrading `libphonenumber-js`.

One layout per country, always the placeholder's: the value never rearranges digits the user has already seen. As-you-type grouping from `libphonenumber-js` is not used for numbers that fit the mask, because its rules are picked per prefix and per length and therefore move separators mid-word — an Albanian number walks through `77 777`, `777 777` and `777 77777` before landing on the placeholder's `77 777 7777`, and a Belize number starting with a zero, which no rule covers, reads `0-000-000` against a `000-0000` placeholder.

The layout also holds for numbers longer than the mask, which take their extra digits onto the last group. A mask describes a country's common format, and plenty of plans reach further: Belize adds an eleven-digit toll-free range (`0800…`) to its seven-digit numbers, and German numbers run from four digits to fifteen against an eleven-digit mask. Those lengths are accepted — the cap comes from the numbering plan, not from the mask — they just keep the country's one layout, so a long German number reads `3012 3456789012` rather than regrouping to `30 1234567890` at the twelfth keystroke.

The trade is that a number whose format differs from the placeholder's is grouped like the placeholder rather than in its own national style: a Berlin landline reads `3090 1820` (the grouping `libphonenumber-js` own as-you-type formatter also gives it) instead of `30 901820`, and a Belize toll-free number reads `080-01234567` rather than `0-800-1234-567`. Grouping is presentation only — `nationalNumber`, `e164`, `isValid` and `isComplete` come from the digits and are unaffected.

So the placeholder is one example of the country's numbers, in the way the iOS Contacts field shows one, and not a statement of how long a number may be. A Belize field placeholds `000-0000` and still accepts `080-01234567`, because both belong to the plan. Where a field should promise a single length — a form that only takes mobile numbers, say — pass `maxLength` on `PhoneNumberField.Input`.

## Example

```tsx
import { Description, Label } from 'heroui-native';
import { PhoneNumberField } from 'heroui-native-pro';
import { View } from 'react-native';

export default function PhoneNumberFieldExample() {
  return (
    <View className="flex-1 justify-center px-5">
      <PhoneNumberField>
        <Label>Phone number</Label>
        <PhoneNumberField.InputGroup>
          <PhoneNumberField.Prefix>
            <PhoneNumberField.Select>
              <PhoneNumberField.Trigger />
              <PhoneNumberField.Portal>
                <PhoneNumberField.Overlay />
                <PhoneNumberField.Content>
                  <PhoneNumberField.ContentHandle />
                  <PhoneNumberField.SearchInput />
                  <PhoneNumberField.CountryList />
                </PhoneNumberField.Content>
              </PhoneNumberField.Portal>
            </PhoneNumberField.Select>
          </PhoneNumberField.Prefix>
          <PhoneNumberField.Input />
        </PhoneNumberField.InputGroup>
        <Description>We'll send a verification code to this number</Description>
      </PhoneNumberField>
    </View>
  );
}
```

## API Reference

### PhoneNumberField

| prop              | type                                              | default | description                                                                       |
| ----------------- | ------------------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `children`        | `React.ReactNode`                                 | -       | Children elements (Label, InputGroup, Description, FieldError)                    |
| `value`           | `string`                                          | -       | Controlled national number digits (unformatted, e.g. `"5551234567"`)              |
| `defaultValue`    | `string`                                          | -       | Uncontrolled initial national number digits                                       |
| `country`         | `string`                                          | -       | Controlled selected country as an ISO 3166-1 alpha-2 code (e.g. `"US"`)           |
| `defaultCountry`  | `string`                                          | locale  | Uncontrolled initial country; falls back to the device locale region, then `"US"` |
| `isOpen`          | `boolean`                                         | -       | Controlled open state of the country picker                                       |
| `isDefaultOpen`   | `boolean`                                         | -       | Uncontrolled initial open state of the country picker                             |
| `countries`       | `PhoneNumberFieldCountry[]`                       | all     | Custom country list (restrict, reorder, or relabel)                               |
| `isDisabled`      | `boolean`                                         | `false` | Whether the entire field is disabled                                              |
| `isInvalid`       | `boolean`                                         | `false` | Whether the field is in an invalid state                                          |
| `isRequired`      | `boolean`                                         | `false` | Whether the field is required                                                     |
| `className`       | `string`                                          | -       | Additional CSS classes for the root container                                     |
| `onValueChange`   | `(details: PhoneNumberFieldValueDetails) => void` | -       | Called when the number or country changes with the full value details             |
| `onCountryChange` | `(country: PhoneNumberFieldCountry) => void`      | -       | Called when the selected country changes (picker, smart paste, dial code typing)  |
| `onOpenChange`    | `(open: boolean) => void`                         | -       | Called when the country picker open state changes                                 |
| `animation`       | `AnimationRootDisableAll`                         | -       | `"disable-all"` disables all animations in the subtree                            |
| `...ViewProps`    | `ViewProps`                                       | -       | All standard React Native View props are supported                                |

#### PhoneNumberFieldCountry

| property   | type     | description                                                       |
| ---------- | -------- | ----------------------------------------------------------------- |
| `code`     | `string` | ISO 3166-1 alpha-2 country code (e.g. `"US"`)                     |
| `name`     | `string` | English display name                                              |
| `dialCode` | `string` | International dial code including the leading plus sign (`"+44"`) |
| `flag`     | `string` | Flag emoji derived from the ISO code                              |

#### PhoneNumberFieldValueDetails

| property          | type                      | description                                                                      |
| ----------------- | ------------------------- | -------------------------------------------------------------------------------- |
| `nationalNumber`  | `string`                  | National number digits without formatting (`"5551234567"`)                       |
| `formattedNumber` | `string`                  | Formatted national number as displayed (`"(555) 123-4567"`)                      |
| `e164`            | `string`                  | Full number in E.164 format (`"+15551234567"`); empty when no digits are entered |
| `country`         | `PhoneNumberFieldCountry` | The currently selected country                                                   |
| `isValid`         | `boolean`                 | Whether the number is valid for the selected country                             |
| `isComplete`      | `boolean`                 | Whether the number has a plausible length for the selected country               |

### PhoneNumberField.InputGroup / PhoneNumberField.Prefix / PhoneNumberField.Suffix

Same props as the corresponding heroui-native `InputGroup` parts.

### PhoneNumberField.Input

Extends `InputGroup.Input` (minus `value` / `onChangeText`, which come from the field context).

Once the selected country's numbering plan has no room for another digit, the input caps its own `maxLength` at the current text length, so the platform stops accepting keystrokes the field would trim away. The limit follows the number's prefix rather than the country alone, because a plan often allows different lengths for different prefixes: a Ukrainian `50…` number stops at nine digits while a `90…` number takes ten, and countries whose numbers genuinely vary in length keep growing. The cap lifts while text is selected — pasting a longer number over a full one stays possible — and passing `maxLength` replaces the behavior with a fixed limit.

| prop                 | type                     | default          | description                                                              |
| -------------------- | ------------------------ | ---------------- | ------------------------------------------------------------------------ |
| `placeholder`        | `string`                 | mask example     | Placeholder; defaults to a mask-derived example for the selected country |
| `maxLength`          | `number`                 | country maximum  | Character limit; defaults to the selected country's maximum length       |
| `keyboardType`       | `KeyboardTypeOptions`    | `'phone-pad'`    | Keyboard type                                                            |
| `textAlign`          | `'left' \| ...`          | `'left'`         | Deliberately physical: phone numbers read left-to-right in every locale  |
| `isDisabled`         | `boolean`                | root value       | Whether the input is disabled                                            |
| `accessibilityLabel` | `string`                 | `'Phone number'` | Screen reader label                                                      |
| `onChangeText`       | `(text: string) => void` | -                | Runs after the internal handler with the raw text                        |
| `...InputProps`      | `InputGroupInputProps`   | -                | All `InputGroup.Input` props are supported                               |

### PhoneNumberField.Select

`Select` root wired to the field state. All `Select` root props are supported except the state props (`value`, `isOpen`, `onValueChange`, `onOpenChange`, …), `selectionMode`, and `presentation`, which are owned by the field.

### PhoneNumberField.Trigger

Extends `Select.Trigger` (minus `variant`, fixed to `"unstyled"`). Dismisses the keyboard on press.

| prop                 | type                                                | default          | description                                  |
| -------------------- | --------------------------------------------------- | ---------------- | -------------------------------------------- |
| `children`           | `React.ReactNode`                                   | flag + dial code | Custom trigger content replacing the default |
| `classNames`         | `{ base?, flag?, dialCode? }`                       | -                | CSS classes per slot                         |
| `styles`             | `{ base?: ViewStyle; flag?, dialCode?: TextStyle }` | -                | Styles per slot                              |
| `accessibilityLabel` | `string`                                            | country + code   | Screen reader label                          |
| `...TriggerProps`    | `SelectTriggerProps`                                | -                | All `Select.Trigger` props are supported     |

### PhoneNumberField.Portal / PhoneNumberField.Overlay / PhoneNumberField.ContentBackground

Same props as the corresponding `Select` parts. `PhoneNumberField.Portal` re-provides the field context across the portal boundary.

### PhoneNumberField.Content

Same props as `Select.Content`, always with the `"dialog"` presentation.

Unlike a plain `Select` dialog, the surface is pinned below the top safe area instead of being centered, and its height defaults to half the space below that. The search input takes focus as soon as the picker opens, so the lower part of the screen belongs to the keyboard; anchoring the surface at the top and capping its height keeps all of it visible without any keyboard avoidance. No sizing is needed at the call site:

```tsx
<PhoneNumberField.Content>
  <PhoneNumberField.ContentHandle />
  <PhoneNumberField.SearchInput />
  <PhoneNumberField.CountryList />
</PhoneNumberField.Content>
```

Every part of that is overridable — `style` (or `styles.content`) for the height and the `marginTop` offset, `classNames.wrapper` to center the surface again:

```tsx
<PhoneNumberField.Content style={{ height: 420 }}>
```

A taller surface may end up behind the keyboard; pair a centered or full-height surface with `autoFocus={false}` on `PhoneNumberField.SearchInput`.

### PhoneNumberField.ContentHandle

| prop           | type        | default | description                                        |
| -------------- | ----------- | ------- | -------------------------------------------------- |
| `className`    | `string`    | -       | Additional CSS classes for the handle bar          |
| `...ViewProps` | `ViewProps` | -       | All standard React Native View props are supported |

### PhoneNumberField.SearchInput

Extends `SearchField` root props (minus `value` / `onChange`, which come from the field context). Renders the default `SearchField.Group` anatomy (`SearchIcon` + `Input` + `ClearButton`); pass `children` to compose the `SearchField.*` parts yourself.

The default input focuses when the picker opens, so the keyboard is ready for typing right away — the dialog portal unmounts its content on close, which makes this a plain mount-time focus that repeats on every open. Pass `autoFocus={false}` for a picker that is mostly browsed by scrolling.

| prop                  | type                     | default    | description                                                                       |
| --------------------- | ------------------------ | ---------- | --------------------------------------------------------------------------------- |
| `children`            | `React.ReactNode`        | -          | Custom `SearchField` composition; replaces the default when provided              |
| `autoFocus`           | `boolean`                | `true`     | Whether the default input focuses when the picker opens (ignored with `children`) |
| `inputProps`          | `SearchFieldInputProps`  | -          | Props for the default input (`variant` defaults to `"secondary"`)                 |
| `isDisabled`          | `boolean`                | root value | Whether the search field is disabled                                              |
| `onChange`            | `(text: string) => void` | -          | Runs after the internal search query update                                       |
| `className`           | `string`                 | -          | Additional CSS classes                                                            |
| `...SearchFieldProps` | `SearchFieldProps`       | -          | All `SearchField` props are supported                                             |

### PhoneNumberField.CountryList

Extends `FlatList` props (minus `data` / `renderItem`). The list mounts with the selected country centred in the visible area, so there are rows to scroll through in both directions; pass `initialScrollIndex={null}` to open at the top instead.

Jumping hundreds of rows down needs to know how tall a row is, so the list measures its first row and treats the rest as equally tall — true for the default rows and for most custom ones. Rows that deliberately vary in height should come with their own `getItemLayout`.

| prop                 | type                                                   | default                | description                                                    |
| -------------------- | ------------------------------------------------------ | ---------------------- | -------------------------------------------------------------- |
| `countries`          | `PhoneNumberFieldCountry[]`                            | filtered list          | Custom data source                                             |
| `renderCountry`      | `(info: PhoneNumberFieldCountryRenderInfo) => element` | `CountryItem`          | Custom row renderer                                            |
| `emptyText`          | `string`                                               | `'No countries found'` | Message when the search matches no countries                   |
| `className`          | `string`                                               | -                      | Additional CSS classes for the list container                  |
| `classNames`         | `{ base?, empty?, emptyText? }`                        | -                      | CSS classes per slot                                           |
| `styles`             | `{ base?, empty?: ViewStyle; emptyText?: TextStyle }`  | -                      | Styles per slot                                                |
| `initialScrollIndex` | `number \| null`                                       | selected country row   | Row the list centres on when it opens; `null` opens at the top |
| `getItemLayout`      | `FlatListProps['getItemLayout']`                       | measured row height    | Row geometry; override for variable-height rows                |
| `...FlatListProps`   | `FlatListProps`                                        | -                      | All standard FlatList props are supported                      |

### PhoneNumberField.CountryItem

Extends `Select.Item` (minus `value` / `label`, derived from `country`).

| prop           | type                                     | default     | description                                          |
| -------------- | ---------------------------------------- | ----------- | ---------------------------------------------------- |
| `country`      | `PhoneNumberFieldCountry`                | -           | The country entry rendered by this row               |
| `children`     | `React.ReactNode`                        | default row | Custom row content replacing flag / dial code / name |
| `classNames`   | `{ flag?, dialCode?, name? }`            | -           | CSS classes per slot                                 |
| `styles`       | `{ flag?, dialCode?, name?: TextStyle }` | -           | Styles per slot                                      |
| `...ItemProps` | `SelectItemProps`                        | -           | All `Select.Item` props are supported                |

## Hooks

### usePhoneNumberField

Hook to access the PhoneNumberField context. Must be used within a `PhoneNumberField` component.

```tsx
import { usePhoneNumberField } from 'heroui-native-pro';

const { country, nationalNumber, formattedNumber, isOpen } = usePhoneNumberField();
```

#### Returns: PhoneNumberFieldContextValue

| property              | type                                         | description                                                                                                     |
| --------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `country`             | `PhoneNumberFieldCountry`                    | The currently selected country                                                                                  |
| `countries`           | `PhoneNumberFieldCountry[]`                  | Full country list available in the picker                                                                       |
| `filteredCountries`   | `PhoneNumberFieldCountry[]`                  | Country list filtered by the current search query                                                               |
| `nationalNumber`      | `string`                                     | National number digits without formatting                                                                       |
| `formattedNumber`     | `string`                                     | Formatted national number                                                                                       |
| `inputValue`          | `string`                                     | Text displayed by the input — the formatted national number, or the raw prefix while a dial code is being typed |
| `placeholder`         | `string`                                     | Mask-derived placeholder for the selected country                                                               |
| `isOpen`              | `boolean`                                    | Whether the country picker is open                                                                              |
| `searchQuery`         | `string`                                     | Current country search query                                                                                    |
| `isDisabledRoot`      | `boolean`                                    | Whether the root field is disabled                                                                              |
| `onInputChangeText`   | `(text: string) => void`                     | Commits raw text typed into the phone input                                                                     |
| `onCountrySelect`     | `(country: PhoneNumberFieldCountry) => void` | Commits a country selection                                                                                     |
| `onOpenChange`        | `(open: boolean) => void`                    | Changes the picker open state                                                                                   |
| `onSearchQueryChange` | `(query: string) => void`                    | Changes the country search query                                                                                |

## Utilities

Exported helpers for working with phone numbers outside the component:

| export                         | signature                                       | description                                                         |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------- |
| `PHONE_NUMBER_FIELD_COUNTRIES` | `PhoneNumberFieldCountry[]`                     | The full built-in country dataset                                   |
| `buildE164PhoneNumber`         | `(digits, country) => string`                   | E.164 representation (`"+15551234567"`)                             |
| `getIsValidPhoneNumber`        | `(digits, country) => boolean`                  | Validity for the country (numbering plans with `libphonenumber-js`) |
| `getIsCompletePhoneNumber`     | `(digits, country) => boolean`                  | Plausible-length check for the country                              |
| `findCountryByCode`            | `(countries, code) => country \| undefined`     | Lookup by ISO 3166-1 alpha-2 code (case-insensitive)                |
| `findCountryByDialCode`        | `(countries, dialCode) => country \| undefined` | Lookup by dial code, resolving shared codes (e.g. NANP `+1`)        |
