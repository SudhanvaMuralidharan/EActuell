import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, COLORS } from '../constants/theme';

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
  color = COLORS.text,
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
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardWarning: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerTransparent,
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
