import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../constants/translations';

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
  const { t, language, setLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: t('english') },
    { code: 'kn', label: t('kannada') },
    { code: 'hi', label: t('hindi') },
    { code: 'ta', label: t('tamil') },
  ];

  const currentLanguageLabel = languages.find(l => l.code === language)?.label || 'English';

  const handleSelectLanguage = (code: Language) => {
    setLanguage(code);
    setShowLanguageModal(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>{t('account')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem
            icon="plus-circle-outline"
            label={t('add_valve')}
            onPress={() => router.push('/settings/add-valve')}
          />
          <SettingItem
            icon="person-outline"
            label={t('profile_info')}
            value={user?.name || t('set_name')}
            onPress={() => router.push('/settings/profile')}
          />
        </View>
        
        {/* System Section */}
        <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>{t('preferences')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem
            icon="language-outline"
            label={t('language')}
            value={currentLanguageLabel}
            onPress={() => setShowLanguageModal(true)}
          />
        </View>
        
        {/* Support Section */}
        <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>{t('support')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingItem
            icon="help-circle-outline"
            label={t('help_center')}
            onPress={() => {}}
            isExternal
          />
          <SettingItem
            icon="document-text-outline"
            label={t('terms_service')}
            onPress={() => {}}
            color={COLORS.dark}
            isExternal
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>{t('version')}</Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={showLanguageModal} transparent animationType="fade" onRequestClose={() => setShowLanguageModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLanguageModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('select_language')}</Text>
            {languages.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[styles.languageOption, language === item.code && { backgroundColor: COLORS.primary + '22' }]}
                onPress={() => handleSelectLanguage(item.code)}
              >
                <Text style={[styles.languageLabel, { color: colors.text }, language === item.code && { color: COLORS.primary, fontWeight: '700' }]}>
                  {item.label}
                </Text>
                {language === item.code && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.closeModalText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    marginBottom: 4,
  },
  languageLabel: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  closeModalBtn: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: FontSize.md,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
