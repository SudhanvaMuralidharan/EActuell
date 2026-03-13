import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
} from '../../data/mockData';

import { Colors, Spacing, Radius, FontSize, COLORS } from '../../constants/theme';

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

  const activeValve = VALVES.find(v => v.device_id === selectedId);
  const activeState = states[selectedId];

  if (!activeValve || !activeState) return null;

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

    const valve = VALVES.find(v => v.device_id === valveId);
    if (!valve) return;

    if (valve.status === 'offline' || valve.status === 'fault') {
      Alert.alert(
        'Command Blocked',
        `${valve.name} is ${valve.status}. Cannot send command.`,
      );
      return;
    }

    setStates(prev => ({
      ...prev,
      [valveId]: { ...prev[valveId], pending: true }
    }));

    const logEntry = `[${new Date().toLocaleTimeString()}] ${valveId} → ${command}`;
    setCmdLog(prev => [logEntry, ...prev.slice(0, 19)]);

    const delay = 800 + Math.random() * 700;

    setTimeout(() => {

      const success = Math.random() > 0.08;

      setStates(prev => ({
        ...prev,
        [valveId]: {
          position: success ? newPosition : prev[valveId].position,
          status: success ? newStatus : prev[valveId].status,
          pending: false,
          lastCmd: command,
          lastCmdTime: new Date().toLocaleTimeString(),
        }
      }));

      const ackEntry = success
        ? `[${new Date().toLocaleTimeString()}] ✓ ACK: ${valveId} ${command}`
        : `[${new Date().toLocaleTimeString()}] ✗ NACK: ${valveId} ${command}`;

      setCmdLog(prev => [ackEntry, ...prev.slice(0, 19)]);

    }, delay);
  };

  const handleOpen = () =>
    simulateCommand(selectedId, 'OPEN 100%', 100, 'open');

  const handleClose = () =>
    simulateCommand(selectedId, 'CLOSE 0%', 0, 'closed');

  const handleSet = () => {

    const position = Math.round(sliderVal);

    const status: ValveStatus =
      position === 100
        ? 'open'
        : position === 0
        ? 'closed'
        : 'partial';

    simulateCommand(
      selectedId,
      `SET ${position}%`,
      position,
      status
    );
  };

  const isControllable =
    activeState.status !== 'offline' &&
    activeState.status !== 'fault';

  return (

    <SafeAreaView style={styles.safe} edges={['top']}>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>Valve Control</Text>
          <Text style={styles.subtitle}>Remote valve operation</Text>
        </View>

        {/* Valve Picker */}

        <Text style={styles.sectionLabel}>SELECT VALVE</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.valvePicker}
        >

          {VALVES.map(v => {

            const s = states[v.device_id];
            const active = v.device_id === selectedId;
            const color = getStatusColor(s.status);

            const blocked =
              s.status === 'offline' ||
              s.status === 'fault';

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

                <Text style={[styles.pickerId, active && { color }]}>
                  {v.device_id}
                </Text>

                {s.pending && (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                    style={{ marginTop: 2 }}
                  />
                )}

              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Control Panel */}

        <View style={styles.panel}>

          <View style={styles.panelHeader}>

            <View>
              <Text style={styles.valveName}>{activeValve.name}</Text>
              <Text style={styles.valveMeta}>
                {activeValve.zone} · {activeValve.gateway_id}
              </Text>
            </View>

            <StatusBadge status={activeState.status} />

          </View>

          {/* Gauge */}

          <View style={styles.gaugeRow}>

            <ValveGauge
              position={activeState.position}
              status={activeState.status}
              size={110}
            />

            <View style={styles.gaugeInfo}>

              <Text style={styles.gaugeLabel}>Current Position</Text>

              <Text
                style={[
                  styles.gaugeValue,
                  { color: getStatusColor(activeState.status) }
                ]}
              >
                {activeState.position}%
              </Text>

              {activeState.pending && (
                <View style={styles.pendingRow}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.pendingText}>Sending command…</Text>
                </View>
              )}

              {activeState.lastCmd && !activeState.pending && (
                <Text style={styles.lastCmdText}>
                  Last: {activeState.lastCmd}{'\n'}
                  at {activeState.lastCmdTime}
                </Text>
              )}

            </View>

          </View>

          {!isControllable && (

            <View style={styles.blockedBanner}>
              <Ionicons name="ban" size={16} color={COLORS.danger} />
              <Text style={styles.blockedText}>
                Control disabled — valve is {activeState.status}
              </Text>
            </View>

          )}

          {/* Open Close */}

          <View style={styles.ctrlRow}>

            <TouchableOpacity
              style={[
                styles.ctrlBtn,
                styles.openBtn,
                (!isControllable || activeState.pending) && styles.ctrlBtnDisabled
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
                (!isControllable || activeState.pending) && styles.ctrlBtnDisabled
              ]}
              onPress={handleClose}
              disabled={!isControllable || activeState.pending}
            >
              <Ionicons name="close-circle" size={20} color={Colors.bg} />
              <Text style={styles.ctrlBtnText}>CLOSE</Text>
            </TouchableOpacity>

          </View>

          {/* Slider */}

          <View>

            <View style={styles.sliderLabelRow}>
              <Text style={styles.sliderLabel}>Set Position</Text>
              <Text style={styles.sliderValue}>
                {Math.round(sliderVal)}%
              </Text>
            </View>

            <Slider
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={sliderVal}
              onValueChange={setSliderVal}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={COLORS.primary}
              disabled={!isControllable || activeState.pending}
            />

            <TouchableOpacity
              style={[
                styles.setBtn,
                (!isControllable || activeState.pending) && styles.ctrlBtnDisabled
              ]}
              onPress={handleSet}
              disabled={!isControllable || activeState.pending}
            >
              <Text style={styles.setBtnText}>
                Apply Position — {Math.round(sliderVal)}%
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: Colors.bg },

  header: { padding: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FontSize.sm, color: COLORS.dark },

  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: COLORS.dark,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },

  valvePicker: { paddingHorizontal: Spacing.md, gap: Spacing.xs },

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

  pickerDot: { width: 8, height: 8, borderRadius: 4 },

  pickerId: { fontSize: FontSize.xs, color: COLORS.dark },

  panel: {
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  valveName: { fontSize: FontSize.lg, fontWeight: '700', color: COLORS.text },

  valveMeta: { fontSize: FontSize.xs, color: COLORS.dark },

  gaugeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },

  gaugeInfo: { flex: 1 },

  gaugeLabel: { fontSize: FontSize.xs, color: COLORS.dark },

  gaugeValue: { fontSize: FontSize.xxxl, fontWeight: '900' },

  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  pendingText: { fontSize: FontSize.xs, color: COLORS.primary },

  lastCmdText: { fontSize: FontSize.xs, color: COLORS.dark },

  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: COLORS.danger + '18',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },

  blockedText: { fontSize: FontSize.sm, color: COLORS.danger },

  ctrlRow: { flexDirection: 'row', gap: Spacing.sm, marginVertical: Spacing.md },

  ctrlBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },

  openBtn: { backgroundColor: Colors.accent },
  closeBtn: { backgroundColor: Colors.blue },

  ctrlBtnDisabled: { opacity: 0.4 },

  ctrlBtnText: { color: Colors.bg, fontWeight: '700' },

  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sliderLabel: { color: Colors.textSecondary },

  sliderValue: { fontWeight: '800', color: Colors.accent },

  setBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },

  setBtnText: { fontWeight: '700', color: Colors.accent },
});