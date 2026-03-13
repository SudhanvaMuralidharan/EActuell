import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  VALVES,
  GATEWAYS,
  Valve,
  ValveStatus,
  getStatusColor,
  formatLastSeen,
} from '../../data/mockData';
import { Colors, Spacing, Radius, FontSize, COLORS } from '../../constants/theme';
import StatusBadge from '../../components/StatusBadge';
import ValveGauge from '../../components/ValveGauge';
import ProfileModal from '../../components/profile/ProfileModal';

const STATUS_FILTERS: (ValveStatus | 'all')[] = ['all', 'open', 'partial', 'closed', 'fault', 'offline'];

export default function MapScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<ValveStatus | 'all'>('all');
  const [selected, setSelected] = useState<Valve | null>(null);
  const [expandedGw, setExpandedGw] = useState<string | null>('GW-001');
  const [profileVisible, setProfileVisible] = useState(false);

  const filteredValves = filter === 'all'
    ? VALVES
    : VALVES.filter((v) => v.status === filter);

  const statusCounts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] = s === 'all' ? VALVES.length : VALVES.filter((v) => v.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const openCount    = VALVES.filter(v => v.status === 'open').length;
  const faultCount   = VALVES.filter(v => v.status === 'fault').length;
  const offlineCount = VALVES.filter(v => v.status === 'offline').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.logo, { color: COLORS.primary }]}>OrbiPulse</Text>
          <Text style={styles.subtitle}>Smart Valve Network</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setProfileVisible(true)}
          >
            <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.statText}>{openCount} Live</Text>
            </View>
            {faultCount > 0 && (
              <View style={[styles.statPill, { borderColor: COLORS.danger + '66' }]}>
                <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
                <Text style={[styles.statText, { color: COLORS.danger }]}>{faultCount} Fault</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.fleetBar}>
        {[
          { label: 'Total',    val: VALVES.length,   color: COLORS.text },
          { label: 'Open',     val: openCount,        color: COLORS.primary },
          { label: 'Fault',    val: faultCount,       color: COLORS.danger },
          { label: 'Offline',  val: offlineCount,     color: COLORS.valveOffline },
          { label: 'Gateways', val: GATEWAYS.length,  color: COLORS.secondary },
        ].map(({ label, val, color }) => (
          <View key={label} style={styles.fleetItem}>
            <Text style={[styles.fleetVal, { color }]}>{val}</Text>
            <Text style={styles.fleetLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {STATUS_FILTERS.map((s) => {
          const active = filter === s;
          const color = s === 'all' ? COLORS.text : getStatusColor(s as ValveStatus);
          return (
            <TouchableOpacity key={s}
              style={[styles.filterChip, active && { backgroundColor: color + '22', borderColor: color }]}
              onPress={() => setFilter(s)}>
              <Text style={[styles.filterText, active && { color }]}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}{' '}
                <Text style={styles.filterCount}>({statusCounts[s]})</Text>
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.sectionLabel}>GATEWAYS & VALVES</Text>
        {GATEWAYS.map((gw) => {
          const gwValves = filteredValves.filter(v => v.gateway_id === gw.gateway_id);
          const isExpanded = expandedGw === gw.gateway_id;
          return (
            <View key={gw.gateway_id} style={styles.gwBlock}>
              <TouchableOpacity style={styles.gwHeader}
                onPress={() => setExpandedGw(isExpanded ? null : gw.gateway_id)}>
                <View style={styles.gwIconWrap}>
                  <Ionicons name="wifi" size={16} color={Colors.blue} />
                </View>
                <View style={styles.gwInfo}>
                  <Text style={styles.gwName}>{gw.name}</Text>
                  <Text style={styles.gwMeta}>{gw.gateway_id} · {gw.connected_valves} valves · {gw.signal_strength} dBm</Text>
                </View>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.valveList}>
                  {gwValves.length === 0
                    ? <Text style={styles.noValves}>No valves match filter</Text>
                    : gwValves.map((valve) => (
                        <ValveRow
                          key={valve.device_id}
                          valve={valve}
                          isSelected={selected?.device_id === valve.device_id}
                          onPress={() => setSelected(selected?.device_id === valve.device_id ? null : valve)}
                          onDetail={() => router.push(`/valve/${valve.device_id}` as any)}
                        />
                      ))
                  }
                </View>
              )}
            </View>
          );
        })}

        <Text style={styles.sectionLabel}>NETWORK BOUNDS</Text>
        <View style={styles.coordCard}>
          {[
            ['North', '14.6845° N'], ['South', '14.6460° N'],
            ['East',  '75.9410° E'], ['West',  '75.9180° E'],
            ['Coverage', '~4.2 km²'],
          ].map(([label, val]) => (
            <View key={label} style={styles.coordRow}>
              <Text style={styles.coordLabel}>{label}</Text>
              <Text style={styles.coordVal}>{val}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
      
      {/* Profile Modal */}
      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        onNavigateSettings={() => router.push('/screens/settings/SettingsScreen' as any)}
        onNavigateAbout={() => router.push('/screens/about/AboutScreen' as any)}
        onNavigateProfile={() => {
          setProfileVisible(false);
          router.push('/(auth)/profile-edit' as any);
        }}
      />
    </SafeAreaView>
  );
}

function ValveRow({ valve, isSelected, onPress, onDetail }: {
  valve: Valve; isSelected: boolean; onPress: () => void; onDetail: () => void;
}) {
  const color = getStatusColor(valve.status);
  return (
    <View>
      <TouchableOpacity
        style={[styles.valveRow, isSelected && { backgroundColor: color + '12' }]}
        onPress={onPress}>
        <View style={[styles.valveBar, { backgroundColor: color }]} />
        <ValveGauge position={valve.valve_position} status={valve.status} size={44} />
        <View style={styles.valveInfo}>
          <Text style={styles.valveName}>{valve.name}</Text>
          <Text style={styles.valveMeta}>{valve.device_id} · {valve.zone}</Text>
        </View>
        <View style={styles.valveRight}>
          <Text style={[styles.valvePos, { color }]}>{valve.valve_position}%</Text>
          <Text style={styles.valveSeen}>{formatLastSeen(valve.last_seen)}</Text>
        </View>
        <Ionicons name={isSelected ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textMuted} />
      </TouchableOpacity>

      {isSelected && (
        <View style={styles.valveDetail}>
          <View style={styles.valveMetrics}>
            {[
              ['Battery', valve.battery_voltage.toFixed(1) + 'V'],
              ['Current', valve.motor_current.toFixed(1) + 'A'],
              ['Temp',    valve.internal_temp + '°C'],
              ['Signal',  valve.signal_strength + 'dBm'],
              ['Move',    valve.movement_duration + 'ms'],
              ['GPS',     valve.lat.toFixed(4) + ', ' + valve.lng.toFixed(4)],
            ].map(([lbl, val]) => (
              <View key={lbl} style={styles.miniMetric}>
                <Text style={styles.miniLabel}>{lbl}</Text>
                <Text style={styles.miniVal}>{val}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.detailBtn} onPress={onDetail}>
            <Text style={styles.detailBtnText}>Full Detail & Trends</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.bg} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  profileButton: { padding: 4 },
  logo:   { fontSize: FontSize.lg, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { fontSize: FontSize.xs, color: COLORS.dark, marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: Spacing.xs },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.card, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.secondary },
  dot:      { width: 7, height: 7, borderRadius: 4 },
  statText: { fontSize: FontSize.xs, color: COLORS.text, fontWeight: '600' },
  fleetBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.card, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.secondary, paddingVertical: Spacing.sm, marginBottom: Spacing.xs },
  fleetItem: { alignItems: 'center' },
  fleetVal:  { fontSize: FontSize.xl, fontWeight: '800' },
  fleetLabel:{ fontSize: FontSize.xs, color: COLORS.dark, marginTop: 1 },
  filterBar: { maxHeight: 44 },
  filterContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, gap: Spacing.xs },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: COLORS.secondary, backgroundColor: COLORS.card },
  filterText: { fontSize: FontSize.xs, color: COLORS.dark, fontWeight: '600' },
  filterCount:{ fontWeight: '400', opacity: 0.7 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: COLORS.dark, letterSpacing: 1, paddingHorizontal: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.sm },
  gwBlock: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, backgroundColor: COLORS.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: COLORS.secondary, overflow: 'hidden', shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  gwHeader: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  gwIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryTransparent, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary + '44' },
  gwInfo: { flex: 1 },
  gwName: { fontSize: FontSize.md, fontWeight: '700', color: COLORS.text },
  gwMeta: { fontSize: FontSize.xs, color: COLORS.dark, marginTop: 1 },
  valveList: { borderTopWidth: 1, borderTopColor: COLORS.secondary },
  noValves: { fontSize: FontSize.sm, color: COLORS.dark, textAlign: 'center', padding: Spacing.md },
  valveRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingRight: Spacing.sm, borderBottomWidth: 1, borderBottomColor: COLORS.secondary, gap: Spacing.sm },
  valveBar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  valveInfo: { flex: 1 },
  valveName: { fontSize: FontSize.sm, fontWeight: '600', color: COLORS.text },
  valveMeta: { fontSize: FontSize.xs, color: COLORS.dark, marginTop: 1 },
  valveRight: { alignItems: 'flex-end' },
  valvePos:  { fontSize: FontSize.sm, fontWeight: '800' },
  valveSeen: { fontSize: FontSize.xs, color: COLORS.dark, marginTop: 1 },
  valveDetail: { backgroundColor: COLORS.card, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: COLORS.secondary },
  valveMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  miniMetric: { minWidth: '30%', flex: 1, backgroundColor: COLORS.card, borderRadius: Radius.sm, padding: Spacing.xs, borderWidth: 1, borderColor: COLORS.secondary },
  miniLabel: { fontSize: 10, color: COLORS.dark },
  miniVal:   { fontSize: FontSize.sm, fontWeight: '700', color: COLORS.text, marginTop: 1 },
  detailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  detailBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: COLORS.white },
  coordCard: { marginHorizontal: Spacing.md, backgroundColor: COLORS.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: COLORS.secondary },
  coordRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  coordLabel:{ fontSize: FontSize.xs, color: COLORS.dark },
  coordVal:  { fontSize: FontSize.xs, color: COLORS.text, fontWeight: '600' },
});
