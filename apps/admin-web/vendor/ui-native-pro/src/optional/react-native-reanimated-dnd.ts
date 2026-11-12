let ReactNativeReanimatedDndPackage;
try {
  ReactNativeReanimatedDndPackage = require('react-native-reanimated-dnd');
} catch (_error) {
  /* react-native-reanimated-dnd is an optional peer dependency */
}
export default ReactNativeReanimatedDndPackage;
