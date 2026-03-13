import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  icon?: string;
  subtext?: string;
  warning?: boolean;
}

export default function MetricCard({
  label,
  value,
  unit,
  color = Colors.textPrimary,
  icon,
  subtext,
  warning,
}: MetricCardProps) {
  return (
    <View style={[styles.card, warning && styles.cardWarning]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 100,
  },
  cardWarning: {
    borderColor: Colors.red,
    backgroundColor: '#1A0D13',
  },
  icon: {
    fontSize: FontSize.lg,
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  value: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  unit: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  subtext: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
