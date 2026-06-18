import { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { colors, radius, spacing, shadows } from '../theme';

interface Props {
  name: string;
  village: string;
  landArea?: string;
  soilType?: string;
  currentCrop?: string;
  weatherStatus?: string;
  aiActive?: boolean;
  onPress: () => void;
}

export default function FarmCard({ name, village, currentCrop, landArea, weatherStatus, aiActive, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 8 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }).start()}
    >
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        <View style={styles.topBar}>
          <View style={styles.weatherBadge}>
            <Text style={styles.weatherText}>{weatherStatus || '☀️'}</Text>
          </View>
          {aiActive && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiText}>AI</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.village} numberOfLines={1}>{village}</Text>
          <View style={styles.bottomRow}>
            {currentCrop && (
              <View style={styles.cropRow}>
                <Text style={styles.cropEmoji}>🌾</Text>
                <Text style={styles.cropText} numberOfLines={1}>{currentCrop}</Text>
              </View>
            )}
            {landArea && <Text style={styles.area}>{landArea}</Text>}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, overflow: 'hidden', height: 120, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.md },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.sm + 2, paddingTop: spacing.xs + 2 },
  weatherBadge: { backgroundColor: '#F5F0E8', borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 1 },
  weatherText: { fontSize: 14 },
  aiBadge: { backgroundColor: colors.primaryDark, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  aiText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  info: { flex: 1, paddingHorizontal: spacing.sm + 2, justifyContent: 'flex-end', paddingBottom: spacing.sm + 2 },
  name: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 1 },
  village: { fontSize: 11, color: colors.textSecondary, fontWeight: '500', marginBottom: spacing.xs + 2 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cropRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  cropEmoji: { fontSize: 10 },
  cropText: { fontSize: 11, color: colors.primaryDark, fontWeight: '700' },
  area: { fontSize: 10, color: colors.textLight, fontWeight: '600' },
});
