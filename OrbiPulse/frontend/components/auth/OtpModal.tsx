import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface OtpModalProps {
  isVisible: boolean;
  phone: string;
  onVerify: (otp: string) => Promise<void>;
  onClose: () => void;
  onResend: () => Promise<void>;
}

const OtpModal: React.FC<OtpModalProps> = ({
  isVisible,
  phone,
  onVerify,
  onClose,
  onResend,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(30);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: any;
    if (isVisible && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVisible, timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedOtp.length, 5)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      await onVerify(otpCode);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer === 0) {
      setTimer(30);
      try {
        await onResend();
      } catch (err: any) {
        setError(err.message || 'Failed to resend OTP');
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="shield-check-outline" size={40} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to {phone}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputActive : null,
                  error ? styles.otpInputError : null
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
                editable={!isVerifying}
              />
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {isVerifying ? (
            <ActivityIndicator size="large" color={Colors.accent} style={styles.loader} />
          ) : (
            <View style={styles.footer}>
              <Text style={styles.timerText}>
                {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive code?"}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    padding: Spacing.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.accent + '15',
    borderRadius: 50,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
  },
  otpInputActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surface,
  },
  otpInputError: {
    borderColor: Colors.red,
  },
  errorText: {
    color: Colors.red,
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  loader: {
    marginVertical: Spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  resendText: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  resendDisabled: {
    color: Colors.textMuted,
  },
});

export default OtpModal;
