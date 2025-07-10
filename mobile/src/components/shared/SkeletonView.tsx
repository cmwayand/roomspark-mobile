import React, { useEffect, useState } from 'react';
import { Animated, View, ViewStyle, DimensionValue } from 'react-native';

interface SkeletonViewProps {
  width: DimensionValue;
  height: number;
  style?: ViewStyle;
  borderRadius?: number;
}

export const SkeletonView: React.FC<SkeletonViewProps> = ({
  width,
  height,
  style,
  borderRadius = 8,
}) => {
  const fadeAnim = useState(new Animated.Value(0.3))[0];

  useEffect(() => {
    const animateOpacity = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => animateOpacity());
    };
    animateOpacity();
  }, [fadeAnim]);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      <View
        style={{
          width,
          height,
          backgroundColor: '#E1E9EE',
          borderRadius,
        }}
      />
    </Animated.View>
  );
};

// Image Skeleton Component
interface ImageSkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  width = '100%',
  height = 300,
  borderRadius = 12,
  style,
}) => (
  <View style={style}>
    <SkeletonView width={width} height={height} borderRadius={borderRadius} />
  </View>
);
