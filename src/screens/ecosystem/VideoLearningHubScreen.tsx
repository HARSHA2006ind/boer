import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

const VIDEOS = [
  { id: 'v1', title: 'Rice Transplanting Techniques', duration: '15 min', category: 'Rice Farming', icon: '🌾', thumbnailBg: '#E8F5E9' },
  { id: 'v2', title: 'Organic Compost Making at Home', duration: '20 min', category: 'Organic Farming', icon: '🌿', thumbnailBg: '#F0FDF4' },
  { id: 'v3', title: 'Tractor Operation Safety Tips', duration: '12 min', category: 'Machinery Usage', icon: '🚜', thumbnailBg: '#F5F5DC' },
  { id: 'v4', title: 'Drip Irrigation Installation Guide', duration: '18 min', category: 'Irrigation Techniques', icon: '💧', thumbnailBg: '#DBEAFE' },
  { id: 'v5', title: 'Natural Pest Control Methods', duration: '14 min', category: 'Organic Farming', icon: '🐛', thumbnailBg: '#FEF3C7' },
  { id: 'v6', title: 'Tomato Farming for Profit', duration: '22 min', category: 'Vegetable Farming', icon: '🍅', thumbnailBg: '#FEE2E2' },
  { id: 'v7', title: 'Mango Cultivation Guide', duration: '25 min', category: 'Fruit Farming', icon: '🥭', thumbnailBg: '#FFF7ED' },
  { id: 'v8', title: 'Soil Testing at Home', duration: '10 min', category: 'Rice Farming', icon: '🌱', thumbnailBg: '#F5F3FF' },
];

const CATEGORIES = ['All', 'Rice Farming', 'Vegetable Farming', 'Fruit Farming', 'Organic Farming', 'Irrigation Techniques', 'Machinery Usage'];

interface Props { navigation: any }

export default function VideoLearningHubScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeCat, setActiveCat] = useState('All');
  const filtered = activeCat === 'All' ? VIDEOS : VIDEOS.filter(v => v.category === activeCat);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map(cat => {
          const active = activeCat === cat;
          return (
            <TouchableOpacity key={cat} style={[styles.catChip, active && styles.catActive]} onPress={() => setActiveCat(cat)}>
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.grid}>
        {filtered.map(v => (
          <TouchableOpacity key={v.id} style={styles.videoCard} activeOpacity={0.8}>
            <View style={[styles.thumb, { backgroundColor: v.thumbnailBg }]}>
              <Text style={styles.thumbIcon}>{v.icon}</Text>
              <View style={styles.playOverlay}>
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.8)" />
              </View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{v.duration}</Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={2}>{v.title}</Text>
            <Text style={styles.category}>{v.category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  catScroll: { marginBottom: spacing.md },
  catChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  catLabelActive: { color: '#FFFFFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  videoCard: { width: (width - spacing.md * 2 - spacing.md) / 2 },
  thumb: { height: 110, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm, overflow: 'hidden' },
  thumbIcon: { fontSize: 36 },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  durationBadge: { position: 'absolute', bottom: spacing.xs, right: spacing.xs, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  durationText: { fontSize: 9, color: '#FFFFFF', fontWeight: '600' },
  title: { fontSize: 13, fontWeight: '700', color: colors.text },
  category: { fontSize: 10, color: colors.textLight, fontWeight: '600', marginTop: 2 },
});
