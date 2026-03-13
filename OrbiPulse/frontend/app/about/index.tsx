import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About OrbiPulse</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: COLORS.primary + '15' }]}>
            <MaterialCommunityIcons name="broadcast" size={60} color={COLORS.primary} />
          </View>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.description, { color: colors.text }]}>
            OrbiPulse is a next-generation smart irrigation management system designed specifically for modern farmers. 
            Monitor and control your entire valve network with precision and ease.
          </Text>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Ionicons name="flash-outline" size={20} color={COLORS.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Real-time Monitoring</Text>
                <Text style={[styles.infoSubtitle, { color: colors.textMuted }]}>Get instant updates on valve status and pressure.</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.secondary} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Fault Detection</Text>
                <Text style={[styles.infoSubtitle, { color: colors.textMuted }]}>Automated alerts for leaks or blockages.</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.accent} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Smart Scheduling</Text>
                <Text style={[styles.infoSubtitle, { color: colors.textMuted }]}>Optimize water usage with automated timers.</Text>
              </View>
            </View>
          </View>

          <View style={styles.linkSection}>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleLink('https://orbipulse.com')}>
              <Text style={[styles.linkText, { color: COLORS.primary }]}>Visit Website</Text>
              <Ionicons name="open-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} onPress={() => handleLink('https://orbipulse.com/privacy')}>
              <Text style={[styles.linkText, { color: COLORS.primary }]}>Privacy Policy</Text>
              <Ionicons name="open-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.copyright, { color: colors.textMuted }]}>
          © 2026 E-Actuell. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  versionText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  infoSection: {
    width: '100%',
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  infoCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 8,
  },
  linkSection: {
    gap: 16,
    marginBottom: 40,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  copyright: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
