import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateSettings: () => void;
  onNavigateAbout: () => void;
}

interface ProfileOptionProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

// Mock user data - replace with actual user data from auth context
const USER_DATA = {
  name: 'John Doe',
  email: 'john.doe@farm.com',
  role: 'Farm Manager',
};

function ProfileOption({ icon, label, onPress, color = COLORS.primary }: ProfileOptionProps) {
  return (
    <TouchableOpacity style={styles.optionRow} onPress={onPress}>
      <View style={[styles.optionIconContainer, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={COLORS.dark} />
    </TouchableOpacity>
  );
}

export default function ProfileModal({
  visible,
  onClose,
  onNavigateSettings,
  onNavigateAbout,
}: ProfileModalProps) {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.userName}>{USER_DATA.name}</Text>
              <Text style={styles.userRole}>{USER_DATA.role}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
          </View>
          
          {/* User Info Card */}
          <View style={styles.userInfoCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={60} color={COLORS.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{USER_DATA.email}</Text>
              <View style={styles.accountBadge}>
                <Text style={styles.accountBadgeText}>Pro Account</Text>
              </View>
            </View>
          </View>
          
          {/* Options */}
          <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>MENU</Text>
            
            <ProfileOption
              icon="settings-outline"
              label="Settings"
              onPress={() => {
                onClose();
                onNavigateSettings();
              }}
            />
            
            <ProfileOption
              icon="color-palette-outline"
              label="Theme"
              onPress={() => {}}
              color={COLORS.secondary}
            />
            
            {/* Theme Toggle */}
            <View style={styles.themeToggleRow}>
              <View style={styles.optionRow}>
                <View style={[styles.optionIconContainer, { backgroundColor: COLORS.accent + '22' }]}>
                  <Ionicons name="moon-outline" size={20} color={COLORS.accent} />
                </View>
                <Text style={styles.optionLabel}>Dark Mode</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleSwitch, isDark && styles.toggleSwitchActive]}
                onPress={toggleTheme}
              >
                <View style={[styles.toggleKnob, isDark && styles.toggleKnobActive]} />
              </TouchableOpacity>
            </View>
            
            <ProfileOption
              icon="information-circle-outline"
              label="About"
              onPress={() => {
                onClose();
                onNavigateAbout();
              }}
              color={COLORS.dark}
            />
          </ScrollView>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.versionText}>OrbiPulse v1.0.0</Text>
            <Text style={styles.copyrightText}>© 2024 Smart Irrigation</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.dark,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 4,
  },
  accountBadge: {
    backgroundColor: COLORS.primary + '22',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  accountBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  optionsContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.dark,
  },
  copyrightText: {
    fontSize: 11,
    color: COLORS.dark,
    opacity: 0.7,
  },
});
