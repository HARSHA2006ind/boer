import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { getCropList, getCropTrends, MARKET_SOURCE, MARKET_LAST_UPDATED } from '../services/marketService';

const { width } = Dimensions.get('window');

// Re-export since we need it
const ALL_CROPS = [
  { crop: 'Rice', price: '₹2,420', priceNum: 2420, change: '+1.2', changeNum: 1.2, market: 'Sangareddy', district: 'Sangareddy', state: 'Telangana', trend: 'up' as const },
  { crop: 'Wheat', price: '₹2,150', priceNum: 2150, change: '-0.8', changeNum: -0.8, market: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', trend: 'down' as const },
  { crop: 'Cotton', price: '₹5,680', priceNum: 5680, change: '+2.5', changeNum: 2.5, market: 'Adilabad', district: 'Adilabad', state: 'Telangana', trend: 'up' as const },
  { crop: 'Groundnut', price: '₹4,120', priceNum: 4120, change: '+3.2', changeNum: 3.2, market: 'Karimnagar', district: 'Karimnagar', state: 'Telangana', trend: 'up' as const },
  { crop: 'Tomato', price: '₹1,280', priceNum: 1280, change: '-2.1', changeNum: -2.1, market: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', trend: 'down' as const },
  { crop: 'Onion', price: '₹1,650', priceNum: 1650, change: '+0.9', changeNum: 0.9, market: 'Mahbubnagar', district: 'Mahbubnagar', state: 'Telangana', trend: 'up' as const },
  { crop: 'Chilli', price: '₹3,850', priceNum: 3850, change: '-3.5', changeNum: -3.5, market: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', trend: 'down' as const },
  { crop: 'Mango', price: '₹5,200', priceNum: 5200, change: '+4.2', changeNum: 4.2, market: 'Nalgonda', district: 'Nalgonda', state: 'Telangana', trend: 'up' as const },
  { crop: 'Soybean', price: '₹3,680', priceNum: 3680, change: '+0.7', changeNum: 0.7, market: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', trend: 'up' as const },
  { crop: 'Coconut', price: '₹1,850', priceNum: 1850, change: '+2.1', changeNum: 2.1, market: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', trend: 'up' as const },
];

const CHART_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

interface RegionInsight {
  state: string;
  topCrop: string;
  avgPrice: number;
  trend: 'up' | 'down';
  crops: number;
}

const REGION_INSIGHTS: RegionInsight[] = [
  { state: 'Telangana', topCrop: 'Groundnut', avgPrice: 3240, trend: 'up', crops: 9 },
  { state: 'Andhra Pradesh', topCrop: 'Chilli', avgPrice: 3850, trend: 'down', crops: 2 },
  { state: 'Karnataka', topCrop: 'Sunflower', avgPrice: 3120, trend: 'up', crops: 3 },
  { state: 'Maharashtra', topCrop: 'Soybean', avgPrice: 3680, trend: 'up', crops: 2 },
  { state: 'Tamil Nadu', topCrop: 'Coconut', avgPrice: 1850, trend: 'up', crops: 1 },
];

interface Props { navigation: any }

export default function MarketIntelligenceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [cropSearch, setCropSearch] = useState('');
  const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const cropList = getCropList();
  const cropTrends = getCropTrends(selectedCrop);
  const trend = cropTrends[trendPeriod];
  const maxPrice = Math.max(...trend.map(t => t.price), 1);

  const filteredCrops = useMemo(() => {
    if (!cropSearch.trim()) return cropList;
    return cropList.filter(c => c.toLowerCase().includes(cropSearch.toLowerCase()));
  }, [cropSearch, cropList]);

  const cropData = ALL_CROPS.find(c => c.crop === selectedCrop);
  const avgPrice = Math.round(ALL_CROPS.reduce((s, c) => s + c.priceNum, 0) / ALL_CROPS.length);

  const gainers = [...ALL_CROPS].filter(c => c.trend === 'up').sort((a, b) => b.changeNum - a.changeNum).slice(0, 3);
  const losers = [...ALL_CROPS].filter(c => c.trend === 'down').sort((a, b) => a.changeNum - b.changeNum).slice(0, 3);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Market Intelligence</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Source banner */}
        <View style={styles.sourceBanner}>
          <Ionicons name="server-outline" size={12} color={colors.textLight} />
          <Text style={styles.sourceText}>Source: {MARKET_SOURCE}</Text>
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textLight, marginHorizontal: 4 }} />
          <Ionicons name="time-outline" size={12} color={colors.textLight} />
          <Text style={styles.sourceText}>{MARKET_LAST_UPDATED}</Text>
        </View>

        {/* Crop search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Crop..."
            placeholderTextColor={colors.textLight}
            value={cropSearch}
            onChangeText={setCropSearch}
          />
          {cropSearch.length > 0 && (
            <TouchableOpacity onPress={() => setCropSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Crop selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropRow}>
          {(cropSearch.trim() ? filteredCrops : cropList).map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => setSelectedCrop(c)}
              style={[styles.cropChip, selectedCrop === c && styles.cropChipActive]}
            >
              <Text style={[styles.cropChipText, selectedCrop === c && styles.cropChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary tile */}
        <View style={styles.summaryRow}>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>{cropData?.price || '—'}</Text>
            <Text style={styles.tileLabel}>Current Price</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>{cropData?.change || '—'}%</Text>
            <Text style={styles.tileLabel}>Daily Change</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileValue}>{cropData?.market || '—'}</Text>
            <Text style={styles.tileLabel}>Top Market</Text>
          </View>
        </View>

        {/* Trend chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{selectedCrop} — Price Trend</Text>
            <View style={styles.periodRow}>
              {(['daily', 'weekly', 'monthly'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setTrendPeriod(p)}
                  style={[styles.periodChip, trendPeriod === p && styles.periodChipActive]}
                >
                  <Text style={[styles.periodText, trendPeriod === p && styles.periodTextActive]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.chartRow}>
            {trend.map((m, i) => (
              <View key={`${m.label}-${i}`} style={styles.chartBarWrap}>
                <Text style={styles.chartValue}>₹{m.price}</Text>
                <View style={[styles.chartBar, { height: Math.max(12, (m.price / maxPrice) * 100) }]} />
                <Text style={styles.chartLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Gainers & Losers */}
        <View style={styles.trendsRow}>
          <View style={styles.trendCol}>
            <Text style={styles.trendColTitle}>
              <Ionicons name="trending-up" size={14} color={colors.success} /> Top Gainers
            </Text>
            {gainers.map(c => (
              <View key={c.crop} style={styles.trendItem}>
                <Text style={styles.trendItemCrop}>{c.crop}</Text>
                <Text style={[styles.trendItemChange, { color: colors.success }]}>+{c.changeNum}%</Text>
              </View>
            ))}
          </View>
          <View style={styles.trendDivider} />
          <View style={styles.trendCol}>
            <Text style={styles.trendColTitle}>
              <Ionicons name="trending-down" size={14} color={colors.danger} /> Top Losers
            </Text>
            {losers.map(c => (
              <View key={c.crop} style={styles.trendItem}>
                <Text style={styles.trendItemCrop}>{c.crop}</Text>
                <Text style={[styles.trendItemChange, { color: colors.danger }]}>{c.changeNum}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Regional Insights */}
        <Text style={styles.sectionTitle}>Regional Insights</Text>
        {REGION_INSIGHTS.map(r => (
          <View key={r.state} style={styles.regionCard}>
            <View style={styles.regionTop}>
              <Text style={styles.regionState}>{r.state}</Text>
              <View style={[styles.regionBadge, { backgroundColor: r.trend === 'up' ? '#ECFDF5' : '#FEF2F2' }]}>
                <Ionicons name={r.trend === 'up' ? 'arrow-up' : 'arrow-down'} size={12} color={r.trend === 'up' ? colors.success : colors.danger} />
                <Text style={[styles.regionBadgeText, { color: r.trend === 'up' ? colors.success : colors.danger }]}>
                  {r.trend === 'up' ? 'Bullish' : 'Bearish'}
                </Text>
              </View>
            </View>
            <View style={styles.regionStats}>
              <Text style={styles.regionStat}>Top: <Text style={styles.regionStatVal}>{r.topCrop}</Text></Text>
              <Text style={styles.regionStat}>Avg: <Text style={styles.regionStatVal}>₹{r.avgPrice.toLocaleString('en-IN')}</Text></Text>
              <Text style={styles.regionStat}>{r.crops} crops tracked</Text>
            </View>
          </View>
        ))}

        {/* Analytics summary */}
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Market Analytics</Text>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{avgPrice.toLocaleString('en-IN')}</Text>
              <Text style={styles.analyticsLabel}>Avg Market Price</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{ALL_CROPS.length}</Text>
              <Text style={styles.analyticsLabel}>Total Crops</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{ALL_CROPS.filter(c => c.trend === 'up').length}</Text>
              <Text style={styles.analyticsLabel}>Trending Up</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8E7E0', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },

  sourceBanner: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm, flexWrap: 'wrap' },
  sourceText: { fontSize: 10, color: colors.textLight, fontWeight: '500' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, paddingVertical: spacing.xs },

  cropRow: { gap: spacing.sm, marginBottom: spacing.md },
  cropChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.pill,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm,
  },
  cropChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cropChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  cropChipTextActive: { color: '#FFFFFF' },

  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', gap: 2 },
  tileValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  tileLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },

  chartCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  periodRow: { flexDirection: 'row', gap: 4 },
  periodChip: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  periodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { fontSize: 9, fontWeight: '600', color: colors.textSecondary },
  periodTextActive: { color: '#FFFFFF' },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  chartBarWrap: { flex: 1, alignItems: 'center' },
  chartValue: { fontSize: 8, color: colors.textLight, fontWeight: '600', marginBottom: 4 },
  chartBar: { width: 28, backgroundColor: colors.primary, borderRadius: 4, minHeight: 10 },
  chartLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginTop: 4 },

  trendsRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg },
  trendCol: { flex: 1, gap: spacing.sm },
  trendDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  trendColTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  trendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendItemCrop: { fontSize: 13, fontWeight: '600', color: colors.text },
  trendItemChange: { fontSize: 13, fontWeight: '800' },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  regionCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  regionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  regionState: { fontSize: 15, fontWeight: '700', color: colors.text },
  regionBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  regionBadgeText: { fontSize: 11, fontWeight: '700' },
  regionStats: { flexDirection: 'row', gap: spacing.md },
  regionStat: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  regionStatVal: { fontWeight: '700', color: colors.text },

  analyticsCard: { backgroundColor: colors.primaryDark, borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.sm },
  analyticsTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: spacing.md },
  analyticsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  analyticsItem: { alignItems: 'center', gap: 2 },
  analyticsValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  analyticsLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
});
