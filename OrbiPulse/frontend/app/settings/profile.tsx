import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { pickProfileImage } from '../../utils/imagePicker';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState<string | undefined>(user?.profileImage);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = async () => {
    try {
      const base64 = await pickProfileImage();
      if (base64) {
        setProfileImage(base64);
      }
    } catch (error: any) {
      Alert.alert(t('error'), error.message || 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('missing_name'), t('enter_name_alert'));
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(name.trim(), profileImage);
      Alert.alert(t('success'), t('profile_updated'), [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert(t('update_failed'), error.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('edit_profile')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={handlePickImage} style={styles.imageContainer}>
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage.startsWith('data:') ? profileImage : `data:image/jpeg;base64,${profileImage}` }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.card }]}>
                  <Ionicons name="camera-outline" size={40} color={COLORS.primary} />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={14} color={COLORS.white} />
              </View>
            </TouchableOpacity>
            <Text style={[styles.imageHint, { color: colors.textMuted }]}>
              {t('tap_change_photo')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('full_name')}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('enter_name')}
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('phone_number')}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border, opacity: 0.7 }]}>
                <Ionicons name="call-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textMuted }]}
                  value={user?.phone}
                  editable={false}
                />
                <MaterialCommunityIcons name="lock" size={16} color={colors.textMuted} />
              </View>
              <Text style={styles.inputHint}>{t('phone_no_change')}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, isSaving && { opacity: 0.8 }]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>{t('save_changes')}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '33',
    borderStyle: 'dashed',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHint: {
    marginTop: 12,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 10,
    color: '#6B7A8F',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FontSize.md,
    fontWeight: '800',
  },
});
