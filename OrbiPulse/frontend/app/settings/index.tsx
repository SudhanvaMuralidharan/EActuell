import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface SettingItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  isExternal?: boolean;
}

function SettingItem({ icon, label, value, onPress, color = COLORS.primary, isExternal = false }: SettingItemProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.valueContainer}>
        {value && <Text style={[styles.settingValue, { color: colors.textMuted }]}>{value}</Text>}
        <Ionicons name={isExternal ? "open-outline" : "chevron-forward"} size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { toggleTheme, isDark, colors } = useTheme();
  const { user } = useAuth();
  
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem
            icon="person-outline"
            label="Profile Information"
            value={user?.name || 'Set Name'}
            onPress={() => router.push('/settings/profile')}
          />
          <SettingItem
            icon="phone-portrait-outline"
            label="Phone Number"
            value={user?.phone || 'Not linked'}
            color={COLORS.secondary}
          />
        </View>
        
        {/* System Section */}
        <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>PREFERENCES</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem
            icon="color-palette-outline"
            label="Dark Mode"
            value={isDark ? 'On' : 'Off'}
            onPress={toggleTheme}
            color={COLORS.accent}
          />
          <SettingItem
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => {}}
          />
        </View>
        
        {/* Support Section */}
        <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>SUPPORT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => {}}
            isExternal
          />
          <SettingItem
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => {}}
            color={COLORS.dark}
            isExternal
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>OrbiPulse v1.0.0</Text>
        </View>
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
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  footer: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
