// @ts-nocheck
import LibPhoneNumberPackage from '../../optional/libphonenumber-js';
import {
  BIDI_LEFT_TO_RIGHT_ISOLATE,
  BIDI_POP_DIRECTIONAL_ISOLATE,
  DEFAULT_COUNTRY_CODE,
  FALLBACK_MASK_MAP,
  MAX_E164_DIGITS,
  MAX_NATIONAL_DIGITS,
  PREFERRED_COUNTRY_FOR_DIAL_CODE_MAP,
} from './phone-number-field.constants';
/**
 * Strips bidirectional control marks (LRM, RLM, ALM, embedding/override/isolate
 * marks) that RTL keyboards insert around phone numbers and that
 * `PhoneNumberField.Input` prepends to its display value under RTL layouts.
 */
export function stripBidiControlMarks(text) {
  return text.replace(/[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g, '');
}
/**
 * Strips bidi control marks, then removes every non-digit character.
 */
export function sanitizePhoneNumberDigits(text) {
  return stripBidiControlMarks(text).replace(/\D/g, '');
}
/**
 * Wraps a weak-direction fragment (a dial code like `"+44"`) in a Unicode
 * left-to-right isolate. Inside an RTL paragraph the leading plus sign is a
 * neutral character and would otherwise be reordered to the end (`"44+"`);
 * the isolate pins the fragment left-to-right without affecting the
 * surrounding text.
 */
export function isolateBidiLtr(text) {
  return `${BIDI_LEFT_TO_RIGHT_ISOLATE}${text}${BIDI_POP_DIRECTIONAL_ISOLATE}`;
}
/**
 * Splits a mask into its digit groups (runs of `#`) and the literal runs
 * between them, so a partially filled mask can decide which literals belong on
 * screen yet.
 */
function tokenizePhoneNumberMask(mask) {
  const tokens = [];
  let literal = '';
  let groupSize = 0;
  for (const maskChar of mask) {
    if (maskChar === '#') {
      groupSize += 1;
      continue;
    }
    if (groupSize > 0) {
      tokens.push({
        literal,
        groupSize,
      });
      literal = '';
      groupSize = 0;
    }
    literal += maskChar;
  }
  tokens.push({
    literal,
    groupSize,
  });
  return tokens;
}
/**
 * Fills a `#`-template mask with digits, revealing each literal at the moment
 * the official as-you-type formatting would: a bracket appears once the group
 * it wraps is complete (`"20"` → `"20"`, `"201"` → `"(201)"`), a separator once
 * the following group receives its first digit (`"(201) 5"`, never `"(201) "`).
 * Digits left over once the mask is exhausted are appended unformatted — masks
 * describe the common national format, not the full numbering plan, so a
 * longer-than-usual number must still be typeable.
 *
 * @param digits - National number digits.
 * @param mask - Template where `#` is a digit placeholder (e.g. `"(###) ###-####"`).
 */
export function applyPhoneNumberMask(digits, mask) {
  const tokens = tokenizePhoneNumberMask(mask);
  let result = '';
  let digitIndex = 0;
  /** Digits needed to fill every group before the one in the current token. */
  let digitsThroughPreviousGroup = 0;
  for (const { literal, groupSize } of tokens) {
    const digitsThroughGroup = digitsThroughPreviousGroup + groupSize;
    for (const literalChar of literal) {
      const isClosingBracket = literalChar === ')' || literalChar === ']';
      const isOpeningBracket = literalChar === '(' || literalChar === '[';
      /**
       * A bracket belongs to the group it wraps — an opening one to the group
       * ahead of it, a closing one to the group already printed — and only
       * shows once that group is full. Everything else separates two groups
       * and waits for the second one to receive a digit.
       */
      const isVisible = isClosingBracket
        ? digitsThroughPreviousGroup > 0 && digits.length >= digitsThroughPreviousGroup
        : isOpeningBracket
          ? groupSize > 0 && digits.length >= digitsThroughGroup
          : digits.length > digitsThroughPreviousGroup;
      if (isVisible) {
        result += literalChar;
      }
    }
    if (groupSize === 0) {
      continue;
    }
    const remaining = digits.length - digitIndex;
    if (remaining <= 0) {
      break;
    }
    const taken = Math.min(groupSize, remaining);
    result += digits.slice(digitIndex, digitIndex + taken);
    digitIndex += taken;
    digitsThroughPreviousGroup = digitsThroughGroup;
  }
  return `${result}${digits.slice(digitIndex)}`;
}
/**
 * Counts the digit placeholders (`#`) in a mask template.
 */
export function countMaskDigits(mask) {
  let count = 0;
  for (const maskChar of mask) {
    if (maskChar === '#') {
      count += 1;
    }
  }
  return count;
}
/**
 * Whether the country's national formatting rules cover this prefix at all,
 * answered by asking about a number long enough for a rule to apply.
 *
 * Short numbers sit below every grouping rule, so the national formatter
 * returns them unchanged — the same answer it gives for a country whose rules
 * never apply without a trunk prefix (Germany). Padding tells the two apart:
 * a Paraguayan `"9614"` grows into the grouped `"9614 567 89"`, a German
 * `"309"` stays bare no matter how long it gets. Knowing which of the two it is
 * decides whether the numbering plan still has room for another digit.
 *
 * @param digits - National number digits typed so far.
 * @param country - Selected country.
 */
function getHasNationalFormattingRule(digits, country) {
  if (!LibPhoneNumberPackage) {
    return false;
  }
  const mask = FALLBACK_MASK_MAP[country.code];
  const targetLength = mask ? countMaskDigits(mask) : getMaxNationalDigits(country);
  if (digits.length >= targetLength) {
    return false;
  }
  const padded = digits.padEnd(targetLength, '0');
  return LibPhoneNumberPackage.formatIncompletePhoneNumber(padded, country.code) !== padded;
}
/**
 * Groups national number digits using `libphonenumber-js` metadata, or returns
 * `null` when the package is absent or no numbering rule covers the digits.
 *
 * Used to tell whether the plan still describes a number one digit longer, and
 * to group countries that have no mask — a custom `countries` entry, since
 * every built-in country has one. The rest are formatted from their mask
 * instead (see `formatNationalNumber`).
 *
 * A rule is only considered matched when the result differs from the input:
 * `libphonenumber-js` echoes the digits back for an in-progress number whose
 * prefix belongs to no rule (`"000000000"` for Ukraine, say), which says
 * nothing about how the number should be grouped.
 *
 * @param digits - National number digits.
 * @param country - Selected country.
 */
function groupNationalNumberWithMetadata(digits, country) {
  if (!LibPhoneNumberPackage) {
    return null;
  }
  try {
    const { formatIncompletePhoneNumber } = LibPhoneNumberPackage;
    const national = formatIncompletePhoneNumber(digits, country.code);
    if (national !== '' && national !== digits) {
      return national;
    }
    /**
     * The national rules own this prefix and simply have no separator to add
     * yet. Reaching for another source here is what makes separators jump
     * later: Paraguay's `"9614"` would print as the international `"961 4"`,
     * only to regroup into `"9614 5"` on the next keystroke.
     */
    if (getHasNationalFormattingRule(digits, country)) {
      return digits;
    }
    /**
     * Countries with a national (trunk) prefix — Germany's `"0"`, for
     * instance — only match a national formatting rule when that prefix is
     * present, and the field stores the national significant number without
     * it. Formatting the international form and dropping the dial code
     * yields the same grouping (`"+49 1511 2345678"` → `"1511 2345678"`).
     */
    const international = formatIncompletePhoneNumber(`${country.dialCode}${digits}`);
    if (international.startsWith(country.dialCode)) {
      const withoutDialCode = international.slice(country.dialCode.length).trim();
      if (withoutDialCode !== '' && withoutDialCode !== digits) {
        return withoutDialCode;
      }
    }
  } catch {
    /* Treated as "no metadata available". */
  }
  return null;
}
/**
 * Formats national number digits for display, following the country mask — the
 * same template the placeholder shows — so the value a user types always lands
 * in the shape the field promised.
 *
 * As-you-type grouping from `libphonenumber-js` is deliberately not used while
 * the number fits the mask. Its rules are chosen per prefix and per length, so
 * they rearrange digits already on screen mid-word: an Albanian number reads
 * `"77 777"`, then `"777 777"`, then `"77 777 7777"`, and a Botswanan one walks
 * through four layouts before landing on the placeholder's. Prefixes no rule
 * covers fare worse — Belize renders `"0-000-000"` against a `"000-0000"`
 * placeholder. One template per country trades per-prefix grouping (a Berlin
 * landline reads `"3090 1820"`, the grouping `libphonenumber-js` own as-you-type
 * formatter gives it, rather than `"30 901820"`) for a layout that never moves
 * under the caret. Grouping is presentation only: `nationalNumber`, `e164` and
 * validity come from the digits and are unaffected.
 *
 * Numbers that outgrow the mask keep it and take the extra digits onto the last
 * group, rather than switching to the grouping the metadata gives their length.
 * A mask describes a country's common format, and several plans reach further:
 * Belize adds an eleven-digit toll-free range on top of its seven-digit
 * numbers, Germany's numbers run from four digits to fifteen. Handing those
 * lengths to the metadata regroups the digits already typed — a German number
 * would turn `"3012 3456789"` into `"30 1234567890"` on the twelfth keystroke,
 * and a Belize toll-free number `"080-0123"` into `"0-800-1234"` on the eighth.
 * The layout the field opened with therefore holds for the whole number.
 *
 * Countries without a known mask are grouped by metadata, and left as bare
 * digits when the package is absent.
 *
 * @param digits - National number digits.
 * @param country - Selected country.
 */
export function formatNationalNumber(digits, country) {
  if (digits === '') {
    return '';
  }
  const mask = FALLBACK_MASK_MAP[country.code];
  if (mask === undefined) {
    return groupNationalNumberWithMetadata(digits, country) ?? digits;
  }
  return applyPhoneNumberMask(digits, mask);
}
/**
 * Maximum national number digits the country's dial code leaves within the
 * E.164 budget (15 digits including the dial code) — e.g. 13 for Germany
 * (`"+49"`). This is the outermost limit: it applies on its own when
 * `libphonenumber-js` is not installed, and bounds the metadata-driven checks
 * otherwise.
 */
export function getMaxNationalDigits(country) {
  const dialCodeDigits = sanitizePhoneNumberDigits(country.dialCode).length;
  if (dialCodeDigits === 0 || dialCodeDigits >= MAX_E164_DIGITS) {
    return MAX_NATIONAL_DIGITS;
  }
  return MAX_E164_DIGITS - dialCodeDigits;
}
/**
 * Trims trailing digits the country's numbering plan cannot accept, so a value
 * that arrives faster than the input's `maxLength` can react — a paste, a
 * controlled `value`, keystrokes typed ahead of a render — never settles into a
 * number longer than the plan describes.
 *
 * Uses `getIsNationalNumberAtMaxLength` per digit when `libphonenumber-js` is
 * installed, and the E.164 digit budget otherwise.
 */
export function trimDigitsToCountryLimit(digits, country) {
  if (digits === '') {
    return digits;
  }
  let trimmed = digits.slice(0, getMaxNationalDigits(country));
  if (LibPhoneNumberPackage) {
    while (trimmed.length > 1 && getIsNationalNumberAtMaxLength(trimmed.slice(0, -1), country)) {
      trimmed = trimmed.slice(0, -1);
    }
  }
  return trimmed;
}
/**
 * Whether the country's numbering plan leaves room for another digit after the
 * ones already entered.
 *
 * A country's possible lengths span all of its prefixes, so length alone is too
 * permissive: Ukraine allows ten national digits, but only for numbers starting
 * with 8 or 9, and a `"50…"` number that accepted a tenth digit grew past
 * anything the plan describes. The question is therefore whether the number can
 * still be *formatted* one digit longer — formatting rules are chosen by prefix
 * and have a fixed capacity, so losing the rule means the plan has run out of
 * room for this prefix. Countries whose numbers genuinely vary in length keep
 * growing, because a longer rule takes over.
 *
 * Digits that match no rule at all (a run of zeros, say) are capped at the
 * country mask instead, which is the length the placeholder advertises. Without
 * `libphonenumber-js` only the E.164 budget is known.
 *
 * @param digits - Current national number digits.
 * @param country - Selected country.
 */
export function getIsNationalNumberAtMaxLength(digits, country) {
  if (digits === '') {
    return false;
  }
  if (LibPhoneNumberPackage) {
    try {
      const isBeyondPlan =
        LibPhoneNumberPackage.validatePhoneNumberLength(`${digits}0`, country.code) === 'TOO_LONG';
      if (isBeyondPlan) {
        return true;
      }
      if (groupNationalNumberWithMetadata(digits, country) !== null) {
        for (let digit = 0; digit <= 9; digit += 1) {
          const extended = `${digits}${digit}`;
          if (groupNationalNumberWithMetadata(extended, country) !== null) {
            return false;
          }
        }
        return true;
      }
      const mask = FALLBACK_MASK_MAP[country.code];
      return mask !== undefined && digits.length >= countMaskDigits(mask);
    } catch {
      /* Fall through to the budget-based check below. */
    }
  }
  return digits.length >= getMaxNationalDigits(country);
}
/**
 * Whether the digits form a plausible complete number for the country.
 * With `libphonenumber-js` this is a metadata length check; the fallback
 * treats the country mask's digit count as a minimum plausible length,
 * because several masks are shorter than the real numbering plan.
 */
export function getIsCompletePhoneNumber(digits, country) {
  if (digits === '') {
    return false;
  }
  if (LibPhoneNumberPackage) {
    try {
      return LibPhoneNumberPackage.validatePhoneNumberLength(digits, country.code) === undefined;
    } catch {
      /* Fall through to the mask-based check below. */
    }
  }
  const maxDigits = getMaxNationalDigits(country);
  const mask = FALLBACK_MASK_MAP[country.code];
  const minDigits = mask ? countMaskDigits(mask) : 4;
  return digits.length >= minDigits && digits.length <= maxDigits;
}
/**
 * Whether the digits form a valid number for the country.
 * With `libphonenumber-js` this validates against real numbering plans; the
 * fallback is a completeness (length) check only.
 */
export function getIsValidPhoneNumber(digits, country) {
  if (digits === '') {
    return false;
  }
  if (LibPhoneNumberPackage) {
    try {
      return LibPhoneNumberPackage.isValidPhoneNumber(digits, country.code);
    } catch {
      /* Fall through to the mask-based check below. */
    }
  }
  return getIsCompletePhoneNumber(digits, country);
}
/**
 * Builds the E.164 representation (`"+15551234567"`).
 * Prefers `libphonenumber-js` parsing (handles national prefixes); falls back
 * to concatenating the country dial code with the digits.
 *
 * @returns An empty string when no digits are entered.
 */
export function buildE164PhoneNumber(digits, country) {
  if (digits === '') {
    return '';
  }
  if (LibPhoneNumberPackage) {
    try {
      const parsed = LibPhoneNumberPackage.parsePhoneNumberFromString(digits, country.code);
      if (parsed) {
        return parsed.number;
      }
    } catch {
      /* Fall through to the dial-code concatenation below. */
    }
  }
  return `${country.dialCode}${digits}`;
}
/**
 * Derives an example placeholder from the country's fallback mask
 * (`"(###) ###-####"` → `"(000) 000-0000"`).
 *
 * @returns An empty string when no mask is known for the country.
 */
export function getPhoneNumberPlaceholder(country) {
  const mask = FALLBACK_MASK_MAP[country.code];
  return mask ? mask.replace(/#/g, '0') : '';
}
/**
 * Finds a country by ISO 3166-1 alpha-2 code (case-insensitive).
 */
export function findCountryByCode(countries, code) {
  if (!code) {
    return undefined;
  }
  const normalized = code.toUpperCase();
  return countries.find((country) => country.code === normalized);
}
/**
 * Finds the country matching a dial code (e.g. `"+44"`), resolving codes
 * shared by multiple countries through `PREFERRED_COUNTRY_FOR_DIAL_CODE_MAP`.
 */
export function findCountryByDialCode(countries, dialCode) {
  const matches = countries.filter((country) => country.dialCode === dialCode);
  if (matches.length === 0) {
    return undefined;
  }
  const preferredCode = PREFERRED_COUNTRY_FOR_DIAL_CODE_MAP[dialCode];
  if (preferredCode) {
    const preferred = matches.find((country) => country.code === preferredCode);
    if (preferred) {
      return preferred;
    }
  }
  return matches[0];
}
/**
 * Result of parsing an international (`+`-prefixed) input.
 */
/**
 * Detects the country and national number from text containing a `+` (smart
 * paste / dial code typing). Uses `libphonenumber-js` region detection when
 * installed; the fallback performs a longest-dial-code prefix match.
 *
 * @returns `undefined` when no country in the list matches.
 */
export function parseInternationalPhoneNumberInput(countries, text) {
  const digits = sanitizePhoneNumberDigits(text);
  if (digits === '') {
    return undefined;
  }
  if (LibPhoneNumberPackage) {
    try {
      const parsed = LibPhoneNumberPackage.parsePhoneNumberFromString(`+${digits}`);
      if (parsed) {
        const byRegion = findCountryByCode(countries, parsed.country);
        const byDialCode = findCountryByDialCode(countries, `+${parsed.countryCallingCode}`);
        const country = byRegion ?? byDialCode;
        if (country) {
          return {
            country,
            nationalNumber: parsed.nationalNumber,
          };
        }
      }
    } catch {
      /* Fall through to the prefix matching below. */
    }
  }
  /** Longest-prefix match: dial codes are 1-4 digits after the plus sign. */
  const maxPrefixLength = Math.min(4, digits.length);
  for (let length = maxPrefixLength; length >= 1; length -= 1) {
    const candidate = findCountryByDialCode(countries, `+${digits.slice(0, length)}`);
    if (candidate) {
      return {
        country: candidate,
        nationalNumber: digits.slice(length),
      };
    }
  }
  return undefined;
}
/**
 * Extracts an ISO 3166-1 alpha-2 region code from the device locale
 * (e.g. `"en-US"` → `"US"`).
 */
export function getDeviceRegionCode() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const match = /[-_]([A-Za-z]{2})(?:[-_]|$)/.exec(locale);
    return match?.[1]?.toUpperCase();
  } catch {
    return undefined;
  }
}
/**
 * Resolves the initial country code: explicit `defaultCountry` prop, device
 * locale region, `DEFAULT_COUNTRY_CODE`, then the first list entry.
 */
