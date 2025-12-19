import Image from '@/src/components/Image';
import Colors from '@/src/constants/Colors';
import { useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNewProjectStore } from '@/src/lib/state/newProjectStore';
import { RoomType } from '@roomspark/shared';

const STYLES = [
  { id: RoomType.MID_CENTURY_MODERN, name: 'Mid-Century Modern' },
  { id: RoomType.SCANDINAVIAN, name: 'Scandinavian' },
  { id: RoomType.INDUSTRIAL, name: 'Industrial' },
  { id: RoomType.BOHEMIAN, name: 'Bohemian' },
  { id: RoomType.MODERN_FARMHOUSE, name: 'Modern Farmhouse' },
  { id: RoomType.JAPANDI, name: 'Japandi' },
  { id: RoomType.TRADITIONAL, name: 'Traditional' },
  { id: RoomType.CONTEMPORARY, name: 'Contemporary' },
  { id: RoomType.COASTAL, name: 'Coastal' },
  { id: RoomType.ECLECTIC, name: 'Eclectic' },
  { id: RoomType.TRANSITIONAL, name: 'Transitional' },
];

export default function PickStylePage() {
  const router = useRouter();
  const { setStyle, imageToUpload } = useNewProjectStore();

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageToUpload.uri }} />
      <View style={styles.stylesContainer}>
        <Text style={styles.title}>Choose a Style</Text>
        <View style={styles.styleButtons}>
          {STYLES.map(style => (
            <TouchableOpacity
              key={style.id}
              style={styles.styleButton}
              onPress={() => {
                console.log('style: ', style);
                setStyle(style.id);
                router.push('/new/pickRoom');
              }}
            >
              <Text style={styles.styleButtonText}>{style.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  stylesContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text.primary,
  },
  styleButtons: {
    gap: 12,
  },
  styleButton: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  styleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
