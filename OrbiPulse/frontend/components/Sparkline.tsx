import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Line, Rect, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { TelemetryPoint } from '../data/mockData';

interface SparklineProps {
  data: TelemetryPoint[];
  color?: string;
  width?: number;
  height?: number;
  filled?: boolean;
}

export default function Sparkline({
  data,
  color = '#00E5A0',
  width = 120,
  height = 40,
  filled = true,
}: SparklineProps) {
  const points = useMemo(() => {
    if (!data || data.length < 2) return '';
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pad = 4;
    const pts = data.map((d, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + ((max - d.value) / range) * (height - pad * 2);
      return `${x},${y}`;
    });
    return pts.join(' ');
  }, [data, width, height]);

  const fillPoints = useMemo(() => {
    if (!points) return '';
    const firstX = 4;
    const lastX = width - 4;
    return `${firstX},${height} ${points} ${lastX},${height}`;
  }, [points, width, height]);

  if (!points) return <View style={{ width, height }} />;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {filled && (
          <Polygon
            points={fillPoints}
            fill={`url(#grad-${color})`}
          />
        )}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