export function resolveInitialCountryCode(countries, preferredCode) {
  const preferred = findCountryByCode(countries, preferredCode);
  if (preferred) {
    return preferred.code;
  }
  const byDeviceRegion = findCountryByCode(countries, getDeviceRegionCode());
  if (byDeviceRegion) {
    return byDeviceRegion.code;
  }
  const byDefault = findCountryByCode(countries, DEFAULT_COUNTRY_CODE);
  if (byDefault) {
    return byDefault.code;
  }
  return countries[0]?.code ?? DEFAULT_COUNTRY_CODE;
}
/**
 * Filters countries by a search query matched against the country name,
 * ISO code, and dial code (with or without the leading plus sign).
 */
export function filterCountriesByQuery(countries, query) {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') {
    return countries;
  }
  return countries.filter(
    (country) =>
      country.name.toLowerCase().includes(normalized) ||
      country.code.toLowerCase().includes(normalized) ||
      country.dialCode.includes(normalized) ||
      country.dialCode.slice(1).startsWith(normalized)
  );
}
/**
 * Options for `resolvePhoneNumberInputChange`.
 */
/**
 * Result of `resolvePhoneNumberInputChange`.
 */
/**
 * Computes the next input state from a raw text change:
 *
 * 1. **Smart paste** — text containing `+` switches the country (when detectable)
 *    and keeps the national remainder.
 * 2. **Typed dial code** — a leading `+` that is still too short to identify a
 *    country is echoed back as a draft, so the plus is not silently dropped
 *    into the current country's national number.
 * 3. **Deletion through literals** — when a backspace removed only a mask literal
 *    (digit count unchanged, text shorter), the last digit is dropped instead so
 *    the user can delete through `") "`-style separators.
 * 4. **Length capping** — digits beyond the country's maximum are trimmed.
 */
