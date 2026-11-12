import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { useThemeColor } from 'heroui-native/hooks';
export const MinusIcon = ({ size = 18, color }) => {
  const themeColorForeground = useThemeColor('foreground');
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Rect width={16} height={16} fill="none" />
      <Path
        fill={color ?? themeColorForeground}
        fillRule="evenodd"
        d="M1.75 8a.75.75 0 0 1 .75-.75h11a.75.75 0 0 1 0 1.5h-11A.75.75 0 0 1 1.75 8"
        clipRule="evenodd"
      />
    </Svg>
  );
};
/**
 * Default plus icon for the number stepper increment button.
 * Uses the foreground theme color when no explicit color is provided.
 */
export const PlusIcon = ({ size = 18, color }) => {
  const themeColorForeground = useThemeColor('foreground');
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Rect width={16} height={16} fill="none" />
      <Path
        fill={color ?? themeColorForeground}
        fillRule="evenodd"
        d="M8 1.75a.75.75 0 0 1 .75.75v4.75h4.75a.75.75 0 0 1 0 1.5H8.75v4.75a.75.75 0 0 1-1.5 0V8.75H2.5a.75.75 0 0 1 0-1.5h4.75V2.5A.75.75 0 0 1 8 1.75"
        clipRule="evenodd"
      />
    </Svg>
  );
};
