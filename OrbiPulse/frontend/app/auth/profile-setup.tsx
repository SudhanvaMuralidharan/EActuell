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
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { pickProfileImage } from '../../utils/imagePicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const ProfileSetupScreen = () => {
  const { user, updateUserProfile, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    const result = await pickProfileImage();
    if (result) {
      setProfileImage(result);
    }
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }

    try {
      await updateUserProfile(name, profileImage || undefined);
      router.replace('/(tabs)'); 
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Failed to update profile.');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Setup Profile</Text>
          <Text style={styles.subtitle}>Help us personalize your OrbiPulse experience</Text>
        </View>

        <View style={styles.imageContainer}>
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={handlePickImage}
            disabled={isLoading}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="camera" size={40} color={Colors.textMuted} />
              </View>
            )}
            <View style={styles.addIcon}>
              <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageLabel}>Add Profile Picture</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.phone || ''}
              editable={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !name.trim() && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.buttonText}>Continue</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    padding: Spacing.xl,
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.xxl,
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
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.accent,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  imageLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  input: {
    height: 55,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: Colors.bg,
    color: Colors.textMuted,
  },
  button: {
    backgroundColor: Colors.accent,
    height: 55,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
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
  skipButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textDecorationLine: 'underline',
  },
});

export default ProfileSetupScreen;
