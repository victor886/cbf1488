import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { HeroText } from '../../helpers/internal/components/index';
import { childrenToString } from '../../helpers/internal/utils/index';
import { useWidgetRootAnimation } from './widget.animation';
import { DISPLAY_NAME } from './widget.constants';
import { widgetClassNames, widgetStyleSheet } from './widget.styles';
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the widget
 * shell. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const WidgetBackground = forwardRef(({ className, ...props }: any, ref: any) => {
  const backgroundClassName = widgetClassNames.background({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={backgroundClassName}
      fallbackColor="surface-secondary"
      {...props}
    />
  );
});
// --------------------------------------------------
const WidgetRoot = forwardRef((props: any, ref: any) => {
  const { children, className, style, animation, background, ...restProps } = props;
  const rootClassName = widgetClassNames.root({
    className,
  });
  const { isAllAnimationsDisabled } = useWidgetRootAnimation({
    animation,
  });
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  /**
   * Background layer rendered behind the widget shell.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   *
   * `Widget.Content` intentionally keeps its translucent surface tint with
   * no blur layer of its own — it composites over this root layer, which
   * avoids stacking multiple native blur views.
   */
  const backgroundElement =
    background !== undefined ? background : hasDefaultThemeBackground ? <WidgetBackground /> : null;
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <View
        ref={ref}
        className={rootClassName}
        style={[widgetStyleSheet.root, style]}
        {...restProps}
      >
        {backgroundElement}
        {children}
      </View>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const WidgetHeader = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const headerClassName = widgetClassNames.header({
    className,
  });
  return (
    <View ref={ref} className={headerClassName} {...restProps}>
      {children}
    </View>
  );
});
// --------------------------------------------------
const WidgetTitle = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const titleClassName = widgetClassNames.title({
    className,
  });
  return (
    <HeroText ref={ref} className={titleClassName} accessibilityRole="header" {...restProps}>
      {children}
    </HeroText>
  );
});
// --------------------------------------------------
const WidgetDescription = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const descriptionClassName = widgetClassNames.description({
    className,
  });
  return (
    <HeroText ref={ref} className={descriptionClassName} {...restProps}>
      {children}
    </HeroText>
  );
});
// --------------------------------------------------
const WidgetContent = forwardRef((props: any, ref: any) => {
  const { children, className, style, ...restProps } = props;
  const contentClassName = widgetClassNames.content({
    className,
  });
  return (
    <View
      ref={ref}
      className={contentClassName}
      style={[widgetStyleSheet.content, style]}
      {...restProps}
    >
      {children}
    </View>
  );
});
// --------------------------------------------------
const WidgetFooter = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const footerClassName = widgetClassNames.footer({
    className,
  });
  return (
    <View ref={ref} className={footerClassName} {...restProps}>
      {children}
    </View>
  );
});
// --------------------------------------------------
const WidgetLegend = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const legendClassName = widgetClassNames.legend({
    className,
  });
  return (
    <View ref={ref} className={legendClassName} {...restProps}>
      {children}
    </View>
  );
});
// --------------------------------------------------
const WidgetLegendItem = forwardRef((props: any, ref: any) => {
  const {
    children,
    color,
    colorClassName,
    className,
    classNames,
    styles,
    style,
    textProps,
    ...restProps
  } = props;
  const { wrapper, dot, label } = widgetClassNames.legendItem();
  const wrapperClassName = wrapper({
    className: [classNames?.wrapper, className],
  });
  const dotClassName = dot({
    className: [colorClassName, classNames?.dot],
  });
  const labelClassName = label({
    className: [classNames?.label, textProps?.className],
  });
  const stringifiedChildren = childrenToString(children);
  return (
    <View ref={ref} className={wrapperClassName} style={[styles?.wrapper, style]} {...restProps}>
      <View
        className={dotClassName}
        style={[
          color !== undefined
            ? {
                backgroundColor: color,
              }
            : undefined,
          styles?.dot,
        ]}
      />
      {stringifiedChildren !== null ? (
        <HeroText
          {...textProps}
          className={labelClassName}
          style={[styles?.label, textProps?.style]}
        >
          {stringifiedChildren}
        </HeroText>
      ) : (
        children
      )}
    </View>
  );
});
// --------------------------------------------------
WidgetRoot.displayName = DISPLAY_NAME.ROOT;
WidgetBackground.displayName = DISPLAY_NAME.BACKGROUND;
WidgetHeader.displayName = DISPLAY_NAME.HEADER;
WidgetTitle.displayName = DISPLAY_NAME.TITLE;
WidgetDescription.displayName = DISPLAY_NAME.DESCRIPTION;
WidgetContent.displayName = DISPLAY_NAME.CONTENT;
WidgetFooter.displayName = DISPLAY_NAME.FOOTER;
WidgetLegend.displayName = DISPLAY_NAME.LEGEND;
WidgetLegendItem.displayName = DISPLAY_NAME.LEGEND_ITEM;
// --------------------------------------------------
/**
 * Compound `Widget` component with sub-components.
 *
 * @component Widget - Dashboard container surface (`bg-surface-secondary`,
 * `rounded-2xl`) hosting an optional header row, an elevated content card,
 * and an optional footer row. The root only renders its children — every
 * sub-component is opt-in.
 *
 * @component Widget.Background - Absolute-fill background container behind
 * the widget shell. With no children, the active library theme decides the
 * content (glass theme renders a blur layer with a surface-secondary-matched
 * fallback). Accepts children to host custom content such as gradients with
 * the container's positioning and clipping applied. Replaceable via the
 * `background` prop on Widget.
 *
 * @component Widget.Header - Optional header row with `space-between`
 * justification. Typically pairs `Widget.Title` (and optional
 * `Widget.Description`) with an inline `Widget.Legend`.
 *
 * @component Widget.Title - Primary widget label (`text-foreground`,
 * `font-medium`, `text-sm`). Rendered with `accessibilityRole="header"`.
 *
 * @component Widget.Description - Secondary muted text (`text-muted`,
 * `text-xs`). Pair with `Widget.Title` for a stacked label/hint, or render
 * inside `Widget.Footer` for a summary line.
 *
 * @component Widget.Content - Elevated inner card (`bg-surface`,
 * `rounded-xl`, `shadow-surface`) hosting the widget's payload (chart,
 * table, KPI block, etc.).
 *
 * @component Widget.Footer - Optional bottom row.
 *
 * @component Widget.Legend - Inline container for one or more
 * `Widget.LegendItem`s, typically rendered inside the header next to the
 * title.
 *
 * @component Widget.LegendItem - Single colored-dot + label entry. Color
 * the dot via `colorClassName` (preferred — Tailwind class such as
 * `"bg-chart-3"`) or `color` (inline color string). Slot-aware via its own
 * `classNames` / `styles` props, with `textProps` forwarded to the inner
 * label `Text`.
 *
 * Each compound part owns its own style instance; consumers style them
 * directly via the part's `className` (and `classNames` / `styles` for
 * `LegendItem`'s slots).
 *
 */
const Widget = Object.assign(WidgetRoot, {
  /** @optional Theme-aware background container behind the widget shell. */
  Background: WidgetBackground,
  /** @optional Header row container with title + legend layout. */
  Header: WidgetHeader,
  /** @optional Primary widget label. */
  Title: WidgetTitle,
  /** @optional Secondary muted text. */
  Description: WidgetDescription,
  /** @optional Elevated inner card hosting the widget payload. */
  Content: WidgetContent,
  /** @optional Bottom row container. */
  Footer: WidgetFooter,
  /** @optional Inline legend container. */
  Legend: WidgetLegend,
  /** @optional Single legend entry (dot + label). */
  LegendItem: WidgetLegendItem,
});
export default Widget;
