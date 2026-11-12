let ReactNativeSkiaPackage;
try {
  ReactNativeSkiaPackage = require('react-native-skia');
} catch (_error) {
  /* react-native-skia is an optional peer dependency */
}
export default ReactNativeSkiaPackage;
