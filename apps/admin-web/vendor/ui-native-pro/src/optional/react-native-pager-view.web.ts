/**
 * Web stand-in for the optional `react-native-pager-view` peer.
 *
 * Metro resolves this file for web and `react-native-pager-view.ts` for
 * iOS and Android. The native package imports
 * `react-native/Libraries/Utilities/codegenNativeCommands`, which Expo
 * rejects during `expo export --platform web`. A `require` inside
 * `try/catch` is still statically bundled, so this file must not mention
 * the package at runtime. Callers already treat a missing module as
 * "pager unavailable".
 */
const ReactNativePagerViewPackage = undefined;
export default ReactNativePagerViewPackage;
