import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, Spacing, Radius, FontSize } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { pickImageFromGallery, imageToBase64 } from '../../utils/imagePicker';

export default function ProfileScreen() {
  const router = useRouter();
  const { farmer, login } = useAuth();
  
  // Initialize with current user data
  const [name, setName] = useState(farmer?.name || '');
  const [phone, setPhone] = useState(farmer?.phone || '');
  const [profileImage, setProfileImage] = useState<string | undefined>(farmer?.profile_image);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await pickImageFromGallery();
      
      if (result.success && result.imageUrl) {
        setProfileImage(result.imageUrl);
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Unable to pick image');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);

      // Convert image to base64 if changed
      let base64Image: string | undefined;
      if (profileImage && !profileImage.startsWith('data:')) {
        base64Image = await imageToBase64(profileImage);
      } else if (profileImage) {
        base64Image = profileImage;
      }

      // Update profile in auth context
      login({
        id: farmer?.id || 'demo-user-id',
        phone: phone.trim(),
        name: name.trim(),
        profile_image: base64Image,
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Content */}
        <View style={styles.card}>
          
          {/* Profile Picture Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={40} color={COLORS.dark} />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handlePickImage} style={styles.cameraButton}>
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </View>
            </TouchableOpacity>

            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.dark}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phoneCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter phone number"
                placeholderTextColor={COLORS.dark}
                value={phone.replace('+91', '')}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, '');
                  setPhone(`+91${digits}`);
                }}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>

          {/* Info Text */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color={COLORS.secondary} />
            <Text style={styles.infoText}>
              Your name and photo are visible on the dashboard profile menu
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Ionicons name="hourglass" size={20} color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save Changes</Text>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 10,
    right: '38%',
  },
  cameraIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.card,
  },
  avatarHint: {
    fontSize: FontSize.sm,
    color: COLORS.dark,
    marginTop: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneCode: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: Spacing.xs,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: COLORS.dark,
    lineHeight: 18,
  },
  saveButton: {
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
  saveButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});
