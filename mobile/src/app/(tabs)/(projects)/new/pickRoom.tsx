// app/new/pickRoom.tsx
import Image from '@/src/components/Image';
import Colors from '@/src/constants/Colors';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNewProjectStore } from '@/src/lib/state/newProjectStore';
import { RoomType } from '@roomspark/shared';

const STYLE_LABELS: Record<RoomType, string> = {
  [RoomType.MID_CENTURY_MODERN]: 'Mid Century',
  [RoomType.SCANDINAVIAN]: 'Scandinavian',
  [RoomType.INDUSTRIAL]: 'Industrial',
  [RoomType.BOHEMIAN]: 'Bohemian',
  [RoomType.MODERN_FARMHOUSE]: 'Farm House',
  [RoomType.JAPANDI]: 'Japandi',
  [RoomType.TRADITIONAL]: 'Traditional',
  [RoomType.CONTEMPORARY]: 'Contemporary',
  [RoomType.COASTAL]: 'Coastal',
  [RoomType.ECLECTIC]: 'Eclectic',
  [RoomType.TRANSITIONAL]: 'Transitional',
};

export default function PickRoomPage() {
  const router = useRouter();
  const { imageToUpload, style, setRoomType } = useNewProjectStore();

  if (!imageToUpload?.uri) {
    router.replace('/new');
    return null;
  }

  const styleLabel = style ? STYLE_LABELS[style] : '';

  const handleSelectRoom = (room: 'kitchen' | 'living_room') => {
    setRoomType(room);

    router.push({
      pathname: '/(tabs)/(projects)/[id]',
      params: { id: 'newProject' },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageToUpload.uri }} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose a style</Text>
        {styleLabel ? (
          <View style={styles.selectedStylePill}>
            <Text style={styles.selectedStyleText}>{styleLabel}</Text>
          </View>
        ) : (
          <Text style={styles.helperText}>You can go back and pick a style.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose type of room</Text>
        <View style={styles.roomButtons}>
          <TouchableOpacity style={styles.roomButton} onPress={() => handleSelectRoom('kitchen')}>
            <Text style={styles.roomButtonText}>Bedroom</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roomButton}
            onPress={() => handleSelectRoom('living_room')}
          >
            <Text style={styles.roomButtonText}>Living room</Text>
          </TouchableOpacity>
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.text.primary,
  },
  selectedStylePill: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',
  },
  selectedStyleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  helperText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  roomButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roomButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  roomButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
