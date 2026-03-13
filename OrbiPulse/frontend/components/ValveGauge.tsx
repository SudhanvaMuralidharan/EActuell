import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, FontSize, COLORS } from '../constants/theme';
import { getStatusColor, ValveStatus } from '../data/mockData';

interface ValveGaugeProps {
  position: number;   // 0–100
  status: ValveStatus;
  size?: number;
}

export default function ValveGauge({ position, status, size = 80 }: ValveGaugeProps) {
  const color = getStatusColor(status);
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - position / 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={color + 'AA'} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLORS.background}
          strokeWidth={6}
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.value, { color }]}>{position}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
});
