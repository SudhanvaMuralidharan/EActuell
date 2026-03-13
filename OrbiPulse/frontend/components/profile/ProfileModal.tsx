import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ProfileMenuItem from './ProfileMenuItem';

export interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateSettings: () => void;
  onNavigateAbout: () => void;
}

// Mock user data - replace with actual user data from auth context
const USER_DATA = {
  name: 'John Doe',
  email: 'john.doe@farm.com',
};

export default function ProfileModal({
  visible,
  onClose,
  onNavigateSettings,
  onNavigateAbout,
}: ProfileModalProps) {
  const { theme, setTheme, toggleTheme, isDark, colors, showTelemetry, toggleTelemetry } = useTheme();
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Transparent overlay to detect taps outside */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Floating dropdown panel */}
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={[styles.dropdownContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* User Info Section */}
          <View style={styles.userInfoSection}>
            <View style={styles.avatarWrapper}>
              <Ionicons name="person-circle" size={40} color={COLORS.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>{USER_DATA.name}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{USER_DATA.email}</Text>
            </View>
          </View>
          
          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {/* Menu Options */}
          <View style={styles.menuOptions}>
            <ProfileMenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => {
                onClose();
                onNavigateSettings();
              }}
              color={COLORS.primary}
            />
            
            {/* Theme Toggle Inline */}
            <View style={styles.themeRow}>
              <View style={styles.themeIconWrapper}>
                <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={20} color={COLORS.secondary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{isDark ? 'Dark' : 'Light'}</Text>
              <TouchableOpacity
                style={[styles.themeToggle, isDark ? styles.themeToggleActive : styles.themeToggleInactive]}
                onPress={toggleTheme}
              >
                <View style={[styles.themeToggleBg, isDark && styles.themeToggleBgActive]}>
                  <View style={[styles.themeToggleKnob, isDark && styles.themeToggleKnobActive]} />
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Telemetry Toggle Inline */}
            <View style={styles.themeRow}>
              <View style={styles.themeIconWrapper}>
                <Ionicons name="pulse-outline" size={20} color={COLORS.secondary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Telemetry</Text>
              <TouchableOpacity
                style={[styles.themeToggle, showTelemetry ? styles.themeToggleActive : styles.themeToggleInactive]}
                onPress={toggleTelemetry}
              >
                <View style={[styles.themeToggleBg, showTelemetry && styles.themeToggleBgActive]}>
                  <View style={[styles.themeToggleKnob, showTelemetry && styles.themeToggleKnobActive]} />
                </View>
              </TouchableOpacity>
            </View>
            
            <ProfileMenuItem
              icon="information-circle-outline"
              label="About"
              onPress={() => {
                onClose();
                onNavigateAbout();
              }}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 240,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  menuOptions: {
    paddingVertical: 8,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  themeIconWrapper: {
    width: 24,
    alignItems: 'center',
  },
  themeToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  themeToggleActive: {
    backgroundColor: COLORS.primary,
  },
  themeToggleInactive: {
    backgroundColor: COLORS.secondary,
  },
  themeToggleBg: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
  },
  themeToggleBgActive: {
    backgroundColor: COLORS.primary,
  },
  themeToggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    marginLeft: 2,
  },
  themeToggleKnobActive: {
    alignSelf: 'flex-end',
  },
});
