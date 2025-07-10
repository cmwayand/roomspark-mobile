import Colors from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useNewProjectStore } from '@/src/lib/state/newProjectStore';

export default function NewProjectPage() {
  const router = useRouter();
  const { reset, setImageToUpload } = useNewProjectStore();

  const saveImageToCache = async (uri: string): Promise<string> => {
    const filename = uri.split('/').pop() || 'image.jpg';
    const cacheDir = FileSystem.cacheDirectory;
    const newPath = `${cacheDir}${filename}`;

    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });

    return newPath;
  };

  const handleImageCapture = async (imageUri: string) => {
    try {
      const cachedPath = await saveImageToCache(imageUri);

      // Reset the new project state because the rest of the state depends on the image taken
      reset();
      setImageToUpload({ uri: cachedPath });

      router.push({
        pathname: '/new/pickStyle',
      });
    } catch (error) {
      console.error('Error:', error);
      // You might want to show an error message to the user here
    } finally {
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageCapture(result.assets[0].uri);
    }
  };

  const handlePickPhotoFromFiles = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageCapture(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Ionicons name="camera" size={32} color={Colors.primary} />
          <Text style={styles.buttonText}>{'Take Photo'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handlePickPhotoFromFiles}>
          <Ionicons name="images" size={32} color={Colors.primary} />
          <Text style={styles.buttonText}>{'Upload Photo'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
});
