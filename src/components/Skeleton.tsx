import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Props { width?: number | string; height?: number; borderRadius?: number; style?: any; }

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[{ width, height, borderRadius, backgroundColor: '#E5E0D5', opacity }, style]} />;
}

export function CardSkeleton() {
  return (
    <View style={s.card}>
      <Skeleton height={18} width="60%" />
      <View style={{ height: 8 }} />
      <Skeleton height={14} width="90%" />
      <View style={{ height: 4 }} />
      <Skeleton height={14} width="75%" />
      <View style={{ height: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={{ padding: 16 }}>
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12 },
});
