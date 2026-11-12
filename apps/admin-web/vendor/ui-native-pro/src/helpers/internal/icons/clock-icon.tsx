import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
/**
 * Clock glyph used by `TimePicker.TriggerIndicator` (and available for custom layouts).
 */
export const ClockIcon = ({ size = 16, color = 'currentColor' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path
        d="M12 7v5l3 2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
ClockIcon.displayName = 'HeroUINative.ClockIcon';

export interface ClockIconProps {
  /**
   * Width and height of the icon in logical pixels (1:1 aspect ratio)
   * @default 16
   */
  size?: number;
  /**
   * Stroke color
   * @default currentColor
   */
  color?: string;
}
