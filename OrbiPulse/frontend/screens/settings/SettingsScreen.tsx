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

interface SettingItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
}

function SettingItem({ icon, label, value, onPress, color = COLORS.primary }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {value ? (
        <View style={styles.valueContainer}>
          <Text style={styles.settingValue}>{value}</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.dark} />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.dark} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingItem
            icon="person-outline"
            label="Profile Information"
            onPress={() => {}}
          />
          <SettingItem
            icon="mail-outline"
            label="Email"
            value="john.doe@farm.com"
            onPress={() => {}}
            color={COLORS.secondary}
          />
          <SettingItem
            icon="phone-portrait-outline"
            label="Phone Number"
            value="+1 234 567 8900"
            onPress={() => {}}
            color={COLORS.accent}
          />
        </View>
        
        {/* Notifications Section */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <SettingItem
            icon="notifications-outline"
            label="Push Notifications"
            value="Enabled"
            onPress={() => {}}
          />
          <SettingItem
            icon="mail-outline"
            label="Email Alerts"
            value="Critical Only"
            onPress={() => {}}
            color={COLORS.warning}
          />
          <SettingItem
            icon="volume-high-outline"
            label="Sound"
            value="On"
            onPress={() => {}}
            color={COLORS.success}
          />
        </View>
        
        {/* System Section */}
        <Text style={styles.sectionLabel}>SYSTEM</Text>
        <View style={styles.card}>
          <SettingItem
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => {}}
          />
          <SettingItem
            icon="time-outline"
            label="Time Zone"
            value="UTC+5:30"
            onPress={() => {}}
            color={COLORS.secondary}
          />
          <SettingItem
            icon="cloud-download-outline"
            label="Data Usage"
            onPress={() => {}}
            color={COLORS.accent}
          />
        </View>
        
        {/* Support Section */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <View style={styles.card}>
          <SettingItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => {}}
          />
          <SettingItem
            icon="chatbubble-ellipses-outline"
            label="Contact Support"
            onPress={() => {}}
            color={COLORS.secondary}
          />
          <SettingItem
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => {}}
            color={COLORS.dark}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => {}}
            color={COLORS.success}
          />
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValue: {
    fontSize: FontSize.sm,
    color: COLORS.dark,
  },
});
