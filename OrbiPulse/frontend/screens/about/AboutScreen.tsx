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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';

export default function AboutScreen() {
  const router = useRouter();
  
  const APP_INFO = {
    name: 'OrbiPulse',
    version: '1.0.0',
    build: '2024.1.0',
    description: 'Smart Irrigation Monitoring System for modern agriculture. Monitor and control your irrigation valves remotely with AI-powered analytics.',
    company: 'AgriTech Solutions',
    website: 'https://orbipulse.com',
  };
  
  const handleOpenWebsite = () => {
    Linking.openURL(APP_INFO.website);
  };
  
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo & Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="water" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>{APP_INFO.name}</Text>
          <Text style={styles.tagline}>Smart Irrigation Monitoring</Text>
        </View>
        
        {/* Version Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{APP_INFO.version}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>{APP_INFO.build}</Text>
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{APP_INFO.description}</Text>
        </View>
        
        {/* Features */}
        <Text style={styles.sectionLabel}>KEY FEATURES</Text>
        <View style={styles.featuresCard}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Real-time valve monitoring</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>AI-powered analytics</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Remote control & scheduling</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Predictive maintenance</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Alert notifications</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>GPS valve mapping</Text>
          </View>
        </View>
        
        {/* Company Info */}
        <Text style={styles.sectionLabel}>DEVELOPED BY</Text>
        <View style={styles.companyCard}>
          <View style={styles.companyRow}>
            <Ionicons name="business-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.companyText}>{APP_INFO.company}</Text>
          </View>
          <TouchableOpacity style={styles.websiteRow} onPress={handleOpenWebsite}>
            <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
            <Text style={styles.websiteText}>{APP_INFO.website}</Text>
            <Ionicons name="open-outline" size={18} color={COLORS.dark} />
          </TouchableOpacity>
        </View>
        
        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>© 2024 AgriTech Solutions</Text>
          <Text style={styles.rights}>All rights reserved.</Text>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary + '44',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.dark,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: COLORS.dark,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.secondary,
    marginVertical: 4,
  },
  descriptionCard: {
    backgroundColor: COLORS.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 24,
  },
  description: {
    fontSize: FontSize.sm,
    color: COLORS.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: 1,
    marginBottom: 12,
  },
  featuresCard: {
    backgroundColor: COLORS.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: COLORS.text,
  },
  companyCard: {
    backgroundColor: COLORS.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    gap: 12,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyText: {
    flex: 1,
    fontSize: FontSize.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  websiteText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 4,
  },
  copyright: {
    fontSize: FontSize.xs,
    color: COLORS.dark,
  },
  rights: {
    fontSize: FontSize.xs,
    color: COLORS.dark,
    opacity: 0.7,
  },
});