export function resolvePhoneNumberInputChange(options) {
  const { text, previousDigits, previousFormatted, country, countries } = options;
  /**
   * Bidi marks are stripped before any length comparison: under RTL layouts
   * `PhoneNumberField.Input` prepends an LRM to its display value (and RTL
   * keyboards insert marks of their own), so the raw text can differ in
   * length from `previousFormatted` without any user edit.
   */
  const normalizedText = stripBidiControlMarks(text);
  /**
   * Only a leading plus starts international resolution. A plus anywhere else
   * is a stray character in an otherwise national number (typing one at the
   * end of an existing number, for instance) and must not reinterpret the
   * digits already entered as a dial code.
   */
  if (normalizedText.trimStart().startsWith('+')) {
    const international = parseInternationalPhoneNumberInput(countries, normalizedText);
    if (international) {
      return {
        country: international.country,
        digits: trimDigitsToCountryLimit(international.nationalNumber, international.country),
        internationalDraft: '',
      };
    }
    /**
     * A typed dial code arrives one character at a time (`"+"`, `"+4"`, `"+49"`)
     * and only the last of those resolves. Until then the raw text is echoed
     * back, otherwise the plus would be stripped and its digits appended to the
     * currently selected country's national number.
     */
    return {
      country,
      digits: previousDigits,
      internationalDraft: normalizedText,
    };
  }
  let digits = sanitizePhoneNumberDigits(normalizedText);
  const isLiteralOnlyDeletion =
    normalizedText.length < previousFormatted.length &&
    digits === previousDigits &&
    digits.length > 0;
  if (isLiteralOnlyDeletion) {
    digits = digits.slice(0, -1);
  }
  return {
    country,
    digits: trimDigitsToCountryLimit(digits, country),
    internationalDraft: '',
  };
}
/**
 * Builds the `onValueChange` payload for the current digits and country.
 */
export function buildPhoneNumberValueDetails(digits, country) {
  return {
    nationalNumber: digits,
    formattedNumber: formatNationalNumber(digits, country),
    e164: buildE164PhoneNumber(digits, country),
    country,
    isValid: getIsValidPhoneNumber(digits, country),
    isComplete: getIsCompletePhoneNumber(digits, country),
  };
}
