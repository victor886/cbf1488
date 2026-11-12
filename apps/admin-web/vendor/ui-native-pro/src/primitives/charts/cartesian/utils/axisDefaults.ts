// @ts-nocheck
import { StyleSheet } from 'react-native';
export const CartesianAxisDefaultProps = {
  lineColor: 'hsla(0, 0%, 0%, 0.25)',
  lineWidth: StyleSheet.hairlineWidth,
  tickCount: 5,
  labelOffset: {
    x: 2,
    y: 4,
  },
  axisSide: {
    x: 'bottom',
    y: 'left',
  },
  axisScales: {
    xAxisScale: 'linear',
    yAxisScale: 'linear',
  },
  labelPosition: 'outset',
  formatXLabel: (label) => String(label),
  formatYLabel: (label) => String(label),
  labelColor: '#000000',
  ix: [],
  domain: null,
};
export const XAxisDefaults = {
  lineColor: 'hsla(0, 0%, 0%, 0.25)',
  lineWidth: StyleSheet.hairlineWidth,
  tickCount: 5,
  labelOffset: 2,
  axisSide: 'bottom',
  yAxisSide: 'left',
  labelPosition: 'outset',
  formatXLabel: (label) => String(label),
  labelColor: '#000000',
  labelRotate: 0,
};
export const YAxisDefaults = {
  lineColor: 'hsla(0, 0%, 0%, 0.25)',
  lineWidth: StyleSheet.hairlineWidth,
  tickCount: 5,
  labelOffset: 4,
  axisSide: 'left',
  labelPosition: 'outset',
  formatYLabel: (label) => String(label),
  labelColor: '#000000',
  yKeys: [],
  domain: null,
};
export const FrameDefaults = {
  lineColor: 'hsla(0, 0%, 0%, 0.25)',
  lineWidth: StyleSheet.hairlineWidth,
};
