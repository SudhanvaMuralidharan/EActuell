import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  VALVES,
  GATEWAYS,
  Valve,
  generateTelemetryHistory,
  getStatusColor,
  getBatteryColor,
  getSignalIcon,
  formatLastSeen,
  TelemetryPoint,
} from '../../data/mockData';
import { Colors, Spacing, Radius, FontSize, COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useValves } from '../../context/ValveContext';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import Sparkline from '../../components/Sparkline';

interface ValveTelemetry {
  valve: Valve;
  currentHistory: TelemetryPoint[];
  batteryHistory: TelemetryPoint[];
  tempHistory: TelemetryPoint[];
}

export default function TelemetryScreen() {
  const { colors } = useTheme();
  const { openCount, faultCount, offlineCount } = useValves();
  const [selected, setSelected] = useState<string>(VALVES[0].device_id);
  const [telemetryData, setTelemetryData] = useState<Record<string, ValveTelemetry>>({});
  const [tick, setTick] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Initialise telemetry history for all valves
  useEffect(() => {
    const initial: Record<string, ValveTelemetry> = {};
    VALVES.forEach((v) => {
      initial[v.device_id] = {
        valve: v,
        currentHistory: generateTelemetryHistory(v.motor_current, 0.3),
        batteryHistory:  generateTelemetryHistory(v.battery_voltage, 0.1),
        tempHistory:     generateTelemetryHistory(v.internal_temp, 2),
      };
    });
    setTelemetryData(initial);

    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setTelemetryData((prev) => {
        const next = { ...prev };
        VALVES.forEach((v) => {
          if (!prev[v.device_id]) return;
          const td = prev[v.device_id];
          const addPoint = (hist: TelemetryPoint[], base: number, variance: number) => {
            const newPoint: TelemetryPoint = {
              timestamp: new Date().toISOString(),
              value: Math.max(0, base + (Math.random() - 0.5) * variance * 2),
            };
            return [...hist.slice(-11), newPoint];
          };
          next[v.device_id] = {
            ...td,
            currentHistory: addPoint(td.currentHistory, v.motor_current, 0.3),
            batteryHistory:  addPoint(td.batteryHistory, v.battery_voltage, 0.05),
            tempHistory:     addPoint(td.tempHistory, v.internal_temp, 1.5),
          };
        });
        return next;
      });

      // Pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 150, useNativeDriver: true }),
      ]).start();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeValve = VALVES.find((v) => v.device_id === selected)!;
  const activeTd   = telemetryData[selected];

  const isAbnormal = (v: Valve) =>
    v.battery_voltage < 3.3 || v.motor_current > 2.0 || v.internal_temp > 45 || v.status === 'fault';

  const onlineCount = VALVES.length - offlineCount;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary metrics */}
        <View style={styles.section}>
          <View style={styles.metricsRow}>
            <MetricCard label="Online" value={onlineCount} unit={`/ ${VALVES.length}`} color={Colors.accent} icon="🟢" />
            <MetricCard label="Faults"  value={faultCount}   color={faultCount > 0 ? Colors.red : Colors.textPrimary} icon="⚠️" warning={faultCount > 0} />
            <MetricCard label="Offline" value={offlineCount} color={offlineCount > 0 ? Colors.offlineGray : Colors.textPrimary} icon="📡" />
          </View>
        </View>

        {/* Alert banner */}
        {faultCount > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="warning" size={16} color={Colors.red} />
            <Text style={styles.alertText}>
              {faultCount} valve{faultCount > 1 ? 's' : ''} in fault state — immediate attention required
            </Text>
          </View>
        )}

        {/* Device selector */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Device Telemetry</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deviceList}
          style={styles.deviceListWrap}
        >
          {VALVES.map((v) => {
            const active = v.device_id === selected;
            const color  = getStatusColor(v.status);
            const abnormal = isAbnormal(v);
            return (
              <TouchableOpacity
                key={v.device_id}
                style={[
                  styles.deviceChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  active && { borderColor: color, backgroundColor: color + '18' },
                  abnormal && !active && { borderColor: Colors.red + '66' },
                ]}
                onPress={() => setSelected(v.device_id)}
              >
                <View style={[styles.chipDot, { backgroundColor: color }]} />
                <Text style={[styles.chipId, active && { color }]}>{v.device_id}</Text>
                {abnormal && <Text style={styles.chipAlert}>!</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected device detail */}
        {activeValve && activeTd && (
          <View style={[styles.detailBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.deviceHeader}>
              <View>
                <Text style={[styles.deviceName, { color: colors.text }]}>{activeValve.name}</Text>
                <Text style={[styles.deviceMeta, { color: colors.textSecondary }]}>{activeValve.device_id} · {activeValve.zone} · GW: {activeValve.gateway_id}</Text>
              </View>
              <StatusBadge status={activeValve.status} />
            </View>

            {/* Key metrics */}
            <View style={styles.metricsRow}>
              <MetricCard
                label="Battery"
                value={activeValve.battery_voltage.toFixed(2)}
                unit="V"
                color={getBatteryColor(activeValve.battery_voltage)}
                warning={activeValve.battery_voltage < 3.3}
              />
              <MetricCard
                label="Current"
                value={activeValve.motor_current.toFixed(2)}
                unit="A"
                color={activeValve.motor_current > 2 ? Colors.red : Colors.textPrimary}
                warning={activeValve.motor_current > 2}
              />
            </View>
            <View style={[styles.metricsRow, { marginTop: Spacing.sm }]}>
              <MetricCard
                label="Temperature"
                value={activeValve.internal_temp}
                unit="°C"
                color={activeValve.internal_temp > 45 ? Colors.red : activeValve.internal_temp > 40 ? Colors.orange : Colors.textPrimary}
                warning={activeValve.internal_temp > 45}
              />
              <MetricCard
                label="Signal"
                value={activeValve.signal_strength}
                unit="dBm"
                color={activeValve.signal_strength > -70 ? Colors.accent : activeValve.signal_strength > -80 ? Colors.orange : Colors.red}
                subtext={getSignalIcon(activeValve.signal_strength)}
              />
            </View>

            {/* Sparklines */}
            <View style={styles.sparkSection}>
              <SparkRow
                label="Motor Current (A)"
                history={activeTd.currentHistory}
                color={Colors.orange}
                threshold={2.0}
              />
              <SparkRow
                label="Battery Voltage (V)"
                history={activeTd.batteryHistory}
                color={Colors.accent}
                threshold={3.3}
                thresholdDir="below"
              />
              <SparkRow
                label="Internal Temp (°C)"
                history={activeTd.tempHistory}
                color={Colors.blue}
                threshold={45}
              />
            </View>

            <View style={styles.lastSeenRow}>
              <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.lastSeenText}>Last seen: {formatLastSeen(activeValve.last_seen)}</Text>
              <Text style={styles.moveTime}>Move time: {activeValve.movement_duration}ms</Text>
            </View>
          </View>
        )}

        {/* All devices health summary */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>All Devices — Health Overview</Text>
        <View style={[styles.healthTable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.tableHeader, { backgroundColor: colors.surfaceHigh, borderBottomColor: colors.border }]}>
            {['Device', 'Bat', 'Cur', 'Tmp', 'Sig', 'Status'].map((h) => (
              <Text key={h} style={styles.tableHeaderText}>{h}</Text>
            ))}
          </View>
          {VALVES.map((v) => {
            const abnormal = isAbnormal(v);
            return (
              <TouchableOpacity
                key={v.device_id}
                style={[styles.tableRow, abnormal && styles.tableRowWarning]}
                onPress={() => setSelected(v.device_id)}
              >
                <Text style={styles.tableCell}>{v.device_id}</Text>
                <Text style={[styles.tableCell, { color: getBatteryColor(v.battery_voltage) }]}>
                  {v.battery_voltage.toFixed(1)}
                </Text>
                <Text style={[styles.tableCell, { color: v.motor_current > 2 ? Colors.red : Colors.textPrimary }]}>
                  {v.motor_current.toFixed(1)}
                </Text>
                <Text style={[styles.tableCell, { color: v.internal_temp > 45 ? Colors.red : Colors.textPrimary }]}>
                  {v.internal_temp}°
                </Text>
                <Text style={[styles.tableCell, { color: v.signal_strength > -75 ? Colors.accent : Colors.orange }]}>
                  {v.signal_strength}
                </Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(v.status) }]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SparkRow({
  label,
  history,
  color,
  threshold,
  thresholdDir = 'above',
}: {
  label: string;
  history: TelemetryPoint[];
  color: string;
  threshold: number;
  thresholdDir?: 'above' | 'below';
}) {
  const latest = history[history.length - 1]?.value ?? 0;
  const isWarning = thresholdDir === 'above' ? latest > threshold : latest < threshold;
  return (
    <View style={sparkStyles.row}>
      <View style={sparkStyles.info}>
        <Text style={sparkStyles.label}>{label}</Text>
        <Text style={[sparkStyles.value, isWarning && { color: Colors.red }]}>
          {latest.toFixed(2)}
          {isWarning && <Text style={sparkStyles.warn}>  ▲ Alert</Text>}
        </Text>
      </View>
      <Sparkline data={history} color={isWarning ? Colors.red : color} width={140} height={44} />
    </View>
  );
}

const sparkStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  info: { flex: 1 },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary },
  value: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  warn: { fontSize: FontSize.xs, color: Colors.red },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  liveText: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '600', letterSpacing: 0.5 },
  timestamp: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs },

  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  metricsRow: { flexDirection: 'row', gap: Spacing.sm },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.red + '18',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.red + '44',
  },
  alertText: { fontSize: FontSize.sm, color: Colors.red, flex: 1 },

  deviceListWrap: { marginBottom: Spacing.sm },
  deviceList: { paddingHorizontal: Spacing.md, gap: Spacing.xs },
  deviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipId: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  chipAlert: { fontSize: FontSize.xs, color: Colors.red, fontWeight: '900' },

  detailBlock: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  deviceName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  deviceMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  sparkSection: { marginTop: Spacing.md },

  lastSeenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lastSeenText: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1 },
  moveTime: { fontSize: FontSize.xs, color: Colors.textMuted },

  healthTable: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surfaceHigh,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRowWarning: { backgroundColor: Colors.red + '0C' },
  tableCell: { flex: 1, fontSize: FontSize.xs, color: Colors.textPrimary },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});
