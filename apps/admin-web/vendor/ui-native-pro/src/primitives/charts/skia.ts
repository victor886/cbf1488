// @ts-nocheck
import ReactNativeSkiaPackage from '../../optional/react-native-skia';
/**
 * Runtime Skia bindings for the chart engine, resolved through the optional
 * loader so apps without `react-native-skia` can still bundle the library.
 * Values are `undefined` when Skia is not installed; they are only touched
 * when a chart renders. Import Skia types directly with `import type`.
 */
export const {
  Canvas,
  FillType,
  Group,
  Line,
  PaintStyle,
  Paragraph,
  Path,
  Skia,
  Text,
  multiply4,
  rect,
  scale,
  translate,
  vec,
} = ReactNativeSkiaPackage ?? {};
/**
 * Throws an actionable error when a chart renders without the optional
 * `react-native-skia` dependency.
 *
 * @param componentName - Chart root that requires Skia
 */
export function assertSkiaInstalled(componentName) {
  if (ReactNativeSkiaPackage) return;
  throw new Error(
    [
      `[${componentName}] \`react-native-skia\` is not installed.`,
      'Chart components require it as an optional peer dependency (>=3.0.0):',
      '`npx expo install react-native-skia` (or add it with your package manager and rebuild the native app).',
    ].join(' ')
  );
}
