import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { pickImageFromGallery, imageToBase64 } from '../../utils/imagePicker';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { phoneNumber, login } = useAuth();

  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await pickImageFromGallery();

      if (result?.success && result?.imageUrl) {
        setProfileImage(result.imageUrl);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Unable to pick image');
    }
  };

  const navigateToDashboard = () => {
    router.replace('/(tabs)');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);

      let base64Image: string | undefined;

      if (profileImage) {
        base64Image = await imageToBase64(profileImage);
      }

      // Save profile locally (hackathon mode)
      login({
        id: 'demo-user-id',
        phone: phoneNumber,
        name: name.trim(),
        profile_image: base64Image,
      });

      navigateToDashboard();
    } catch (error) {
      console.error('Profile submit error:', error);

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to create profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (!name.trim()) {
      Alert.alert(
        'Name Required',
        'Please enter your name before continuing.'
      );
      return;
    }

    login({
      id: 'demo-user-id',
      phone: phoneNumber,
      name: name.trim(),
      profile_image: undefined,
    });

    navigateToDashboard();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Let’s personalize your farming experience
          </Text>
        </View>

        {/* Profile Image */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={40} color={COLORS.dark} />
              </View>
            )}

            <View style={styles.cameraIcon}>
              <Ionicons
                name="camera"
                size={18}
                color={COLORS.white}
              />
            </View>
          </TouchableOpacity>

          <Text style={styles.uploadText}>
            Upload Profile Picture (Optional)
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Farmer Name *</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.dark}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
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
                <Text style={styles.primaryButtonText}>Continue</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={COLORS.white}
                />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSkip}
          >
            <Text style={styles.secondaryButtonText}>
              Skip for Now
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          You can update your profile anytime from settings
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    padding: Spacing.md,
  },

  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: Spacing.xs,
  },

  subtitle: {
    fontSize: FontSize.sm,
    color: COLORS.dark,
    textAlign: 'center',
  },

  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
  },

  avatarPlaceholder: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.card,
  },

  uploadText: {
    fontSize: FontSize.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },

  inputSection: {
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: Spacing.sm,
  },

  input: {
    backgroundColor: COLORS.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },

  buttonContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },

  button: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
  },

  secondaryButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: COLORS.white,
  },

  secondaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },

  infoText: {
    fontSize: FontSize.xs,
    color: COLORS.dark,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
});