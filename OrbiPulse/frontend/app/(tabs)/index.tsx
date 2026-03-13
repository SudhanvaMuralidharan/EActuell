import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import Slider from '@react-native-community/slider';

import {
  VALVES,
  GATEWAYS,
  Valve,
  ValveStatus,
  getStatusColor,
  formatLastSeen,
} from '../../data/mockData';
import { Colors, Spacing, Radius, FontSize, COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useValves } from '../../context/ValveContext';
import ProfileModal from '../../components/profile/ProfileModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STATUS_FILTERS: (ValveStatus | 'all')[] = ['all', 'open', 'partial', 'closed', 'fault', 'offline'];

// Center the map on the average of all valve positions
const MAP_CENTER: Region = {
  latitude: 14.665,
  longitude: 75.925,
  latitudeDelta: 0.045,
  longitudeDelta: 0.035,
};

function getMarkerColor(status: ValveStatus): string {
  switch (status) {
    case 'open':    return COLORS.valveOpen;
    case 'partial': return COLORS.valvePartial;
    case 'closed':  return COLORS.valveClosed;
    case 'fault':   return COLORS.valveFault;
    case 'offline': return COLORS.valveOffline;
    default:        return COLORS.valveOffline;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'open': return 'water';
    case 'partial': return 'water-outline';
    case 'closed': return 'close-circle';
    case 'fault': return 'alert-circle';
    case 'offline': return 'cloud-offline';
    default: return 'apps-outline';
  }
}

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { colors } = useTheme();
  const { valves, states, openValve, closeValve, setValvePosition } = useValves();
  const [filter, setFilter] = useState<ValveStatus | 'all'>('all');
  const [selectedValve, setSelectedValve] = useState<Valve | null>(null);
  const [sliderVal, setSliderVal] = useState<number>(0);

  const filteredValves = filter === 'all' ? valves : valves.filter(v => v.status === filter);

  const statusCounts = valves.reduce((acc: any, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    acc['all'] = (acc['all'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleMarkerPress = (valve: Valve) => {
    setSelectedValve(valve);
    setSliderVal(states[valve.device_id]?.position ?? valve.valve_position);
  };

  const handleNavigateToDetail = (valve: Valve) => {
    router.push(`/valve/${valve.device_id}` as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {STATUS_FILTERS.map((s) => {
          const active = filter === s;
          const color = s === 'all' ? colors.text : getStatusColor(s as ValveStatus);
          const icon = getStatusIcon(s);
          return (
            <TouchableOpacity key={s}
              style={[styles.filterChip, { backgroundColor: colors.card, borderColor: colors.border }, active && { backgroundColor: color + '22', borderColor: color }]}
              onPress={() => setFilter(s)}>
              <Ionicons name={icon as any} size={14} color={active ? color : colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.filterText, { color: colors.textSecondary }, active && { color }]}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}{' '}
                <Text style={styles.filterCount}>({statusCounts[s]})</Text>
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={MAP_CENTER}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          mapType="hybrid"
        >
          {/* Valve markers */}
          {filteredValves.map((valve) => {
            const isSelected = selectedValve?.device_id === valve.device_id;
            const markerColor = getMarkerColor(states[valve.device_id]?.status ?? valve.status);
            const size = isSelected ? 44 : 34;

            return (
              <Marker
                key={valve.device_id}
                coordinate={{ latitude: valve.lat, longitude: valve.lng }}
                onPress={() => handleMarkerPress(valve)}
              >
                <View 
                  pointerEvents="none"
                  style={[
                    styles.pumpMarkerContainer, 
                    { 
                      backgroundColor: markerColor, 
                      width: size, 
                      height: size, 
                      borderRadius: size / 2,
                      borderColor: colors.card,
                      borderWidth: isSelected ? 3 : 2,
                    }
                  ]}
                >
                  <MaterialCommunityIcons 
                    name="pump" 
                    size={size * 0.6} 
                    color={COLORS.white} 
                  />
                </View>
                <Callout tooltip onPress={() => handleNavigateToDetail(valve)}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{valve.name}</Text>
                    <Text style={styles.calloutSubtitle}>{valve.device_id} · {valve.zone}</Text>
                    <View style={styles.calloutDivider} />
                    <View style={styles.calloutRow}>
                      <Text style={styles.calloutLabel}>Status</Text>
                      <Text style={[styles.calloutValue, { color: markerColor }]}>
                        {(states[valve.device_id]?.status ?? valve.status).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.calloutRow}>
                      <Text style={styles.calloutLabel}>Position</Text>
                      <Text style={styles.calloutValue}>{states[valve.device_id]?.position ?? valve.valve_position}%</Text>
                    </View>
                    <View style={styles.calloutRow}>
                      <Text style={styles.calloutLabel}>Battery</Text>
                      <Text style={styles.calloutValue}>{valve.battery_voltage.toFixed(1)}V</Text>
                    </View>
                    <View style={styles.calloutFooter}>
                      <Text style={styles.calloutAction}>Control Flow →</Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          })}

          {/* Gateway markers */}
          {GATEWAYS.map((gw) => (
            <Marker
              key={gw.gateway_id}
              coordinate={{ latitude: gw.lat, longitude: gw.lng }}
              pinColor={COLORS.secondary}
            >
              <View style={styles.gatewayMarker}>
                <Ionicons name="wifi" size={16} color={COLORS.white} />
              </View>
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{gw.name}</Text>
                  <Text style={styles.calloutSubtitle}>{gw.gateway_id}</Text>
                  <View style={styles.calloutDivider} />
                  <View style={styles.calloutRow}>
                    <Text style={styles.calloutLabel}>Valves</Text>
                    <Text style={styles.calloutValue}>{gw.connected_valves}</Text>
                  </View>
                  <View style={styles.calloutRow}>
                    <Text style={styles.calloutLabel}>Signal</Text>
                    <Text style={styles.calloutValue}>{gw.signal_strength} dBm</Text>
                  </View>
                  <View style={styles.calloutRow}>
                    <Text style={styles.calloutLabel}>Uptime</Text>
                    <Text style={styles.calloutValue}>{gw.uptime_hours}h</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Map legend */}
        <View style={[styles.legend, { backgroundColor: colors.card + 'EE', borderColor: colors.border }]}>
          {[
            { label: 'Open', status: 'open', color: COLORS.valveOpen },
            { label: 'Partial', status: 'partial', color: COLORS.valvePartial },
            { label: 'Closed', status: 'closed', color: COLORS.valveClosed },
            { label: 'Fault', status: 'fault', color: COLORS.valveFault },
            { label: 'Offline', status: 'offline', color: COLORS.valveOffline },
          ].map(({ label, status, color }) => (
            <View key={label} style={styles.legendItem}>
              <Ionicons name={getStatusIcon(status) as any} size={12} color={color} style={{ marginRight: 4 }} />
              <Text style={[styles.legendText, { color: colors.text }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Selected Valve Bottom Card */}
      {selectedValve && (
        <View style={[styles.bottomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.bottomCardHeader}>
            <View style={[styles.statusDot, { backgroundColor: getMarkerColor(states[selectedValve.device_id]?.status ?? selectedValve.status) }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bottomCardTitle, { color: colors.text }]}>{selectedValve.name}</Text>
              <Text style={[styles.bottomCardSubtitle, { color: colors.textSecondary }]}>{selectedValve.device_id} · {selectedValve.zone}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedValve(null)}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Current position display */}
          <View style={[styles.flowPositionRow, { backgroundColor: colors.background }]}>
            <Text style={[styles.flowPositionLabel, { color: colors.textSecondary }]}>Current Position</Text>
            <Text style={[styles.flowPositionValue, { color: getMarkerColor(states[selectedValve.device_id]?.status ?? selectedValve.status) }]}>
              {states[selectedValve.device_id]?.position ?? selectedValve.valve_position}%
            </Text>
            {states[selectedValve.device_id]?.pending && (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* Flow rate slider */}
          <View style={styles.flowSliderSection}>
            <View style={styles.flowSliderLabelRow}>
              <Text style={[styles.flowSliderLabel, { color: colors.textSecondary }]}>Adjust Flow Rate</Text>
              <Text style={[styles.flowSliderValue, { color: Colors.accent }]}>{Math.round(sliderVal)}%</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 36 }}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={sliderVal}
              onValueChange={setSliderVal}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={COLORS.primary}
              disabled={states[selectedValve.device_id]?.pending || selectedValve.status === 'offline' || selectedValve.status === 'fault'}
            />
            <View style={styles.flowSliderTicks}>
              {[0, 25, 50, 75, 100].map((t) => (
                <Text key={t} style={[styles.flowSliderTick, { color: colors.textMuted }]}>{t}%</Text>
              ))}
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.flowBtnRow}>
            <TouchableOpacity
              style={[styles.flowBtnOpen, { backgroundColor: COLORS.valveOpen }, (states[selectedValve.device_id]?.pending || selectedValve.status === 'offline' || selectedValve.status === 'fault') && styles.flowBtnDisabled]}
              onPress={() => { openValve(selectedValve.device_id); setSliderVal(100); }}
              disabled={states[selectedValve.device_id]?.pending || selectedValve.status === 'offline' || selectedValve.status === 'fault'}
            >
              <Ionicons name="water" size={16} color="#fff" />
              <Text style={styles.flowBtnText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.flowBtnApply, { backgroundColor: COLORS.primary }, (states[selectedValve.device_id]?.pending || selectedValve.status === 'offline' || selectedValve.status === 'fault') && styles.flowBtnDisabled]}
              onPress={() => setValvePosition(selectedValve.device_id, sliderVal)}
              disabled={states[selectedValve.device_id]?.pending || selectedValve.status === 'offline' || selectedValve.status === 'fault'}
            >
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.flowBtnText}>Set {Math.round(sliderVal)}%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.flowBtnClose, { backgroundColor: COLORS.valveClosed }, (states[selectedValve.device_id]?.pending || selectedValve.status === 'offline' || selectedValve.status === 'fault') && styles.flowBtnDisabled]}
              onPress={() => { closeValve(selectedValve.device_id); setSliderVal(0); }}
              disabled={states[selectedValve.device_id]?.pending || selectedValve.status === 'offline' || selectedValve.status === 'fault'}
            >
              <Ionicons name="close-circle" size={16} color="#fff" />
              <Text style={styles.flowBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  profileButton: { padding: 4 },
  logo: { fontSize: FontSize.lg, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { fontSize: FontSize.xs, color: COLORS.dark, marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: Spacing.xs },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.card, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.secondary,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statText: { fontSize: FontSize.xs, color: COLORS.text, fontWeight: '600' },
  filterBar: { maxHeight: 44 },
  filterContent: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, gap: Spacing.xs },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: COLORS.secondary, backgroundColor: COLORS.card,
  },
  filterText: { fontSize: FontSize.xs, color: COLORS.dark, fontWeight: '600' },
  filterCount: { fontWeight: '400', opacity: 0.7 },

  // Map
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },

  // Gateway marker
  gatewayMarker: {
    backgroundColor: COLORS.secondary,
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, elevation: 4,
  },

  // Callout
  calloutContainer: {
    backgroundColor: COLORS.card,
    borderRadius: Radius.md,
    padding: 12,
    minWidth: 180,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
    borderWidth: 1, borderColor: COLORS.secondary + '44',
  },
  calloutTitle: { fontSize: FontSize.sm, fontWeight: '700', color: COLORS.text },
  calloutSubtitle: { fontSize: FontSize.xs, color: COLORS.dark, marginTop: 2 },
  calloutDivider: { height: 1, backgroundColor: COLORS.secondary + '44', marginVertical: 8 },
  calloutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  calloutLabel: { fontSize: FontSize.xs, color: COLORS.dark },
  calloutValue: { fontSize: FontSize.xs, fontWeight: '600', color: COLORS.text },
  calloutFooter: { marginTop: 8, alignItems: 'center' },
  calloutAction: { fontSize: FontSize.xs, color: COLORS.primary, fontWeight: '600' },

  // Custom Markers
  pumpMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pumpMarker: {
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  pumpMarkerText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  statsPillLabel: { fontSize: 9, color: COLORS.dark },
  statsPillValue: { fontSize: FontSize.xs, fontWeight: '700', color: COLORS.text },

  // Legend
  legend: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: COLORS.card + 'EE', borderRadius: Radius.md,
    padding: 8, flexDirection: 'row', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 3, elevation: 3,
    borderWidth: 1, borderColor: COLORS.secondary + '44',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: COLORS.text, fontWeight: '500' },

  // Bottom selected valve card
  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 8,
    borderTopWidth: 1, borderColor: COLORS.secondary,
  },
  bottomCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  bottomCardTitle: { fontSize: FontSize.md, fontWeight: '700', color: COLORS.text },
  bottomCardSubtitle: { fontSize: FontSize.xs, color: COLORS.dark, marginTop: 1 },
  bottomCardMetrics: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  bottomMetric: {
    alignItems: 'center', flex: 1,
    backgroundColor: COLORS.background, borderRadius: Radius.sm, padding: 8,
    marginHorizontal: 2,
  },
  bottomMetricLabel: { fontSize: 10, color: COLORS.dark },
  bottomMetricValue: { fontSize: FontSize.sm, fontWeight: '700', color: COLORS.text, marginTop: 2 },

  // Flow control styles
  flowPositionRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.sm, padding: 10, marginBottom: 10,
  },
  flowPositionLabel: { fontSize: FontSize.xs, fontWeight: '600', flex: 1 },
  flowPositionValue: { fontSize: FontSize.xl, fontWeight: '900' },
  flowSliderSection: { marginBottom: 10 },
  flowSliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  flowSliderLabel: { fontSize: FontSize.xs, fontWeight: '600' },
  flowSliderValue: { fontSize: FontSize.sm, fontWeight: '800' },
  flowSliderTicks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  flowSliderTick: { fontSize: 9 },
  flowBtnRow: { flexDirection: 'row', gap: 8 },
  flowBtnOpen: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: Colors.accent,
  },
  flowBtnApply: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: COLORS.primary,
  },
  flowBtnClose: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: Colors.blue,
  },
  flowBtnDisabled: { opacity: 0.35 },
  flowBtnText: { fontSize: FontSize.xs, fontWeight: '800', color: '#fff' },
});
