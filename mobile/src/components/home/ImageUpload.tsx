import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImageUploadProps {
  onImageSelected: (uri: string) => void;
  isUploading: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, isUploading }) => {
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // console.log('Processing image...');
        // const resizedImage = await ImageManipulator.manipulateAsync(
        //   result.assets[0].uri,
        //   [{ resize: { width: 1024 } }],
        //   {
        //     format: ImageManipulator.SaveFormat.JPEG,
        //     compress: 0.8,
        //   }
        // );

        // console.log('Image processed:', resizedImage);

        // // Show local preview immediately
        // setLocalImageUri(resizedImage.uri);

        // // Then start the upload process
        // onImageSelected(resizedImage.uri);

        // Show local preview immediately
        setLocalImageUri(result.assets[0].uri);

        // Then start the upload process
        onImageSelected(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Image picker error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.photoButton} disabled={isUploading}>
        <Text style={styles.buttonText}>Take a Photo</Text>
      </TouchableOpacity>

      {localImageUri && <Image source={{ uri: localImageUri }} style={styles.imagePreview} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
});
