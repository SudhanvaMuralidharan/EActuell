import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import OtpModal from '../../components/auth/OtpModal';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const { setPhoneNumber } = useAuth();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  const countryCode = '+91';

  const validatePhoneNumber = (number: string) => {
    const digits = number.replace(/\D/g, '');
    return digits.length === 10;
  };

  const handleSendOtp = () => {
    if (!validatePhoneNumber(phone)) {
      Alert.alert(
        'Invalid Number',
        'Please enter a valid 10-digit phone number'
      );
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${cleanPhone}`;

    setLoading(true);

    // Hackathon mode: no backend call
    setTimeout(() => {
      setPhoneNumber(fullPhoneNumber);
      setOtpModalVisible(true);
      setLoading(false);
    }, 400);
  };

  const handleOtpVerified = () => {
    setOtpModalVisible(false);

    // Navigate to profile setup
    router.push('/(auth)/profile');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="leaf" size={60} color={COLORS.primary} />
            <Text style={styles.title}>OrbiPulse</Text>
            <Text style={styles.subtitle}>Smart Valve Network</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Login to your farm account
            </Text>

            {/* Phone Input */}
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>{countryCode}</Text>
              </View>

              <TextInput
                style={styles.phoneInput}
                placeholder="Enter phone number"
                placeholderTextColor={COLORS.dark}
                value={phone}
                onChangeText={(text) =>
                  setPhone(text.replace(/[^0-9]/g, ''))
                }
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <Ionicons
                  name="hourglass"
                  size={20}
                  color={COLORS.white}
                />
              ) : (
                <>
                  <Text style={styles.buttonText}>Send OTP</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={COLORS.white}
                  />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.infoText}>
              By continuing you agree to our Terms of Service
              and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <OtpModal
        visible={otpModalVisible}
        phoneNumber={`${countryCode}${phone}`}
        onVerified={handleOtpVerified}
        onClose={() => setOtpModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.md,
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: Spacing.sm,
  },

  subtitle: {
    fontSize: FontSize.sm,
    color: COLORS.dark,
    marginTop: 2,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },

  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },

  countryCodeContainer: {
    backgroundColor: COLORS.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginRight: Spacing.xs,
  },

  countryCode: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },

  phoneInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: COLORS.white,
  },

  infoText: {
    fontSize: FontSize.xs,
    color: COLORS.dark,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
});