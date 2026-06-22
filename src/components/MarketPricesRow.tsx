import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, shadows } from '../theme';

interface MarketCrop {
  name: string;
  icon: string;
  price: number;
  unit: string;
  change: number;
  trend: 'up' | 'down';
}

interface Props {
  crops: MarketCrop[];
  onViewAll: () => void;
  onCropPress: (crop: MarketCrop) => void;
}

function MarketPricesRow({ crops, onViewAll, onCropPress }: Props) {
  return (
    <Animated.View entering={FadeInUp.duration(500).delay(500)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trending-up-outline" size={16} color="#14B8A6" />
          <Text style={styles.title}>Market Prices</Text>
        </View>
        {crops.length > 0 && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      {crops.length > 0 ? (
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={130}
          decelerationRate="fast"
        >
          {crops.map((crop, i) => (
            <TouchableOpacity key={crop.name} onPress={() => onCropPress(crop)} activeOpacity={0.8}>
              <Animated.View entering={FadeInUp.duration(400).delay(550 + i * 80)} style={styles.cropCard}>
                <Text style={styles.cropIcon}>{crop.icon}</Text>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={styles.cropPrice}>₹{crop.price}</Text>
                <View style={[styles.trendBadge, { backgroundColor: crop.trend === 'up' ? '#ECFDF5' : '#FEF2F2' }]}>
                  <Ionicons name={crop.trend === 'up' ? 'arrow-up' : 'arrow-down'} size={10} color={crop.trend === 'up' ? '#22C55E' : '#EF4444'} />
                  <Text style={[styles.trendText, { color: crop.trend === 'up' ? '#22C55E' : '#EF4444' }]}>
                    {Math.abs(crop.change)}%
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="trending-up-outline" size={24} color="#CBD5E1" />
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14B8A6',
  },
  scrollContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  cropCard: {
    width: 110,
    backgroundColor: '#F6F7FB',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 3,
  },
  cropIcon: {
    fontSize: 24,
  },
  cropName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  cropPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14B8A6',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  emptyText: { fontSize: 13, color: '#CBD5E1', fontWeight: '600' },
});

export default memo(MarketPricesRow);
