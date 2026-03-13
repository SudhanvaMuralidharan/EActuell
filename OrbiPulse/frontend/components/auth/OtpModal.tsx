import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
import { verifyOtp } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface OtpModalProps {
  visible: boolean;
  phoneNumber: string;
  onVerified: () => void;
  onClose: () => void;
}

export default function OtpModal({
  visible,
  phoneNumber,
  onVerified,
  onClose,
}: OtpModalProps) {
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp(phoneNumber, otpCode);
      
      if (response.success) {
        // Login successful
        login({
          id: response.user?.id || '',
          phone: phoneNumber,
          name: response.user?.name || '',
          profile_image: response.user?.profile_image,
        });
        
        onVerified();
      } else {
        Alert.alert('Verification Failed', response.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to verify OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    // Reset OTP inputs
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    Alert.alert('OTP Resent', 'A new verification code has been sent');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modalContainer} pointerEvents="box-only">
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to {phoneNumber}
            </Text>

            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <Ionicons name="hourglass" size={20} color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Verify OTP</Text>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            {/* Resend Link */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: COLORS.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  otpInput: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.background,
    borderRadius: Radius.md,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: FontSize.sm,
    color: COLORS.dark,
  },
  resendLink: {
    fontSize: FontSize.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
