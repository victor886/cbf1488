// @ts-nocheck
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, useWindowDimensions, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimationSettingsProvider, FormFieldProvider } from 'heroui-native/contexts';
import { useIsRTL } from 'heroui-native/hooks';
import { InputGroup } from 'heroui-native/input-group';
import { SearchField } from 'heroui-native/search-field';
import { Select } from 'heroui-native/select';
import { HeroText } from '../../helpers/internal/components/index';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { composeRefs } from '../../primitives/slot/utils';
import { usePhoneNumberFieldRootAnimation } from './phone-number-field.animation';
import {
  BIDI_LEFT_TO_RIGHT_MARK,
  CONTENT_HEIGHT_RATIO,
  COUNTRIES,
  COUNTRY_LIST_INITIAL_NUM_TO_RENDER,
  COUNTRY_LIST_MAX_TO_RENDER_PER_BATCH,
  COUNTRY_LIST_SELECTED_VIEW_POSITION,
  COUNTRY_LIST_WINDOW_SIZE,
  DISPLAY_NAME,
  TEXT_MAX_FONT_SIZE_MULTIPLIER,
} from './phone-number-field.constants';
import { PhoneNumberFieldProvider, usePhoneNumberField } from './phone-number-field.context';
import { phoneNumberFieldClassNames } from './phone-number-field.styles';
import {
  buildPhoneNumberValueDetails,
  filterCountriesByQuery,
  findCountryByCode,
  formatNationalNumber,
  getIsNationalNumberAtMaxLength,
  getPhoneNumberPlaceholder,
  isolateBidiLtr,
  resolveInitialCountryCode,
  resolvePhoneNumberInputChange,
  sanitizePhoneNumberDigits,
} from './phone-number-field.utils';
const PhoneNumberFieldRoot = forwardRef((props, ref) => {
  const {
    children,
    className,
    isDisabled = false,
    isInvalid = false,
    isRequired = false,
    value: valueProp,
    defaultValue,
    country: countryProp,
    defaultCountry,
    isOpen: isOpenProp,
    isDefaultOpen,
    countries: countriesProp,
    onValueChange: onValueChangeProp,
    onCountryChange: onCountryChangeProp,
    onOpenChange: onOpenChangeProp,
    animation,
    ...restProps
  } = props;
  const countries = countriesProp ?? COUNTRIES;
  const rootClassName = phoneNumberFieldClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = usePhoneNumberFieldRootAnimation({
    animation,
  });
  /**
   * Resolved once on mount: `defaultCountry` prop → device locale region →
   * `"US"` → first list entry.
   */
  const [initialCountryCode] = useState(() => resolveInitialCountryCode(countries, defaultCountry));
  const [countryCodeState, setCountryCode] = useControllableState({
    prop: countryProp,
    defaultProp: initialCountryCode,
  });
  const country = useMemo(() => {
    const found = findCountryByCode(countries, countryCodeState ?? initialCountryCode);
    return (
      found ??
      countries[0] ?? {
        code: initialCountryCode,
        name: initialCountryCode,
        dialCode: '',
        flag: '',
      }
    );
  }, [countries, countryCodeState, initialCountryCode]);
  const [digitsState, setDigits] = useControllableState({
    prop: valueProp === undefined ? undefined : sanitizePhoneNumberDigits(valueProp),
    defaultProp: sanitizePhoneNumberDigits(defaultValue ?? ''),
  });
  const nationalNumber = digitsState ?? '';
  const [openState, setOpenState] = useControllableState({
    prop: isOpenProp,
    defaultProp: isDefaultOpen,
  });
  const isOpen = openState ?? false;
  const [searchQuery, setSearchQuery] = useState('');
  /**
   * Raw text held while the user types a dial code that is not long enough to
   * identify a country yet — see `resolvePhoneNumberInputChange`.
   */
  const [internationalDraft, setInternationalDraft] = useState('');
  const formattedNumber = useMemo(
    () => formatNationalNumber(nationalNumber, country),
    [nationalNumber, country]
  );
  const inputValue = internationalDraft !== '' ? internationalDraft : formattedNumber;
  const placeholder = useMemo(() => getPhoneNumberPlaceholder(country), [country]);
  const filteredCountries = useMemo(
    () => filterCountriesByQuery(countries, searchQuery),
    [countries, searchQuery]
  );
  const emitValueChange = useCallback(
    (digits, nextCountry) => {
      onValueChangeProp?.(buildPhoneNumberValueDetails(digits, nextCountry));
    },
    [onValueChangeProp]
  );
  const onInputChangeText = useCallback(
    (text) => {
      const next = resolvePhoneNumberInputChange({
        text,
        previousDigits: nationalNumber,
        previousFormatted: inputValue,
        country,
        countries,
      });
      setInternationalDraft(next.internationalDraft);
      const hasCountryChanged = next.country.code !== country.code;
      if (hasCountryChanged) {
        setCountryCode(next.country.code);
        onCountryChangeProp?.(next.country);
      }
      if (next.digits !== nationalNumber || hasCountryChanged) {
        setDigits(next.digits);
        emitValueChange(next.digits, next.country);
      }
    },
    [
      nationalNumber,
      inputValue,
      country,
      countries,
      setCountryCode,
      setDigits,
      onCountryChangeProp,
      emitValueChange,
    ]
  );
  const onCountrySelect = useCallback(
    (nextCountry) => {
      /**
       * Digits are dropped: a national number only means something within its
       * own numbering plan, so carrying it over to another country would leave
       * a number that reads as valid while belonging to neither.
       */
      setInternationalDraft('');
      setCountryCode(nextCountry.code);
      onCountryChangeProp?.(nextCountry);
      if (nationalNumber !== '') {
        setDigits('');
      }
      emitValueChange('', nextCountry);
      setSearchQuery('');
    },
    [nationalNumber, setCountryCode, setDigits, onCountryChangeProp, emitValueChange]
  );
  const onOpenChange = useCallback(
    (open) => {
      setOpenState(open);
      onOpenChangeProp?.(open);
      if (!open) {
        setSearchQuery('');
      }
    },
    [setOpenState, onOpenChangeProp]
  );
  const formFieldContextValue = useMemo(
    () => ({
      isDisabled,
      isInvalid,
      isRequired,
      hasFieldPadding: true,
    }),
    [isDisabled, isInvalid, isRequired]
  );
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const phoneNumberFieldContextValue = useMemo(
    () => ({
      country,
      countries,
      filteredCountries,
      nationalNumber,
      formattedNumber,
      inputValue,
      placeholder,
      isOpen,
      searchQuery,
      isDisabledRoot: isDisabled,
      onInputChangeText,
      onCountrySelect,
      onOpenChange,
      onSearchQueryChange: setSearchQuery,
    }),
    [
      country,
      countries,
      filteredCountries,
      nationalNumber,
      formattedNumber,
      inputValue,
      placeholder,
      isOpen,
      searchQuery,
      isDisabled,
      onInputChangeText,
      onCountrySelect,
      onOpenChange,
    ]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <FormFieldProvider value={formFieldContextValue}>
        <PhoneNumberFieldProvider value={phoneNumberFieldContextValue}>
          <View ref={ref} className={rootClassName} {...restProps}>
            {children}
          </View>
        </PhoneNumberFieldProvider>
      </FormFieldProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
/**
 * Country picker `Select` wired to the field state. Selection, open state,
 * presentation, and the disabled state are owned by the `PhoneNumberField`
 * root, so the corresponding `Select` props are not accepted here.
 */
const PhoneNumberFieldSelect = forwardRef(({ isDisabled: isDisabledProp, ...props }, ref) => {
  const ctx = usePhoneNumberField();
  const selectedOption = useMemo(
    () => ({
      value: ctx.country.code,
      label: ctx.country.name,
    }),
    [ctx.country]
  );
  const handleValueChange = useCallback(
    (option) => {
      if (!option) {
        return;
      }
      const found = findCountryByCode(ctx.countries, option.value);
      if (found) {
        ctx.onCountrySelect(found);
      }
    },
    [ctx]
  );
  return (
    <Select
      ref={ref}
      isDisabled={isDisabledProp ?? ctx.isDisabledRoot}
      isOpen={ctx.isOpen}
      onOpenChange={ctx.onOpenChange}
      onValueChange={handleValueChange}
      value={selectedOption}
      {...props}
      presentation="dialog"
      selectionMode="single"
    />
  );
});
// --------------------------------------------------
/**
 * `Select.Portal` breaks ancestor context; re-wrap with `PhoneNumberFieldProvider`
 * so portaled `PhoneNumberField.Content` children still resolve `usePhoneNumberField()`.
 */
function PhoneNumberFieldPortal(props) {
  const { children, ...rest } = props;
  const ctx = usePhoneNumberField();
  return (
    <Select.Portal {...rest}>
      <PhoneNumberFieldProvider value={ctx}>{children}</PhoneNumberFieldProvider>
    </Select.Portal>
  );
}
// --------------------------------------------------
/**
 * Tinted backdrop behind the portaled picker surface.
 */
const PhoneNumberFieldOverlay = forwardRef(({ className, ...props }, ref) => {
  const overlayClassName = phoneNumberFieldClassNames.overlay({
    className,
  });
  return <Select.Overlay ref={ref} className={overlayClassName} {...props} />;
});
// --------------------------------------------------
/**
 * Picker surface. The presentation is fixed to `"dialog"`: the country list is
 * a long, searchable surface that does not fit a popover.
 *
 * Unlike a plain `Select` dialog, the surface is pinned below the top safe
 * area instead of being centered, and sized to half the space below it. The
 * search input takes focus as soon as the picker opens, so the lower part of
 * the screen belongs to the keyboard; anchoring the surface at the top and
 * capping its height keeps all of it visible without any keyboard-avoidance
 * machinery.
 *
 * Both are defaults: `style` / `styles.content` override the height and the
 * top offset, and `classNames.wrapper` can center the surface again.
 */
const PhoneNumberFieldContent = forwardRef((props, ref) => {
  const { classNames, styles, ...restProps } = props;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const contentWrapperClassName = phoneNumberFieldClassNames.contentWrapper({
    className: classNames?.wrapper,
  });
  const contentHeight = (windowHeight - insets.top) * CONTENT_HEIGHT_RATIO;
  return (
    <Select.Content
      ref={ref}
      presentation="dialog"
      classNames={{
        ...classNames,
        wrapper: contentWrapperClassName,
      }}
      styles={{
        ...styles,
        content: {
          marginTop: insets.top,
          height: contentHeight,
          ...styles?.content,
        },
      }}
      {...restProps}
    />
  );
});
// --------------------------------------------------
/**
 * Theme-aware background layer of the picker surface (re-exported from
 * `Select.ContentBackground`). Under the glass theme it renders the frosted
 * blur layer; pass a customized instance to the `background` prop of
 * `PhoneNumberField.Content`.
 */
const PhoneNumberFieldContentBackground = forwardRef((props, ref) => {
  return <Select.ContentBackground ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Decorative drag-handle bar signaling that the dialog can be swiped to
 * dismiss. Hidden from assistive technology — the affordance it advertises is
 * a gesture, not an action a screen reader user can take.
 */
const PhoneNumberFieldContentHandle = forwardRef(({ className, ...props }, ref) => {
  const contentHandleClassName = phoneNumberFieldClassNames.contentHandle({
    className,
  });
  return (
    <View
      ref={ref}
      className={contentHandleClassName}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      {...props}
    />
  );
});
// --------------------------------------------------
/**
 * Country picker trigger rendered inside the prefix. Shows the selected flag
 * and dial code by default and dismisses the keyboard on press, so the phone
 * keyboard does not fight the picker dialog for screen space.
 */
const PhoneNumberFieldTrigger = forwardRef((props, ref) => {
  const {
    children,
    className,
    classNames,
    styles,
    onPress: onPressProp,
    accessibilityLabel,
    accessibilityHint,
    ...restProps
  } = props;
  const ctx = usePhoneNumberField();
  const { base, flag, dialCode } = phoneNumberFieldClassNames.trigger();
  const baseClassName = base({
    className: [className, classNames?.base],
  });
  const flagClassName = flag({
    className: classNames?.flag,
  });
  const dialCodeClassName = dialCode({
    className: classNames?.dialCode,
  });
  const handlePress = useCallback(
    (event) => {
      Keyboard.dismiss();
      onPressProp?.(event);
    },
    [onPressProp]
  );
  return (
    <Select.Trigger
      ref={ref}
      onPress={handlePress}
      className={baseClassName}
      style={styles?.base}
      accessibilityLabel={
        accessibilityLabel ?? `Selected country: ${ctx.country.name} (${ctx.country.dialCode})`
      }
      accessibilityHint={accessibilityHint ?? 'Opens the country list'}
      {...restProps}
      variant="unstyled"
    >
      {children ?? (
        <>
          <HeroText
            className={flagClassName}
            style={styles?.flag}
            maxFontSizeMultiplier={TEXT_MAX_FONT_SIZE_MULTIPLIER}
          >
            {ctx.country.flag}
          </HeroText>
          <HeroText
            className={dialCodeClassName}
            style={styles?.dialCode}
            maxFontSizeMultiplier={TEXT_MAX_FONT_SIZE_MULTIPLIER}
          >
            {isolateBidiLtr(ctx.country.dialCode)}
          </HeroText>
        </>
      )}
    </Select.Trigger>
  );
});
// --------------------------------------------------
/**
 * `SearchField` filtering the country list by name, ISO code, or dial code.
 * The query is owned by the field context and resets when the picker closes.
 *
 * The default input focuses on mount, which is also every time the picker
 * opens: the dialog portal unmounts its content on close.
 */
const PhoneNumberFieldSearchInput = forwardRef((props, ref) => {
  const {
    children,
    className,
    isDisabled: isDisabledProp,
    autoFocus = true,
    inputProps,
    onChange: onChangeProp,
    ...restProps
  } = props;
  const ctx = usePhoneNumberField();
  const searchInputClassName = phoneNumberFieldClassNames.searchInput({
    className,
  });
  const handleChange = useCallback(
    (text) => {
      ctx.onSearchQueryChange(text);
      onChangeProp?.(text);
    },
    [ctx, onChangeProp]
  );
  return (
    <SearchField
      ref={ref}
      value={ctx.searchQuery}
      onChange={handleChange}
      isDisabled={isDisabledProp ?? ctx.isDisabledRoot}
      className={searchInputClassName}
      {...restProps}
    >
      {children ?? (
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            variant="secondary"
            placeholder="Search country..."
            accessibilityLabel="Search countries"
            autoFocus={autoFocus}
            {...inputProps}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
      )}
    </SearchField>
  );
});
// --------------------------------------------------
/**
 * A single selectable country row — flag, dial code, name, and the selection
 * indicator by default.
 */
const PhoneNumberFieldCountryItem = forwardRef((props, ref) => {
  const { country, children, classNames, styles, ...restProps } = props;
  const { flag, dialCode, name } = phoneNumberFieldClassNames.countryItem();
  const flagClassName = flag({
    className: classNames?.flag,
  });
  const dialCodeClassName = dialCode({
    className: classNames?.dialCode,
  });
  const nameClassName = name({
    className: classNames?.name,
  });
  return (
    <Select.Item
      ref={ref}
      value={country.code}
      label={country.name}
      accessibilityLabel={`${country.name} (${country.dialCode})`}
      {...restProps}
    >
      {children ?? (
        <>
          <HeroText
            className={flagClassName}
            style={styles?.flag}
            maxFontSizeMultiplier={TEXT_MAX_FONT_SIZE_MULTIPLIER}
          >
            {country.flag}
          </HeroText>
          <HeroText
            className={dialCodeClassName}
            style={styles?.dialCode}
            maxFontSizeMultiplier={TEXT_MAX_FONT_SIZE_MULTIPLIER}
          >
            {isolateBidiLtr(country.dialCode)}
          </HeroText>
          <HeroText
            className={nameClassName}
            style={styles?.name}
            numberOfLines={1}
            maxFontSizeMultiplier={TEXT_MAX_FONT_SIZE_MULTIPLIER}
          >
            {country.name}
          </HeroText>
          <Select.ItemIndicator />
        </>
      )}
    </Select.Item>
  );
});
// --------------------------------------------------
/**
 * Fills the picker surface so its measured height is the list's viewport
 * height; purely structural, so not part of the themable style surface.
 */
const COUNTRY_LIST_CONTAINER_STYLE = {
  flex: 1,
};
/**
 * Lays the probe row out at the width real rows will get, without showing it
 * or letting it catch touches.
 */
const COUNTRY_LIST_PROBE_STYLE = {
  position: 'absolute',
  left: 0,
  right: 0,
  opacity: 0,
};
/**
 * Virtualized country list. Defaults to the search-filtered countries from
 * context; `keyboardShouldPersistTaps="handled"` keeps row presses working in a
 * single tap while the search keyboard is open. Opens with the selected country
 * centred rather than at the top of a 240-entry list.
 */
const PhoneNumberFieldCountryList = forwardRef((props, ref) => {
  const {
    countries: countriesProp,
    renderCountry,
    emptyText = 'No countries found',
    className,
    classNames,
    styles,
    keyboardShouldPersistTaps = 'handled',
    initialNumToRender = COUNTRY_LIST_INITIAL_NUM_TO_RENDER,
    maxToRenderPerBatch = COUNTRY_LIST_MAX_TO_RENDER_PER_BATCH,
    windowSize = COUNTRY_LIST_WINDOW_SIZE,
    initialScrollIndex: initialScrollIndexProp,
    getItemLayout: getItemLayoutProp,
    ...restProps
  } = props;
  const ctx = usePhoneNumberField();
  const listRef = useRef(null);
  const composedRef = useMemo(() => composeRefs(ref, listRef), [ref]);
  const data = countriesProp ?? ctx.filteredCountries;
  /**
   * Resolved once per mount, which is exactly once per opening: the picker
   * surface is portalled and unmounts when closed, so the list always mounts
   * with the current selection known and can start scrolled at it.
   */
  const [selectedIndex] = useState(() => data.findIndex((item) => item.code === ctx.country.code));
  const initialScrollIndex =
    initialScrollIndexProp !== undefined
      ? initialScrollIndexProp
      : selectedIndex > 0
        ? selectedIndex
        : undefined;
  /** Row the list opens at, or `null` when it should open where it is. */
  const targetIndex =
    initialScrollIndex === undefined ||
    initialScrollIndex === null ||
    initialScrollIndex >= data.length ||
    /**
     * The list is showing search results, whose rows have nothing to do with
     * the selection — unless the index came from the caller, who means it for
     * whatever the list is showing.
     */
    (initialScrollIndexProp === undefined && data[initialScrollIndex]?.code !== ctx.country.code)
      ? null
      : initialScrollIndex;
  /**
   * Row and viewport heights, measured *before* the list mounts. The order
   * matters: rows laid out while the list has no `getItemLayout` yet are
   * remembered at the offsets of that first frame, and the list prefers those
   * measurements over `getItemLayout` from then on. With the opening row
   * deep in the list, that stale entry convinces the virtualization that the
   * whole list sits above the screen, freezing the render window on the rows
   * around the target — every other row then stays permanently blank. So
   * until both heights are known, the list stays unmounted and an invisible
   * probe row provides the row height. Rows are uniform, so one measurement
   * describes the whole list, and the height itself stays where it belongs —
   * in CSS and the theme — rather than duplicated here as a magic number.
   */
  const [measuredRowHeight, setMeasuredRowHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const rowHeight =
    targetIndex !== null && getItemLayoutProp !== undefined
      ? getItemLayoutProp(data, targetIndex).length
      : measuredRowHeight;
  const handleProbeLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    setMeasuredRowHeight((current) => (current === 0 ? height : current));
  }, []);
  /**
   * Measured once: the height only feeds the opening position, and later
   * layout changes (keyboard, rotation) must not move the list.
   */
  const handleViewportLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    setViewportHeight((current) => (current === 0 ? height : current));
  }, []);
  const getItemLayout = useMemo(() => {
    if (getItemLayoutProp !== undefined || rowHeight === 0) {
      return getItemLayoutProp;
    }
    return (_, index) => ({
      length: rowHeight,
      offset: rowHeight * index,
      index,
    });
  }, [getItemLayoutProp, rowHeight]);
  /**
   * Where the list opens: the target row's offset centred in the visible area,
   * plus the first row visible there, which seeds the render window so the
   * rows around the target exist on the very first frame. Resolved once, right
   * before the list mounts; recomputing later (say, when search changes the
   * row count) would move the list under the user.
   */
  const initialPositionRef = useRef(null);
  if (
    initialPositionRef.current === null &&
    targetIndex !== null &&
    rowHeight > 0 &&
    viewportHeight > 0
  ) {
    const lastOffset = Math.max(0, rowHeight * data.length - viewportHeight);
    const offset = Math.min(
      Math.max(
        0,
        rowHeight * targetIndex - (viewportHeight - rowHeight) * COUNTRY_LIST_SELECTED_VIEW_POSITION
      ),
      lastOffset
    );
    initialPositionRef.current = {
      offset,
      anchorIndex: Math.floor(offset / rowHeight),
    };
  }
  const initialPosition = initialPositionRef.current;
  /** The measuring frame(s): nothing to show yet, so the list waits. */
  const isMeasuring = targetIndex !== null && initialPosition === null;
  /**
   * `contentOffset` places the list natively before it first draws, but not
   * every platform honours it at mount; this pass makes the offset
   * authoritative, and is a no-op where the native side already sits there.
   */
  useEffect(() => {
    if (initialPosition === null) {
      return;
    }
    listRef.current?.scrollToOffset({
      offset: initialPosition.offset,
      animated: false,
    });
  }, [initialPosition]);
  const { base, empty, emptyText: emptyTextSlot } = phoneNumberFieldClassNames.countryList();
  const baseClassName = base({
    className: [className, classNames?.base],
  });
  const emptyClassName = empty({
    className: classNames?.empty,
  });
  const emptyTextClassName = emptyTextSlot({
    className: classNames?.emptyText,
  });
  const renderItem = useCallback(
    ({ item, index }) => (
      <View>
        {renderCountry ? (
          renderCountry({
            country: item,
            index,
          })
        ) : (
          <PhoneNumberFieldCountryItem country={item} />
        )}
      </View>
    ),
    [renderCountry]
  );
  const keyExtractor = useCallback((item) => item.code, []);
  /**
   * Rows currently shown, so the effect below can tell a change of rows from a
   * re-render of the same ones.
   */
  const dataRef = useRef(data);
  /**
   * Returns to the top whenever the rows change, because the scroll offset
   * belonged to the previous rows. The list opens a couple of hundred rows deep
   * — centred on the selection — and search results are usually shorter than
   * that offset, which would otherwise leave every result above the visible
   * area: an apparently empty list that only shows content again once a scroll
   * gesture bounces it back into range.
   */
  useEffect(() => {
    if (dataRef.current === data) {
      return;
    }
    dataRef.current = data;
    listRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, [data]);
  /** The row the probe measures — the one the list will open at. */
  const probeCountry =
    isMeasuring && getItemLayoutProp === undefined && targetIndex !== null
      ? data[targetIndex]
      : undefined;
  return (
    <View style={COUNTRY_LIST_CONTAINER_STYLE} onLayout={handleViewportLayout}>
      {probeCountry !== undefined && (
        <View style={COUNTRY_LIST_PROBE_STYLE} pointerEvents="none" onLayout={handleProbeLayout}>
          {renderCountry ? (
            renderCountry({
              country: probeCountry,
              index: targetIndex ?? 0,
            })
          ) : (
            <PhoneNumberFieldCountryItem country={probeCountry} />
          )}
        </View>
      )}
      {!isMeasuring && (
        <FlatList
          ref={composedRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          initialNumToRender={initialNumToRender}
          maxToRenderPerBatch={maxToRenderPerBatch}
          windowSize={windowSize}
          initialScrollIndex={
            initialPosition !== null && initialPosition.anchorIndex > 0
              ? initialPosition.anchorIndex
              : undefined
          }
          contentOffset={
            initialPosition !== null
              ? {
                  x: 0,
                  y: initialPosition.offset,
                }
              : undefined
          }
          getItemLayout={getItemLayout}
          className={baseClassName}
          style={styles?.base}
          ListEmptyComponent={
            <View className={emptyClassName} style={styles?.empty}>
              <HeroText
                className={emptyTextClassName}
                style={styles?.emptyText}
                maxFontSizeMultiplier={TEXT_MAX_FONT_SIZE_MULTIPLIER}
              >
                {emptyText}
              </HeroText>
            </View>
          }
          {...restProps}
        />
      )}
    </View>
  );
});
// --------------------------------------------------
/**
 * Layout container for the input row (country picker prefix + phone input).
 */
const PhoneNumberFieldInputGroupRoot = forwardRef((props, ref) => {
  return <InputGroup ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * Leading slot of the input row hosting the country picker trigger.
 */
const PhoneNumberFieldPrefix = forwardRef(({ className, ...props }, ref) => {
  const prefixClassName = phoneNumberFieldClassNames.prefix({
    className,
  });
  return <InputGroup.Prefix ref={ref} className={prefixClassName} {...props} />;
});
// --------------------------------------------------
/**
 * Trailing slot of the input row for custom decorators (validity icon, action
 * button, …).
 */
const PhoneNumberFieldSuffix = forwardRef((props, ref) => {
  return <InputGroup.Suffix ref={ref} {...props} />;
});
// --------------------------------------------------
/**
 * @note RTL: deliberately pinned left-to-right. Phone numbers read
 * left-to-right in every locale (matching the platform dialers), so the
 * default `textAlign` stays physical `"left"` instead of the base input's
 * `rtl:text-right`. The display value and mask placeholder are additionally
 * prefixed with an LRM under RTL layouts: they start with weak/neutral
 * characters (`"("`, digits), which an RTL paragraph would otherwise reorder.
 * `resolvePhoneNumberInputChange` strips bidi marks before comparing lengths,
 * so editing behavior is unaffected.
 */
const PhoneNumberFieldInput = forwardRef((props, ref) => {
  const {
    onChangeText: onChangeTextProp,
    onSelectionChange: onSelectionChangeProp,
    maxLength: maxLengthProp,
    placeholder,
    keyboardType = 'phone-pad',
    textAlign = 'left',
    isDisabled: isDisabledProp,
    accessibilityLabel = 'Phone number',
    ...restProps
  } = props;
  const ctx = usePhoneNumberField();
  const isRTL = useIsRTL();
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const isDisabled = isDisabledProp !== undefined ? isDisabledProp : ctx.isDisabledRoot;
  const handleChangeText = useCallback(
    (text) => {
      ctx.onInputChangeText(text);
      onChangeTextProp?.(text);
    },
    [ctx, onChangeTextProp]
  );
  const handleSelectionChange = useCallback(
    (event) => {
      const { start, end } = event.nativeEvent.selection;
      setHasTextSelection(start !== end);
      onSelectionChangeProp?.(event);
    },
    [onSelectionChangeProp]
  );
  const displayValue =
    isRTL && ctx.inputValue !== '' ? `${BIDI_LEFT_TO_RIGHT_MARK}${ctx.inputValue}` : ctx.inputValue;
  const maskPlaceholder =
    isRTL && ctx.placeholder !== ''
      ? `${BIDI_LEFT_TO_RIGHT_MARK}${ctx.placeholder}`
      : ctx.placeholder;
  const isNumberAtMaxLength = useMemo(
    () => getIsNationalNumberAtMaxLength(ctx.nationalNumber, ctx.country),
    [ctx.nationalNumber, ctx.country]
  );
  /**
   * A number the country's plan has no room to extend would only grow by
   * digits the field discards, and the platform paints such a keystroke for a
   * frame before the controlled value snaps back. Handing the current text
   * length to the input as its `maxLength` makes the platform refuse the
   * keystroke instead, so the field simply stops growing.
   *
   * The cap is released while text is selected and while an international
   * prefix is being resolved: replacing a full number by pasting a longer one
   * is legitimate, and a `maxLength` sized for the old value would silently
   * truncate the pasted digits.
   */
  const isAtMaxLength =
    !hasTextSelection && ctx.inputValue === ctx.formattedNumber && isNumberAtMaxLength;
  const maxLength = maxLengthProp ?? (isAtMaxLength ? displayValue.length : undefined);
  return (
    <InputGroup.Input
      ref={ref}
      value={displayValue}
      onChangeText={handleChangeText}
      onSelectionChange={handleSelectionChange}
      maxLength={maxLength}
      placeholder={placeholder ?? (maskPlaceholder || 'Phone number')}
      keyboardType={keyboardType}
      textAlign={textAlign}
      isDisabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      {...restProps}
    />
  );
});
// --------------------------------------------------
PhoneNumberFieldPortal.displayName = DISPLAY_NAME.PORTAL;
PhoneNumberFieldRoot.displayName = DISPLAY_NAME.ROOT;
PhoneNumberFieldSelect.displayName = DISPLAY_NAME.SELECT;
PhoneNumberFieldOverlay.displayName = DISPLAY_NAME.OVERLAY;
PhoneNumberFieldContent.displayName = DISPLAY_NAME.CONTENT;
PhoneNumberFieldContentBackground.displayName = DISPLAY_NAME.CONTENT_BACKGROUND;
PhoneNumberFieldContentHandle.displayName = DISPLAY_NAME.CONTENT_HANDLE;
PhoneNumberFieldTrigger.displayName = DISPLAY_NAME.TRIGGER;
PhoneNumberFieldSearchInput.displayName = DISPLAY_NAME.SEARCH_INPUT;
PhoneNumberFieldCountryList.displayName = DISPLAY_NAME.COUNTRY_LIST;
PhoneNumberFieldCountryItem.displayName = DISPLAY_NAME.COUNTRY_ITEM;
PhoneNumberFieldInputGroupRoot.displayName = DISPLAY_NAME.INPUT_GROUP;
PhoneNumberFieldPrefix.displayName = DISPLAY_NAME.PREFIX;
PhoneNumberFieldInput.displayName = DISPLAY_NAME.INPUT;
PhoneNumberFieldSuffix.displayName = DISPLAY_NAME.SUFFIX;
/**
 * Static parts attached to the root. We assign properties explicitly instead of only using
 * `Object.assign`: some Metro / Hermes bundles do not reliably retain every key on `forwardRef`
 * results, which surfaced as `DateField.Input` being `undefined` at runtime.
 */
const PhoneNumberField = PhoneNumberFieldRoot;
PhoneNumberField.Select = PhoneNumberFieldSelect;
PhoneNumberField.Portal = PhoneNumberFieldPortal;
PhoneNumberField.Overlay = PhoneNumberFieldOverlay;
PhoneNumberField.Content = PhoneNumberFieldContent;
PhoneNumberField.ContentBackground = PhoneNumberFieldContentBackground;
PhoneNumberField.ContentHandle = PhoneNumberFieldContentHandle;
PhoneNumberField.Trigger = PhoneNumberFieldTrigger;
PhoneNumberField.SearchInput = PhoneNumberFieldSearchInput;
PhoneNumberField.CountryList = PhoneNumberFieldCountryList;
PhoneNumberField.CountryItem = PhoneNumberFieldCountryItem;
PhoneNumberField.InputGroup = PhoneNumberFieldInputGroupRoot;
PhoneNumberField.Prefix = PhoneNumberFieldPrefix;
PhoneNumberField.Input = PhoneNumberFieldInput;
PhoneNumberField.Suffix = PhoneNumberFieldSuffix;
/**
 * `PhoneNumberField` — international phone number field with per-country as-you-type
 * formatting, validation, E.164 output, smart paste, and a searchable country picker.
 *
 * @component PhoneNumberField - Root container. Owns the number / country / open state,
 * provides form-field context for `Label`, `Description`, and `FieldError`.
 * @component PhoneNumberField.InputGroup - Layout container for the input row.
 * @component PhoneNumberField.Prefix - Leading slot hosting the country picker trigger.
 * @component PhoneNumberField.Suffix - @optional Trailing slot for custom decorators.
 * @component PhoneNumberField.Input - Masked national number input (context-driven).
 * @component PhoneNumberField.Select - Country picker `Select` (dialog presentation).
 * @component PhoneNumberField.Trigger - Picker trigger showing flag + dial code by default.
 * @component PhoneNumberField.Portal - Portal re-providing the field context.
 * @component PhoneNumberField.Overlay - @optional Backdrop behind the picker surface.
 * @component PhoneNumberField.Content - Dialog picker surface.
 * @component PhoneNumberField.ContentBackground - @optional Theme-aware background layer
 * of the picker surface (re-exported from `Select.ContentBackground`).
 * @component PhoneNumberField.ContentHandle - @optional Drag-handle bar signaling the
 * dialog can be swiped to dismiss.
 * @component PhoneNumberField.SearchInput - @optional Search box filtering the country list.
 * @component PhoneNumberField.CountryList - Virtualized country list with default rows.
 * @component PhoneNumberField.CountryItem - @optional Single selectable country row.
 *
 * Props flow from `PhoneNumberField` to sub-components via context.
 *
 * @note RTL: mostly inherited. Row ordering (trigger, country rows), the dialog
 * surface, and the search input (`rtl:text-right` on its `TextInput`, icon
 * placement) come from the underlying heroui-native `Select`, `InputGroup`, and
 * `SearchField`; the component's own CSS uses logical or symmetric properties
 * only. The phone input itself is deliberately left-to-right (see
 * `PhoneNumberField.Input`), and dial codes rendered inside RTL text are
 * wrapped in Unicode LTR isolates so the leading plus sign keeps its place.
 */
export default PhoneNumberField;
