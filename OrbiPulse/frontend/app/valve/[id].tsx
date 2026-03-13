import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  VALVES,
  GATEWAYS,
  generateTelemetryHistory,
  getStatusColor,
  getBatteryColor,
  getSignalIcon,
  formatLastSeen,
  TelemetryPoint,
} from '../../data/mockData';
import { Colors, Spacing, Radius, FontSize, COLORS } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import ValveGauge from '../../components/ValveGauge';
import Sparkline from '../../components/Sparkline';
import MetricCard from '../../components/MetricCard';

export default function ValveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nav    = useNavigation();
  const valve  = VALVES.find((v) => v.device_id === id);
  const gateway = valve ? GATEWAYS.find((g) => g.gateway_id === valve.gateway_id) : undefined;

  const [histories, setHistories] = useState({
    current: generateTelemetryHistory(valve?.motor_current ?? 1, 0.3),
    battery: generateTelemetryHistory(valve?.battery_voltage ?? 3.7, 0.1),
    temp:    generateTelemetryHistory(valve?.internal_temp ?? 35, 2),
  });

  useEffect(() => {
    if (valve) nav.setOptions({ title: valve.name });
    const interval = setInterval(() => {
      if (!valve) return;
      setHistories((prev) => ({
        current: [...prev.current.slice(-11), { timestamp: new Date().toISOString(), value: Math.max(0, valve.motor_current + (Math.random() - 0.5) * 0.6) }],
        battery: [...prev.battery.slice(-11), { timestamp: new Date().toISOString(), value: Math.max(2.5, valve.battery_voltage + (Math.random() - 0.5) * 0.1) }],
        temp:    [...prev.temp.slice(-11),    { timestamp: new Date().toISOString(), value: Math.max(15, valve.internal_temp + (Math.random() - 0.5) * 3) }],
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [valve]);

  if (!valve) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Valve {id} not found</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(valve.status);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Top card */}
      <View style={[styles.heroCard, { borderColor: statusColor + '66' }]}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroId}>{valve.device_id}</Text>
            <Text style={styles.heroZone}>{valve.zone} · {valve.gateway_id}</Text>
          </View>
          <StatusBadge status={valve.status} />
        </View>

        <View style={styles.heroGauge}>
          <ValveGauge position={valve.valve_position} status={valve.status} size={120} />
          <View style={styles.heroGaugeInfo}>
            <Text style={styles.heroGaugeLabel}>Valve Position</Text>
            <Text style={[styles.heroGaugeVal, { color: statusColor }]}>{valve.valve_position}%</Text>
            <Text style={styles.heroSeen}>
              <Ionicons name="time-outline" size={11} color={Colors.textMuted} />
              {' '}{formatLastSeen(valve.last_seen)}
            </Text>
          </View>
        </View>
      </View>

      {/* Metrics grid */}
      <Text style={styles.sectionTitle}>Live Telemetry</Text>
      <View style={styles.metricsGrid}>
        <MetricCard label="Battery" value={valve.battery_voltage.toFixed(2)} unit="V" color={getBatteryColor(valve.battery_voltage)} warning={valve.battery_voltage < 3.3} />
        <MetricCard label="Current" value={valve.motor_current.toFixed(2)} unit="A" color={valve.motor_current > 2 ? Colors.red : Colors.textPrimary} warning={valve.motor_current > 2} />
      </View>
      <View style={[styles.metricsGrid, { marginTop: Spacing.sm }]}>
        <MetricCard label="Temperature" value={`${valve.internal_temp}°C`} color={valve.internal_temp > 45 ? Colors.red : Colors.textPrimary} warning={valve.internal_temp > 45} />
        <MetricCard label="Signal" value={valve.signal_strength} unit="dBm" color={valve.signal_strength > -70 ? Colors.accent : Colors.orange} subtext={getSignalIcon(valve.signal_strength)} />
      </View>
      <View style={[styles.metricsGrid, { marginTop: Spacing.sm }]}>
        <MetricCard label="Move Time" value={`${valve.movement_duration}`} unit="ms" color={valve.movement_duration > 2000 ? Colors.red : Colors.textPrimary} warning={valve.movement_duration > 2000} />
        <MetricCard label="Gateway" value={gateway?.name ?? valve.gateway_id} color={Colors.blue} />
      </View>

      {/* Trend charts */}
      <Text style={styles.sectionTitle}>Trends</Text>
      <View style={styles.chartCard}>
        {[
          { label: 'Motor Current (A)', data: histories.current, color: Colors.orange },
          { label: 'Battery Voltage (V)', data: histories.battery, color: Colors.accent },
          { label: 'Temperature (°C)',    data: histories.temp,    color: Colors.blue },
        ].map(({ label, data, color }) => (
          <View key={label} style={styles.chartRow}>
            <View style={styles.chartLabel}>
              <Text style={styles.chartLabelText}>{label}</Text>
              <Text style={[styles.chartValue, { color }]}>
                {(data[data.length - 1]?.value ?? 0).toFixed(2)}
              </Text>
            </View>
            <Sparkline data={data} color={color} width={160} height={48} />
          </View>
        ))}
      </View>

      {/* Condition indicators */}
      <Text style={styles.sectionTitle}>Condition Flags</Text>
      <View style={styles.flagGrid}>
        <ConditionFlag
          label="Battery Health"
          ok={valve.battery_voltage >= 3.5}
          warn={valve.battery_voltage < 3.5 && valve.battery_voltage >= 3.3}
          detail={valve.battery_voltage >= 3.5 ? 'Good' : valve.battery_voltage >= 3.3 ? 'Low — replace soon' : 'Critical'}
        />
        <ConditionFlag
          label="Motor Load"
          ok={valve.motor_current <= 1.5}
          warn={valve.motor_current > 1.5 && valve.motor_current <= 2.0}
          detail={valve.motor_current <= 1.5 ? 'Normal' : valve.motor_current <= 2.0 ? 'Elevated' : 'Overloaded'}
        />
        <ConditionFlag
          label="Thermal"
          ok={valve.internal_temp <= 40}
          warn={valve.internal_temp > 40 && valve.internal_temp <= 45}
          detail={valve.internal_temp <= 40 ? 'Normal' : valve.internal_temp <= 45 ? 'Warm' : 'Overheating'}
        />
        <ConditionFlag
          label="Connectivity"
          ok={valve.signal_strength > -70}
          warn={valve.signal_strength <= -70 && valve.signal_strength > -80}
          detail={valve.signal_strength > -70 ? 'Strong' : valve.signal_strength > -80 ? 'Weak' : 'Poor'}
        />
        <ConditionFlag
          label="Movement"
          ok={valve.movement_duration <= 1200}
          warn={valve.movement_duration > 1200 && valve.movement_duration <= 2000}
          detail={valve.movement_duration <= 1200 ? 'Responsive' : valve.movement_duration <= 2000 ? 'Slow' : 'Stall risk'}
        />
      </View>

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

function ConditionFlag({ label, ok, warn, detail }: { label: string; ok: boolean; warn: boolean; detail: string }) {
  const color = ok ? Colors.accent : warn ? Colors.orange : Colors.red;
  const icon  = ok ? '✓' : warn ? '⚠' : '✗';
  return (
    <View style={[flagStyles.card, { borderColor: color + '44' }]}>
      <Text style={[flagStyles.icon, { color }]}>{icon}</Text>
      <Text style={flagStyles.label}>{label}</Text>
      <Text style={[flagStyles.detail, { color }]}>{detail}</Text>
    </View>
  );
}

const flagStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  icon:   { fontSize: 18, marginBottom: 2 },
  label:  { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  detail: { fontSize: FontSize.xs, fontWeight: '700', marginTop: 2 },
});

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.md },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  notFoundText: { color: Colors.textSecondary, fontSize: FontSize.lg },

  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  heroId: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.textPrimary },
  heroZone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  heroGauge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  heroGaugeInfo: { flex: 1 },
  heroGaugeLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  heroGaugeVal: { fontSize: FontSize.xxxl, fontWeight: '900', marginTop: 2 },
  heroSeen: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xs },

  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  metricsGrid: { flexDirection: 'row', gap: Spacing.sm },

  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chartLabel: { flex: 1 },
  chartLabelText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  chartValue: { fontSize: FontSize.lg, fontWeight: '700', marginTop: 2 },

  flagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
