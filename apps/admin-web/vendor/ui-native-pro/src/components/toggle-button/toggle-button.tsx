import { forwardRef, useCallback, useContext, useMemo } from 'react';
import { useHasDefaultThemeBackground } from 'heroui-native';
import { Button } from 'heroui-native/button';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { ToggleButtonGroupContext } from '../toggle-button-group/toggle-button-group.context';
import { DISPLAY_NAME } from './toggle-button.constants';
import { ToggleButtonContext, useToggleButton } from './toggle-button.context';
import { toggleButtonClassNames } from './toggle-button.styles';
// --------------------------------------------------
const ToggleButton = forwardRef((props: any, ref: any) => {
  const {
    children,
    id,
    variant = 'default',
    size: sizeProp = 'md',
    isSelected: isSelectedProp,
    defaultSelected = false,
    isDisabled: isDisabledProp = false,
    onChange,
    selectedColor,
    unselectedColor,
    className,
    style,
    animation,
    onPress,
    background,
    ...restProps
  } = props;
  const groupCtx = useContext(ToggleButtonGroupContext);
  const inGroup = groupCtx !== null;
  const inAttachedGroup = inGroup && !groupCtx.isDetached;
  const resolvedSize = groupCtx?.size ?? sizeProp;
  const isDisabled = groupCtx?.isDisabled ?? isDisabledProp;
  const isGroupSelected = inGroup && id ? groupCtx.selectedKeys.has(id) : undefined;
  const [isSelected = false, setIsSelected] = useControllableState({
    prop: inGroup ? isGroupSelected : isSelectedProp,
    defaultProp: defaultSelected,
    onChange,
  });
  const handlePress = useCallback(
    (event) => {
      if (inGroup && id) {
        groupCtx.onToggle(id);
      } else {
        setIsSelected(!isSelected);
      }
      if (typeof onPress === 'function') {
        onPress(event);
      }
    },
    [inGroup, id, groupCtx, isSelected, setIsSelected, onPress]
  );
  const rootClassName = toggleButtonClassNames.root({
    isSelected,
    variant,
    inAttachedGroup,
    inGroup,
    groupFullWidth: groupCtx?.fullWidth ?? false,
    className,
  });
  const overrideBackgroundColor = isSelected ? selectedColor : unselectedColor;
  const bgStyle = useMemo(
    () =>
      overrideBackgroundColor === undefined
        ? undefined
        : {
            backgroundColor: overrideBackgroundColor,
          },
    [overrideBackgroundColor]
  );
  const buttonAnimation = inAttachedGroup
    ? {
        scale: false,
      }
    : animation;
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  /**
   * Resolves the background layer forwarded to the underlying `Button`.
   * The toggle owns the decision because the wrapped `Button` renders with
   * the `ghost` variant, which never mounts a theme background on its own.
   * The layer is scoped to the `default` variant while unselected, since
   * selection paints an opaque accent-soft tint over the surface.
   */
  const resolvedBackground = useMemo(() => {
    if (background !== undefined) {
      return background;
    }
    if (hasDefaultThemeBackground && variant === 'default' && !isSelected) {
      return <Button.Background className={inAttachedGroup ? 'rounded-none' : undefined} />;
    }
    return null;
  }, [background, hasDefaultThemeBackground, variant, isSelected, inAttachedGroup]);
  const contextValue = useMemo(
    () => ({
      isSelected,
      isDisabled,
      size: resolvedSize,
      variant,
    }),
    [isSelected, isDisabled, resolvedSize, variant]
  );
  return (
    <ToggleButtonContext.Provider value={contextValue}>
      <Button
        ref={ref}
        variant="ghost"
        size={resolvedSize}
        feedbackVariant={inAttachedGroup ? 'scale' : 'scale-highlight'}
        animation={buttonAnimation}
        isDisabled={isDisabled}
        className={rootClassName}
        style={[bgStyle, style]}
        onPress={handlePress}
        background={resolvedBackground}
        {...restProps}
      >
        {children}
      </Button>
    </ToggleButtonContext.Provider>
  );
});
// --------------------------------------------------
const ToggleButtonLabel = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const { isSelected } = useToggleButton();
  const labelClassName = toggleButtonClassNames.label({
    isSelected,
    className,
  });
  return <Button.Label ref={ref} className={labelClassName} {...restProps} />;
});
ToggleButton.displayName = DISPLAY_NAME.ROOT;
ToggleButtonLabel.displayName = DISPLAY_NAME.LABEL;
/**
 * Compound `ToggleButton` with sub-components.
 *
 * @component ToggleButton - Root toggleable button. Wraps HeroUI Native's
 * `Button` and adds controllable selection state plus `ToggleButtonGroup`
 * integration. Reads `isSelected` and other state via {@link useToggleButton}
 * from descendants.
 *
 * @component ToggleButton.Label - Text label inside the toggle. Wraps
 * `Button.Label` and automatically applies selected/unselected text colors
 * via the `label` style recipe.
 */
const CompoundToggleButton = Object.assign(ToggleButton, {
  /** Toggle label — wraps {@link Button.Label} with selection-aware styles. */
  Label: ToggleButtonLabel,
});
export default CompoundToggleButton;
