import {
  StyleProp,
  ImageStyle,
  View,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image as ExpoImage, ImageProps as ExpoImageProps, ImageErrorEventData } from 'expo-image';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export interface ImageProps extends Omit<ExpoImageProps, 'style'> {
  style?: StyleProp<ImageStyle>;
  onError?: (error: ImageErrorEventData) => void;
  showBorder?: boolean;
  aspectRatio?: number;
  isLoading?: boolean;
}

export default function Image({
  style,
  onError,
  showBorder = true,
  aspectRatio = 16 / 9,
  placeholder = 'LGIX?W~C%Mxv4T4mx^D*_Ns.9E%M', // Safe default
  isLoading = false,
  ...props
}: ImageProps) {
  return (
    <View style={[styles.container, { aspectRatio }, showBorder && styles.bordered]}>
      <ExpoImage
        style={[styles.image, style]}
        contentFit="cover"
        onError={error => {
          console.error('Image loading error:', error);
          onError?.(error);
        }}
        transition={200}
        placeholder={placeholder}
        {...props}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.background} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
