import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Utility for picking images from the device library
 * Returns base64 representation of the selected image
 */
export const pickProfileImage = async (): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        return `data:image/jpeg;base64,${asset.base64}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image');
    return null;
  }
};
