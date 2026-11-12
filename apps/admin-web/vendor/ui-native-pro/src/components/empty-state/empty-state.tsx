import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { HeroText } from '../../helpers/internal/components/index';
import { useEmptyStateRootAnimation } from './empty-state.animation';
import { DISPLAY_NAME } from './empty-state.constants';
import { emptyStateClassNames } from './empty-state.styles';
// --------------------------------------------------
const EmptyStateRoot = forwardRef((props: any, ref: any) => {
  const { children, className, animation, ...restProps } = props;
  const rootClassName = emptyStateClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useEmptyStateRootAnimation({
    animation,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <View ref={ref} className={rootClassName} {...restProps}>
        {children}
      </View>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const EmptyStateHeader = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const headerClassName = emptyStateClassNames.header({
    className,
  });
  return (
    <View ref={ref} className={headerClassName} {...restProps}>
      {children}
    </View>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the icon media
 * circle. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const EmptyStateMediaBackground = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const mediaBackgroundClassName = emptyStateClassNames.mediaBackground({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={mediaBackgroundClassName}
      fallbackColor="default"
      {...restProps}
    />
  );
});
// --------------------------------------------------
const EmptyStateMedia = forwardRef((props: any, ref: any) => {
  const { children, variant = 'default', className, background, ...restProps } = props;
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const mediaClassName = emptyStateClassNames.media({
    variant,
    className,
  });
  /**
   * Background layer rendered behind the media surface.
   * - `undefined`: theme-aware default for the `icon` variant, which is
   *   the only variant painting `--color-default`
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground && variant === 'icon' ? (
      <EmptyStateMediaBackground />
    ) : null;
  return (
    <View ref={ref} className={mediaClassName} {...restProps}>
      {backgroundElement}
      {children}
    </View>
  );
});
// --------------------------------------------------
const EmptyStateTitle = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const titleClassName = emptyStateClassNames.title({
    className,
  });
  return (
    <HeroText ref={ref} className={titleClassName} accessibilityRole="header" {...restProps}>
      {children}
    </HeroText>
  );
});
// --------------------------------------------------
const EmptyStateDescription = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const descriptionClassName = emptyStateClassNames.description({
    className,
  });
  return (
    <HeroText ref={ref} className={descriptionClassName} {...restProps}>
      {children}
    </HeroText>
  );
});
// --------------------------------------------------
const EmptyStateContent = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const contentClassName = emptyStateClassNames.content({
    className,
  });
  return (
    <View ref={ref} className={contentClassName} {...restProps}>
      {children}
    </View>
  );
});
// --------------------------------------------------
EmptyStateRoot.displayName = DISPLAY_NAME.ROOT;
EmptyStateHeader.displayName = DISPLAY_NAME.HEADER;
EmptyStateMedia.displayName = DISPLAY_NAME.MEDIA;
EmptyStateMediaBackground.displayName = DISPLAY_NAME.MEDIA_BACKGROUND;
EmptyStateTitle.displayName = DISPLAY_NAME.TITLE;
EmptyStateDescription.displayName = DISPLAY_NAME.DESCRIPTION;
EmptyStateContent.displayName = DISPLAY_NAME.CONTENT;
// --------------------------------------------------
/**
 * Compound `EmptyState` component with optional media and actions.
 *
 * @component EmptyState - Root container for empty-state messaging and actions.
 * @component EmptyState.Header - Groups media, title, and description.
 * @component EmptyState.Media - Optional icon/avatar container.
 * @component EmptyState.MediaBackground - Theme-aware background layer
 * behind the icon media circle.
 * @component EmptyState.Title - Primary heading text.
 * @component EmptyState.Description - Secondary supporting copy.
 * @component EmptyState.Content - Optional action area.
 *
 */
const EmptyState = Object.assign(EmptyStateRoot, {
  /** @optional Header grouping block. */
  Header: EmptyStateHeader,
  /** @optional Media container for icon or avatar content. */
  Media: EmptyStateMedia,
  /** @optional Theme-aware background layer behind the icon media circle. */
  MediaBackground: EmptyStateMediaBackground,
  /** @optional Primary heading text. */
  Title: EmptyStateTitle,
  /** @optional Secondary description text. */
  Description: EmptyStateDescription,
  /** @optional Action area below the header. */
  Content: EmptyStateContent,
});
export default EmptyState;
