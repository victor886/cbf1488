// @ts-nocheck
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Canvas, Group } from '../skia';
export function ChartWrapper({
  isHeadless,
  explicitSize,
  onLayout,
  hasMeasuredLayoutSize,
  canvasSize,
  canvasRef,
  chartContent,
  gestureOverlay,
  containerStyle,
  canvasStyle,
  wrapCanvasContent,
}) {
  const wrappedContent = wrapCanvasContent ? wrapCanvasContent(chartContent) : chartContent;
  // Headless mode still needs wrapCanvasContent (e.g. CartesianChartProvider).
  if (isHeadless) {
    return <Group>{wrappedContent}</Group>;
  }
  const { width, height } = canvasSize;
  return (
    <GestureHandlerRootView>
      <View
        style={[
          !explicitSize && styles.flex1,
          styles.overflowHidden,
          explicitSize
            ? {
                width: explicitSize.width,
                height: explicitSize.height,
              }
            : null,
          containerStyle,
        ]}
        onLayout={explicitSize ? undefined : onLayout}
      >
        <Canvas
          ref={canvasRef}
          style={StyleSheet.flatten([
            styles.flex1,
            hasMeasuredLayoutSize
              ? {
                  width,
                  height,
                }
              : null,
            canvasStyle,
          ])}
        >
          {wrappedContent}
        </Canvas>
        {gestureOverlay}
      </View>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  overflowHidden: {
    overflow: 'hidden',
  },
});
