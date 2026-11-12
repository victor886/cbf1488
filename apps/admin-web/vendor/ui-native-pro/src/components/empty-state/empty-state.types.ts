import type { ReactNode } from 'react';
import type { TextProps, ViewProps } from 'react-native';
import type { AnimationRootDisableAll, TextRef, ViewRef } from '../../helpers/internal/types';
/**
 * Visual variant for the {@link EmptyStateMedia} part.
 *
 * - `"default"`: render media content as-is.
 * - `"icon"`: wrap media in a circular muted surface.
 */
export type EmptyStateMediaVariant = 'default' | 'icon';
/**
 * Animation configuration for the {@link EmptyState} root component.
 *
 * `EmptyState` owns no animated styles itself; this root prop exists so
 * consumers can cascade `"disable-all"` to animated descendants.
 *
 * - `"disable-all"`: disable all animations including children.
 * - `undefined`: use default animations.
 */
export type EmptyStateRootAnimation = AnimationRootDisableAll;
/**
 * Props for the {@link EmptyState} root component.
 *
 * Centered container that composes `Header` and optional `Content` actions.
 */
export interface EmptyStateRootProps extends ViewProps {
  /** Compound parts rendered inside the empty state container. */
  children?: ReactNode;
  /** Additional classes for the root container. */
  className?: string;
  /**
   * Animation configuration for cascading disable-all behavior.
   *
   * - `"disable-all"`: disable all animations including children.
   * - `undefined`: use default animations.
   */
  animation?: EmptyStateRootAnimation;
}
/** Imperative ref type for {@link EmptyStateRoot}. */
export type EmptyStateRootRef = ViewRef;
/**
 * Props for the {@link EmptyStateHeader} part.
 *
 * Groups `Media`, `Title`, and `Description`.
 */
export interface EmptyStateHeaderProps extends ViewProps {
  /** Header content. */
  children?: ReactNode;
  /** Additional classes for the header wrapper. */
  className?: string;
}
/** Imperative ref type for {@link EmptyStateHeader}. */
export type EmptyStateHeaderRef = ViewRef;
/**
 * Props for the {@link EmptyStateMedia} part.
 *
 * Hosts an icon, avatar, or custom media block.
 */
export interface EmptyStateMediaProps extends ViewProps {
  /** Media content to render. */
  children?: ReactNode;
  /**
   * Media visual treatment.
   *
   * @default "default"
   */
  variant?: EmptyStateMediaVariant;
  /** Additional classes for the media container. */
  className?: string;
  /**
   * Background layer rendered behind the icon media circle.
   * - `undefined` (default): renders `EmptyState.MediaBackground` for the
   *   `icon` variant when the active library theme registers default
   *   background content (e.g. `glass`); otherwise no layer
   * - custom node: replaces the default layer entirely
   * - `null`: removes the background layer
   */
  background?: ReactNode;
}
/** Imperative ref type for {@link EmptyStateMedia}. */
export type EmptyStateMediaRef = ViewRef;
/**
 * Props for the {@link EmptyStateMediaBackground} part.
 *
 * Absolute-fill container rendered behind the icon media circle. With no
 * children, the active library theme decides the default content (e.g. a
 * glass blur layer); pass children to host custom content with the same
 * positioning and clipping.
 */
export interface EmptyStateMediaBackgroundProps extends ViewProps {
  /**
   * Custom content to render inside the background container.
   * When omitted, the active library theme's default background content is
   * rendered.
   */
  children?: ReactNode;
  /** Additional classes for the background container. */
  className?: string;
}
/** Imperative ref type for {@link EmptyStateMediaBackground}. */
export type EmptyStateMediaBackgroundRef = ViewRef;
/**
 * Props for the {@link EmptyStateTitle} part.
 *
 * Primary heading text for the empty state.
 */
export interface EmptyStateTitleProps extends TextProps {
  /** Title text content. */
  children?: ReactNode;
  /** Additional classes for the title text. */
  className?: string;
}
/** Imperative ref type for {@link EmptyStateTitle}. */
export type EmptyStateTitleRef = TextRef;
/**
 * Props for the {@link EmptyStateDescription} part.
 *
 * Secondary explanatory text below the title.
 */
export interface EmptyStateDescriptionProps extends TextProps {
  /** Description text content. */
  children?: ReactNode;
  /** Additional classes for the description text. */
  className?: string;
}
/** Imperative ref type for {@link EmptyStateDescription}. */
export type EmptyStateDescriptionRef = TextRef;
/**
 * Props for the {@link EmptyStateContent} part.
 *
 * Optional action area for buttons and inputs.
 */
export interface EmptyStateContentProps extends ViewProps {
  /** Action content rendered below the header. */
  children?: ReactNode;
  /** Additional classes for the action container. */
  className?: string;
}
/** Imperative ref type for {@link EmptyStateContent}. */
export type EmptyStateContentRef = ViewRef;
