import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';
import { useLanguage } from '../../i18n/LanguageContext';

const { width } = Dimensions.get('window');

const ALL_CROPS = [
  { name: 'Rice', icon: '🌾', price: 2500, unit: 'Quintal', change: 3.2, trend: 'up' as const },
  { name: 'Wheat', icon: '🌾', price: 2150, unit: 'Quintal', change: -0.8, trend: 'down' as const },
  { name: 'Tomato', icon: '🍅', price: 28, unit: 'Kg', change: -2.1, trend: 'down' as const },
  { name: 'Onion', icon: '🧅', price: 35, unit: 'Kg', change: 1.5, trend: 'up' as const },
  { name: 'Potato', icon: '🥔', price: 22, unit: 'Kg', change: 0.5, trend: 'up' as const },
  { name: 'Cotton', icon: '🛡️', price: 5680, unit: 'Quintal', change: 2.5, trend: 'up' as const },
  { name: 'Groundnut', icon: '🥜', price: 4120, unit: 'Quintal', change: 3.2, trend: 'up' as const },
  { name: 'Maize', icon: '🌽', price: 1850, unit: 'Quintal', change: -1.5, trend: 'down' as const },
  { name: 'Sugarcane', icon: '🎋', price: 340, unit: 'Ton', change: 0.5, trend: 'up' as const },
  { name: 'Banana', icon: '🍌', price: 2100, unit: 'Dozen', change: 0.6, trend: 'up' as const },
  { name: 'Coconut', icon: '🥥', price: 25, unit: 'Piece', change: 2.1, trend: 'up' as const },
  { name: 'Chilli', icon: '🌶️', price: 3850, unit: 'Quintal', change: -3.5, trend: 'down' as const },
  { name: 'Turmeric', icon: '🟡', price: 6200, unit: 'Quintal', change: 1.8, trend: 'up' as const },
];

interface Props { navigation: any }

export default function MarketPricesScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'high' | 'low'>('name');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let crops = [...ALL_CROPS];
    if (search) crops = crops.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'high') crops.sort((a, b) => b.change - a.change);
    else if (sortBy === 'low') crops.sort((a, b) => a.change - b.change);
    else crops.sort((a, b) => a.name.localeCompare(b.name));
    return crops;
  }, [search, sortBy]);

  const toggleFav = (name: string) => {
    setFavorites(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <TextInput style={styles.searchInput} placeholder="Search crops..." placeholderTextColor={colors.textLight}
          value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.sortRow}>
        <TouchableOpacity style={[styles.sortBtn, sortBy === 'name' && styles.sortActive]} onPress={() => setSortBy('name')}>
          <Text style={[styles.sortText, sortBy === 'name' && styles.sortTextActive]}>A-Z</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sortBtn, sortBy === 'high' && styles.sortActive]} onPress={() => setSortBy('high')}>
          <Ionicons name="trending-up" size={14} color={sortBy === 'high' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.sortText, sortBy === 'high' && styles.sortTextActive]}>Highest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sortBtn, sortBy === 'low' && styles.sortActive]} onPress={() => setSortBy('low')}>
          <Ionicons name="trending-down" size={14} color={sortBy === 'low' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.sortText, sortBy === 'low' && styles.sortTextActive]}>Lowest</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map((crop, i) => {
          const isUp = crop.trend === 'up';
          const isFav = favorites.includes(crop.name);
          return (
            <TouchableOpacity key={i} style={styles.cropCard} activeOpacity={0.7}
              onPress={() => navigation.navigate('CropPriceDetail', { cropName: crop.name })}>
              <View style={styles.cropLeft}>
                <Text style={styles.cropIcon}>{crop.icon}</Text>
                <View>
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <Text style={styles.cropUnit}>per {crop.unit}</Text>
                </View>
              </View>
              <View style={styles.cropRight}>
                <Text style={styles.cropPrice}>₹{crop.price.toLocaleString('en-IN')}</Text>
                <View style={[styles.changeBadge, isUp ? styles.upBadge : styles.downBadge]}>
                  <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={12} color={isUp ? colors.success : colors.danger} />
                  <Text style={[styles.changeText, isUp ? { color: colors.success } : { color: colors.danger }]}>
                    {isUp ? '+' : ''}{crop.change}%
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.favBtn} onPress={() => toggleFav(crop.name)}>
                <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={18} color={isFav ? colors.danger : colors.textLight} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  headerRow: { marginBottom: spacing.sm },
  searchInput: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border },
  sortRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  sortActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  sortTextActive: { color: '#FFFFFF' },
  list: { paddingBottom: spacing.xxl },
  cropCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  cropLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md },
  cropIcon: { fontSize: 32 },
  cropName: { fontSize: 16, fontWeight: '700', color: colors.text },
  cropUnit: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  cropRight: { alignItems: 'flex-end', marginRight: spacing.sm },
  cropPrice: { fontSize: 17, fontWeight: '800', color: colors.text },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2, paddingHorizontal: spacing.sm, paddingVertical: 1, borderRadius: radius.pill },
  upBadge: { backgroundColor: '#E8F5E9' },
  downBadge: { backgroundColor: '#FEE2E2' },
  changeText: { fontSize: 11, fontWeight: '700' },
  favBtn: { padding: spacing.xs },
});
