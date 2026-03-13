import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout, Region } from 'react-native-maps';

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

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState<ValveStatus | 'all'>('all');
  const [selectedValve, setSelectedValve] = useState<Valve | null>(null);
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

  const handleMarkerPress = (valve: Valve) => {
    setSelectedValve(valve);
  };

  const handleNavigateToDetail = (valve: Valve) => {
    router.push(`/valve/${valve.device_id}` as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.logo, { color: COLORS.primary }]}>OrbiPulse</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Smart Valve Network</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setProfileVisible(true)}
          >
            <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              <Text style={[styles.statText, { color: colors.text }]}>{openCount} Live</Text>
            </View>
            {faultCount > 0 && (
              <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: COLORS.danger + '66' }]}>
                <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
                <Text style={[styles.statText, { color: COLORS.danger }]}>{faultCount} Fault</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {STATUS_FILTERS.map((s) => {
          const active = filter === s;
          const color = s === 'all' ? colors.text : getStatusColor(s as ValveStatus);
          return (
            <TouchableOpacity key={s}
              style={[styles.filterChip, { backgroundColor: colors.card, borderColor: colors.border }, active && { backgroundColor: color + '22', borderColor: color }]}
              onPress={() => setFilter(s)}>
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
          {filteredValves.map((valve) => (
            <Marker
              key={valve.device_id}
              coordinate={{ latitude: valve.lat, longitude: valve.lng }}
              pinColor={getMarkerColor(valve.status)}
              onPress={() => handleMarkerPress(valve)}
            >
              <Callout tooltip onPress={() => handleNavigateToDetail(valve)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{valve.name}</Text>
                  <Text style={styles.calloutSubtitle}>{valve.device_id} · {valve.zone}</Text>
                  <View style={styles.calloutDivider} />
                  <View style={styles.calloutRow}>
                    <Text style={styles.calloutLabel}>Status</Text>
                    <Text style={[styles.calloutValue, { color: getMarkerColor(valve.status) }]}>
                      {valve.status.charAt(0).toUpperCase() + valve.status.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.calloutRow}>
                    <Text style={styles.calloutLabel}>Position</Text>
                    <Text style={styles.calloutValue}>{valve.valve_position}%</Text>
                  </View>
                  <View style={styles.calloutRow}>
                    <Text style={styles.calloutLabel}>Battery</Text>
                    <Text style={styles.calloutValue}>{valve.battery_voltage.toFixed(1)}V</Text>
                  </View>
                  <View style={styles.calloutRow}>
                    <Text style={styles.calloutLabel}>Last seen</Text>
                    <Text style={styles.calloutValue}>{formatLastSeen(valve.last_seen)}</Text>
                  </View>
                  <View style={styles.calloutFooter}>
                    <Text style={styles.calloutAction}>Tap for details →</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}

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
            { label: 'Open', color: COLORS.valveOpen },
            { label: 'Partial', color: COLORS.valvePartial },
            { label: 'Closed', color: COLORS.valveClosed },
            { label: 'Fault', color: COLORS.valveFault },
            { label: 'Offline', color: COLORS.valveOffline },
          ].map(({ label, color }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Selected Valve Bottom Card */}
      {selectedValve && (
        <View style={[styles.bottomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.bottomCardHeader}>
            <View style={[styles.statusDot, { backgroundColor: getMarkerColor(selectedValve.status) }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bottomCardTitle, { color: colors.text }]}>{selectedValve.name}</Text>
              <Text style={[styles.bottomCardSubtitle, { color: colors.textSecondary }]}>{selectedValve.device_id} · {selectedValve.zone}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedValve(null)}>
              <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.bottomCardMetrics}>
            {[
              { label: 'Position', value: `${selectedValve.valve_position}%` },
              { label: 'Battery', value: `${selectedValve.battery_voltage.toFixed(1)}V` },
              { label: 'Temp', value: `${selectedValve.internal_temp}°C` },
              { label: 'Signal', value: `${selectedValve.signal_strength}dBm` },
            ].map(({ label, value }) => (
              <View key={label} style={[styles.bottomMetric, { backgroundColor: colors.background }]}>
                <Text style={[styles.bottomMetricLabel, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.bottomMetricValue, { color: colors.text }]}>{value}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => handleNavigateToDetail(selectedValve)}
          >
            <Text style={styles.detailBtnText}>View Full Details</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Modal */}
      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        onNavigateSettings={() => router.push('/screens/settings/SettingsScreen' as any)}
        onNavigateAbout={() => router.push('/screens/about/AboutScreen' as any)}
      />
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
  detailBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.primary, paddingVertical: Spacing.sm, borderRadius: Radius.md,
  },
  detailBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: COLORS.white },
});
