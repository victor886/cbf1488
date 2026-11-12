import { createContext } from '../../helpers/internal/utils/index';
import type {
  FABAnimationContextValue,
  FABContextValue,
  FABItemIndexContextValue,
} from './fab.types';
/**
 * All FAB contexts live in this dedicated module (rather than in `fab.tsx`
 * or `fab.animation.ts`) so Fast Refresh edits to the component or
 * animation files do not recreate the context objects. FAB content renders
 * through the portal store, which keeps previously captured provider
 * elements alive for a frame after a hot reload; if the contexts were
 * recreated, patched consumers (e.g. `FAB.Item`) would read a different
 * context instance than those stored providers and crash with a
 * "wrap component within the Provider" error.
 */
const [FABProvider, useFABContext] = createContext<FABContextValue>({
  name: 'FABContext',
});
const [FABAnimationProvider, useFABAnimation] = createContext<FABAnimationContextValue>({
  name: 'FABAnimationContext',
});
const [FABItemIndexProvider, useFABItemIndex] = createContext<FABItemIndexContextValue>({
  name: 'FABItemIndexContext',
  errorMessage: 'FAB.Item must be rendered inside FAB.Content so it can receive its stagger index',
});
export {
  FABAnimationProvider,
  FABItemIndexProvider,
  FABProvider,
  useFABAnimation,
  useFABContext,
  useFABItemIndex,
};
