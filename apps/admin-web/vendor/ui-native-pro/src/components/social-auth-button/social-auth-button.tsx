import { forwardRef } from 'react';
import { Button } from 'heroui-native/button';
import {
  DEFAULT_ICON_SIZE,
  DEFAULT_VARIANT,
  DISPLAY_NAME,
  PROVIDER_CONFIG,
  VARIANT_ICON_COLOR_CLASS_NAME,
} from './social-auth-button.constants';
// --------------------------------------------------
const SocialAuthButtonRoot = forwardRef((props: any, ref: any) => {
  const { provider, iconProps, label, children, variant = DEFAULT_VARIANT, ...restProps } = props;
  const config = PROVIDER_CONFIG[provider];
  const hasCustomColor = iconProps?.color !== undefined || iconProps?.colorClassName !== undefined;
  const resolvedLabel = label ?? config.label;
  const renderIcon = () => {
    const size = iconProps?.size ?? DEFAULT_ICON_SIZE;
    if (config.ColoredIcon && !hasCustomColor) {
      return <config.ColoredIcon size={size} />;
    }
    const resolvedColorClassName =
      iconProps?.colorClassName ?? VARIANT_ICON_COLOR_CLASS_NAME[variant];
    return (
      <config.Icon size={size} color={iconProps?.color} colorClassName={resolvedColorClassName} />
    );
  };
  return (
    <Button ref={ref} variant={variant} {...restProps}>
      {children ?? (
        <>
          {renderIcon()}
          <Button.Label>{resolvedLabel}</Button.Label>
        </>
      )}
    </Button>
  );
});
// --------------------------------------------------
SocialAuthButtonRoot.displayName = DISPLAY_NAME.AUTH_BUTTON_ROOT;
/**
 * SocialAuthButton component — a specialised Button that renders a provider-specific
 * monochrome icon alongside a label (e.g. "Continue with Google").
 *
 * Defaults to `variant="outline"` and `size="lg"`.
 * The icon and label are derived from the `provider` prop; both can be
 * overridden via `iconProps` / `label`, or replaced entirely with `children`.
 *
 * @example
 * ```tsx
 * <SocialAuthButton provider="github" />
 * <SocialAuthButton provider="google" label="Sign in with Google" />
 * <SocialAuthButton provider="apple" variant="primary" />
 * ```
 */
const SocialAuthButton = SocialAuthButtonRoot;
export default SocialAuthButton;
