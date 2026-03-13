import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import OtpModal from '../../components/auth/OtpModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PhoneLoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const validatePhone = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleSendOtp = async () => {
    if (!validatePhone(phoneNumber)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendOtp(`+91${phoneNumber}`);
      setIsOtpVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    try {
      await login(`+91${phoneNumber}`, otp);
      setIsOtpVisible(false);
      // Root index or layout will handle redirection based on isAuthenticated and user.name
    } catch (error: any) {
      throw error; 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
             <MaterialCommunityIcons name="broadcast" size={60} color={Colors.accent} />
          </View>
          <Text style={styles.title}>Welcome to OrbiPulse</Text>
          <Text style={styles.subtitle}>Connecting farmers with smart solutions</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Enter Phone Number</Text>
          <View style={styles.inputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="1234567890"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !validatePhone(phoneNumber) && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={isLoading || !validatePhone(phoneNumber)}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Text>
            {!isLoading && (
              <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms and Conditions
          </Text>
        </View>

        <OtpModal
          isVisible={isOtpVisible}
          phone={`+91 ${phoneNumber}`}
          onVerify={handleVerifyOtp}
          onClose={() => setIsOtpVisible(false)}
          onResend={handleSendOtp}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  countryCode: {
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 55,
    borderTopLeftRadius: Radius.md,
    borderBottomLeftRadius: Radius.md,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: Colors.border,
  },
  countryCodeText: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  input: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopRightRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  button: {
    backgroundColor: Colors.accent,
    height: 55,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: Colors.offlineGray,
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PhoneLoginScreen;
