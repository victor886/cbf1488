import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { RadioGroup } from 'heroui-native/radio-group';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { createContext } from '../../helpers/internal/utils/index';
import { useRatingItemAnimation } from './rating.animation';
import {
  DEFAULT_MAX_VALUE,
  DEFAULT_SIZE,
  DISPLAY_NAME,
  HIT_SLOP_MAP,
  ICON_SIZE_MAP,
} from './rating.constants';
import { RatingStarIcon } from './rating.icons';
import { ratingClassNames } from './rating.styles';
import type { RatingContextValue } from './rating.types';
import { getRatingItemState } from './rating.utils';
const AnimatedRadioGroupItem = Animated.createAnimatedComponent(RadioGroup.Item);
// --------------------------------------------------
const [RatingProvider, useRating] = createContext<RatingContextValue>({
  name: 'RatingContext',
});
// --------------------------------------------------
const RatingRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    value: valueProp,
    defaultValue,
    onValueChange,
    maxValue = DEFAULT_MAX_VALUE,
    size = DEFAULT_SIZE,
    isReadOnly = false,
    isDisabled = false,
    icon,
    iconProps,
    className,
    ...restProps
  } = props;
  const [value = 0, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const rootClassName = ratingClassNames.root({
    className,
  });
  const radioValue = Math.floor(value) >= 1 ? String(Math.floor(value)) : undefined;
  const handleValueChange = useCallback(
    (next) => {
      const parsed = Number(next);
      if (Number.isFinite(parsed)) {
        setValue(parsed);
      }
    },
    [setValue]
  );
  const contextValue = useMemo(
    () => ({
      value,
      maxValue,
      size,
      isReadOnly,
      isDisabled,
      icon,
      iconProps,
    }),
    [value, maxValue, size, isReadOnly, isDisabled, icon, iconProps]
  );
  const autoChildren = useMemo(() => {
    if (children != null) {
      return children;
    }
    const items: ReactElement[] = [];
    for (let index = 1; index <= maxValue; index += 1) {
      items.push(<RatingItem key={index} value={index} />);
    }
    return items;
  }, [children, maxValue]);
  return (
    <RatingProvider value={contextValue}>
      <RadioGroup
        ref={ref}
        value={radioValue}
        onValueChange={handleValueChange}
        isDisabled={isDisabled}
        className={rootClassName}
        pointerEvents={isReadOnly ? 'none' : 'auto'}
        data-size={size}
        data-disabled={isDisabled || undefined}
        data-readonly={isReadOnly || undefined}
        {...restProps}
      >
        {autoChildren}
      </RadioGroup>
    </RatingProvider>
  );
});
// --------------------------------------------------
const renderIcon = (iconNode: any, size: any, color: any, colorClassName: any) => {
  if (isValidElement(iconNode)) {
    const iconProps = (iconNode.props ?? {}) as any;
    return cloneElement(iconNode as ReactElement<any>, {
      size: iconProps.size ?? size,
      color: iconProps.color ?? color,
      colorClassName: iconProps.colorClassName ?? colorClassName,
    });
  }
  if (iconNode != null) {
    return iconNode;
  }
  return <RatingStarIcon size={size} color={color} colorClassName={colorClassName} />;
};
// --------------------------------------------------
const RatingItem = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    style,
    value: itemValue,
    icon: itemIcon,
    hitSlop,
    animation,
    isAnimatedStyleActive = true,
    onPressIn: onPressInProp,
    onPressOut: onPressOutProp,
    ...restProps
  } = props;
  const ctx = useRating();
  const [isPressed, setIsPressed] = useState(false);
  const { rContainerStyle } = useRatingItemAnimation({
    animation,
    isPressed,
  });
  const { isActive, isPartial, partialPercent } = getRatingItemState(
    itemValue,
    ctx.value,
    ctx.isReadOnly
  );
  const itemClassName = ratingClassNames.item({
    className,
  });
  const iconWrapperClassName = ratingClassNames.iconWrapper();
  const iconOverlayClassName = ratingClassNames.iconOverlay();
  const resolvedHitSlop = hitSlop ?? HIT_SLOP_MAP[ctx.size];
  const resolvedIconSize = ctx.iconProps?.size ?? ICON_SIZE_MAP[ctx.size];
  const iconNode = itemIcon ?? ctx.icon;
  const inactiveIcon = renderIcon(
    iconNode,
    resolvedIconSize,
    ctx.iconProps?.inactiveColor,
    ctx.iconProps?.inactiveColorClassName ?? 'accent-surface-tertiary'
  );
  const activeIcon = renderIcon(
    iconNode,
    resolvedIconSize,
    ctx.iconProps?.activeColor,
    ctx.iconProps?.activeColorClassName ?? 'accent-warning'
  );
  const renderProps = {
    isActive: isActive || isPartial,
    isPartial,
    partialPercent,
  };
  const handlePressIn = useCallback(
    (event) => {
      setIsPressed(true);
      onPressInProp?.(event);
    },
    [onPressInProp]
  );
  const handlePressOut = useCallback(
    (event) => {
      setIsPressed(false);
      onPressOutProp?.(event);
    },
    [onPressOutProp]
  );
  const itemStyle = isAnimatedStyleActive ? [rContainerStyle, style] : style;
  const content =
    typeof children === 'function' ? (
      children(renderProps)
    ) : (
      <View className={iconWrapperClassName}>
        {inactiveIcon}
        {(isActive || isPartial) && (
          <View
            className={iconOverlayClassName}
            style={{
              width: isActive ? '100%' : `${partialPercent}%`,
            }}
            pointerEvents="none"
          >
            {activeIcon}
          </View>
        )}
      </View>
    );
  return (
    <AnimatedRadioGroupItem
      ref={ref}
      value={String(itemValue)}
      className={itemClassName}
      style={itemStyle}
      hitSlop={resolvedHitSlop}
      accessibilityRole="radio"
      accessibilityLabel={`${itemValue} ${itemValue === 1 ? 'star' : 'stars'}`}
      data-pressed={isPressed || undefined}
      data-active={isActive || isPartial || undefined}
      data-partial={isPartial || undefined}
      data-readonly={ctx.isReadOnly || undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...restProps}
    >
      {content}
    </AnimatedRadioGroupItem>
  );
});
// --------------------------------------------------
RatingRoot.displayName = DISPLAY_NAME.ROOT;
RatingItem.displayName = DISPLAY_NAME.ITEM;
// --------------------------------------------------
/**
 * Compound `Rating` component with sub-components.
 *
 * @component Rating - Star-rating input built on top of `heroui-native`'s
 * `RadioGroup`. The `value` is numeric — the integer part drives the
 * underlying radio selection while a fractional value is only honoured in
 * read-only mode and rendered as a partial fill via an absolutely-
 * positioned overlay that is clipped to the active percentage. Items are
 * auto-rendered from `1` to `maxValue` when no children are provided.
 *
 * @component Rating.Item - Individual rating item. Wraps
 * `RadioGroup.Item` with rating-aware state and renders the default icon
 * + partial overlay. Pass a render-function `children` to render a fully
 * custom indicator that still reflects `isActive` / `isPartial` /
 * `partialPercent` from the rating context.
 *
 * Props flow from `Rating` to its sub-components via context
 * (`value`, `maxValue`, `size`, `isReadOnly`, `isDisabled`, `icon`).
 *
 */
const Rating = Object.assign(RatingRoot, {
  /** @optional Individual rating item with active / partial fill support */
  Item: RatingItem,
});
export default Rating;
export { useRating };
