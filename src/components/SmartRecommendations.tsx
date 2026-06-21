import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, shadows } from '../theme';

export interface Recommendation {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  action: string;
  gradient: [string, string];
  iconColor: string;
}

interface Props {
  recommendations: Recommendation[];
  onPress: (id: string) => void;
}

function SmartRecommendations({ recommendations = [], onPress }: Props) {
  return (
    <Animated.View entering={FadeInUp.duration(500).delay(150)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bulb-outline" size={16} color="#2F5D50" />
          <Text style={styles.title}>Smart Recommendations</Text>
        </View>
      </View>
      <View style={styles.grid}>
        {recommendations.length > 0 ? recommendations.slice(0, 4).map((rec, i) => (
          <Animated.View
            key={rec.id}
            entering={FadeInUp.duration(400).delay(200 + i * 80)}
            style={[styles.card, { backgroundColor: rec.gradient[0] }]}
          >
            <TouchableOpacity onPress={() => onPress(rec.id)} activeOpacity={0.8} style={styles.cardTouch}>
              <View style={[styles.cardIconWrap, { backgroundColor: rec.iconColor + '18' }]}>
                <Ionicons name={rec.icon as any} size={20} color={rec.iconColor} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{rec.title}</Text>
              <Text style={styles.cardSub} numberOfLines={2}>{rec.subtitle}</Text>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: rec.iconColor }]}>{rec.action}</Text>
                <Ionicons name="arrow-forward" size={12} color={rec.iconColor} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )) : (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={28} color="#D1D5DB" />
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    width: '48%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  cardTouch: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },
  cardSub: { fontSize: 10, color: '#6B7280', lineHeight: 14 },
  cardAction: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  cardActionText: { fontSize: 10, fontWeight: '700' },
  emptyState: { width: '100%', alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  emptyText: { fontSize: 13, color: '#D1D5DB', fontWeight: '600' },
});

export default memo(SmartRecommendations);
