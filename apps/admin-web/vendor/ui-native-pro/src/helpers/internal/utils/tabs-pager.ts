// @ts-nocheck
import { Children, isValidElement } from 'react';
/**
 * Reads the `displayName` of a composite element type.
 *
 * @param element - Element to inspect
 * @returns The type's display name, or `undefined` for host elements and
 *   anonymous components
 */
export function getElementDisplayName(element: any) {
  const { type } = element;
  if (typeof type === 'string') {
    return undefined;
  }
  return 'displayName' in type && typeof type.displayName === 'string'
    ? type.displayName
    : undefined;
}
/**
 * Collects the direct `Content` children of a tabs `Pager`, in order. Other
 * children are dropped with a dev warning (every pager child becomes a
 * native page), as are duplicate values.
 *
 * @param options - Collection options
 * @param options.children - Children passed to the pager
 * @param options.contentDisplayName - Display name of the component's
 *   `Content` part
 * @param options.componentName - Component name used in dev warnings
 * @returns Content elements in page order
 */
export function collectContentElements(options: any) {
  const { children, contentDisplayName, componentName } = options;
  const elements = [];
  const seenValues = new Set();
  Children.toArray(children).forEach((child) => {
    const isContent =
      isValidElement(child) &&
      getElementDisplayName(child) === contentDisplayName &&
      typeof (child as any).props.value === 'string';
    if (!isContent) {
      if (__DEV__) {
        console.warn(
          `[${componentName}] ${componentName}.Pager only renders direct ${componentName}.Content children with a string \`value\`; ignoring another child.`
        );
      }
      return;
    }
    const { value } = (child as any).props;
    if (seenValues.has(value)) {
      if (__DEV__) {
        console.warn(
          `[${componentName}] Duplicate ${componentName}.Content value "${value}"; values must be unique.`
        );
      }
      return;
    }
    seenValues.add(value);
    elements.push(child as any);
  });
  return elements;
}
/**
 * Returns the in-range neighbours of a page index.
 *
 * @param index - Current page index
 * @param count - Number of pages
 * @returns Indices of the previous and next pages that exist
 */
export function getNeighbourIndices(index: any, count: any) {
  return [index - 1, index + 1].filter((neighbour) => neighbour >= 0 && neighbour < count);
}
/**
 * Whether two ordered value lists are identical.
 *
 * @param a - First list
 * @param b - Second list
 * @returns `true` when both lists hold the same values in the same order
 */
export function areValueListsEqual(a: any, b: any) {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}
/**
 * How "active" a page is for the current pager position: `1` when the pager
 * rests on it, falling linearly to `0` one page away.
 *
 * @param progress - Continuous pager position (`position + offset`)
 * @param index - Page index (`-1` for an unmatched part, always `0`)
 * @returns Activity in `[0, 1]`
 */
export function getPageActivity(progress: any, index: any) {
  'worklet';
  if (index < 0) {
    return 0;
  }
  return Math.max(0, 1 - Math.abs(progress - index));
}
/**
 * Builds the error thrown when a tabs `Pager` renders without the optional
 * `react-native-pager-view` dependency.
 *
 * @param componentName - Component whose pager is missing the dependency
 * @returns Error message with install instructions
 */
export function getMissingPagerViewError(componentName: any) {
  return [
    `[${componentName}] \`react-native-pager-view\` is not installed.`,
    `${componentName}.Pager requires it as an optional peer dependency:`,
    '`npx expo install react-native-pager-view` (or add it with your package manager and rebuild the native app).',
  ].join(' ');
}
