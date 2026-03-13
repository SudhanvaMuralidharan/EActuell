import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ValveStatus, getStatusColor } from '../data/mockData';
import { Radius, FontSize, Spacing } from '../constants/theme';

export default function StatusBadge({ status }: { status: ValveStatus }) {
  const color = getStatusColor(status);
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '22' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
