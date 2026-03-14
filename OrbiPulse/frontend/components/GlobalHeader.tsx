import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, FontSize, Radius, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useValves } from '../context/ValveContext';
import ProfileModal from './profile/ProfileModal';

export default function GlobalHeader() {
  const { colors } = useTheme();
  const { openCount, faultCount } = useValves();
  const [profileVisible, setProfileVisible] = useState(false);
  const router = useRouter();

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
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
            <View style={[styles.statsPill, { backgroundColor: COLORS.valveOpen + '22' }]}>
              <Text style={styles.statsPillLabel}>LIVE</Text>
              <Text style={[styles.statsPillValue, { color: COLORS.valveOpen }]}>{openCount}</Text>
            </View>
            <View style={[styles.statsPill, { backgroundColor: COLORS.valveFault + '22' }]}>
              <Text style={styles.statsPillLabel}>FAULT</Text>
              <Text style={[styles.statsPillValue, { color: COLORS.valveFault }]}>{faultCount}</Text>
            </View>
          </View>
        </View>
      </View>

      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        onNavigateSettings={() => router.push('/settings' as any)}
        onNavigateAbout={() => router.push('/about' as any)}
        onNavigateProfile={() => router.push('/settings/profile' as any)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  logo: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    padding: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statsPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statsPillLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.dark,
    opacity: 0.6,
  },
  statsPillValue: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
});
