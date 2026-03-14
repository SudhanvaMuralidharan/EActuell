import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useValves } from '../../context/ValveContext';
import { GATEWAYS, Valve } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';

export default function AddValveScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addValve, valves } = useValves();
  const { t } = useLanguage();
  
  const [deviceId, setDeviceId] = useState('');
  const [name, setName] = useState('');
  const [gatewayId, setGatewayId] = useState(GATEWAYS[0].gateway_id);
  const [zone, setZone] = useState('Zone A');
  const [isAdding, setIsAdding] = useState(false);

  // Coordinates - randomly place near Central Hub for demo
  const [lat] = useState(14.6650 + (Math.random() - 0.5) * 0.02);
  const [lng] = useState(75.9360 + (Math.random() - 0.5) * 0.02);

  const handleAddValve = async () => {
    if (!deviceId.trim() || !name.trim()) {
      Alert.alert(t('incomplete_data'), t('provide_id_name'));
      return;
    }

    if (valves.some(v => v.device_id.toUpperCase() === deviceId.trim().toUpperCase())) {
      Alert.alert(t('duplicate_id'), t('valve_exists'));
      return;
    }

    const newValve: Valve = {
      device_id: deviceId.trim(),
      name: name.trim(),
      gateway_id: gatewayId,
      lat,
      lng,
      valve_position: 0,
      status: 'closed',
      battery_voltage: 4.0,
      motor_current: 0.0,
      internal_temp: 28,
      signal_strength: -60,
      movement_duration: 800,
      last_seen: new Date().toISOString(),
      zone,
    };

    setIsAdding(true);
    try {
      await addValve(newValve);
      Alert.alert(t('success'), t('valve_added_success'), [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert(t('error'), t('failed_add_valve'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('add_valve')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconHeader}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="add-circle" size={50} color={COLORS.primary} />
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}> {t('register_valve_msg')} </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('device_id')}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="barcode-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. V-021"
                placeholderTextColor={colors.textMuted}
                value={deviceId}
                onChangeText={setDeviceId}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('valve_name')}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Field C — North Corner"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('gateway_cluster')}</Text>
            <View style={styles.gatewayOptions}>
              {GATEWAYS.map(gw => (
                <TouchableOpacity
                  key={gw.gateway_id}
                  style={[
                    styles.gwOption,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    gatewayId === gw.gateway_id && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }
                  ]}
                  onPress={() => setGatewayId(gw.gateway_id)}
                >
                  <Text style={[styles.gwLabel, gatewayId === gw.gateway_id && { color: COLORS.primary }]}>{gw.gateway_id}</Text>
                  <Text style={styles.gwName} numberOfLines={1}>{gw.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('zone_field')}</Text>
            <View style={styles.zoneOptions}>
              {['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'].map(z => (
                <TouchableOpacity
                  key={z}
                  style={[
                    styles.zoneChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    zone === z && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary }
                  ]}
                  onPress={() => setZone(z)}
                >
                  <Text style={[styles.zoneText, zone === z && { color: '#fff' }]}>{z}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.addBtn, isAdding && { opacity: 0.8 }]} 
          onPress={handleAddValve}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.addBtnText}>{t('save_and_deploy')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800' },
  content: { padding: Spacing.xl },
  iconHeader: { alignItems: 'center', marginBottom: 32 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  infoText: { marginTop: 16, textAlign: 'center', fontSize: FontSize.sm, fontWeight: '600', lineHeight: 20 },
  form: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: FontSize.sm, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: Radius.md, paddingHorizontal: 16, borderWidth: 1.5 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: FontSize.md, fontWeight: '600' },
  gatewayOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gwOption: { flex: 1, minWidth: '45%', padding: 12, borderRadius: Radius.md, borderWidth: 1.5 },
  gwLabel: { fontSize: 13, fontWeight: '800', color: '#6B7A8F' },
  gwName: { fontSize: 10, color: '#6B7A8F', marginTop: 2 },
  zoneOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  zoneChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  zoneText: { fontSize: FontSize.xs, fontWeight: '700', color: '#6B7A8F' },
  addBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },
});
