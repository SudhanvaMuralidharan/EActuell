import React, { useState, useRef, useEffect } from 'react';
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
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
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

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [visible]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next box automatically
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');

    // Hackathon OTP validation
    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);

    // Fake delay for UX
    setTimeout(() => {
      login({
        id: 'demo-user-id',
        phone: phoneNumber,
        name: '',
        profile_image: undefined,
      });

      setLoading(false);

      onVerified();
    }, 600);
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    Alert.alert('OTP Resent', 'A new verification code has been sent.');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              
              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={22} color={COLORS.dark} />
              </TouchableOpacity>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="shield-checkmark"
                  size={58}
                  color={COLORS.primary}
                />
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
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(value) =>
                      handleOtpChange(value, index)
                    }
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
                  <Ionicons
                    name="hourglass"
                    size={20}
                    color={COLORS.white}
                  />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Verify OTP</Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.white}
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* Resend */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn't receive the code?
                </Text>

                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}> Resend</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '85%',
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
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
  },

  subtitle: {
    fontSize: FontSize.sm,
    color: COLORS.dark,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },

  otpInput: {
    width: 45,
    height: 50,
    backgroundColor: COLORS.background,
    borderRadius: Radius.md,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    color: COLORS.text,
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