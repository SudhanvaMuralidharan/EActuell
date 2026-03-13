import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  VALVES,
  Valve,
  ValveStatus,
  getStatusColor,
  formatLastSeen,
} from '../../data/mockData';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import ValveGauge from '../../components/ValveGauge';

interface LocalValveState {
  position: number;
  status: ValveStatus;
  pending: boolean;
  lastCmd?: string;
  lastCmdTime?: string;
}

export default function ControlScreen() {
  const [states, setStates] = useState<Record<string, LocalValveState>>(() => {
    const init: Record<string, LocalValveState> = {};
    VALVES.forEach((v) => {
      init[v.device_id] = {
        position: v.valve_position,
        status: v.status,
        pending: false,
      };
    });
    return init;
  });

  const [selectedId, setSelectedId] = useState<string>(VALVES[0].device_id);
  const [sliderVal, setSliderVal] = useState<number>(VALVES[0].valve_position);
  const [cmdLog, setCmdLog] = useState<string[]>([]);

  const activeValve = VALVES.find((v) => v.device_id === selectedId)!;
  const activeState = states[selectedId]!;

  const selectValve = (valve: Valve) => {
    setSelectedId(valve.device_id);
    setSliderVal(states[valve.device_id]?.position ?? valve.valve_position);
  };

  const simulateCommand = (
    valveId: string,
    command: string,
    newPosition: number,
    newStatus: ValveStatus,
  ) => {
    const valve = VALVES.find((v) => v.device_id === valveId)!;
    if (valve.status === 'offline' || valve.status === 'fault') {
      Alert.alert(
        'Command Blocked',
        `${valve.name} is ${valve.status}. Cannot send command.`,
        [{ text: 'OK' }],
      );
      return;
    }

    // Set pending
    setStates((prev) => ({
      ...prev,
      [valveId]: { ...prev[valveId], pending: true },
    }));

    const logEntry = `[${new Date().toLocaleTimeString()}] ${valveId} → ${command}`;
    setCmdLog((prev) => [logEntry, ...prev.slice(0, 19)]);

    // Simulate network round-trip (800–1500ms)
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const success = Math.random() > 0.08; // 92% success rate
      setStates((prev) => ({
        ...prev,
        [valveId]: {
          position: success ? newPosition : prev[valveId].position,
          status: success ? newStatus : prev[valveId].status,
          pending: false,
          lastCmd: command,
          lastCmdTime: new Date().toLocaleTimeString(),
        },
      }));
      const ackEntry = success
        ? `[${new Date().toLocaleTimeString()}] ✓ ACK: ${valveId} ${command}`
        : `[${new Date().toLocaleTimeString()}] ✗ NACK: ${valveId} ${command} — retry?`;
      setCmdLog((prev) => [ackEntry, ...prev.slice(0, 19)]);
    }, delay);
  };

  const handleOpen  = () => simulateCommand(selectedId, 'OPEN  100%', 100, 'open');
  const handleClose = () => simulateCommand(selectedId, 'CLOSE 0%',  0,   'closed');
  const handleSet   = () => simulateCommand(selectedId, `SET   ${Math.round(sliderVal)}%`, Math.round(sliderVal), sliderVal > 0 && sliderVal < 100 ? 'partial' : sliderVal === 100 ? 'open' : 'closed');

  const isControllable = activeState.status !== 'offline' && activeState.status !== 'fault';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Valve Control</Text>
          <Text style={styles.subtitle}>Remote valve operation</Text>
        </View>

        {/* Valve picker */}
        <Text style={styles.sectionLabel}>SELECT VALVE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.valvePicker}
        >
          {VALVES.map((v) => {
            const s = states[v.device_id];
            const active = v.device_id === selectedId;
            const color = getStatusColor(s.status);
            const blocked = s.status === 'offline' || s.status === 'fault';
            return (
              <TouchableOpacity
                key={v.device_id}
                style={[
                  styles.valvePickerCard,
                  active && { borderColor: color, backgroundColor: color + '18' },
                  blocked && styles.valvePickerBlocked,
                ]}
                onPress={() => selectValve(v)}
              >
                <View style={[styles.pickerDot, { backgroundColor: color }]} />
                <Text style={[styles.pickerId, active && { color }]}>{v.device_id}</Text>
                {s.pending && <ActivityIndicator size={8} color={Colors.accent} style={{ marginTop: 2 }} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Control panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.valveName}>{activeValve.name}</Text>
              <Text style={styles.valveMeta}>{activeValve.zone} · {activeValve.gateway_id}</Text>
            </View>
            <StatusBadge status={activeState.status} />
          </View>

          {/* Gauge */}
          <View style={styles.gaugeRow}>
            <ValveGauge position={activeState.position} status={activeState.status} size={110} />
            <View style={styles.gaugeInfo}>
              <Text style={styles.gaugeLabel}>Current Position</Text>
              <Text style={[styles.gaugeValue, { color: getStatusColor(activeState.status) }]}>
                {activeState.position}%
              </Text>
              {activeState.pending && (
                <View style={styles.pendingRow}>
                  <ActivityIndicator size="small" color={Colors.accent} />
                  <Text style={styles.pendingText}>Sending command…</Text>
                </View>
              )}
              {activeState.lastCmd && !activeState.pending && (
                <Text style={styles.lastCmdText}>
                  Last: {activeState.lastCmd}{'\n'}at {activeState.lastCmdTime}
                </Text>
              )}
            </View>
          </View>

          {/* Blocked notice */}
          {!isControllable && (
            <View style={styles.blockedBanner}>
              <Ionicons name="ban" size={16} color={Colors.red} />
              <Text style={styles.blockedText}>
                Control disabled — valve is {activeState.status}
              </Text>
            </View>
          )}

          {/* Open / Close buttons */}
          <View style={styles.ctrlRow}>
            <TouchableOpacity
              style={[
                styles.ctrlBtn,
                styles.openBtn,
                (!isControllable || activeState.pending) && styles.ctrlBtnDisabled,
              ]}
              onPress={handleOpen}
              disabled={!isControllable || activeState.pending}
            >
              <Ionicons name="water" size={20} color={Colors.bg} />
              <Text style={styles.ctrlBtnText}>OPEN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ctrlBtn,
                styles.closeBtn,
                (!isControllable || activeState.pending) && styles.ctrlBtnDisabled,
              ]}
              onPress={handleClose}
              disabled={!isControllable || activeState.pending}
            >
              <Ionicons name="close-circle" size={20} color={Colors.bg} />
              <Text style={styles.ctrlBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>

          {/* Position slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderLabelRow}>
              <Text style={styles.sliderLabel}>Set Position</Text>
              <Text style={styles.sliderValue}>{Math.round(sliderVal)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={sliderVal}
              onValueChange={setSliderVal}
              minimumTrackTintColor={Colors.accent}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.accent}
              disabled={!isControllable || activeState.pending}
            />
            <View style={styles.sliderTicks}>
              {[0, 25, 50, 75, 100].map((t) => (
                <Text key={t} style={styles.sliderTick}>{t}%</Text>
              ))}
            </View>
            <TouchableOpacity
              style={[
                styles.setBtn,
                (!isControllable || activeState.pending) && styles.ctrlBtnDisabled,
              ]}
              onPress={handleSet}
              disabled={!isControllable || activeState.pending}
            >
              <Text style={styles.setBtnText}>Apply Position — {Math.round(sliderVal)}%</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick status grid */}
        <Text style={styles.sectionLabel}>ALL VALVES — QUICK STATUS</Text>
        <View style={styles.statusGrid}>
          {VALVES.map((v) => {
            const s = states[v.device_id];
            const color = getStatusColor(s.status);
            return (
              <TouchableOpacity
                key={v.device_id}
                style={[styles.statusCard, v.device_id === selectedId && { borderColor: color }]}
                onPress={() => selectValve(v)}
              >
                <Text style={styles.statusCardId}>{v.device_id}</Text>
                <Text style={[styles.statusCardPos, { color }]}>{s.position}%</Text>
                <View style={[styles.statusCardDot, { backgroundColor: color }]} />
                {s.pending && <ActivityIndicator size={8} color={Colors.accent} style={styles.statusPending} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Command log */}
        {cmdLog.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>COMMAND LOG</Text>
            <View style={styles.logBox}>
              {cmdLog.map((entry, i) => (
                <Text key={i} style={[styles.logEntry, entry.includes('ACK') && styles.logAck, entry.includes('NACK') && styles.logNack]}>
                  {entry}
                </Text>
              ))}
            </View>
          </>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: { padding: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  valvePicker: { paddingHorizontal: Spacing.md, gap: Spacing.xs, paddingBottom: Spacing.sm },
  valvePickerCard: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 64,
  },
  valvePickerBlocked: { opacity: 0.5 },
  pickerDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  pickerId: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '700' },

  panel: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  valveName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  valveMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  gaugeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.md },
  gaugeInfo: { flex: 1 },
  gaugeLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  gaugeValue: { fontSize: FontSize.xxxl, fontWeight: '900', marginTop: 2 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.xs },
  pendingText: { fontSize: FontSize.xs, color: Colors.accent },
  lastCmdText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xs, lineHeight: 16 },

  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.red + '18',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.red + '44',
  },
  blockedText: { fontSize: FontSize.sm, color: Colors.red },

  ctrlRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  ctrlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  openBtn: { backgroundColor: Colors.accent },
  closeBtn: { backgroundColor: Colors.blue },
  ctrlBtnDisabled: { opacity: 0.35 },
  ctrlBtnText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.bg, letterSpacing: 0.5 },

  sliderSection: {},
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  sliderLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  sliderValue: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },
  slider: { width: '100%', height: 40 },
  sliderTicks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  sliderTick: { fontSize: 10, color: Colors.textMuted },
  setBtn: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent + '55',
  },
  setBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.accent },

  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  statusCard: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
  },
  statusCardId: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600' },
  statusCardPos: { fontSize: 12, fontWeight: '800', marginTop: 1 },
  statusCardDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  statusPending: { position: 'absolute', top: 2, right: 2 },

  logBox: {
    marginHorizontal: Spacing.md,
    backgroundColor: '#020810',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    fontFamily: 'monospace',
    marginBottom: Spacing.md,
  },
  logEntry: { fontSize: 11, color: Colors.textMuted, fontFamily: 'monospace', marginBottom: 2 },
  logAck: { color: Colors.accent },
  logNack: { color: Colors.red },
});
