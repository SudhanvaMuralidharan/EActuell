import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ProfileMenuItem from './ProfileMenuItem';

export interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateSettings: () => void;
  onNavigateAbout: () => void;
  onNavigateProfile: () => void;
}

export default function ProfileModal({
  visible,
  onClose,
  onNavigateSettings,
  onNavigateAbout,
  onNavigateProfile,
}: ProfileModalProps) {
  const { toggleTheme, isDark } = useTheme();
  const { farmer } = useAuth();

  // Get user data from auth context or use defaults
  const userName = farmer?.name || 'Farmer';
  const userPhone = farmer?.phone || 'Not set';
  const userProfileImage = farmer?.profile_image || null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* Click outside closes modal */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Prevent closing when tapping inside dropdown */}
          <TouchableWithoutFeedback>
            <View style={styles.dropdownContainer}>
              
              {/* User Info */}
              <View style={styles.userInfoSection}>
                {userProfileImage ? (
                  <Image source={{ uri: userProfileImage }} style={styles.userAvatar} />
                ) : (
                  <Ionicons
                    name="person-circle"
                    size={42}
                    color={COLORS.primary}
                  />
                )}

                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{userName}</Text>
                  <Text style={styles.userPhone}>{userPhone}</Text>
                </View>

                <TouchableOpacity onPress={onNavigateProfile} style={styles.editButton}>
                  <Ionicons name="create-outline" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Menu */}
              <View style={styles.menuOptions}>

                <ProfileMenuItem
                  icon="settings-outline"
                  label="Settings"
                  color={COLORS.primary}
                  onPress={() => {
                    onClose();
                    onNavigateSettings();
                  }}
                />

                {/* Theme Toggle */}
                <View style={styles.themeRow}>
                  <Ionicons
                    name="color-palette-outline"
                    size={20}
                    color={COLORS.secondary}
                  />

                  <Text style={styles.menuLabel}>Theme</Text>

                  <TouchableOpacity
                    style={styles.themeToggle}
                    onPress={toggleTheme}
                  >
                    <View
                      style={[
                        styles.toggleBackground,
                        isDark && styles.toggleBackgroundActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.toggleKnob,
                          isDark && styles.toggleKnobActive,
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                <ProfileMenuItem
                  icon="information-circle-outline"
                  label="About"
                  color={COLORS.dark}
                  onPress={() => {
                    onClose();
                    onNavigateAbout();
                  }}
                />

              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    backgroundColor: COLORS.card,
    borderRadius: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,

    borderWidth: 1,
    borderColor: COLORS.border,
  },

  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },

  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.background,
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  userPhone: {
    fontSize: 13,
    color: COLORS.dark,
    marginTop: 2,
  },

  editButton: {
    padding: 4,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },

  menuOptions: {
    paddingVertical: 6,
  },

  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },

  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },

  themeToggle: {
    justifyContent: 'center',
  },

  toggleBackground: {
    width: 42,
    height: 22,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    padding: 2,
  },

  toggleBackgroundActive: {
    backgroundColor: COLORS.primary,
  },

  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },

  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});