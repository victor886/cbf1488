// @ts-nocheck
import { Children, isValidElement } from 'react';
import { childrenToString, getElementDisplayName } from '../../helpers/internal/utils/index';
import { DISPLAY_NAME } from './morph-tabs.constants';
/**
 * Finds the text of the first `MorphTabs.Label` inside a trigger's content.
 * Collapsed pills show only the icon, so this text becomes the trigger's
 * accessibility label.
 *
 * @param node - Rendered trigger content
 * @returns The label text, or `null` when no stringifiable label is found
 */
export function findLabelText(node) {
  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) {
      continue;
    }
    if (getElementDisplayName(child) === DISPLAY_NAME.LABEL) {
      return childrenToString((child as any).props.children);
    }
    const nestedText = findLabelText((child as any).props.children);
    if (nestedText !== null) {
      return nestedText;
    }
  }
  return null;
}
