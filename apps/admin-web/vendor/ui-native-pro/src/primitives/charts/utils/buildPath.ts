// @ts-nocheck
import { Skia } from '../skia';
/**
 * Builds an immutable Skia v3 `SkPath` via `PathBuilder`.
 * Prefer factory helpers (`Skia.Path.Line`, `Circle`, `Rect`, …) when a single shape is enough.
 */
export function buildPath(build) {
  'worklet';
  const builder = Skia.PathBuilder.Make();
  build(builder);
  return builder.detach();
}
