import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SkeletonLoader: React.FC<Props> = ({ width = '100%', height = 16, borderRadius = 6, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

const ItemCardSkeleton: React.FC = () => (
  <View style={styles.card}>
    <SkeletonLoader height={110} borderRadius={10} style={{ marginBottom: 8 }} />
    <SkeletonLoader width="60%" height={12} style={{ marginBottom: 6 }} />
    <SkeletonLoader width="80%" height={14} style={{ marginBottom: 6 }} />
    <SkeletonLoader width="40%" height={12} />
  </View>
);

export { ItemCardSkeleton };
export default SkeletonLoader;

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray200,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    flex: 1,
  },
});
