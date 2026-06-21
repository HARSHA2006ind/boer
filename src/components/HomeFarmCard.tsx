import { memo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, radius, shadows } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_W = SCREEN_WIDTH * 0.6;

interface Props {
  farms: { id: string; name: string; location: string; currentCrop: string; area: string; weatherBadge: string }[];
  onFarmPress: (id: string) => void;
  onAddFarm: () => void;
}

function HomeFarmCard({ farms, onFarmPress, onAddFarm }: Props) {
  if (farms.length === 0) {
    return (
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="leaf-outline" size={16} color="#6B705C" />
            <Text style={styles.title}>My Farms</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onAddFarm} style={styles.addCard} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={32} color="#6B705C" />
          <Text style={styles.addText}>Add Your First Farm</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="leaf-outline" size={16} color="#6B705C" />
          <Text style={styles.title}>My Farms</Text>
        </View>
        <TouchableOpacity onPress={onAddFarm}>
          <Ionicons name="add-circle" size={22} color="#6B705C" />
        </TouchableOpacity>
      </View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_W + spacing.sm}
        decelerationRate="fast"
      >
        {farms.map((farm, i) => {
          const colors: [string, string] = i % 3 === 0 ? ['#6B705C', '#4A4F3E'] : i % 3 === 1 ? ['#A5A58D', '#7A7A6A'] : ['#CB997E', '#A87A6A'];
          return (
            <TouchableOpacity key={farm.id} onPress={() => onFarmPress(farm.id)} activeOpacity={0.95}>
              <Animated.View entering={FadeInDown.duration(400).delay(450 + i * 100)} style={styles.farmCard}>
                <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.farmGradient}>
                  <View style={styles.farmTop}>
                    <View style={styles.weatherBadge}>
                      <Text style={styles.weatherBadgeText}>{farm.weatherBadge}</Text>
                    </View>
                  </View>
                  <View style={styles.farmBottom}>
                    <Text style={styles.farmName}>{farm.name}</Text>
                    <Text style={styles.farmCrop}>{farm.currentCrop}</Text>
                    <Text style={styles.farmArea}>{farm.area}</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>
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
    color: '#1A1A1A',
  },
  scrollContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  farmCard: {
    width: CARD_W,
    height: 160,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.sm,
    ...shadows.md,
  },
  farmGradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  farmTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  weatherBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  weatherBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  farmBottom: {
    gap: 2,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  farmCrop: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  farmArea: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
  },
  addCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E5E0D5',
    borderRadius: radius.lg,
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B705C',
  },
});

export default memo(HomeFarmCard);
