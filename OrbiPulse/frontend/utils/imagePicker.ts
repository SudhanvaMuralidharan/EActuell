import * as ImagePicker from 'expo-image-picker';

export interface ImagePickerResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Launch image picker to select from gallery
 */
export async function pickImageFromGallery(): Promise<ImagePickerResult> {
  try {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      return {
        success: false,
        error: 'Permission to access gallery is required',
      };
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square for profile picture
      quality: 0.8,
    });

    if (result.canceled) {
      return {
        success: false,
        error: 'User cancelled image selection',
      };
    }

    // Get the image URI
    const imageUri = result.assets[0]?.uri;
    
    if (!imageUri) {
      return {
        success: false,
        error: 'No image selected',
      };
    }

    return {
      success: true,
      imageUrl: imageUri,
    };
  } catch (error) {
    console.error('Image Picker Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Convert image URI to base64 for upload
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Base64 Conversion Error:', error);
    throw error;
  }
}
