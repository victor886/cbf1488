import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { withUniwind } from 'uniwind';
/**
 * Microsoft four-square logo icon - monochrome React Native SVG implementation.
 * Wrapped with withUniwind to enable className-based styling.
 */
const MicrosoftIconComponent = ({ size = 20, color = 'currentColor' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect width={24} height={24} fill="none" />
      <Path fill={color} d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z" />
    </Svg>
  );
};
/**
 * Monochrome Microsoft icon wrapped with withUniwind for className-based styling
 *
 * @example
 * ```tsx
 * <MicrosoftIcon colorClassName="accent-foreground" />
 * <MicrosoftIcon size={24} color="#000" />
 * ```
 */
export const MicrosoftIcon = withUniwind(MicrosoftIconComponent, {
  color: {
    fromClassName: 'colorClassName',
    styleProperty: 'accentColor',
  },
});
