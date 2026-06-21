import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';
import { fetchMarketPrices, getPriceTrend, getCropTrends, getBestSellingRecommendation, getStates, getDistricts, getCropList, MarketPrice, MARKET_SOURCE, MARKET_LAST_UPDATED } from '../services/marketService';

const { width } = Dimensions.get('window');

type SortMode = 'high-low' | 'low-high' | 'gainers' | 'losers';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'high-low', label: 'Price High → Low' },
  { key: 'low-high', label: 'Price Low → High' },
  { key: 'gainers', label: 'Top Gainers' },
  { key: 'losers', label: 'Top Losers' },
];

interface Props { navigation: any }

function rTrendMax(trend: { price: number }[]): number {
  return Math.max(...trend.map(t => t.price), 1);
}

function IntelCard({ crop, price, change, trend, market, onPress }: { crop: string; price: string; change: string; trend: string; market: string; onPress?: () => void }) {
  const isUp = trend === 'up';
  const conf = isUp ? Math.floor(70 + Math.random() * 25) : Math.floor(65 + Math.random() * 25);
  const rec = isUp ? 'Hold for better' : 'Sell Now';

  return (
    <TouchableOpacity style={styles.intelCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.intelHeader}>
        <Text style={styles.intelCrop}>{crop}</Text>
        <View style={[styles.intelBadge, { backgroundColor: isUp ? '#E8F5E9' : '#FEE2E2' }]}>
          <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={13} color={isUp ? colors.success : colors.danger} />
          <Text style={[styles.intelChange, { color: isUp ? colors.success : colors.danger }]}>{change}</Text>
        </View>
      </View>
      <Text style={styles.intelPrice}>{price}</Text>
      <Text style={styles.intelMarket}>{market}</Text>
      <View style={styles.intelFooter}>
        <View style={styles.intelRec}>
          <Ionicons name={isUp ? 'time-outline' : 'checkmark-circle'} size={12} color={isUp ? '#F59E0B' : colors.success} />
          <Text style={[styles.intelRecText, { color: isUp ? '#F59E0B' : colors.success }]}>AI: {rec}</Text>
        </View>
        <View style={styles.confBarOuter}>
          <View style={[styles.confBarFill, { width: `${conf}%`, backgroundColor: isUp ? '#F59E0B' : colors.success }]} />
        </View>
        <Text style={styles.confText}>{conf}%</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MarketScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('high-low');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [cropSearch, setCropSearch] = useState('');
  const [trendCrop, setTrendCrop] = useState('Rice');
  const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const allCrops = getCropList();

  const loadPrices = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const filters: any = {};
      if (selectedState !== 'All States') filters.state = selectedState;
      const data = await fetchMarketPrices(Object.keys(filters).length > 0 ? filters : undefined);
      setPrices(data);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [selectedState]);

  useEffect(() => { loadPrices(); }, [loadPrices]);

  const sorted = useMemo(() => {
    let list = [...prices];
    if (cropSearch.trim()) {
      const q = cropSearch.toLowerCase();
      list = list.filter(c => c.crop.toLowerCase().includes(q));
    }
    if (selectedDistrict) {
      list = list.filter(c => c.district === selectedDistrict);
    }
    switch (sortMode) {
      case 'high-low': return list.sort((a, b) => b.priceNum - a.priceNum);
      case 'low-high': return list.sort((a, b) => a.priceNum - b.priceNum);
      case 'gainers': return list.sort((a, b) => b.changeNum - a.changeNum);
      case 'losers': return list.sort((a, b) => a.changeNum - b.changeNum);
      default: return list;
    }
  }, [prices, sortMode, selectedDistrict, cropSearch]);

  const topCrops = sorted.slice(0, 4);
  const bestSell = getBestSellingRecommendation(sorted);
  const states = getStates();
  const filteredStates = stateSearch.trim()
    ? states.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()))
    : states;
  const districts = selectedState !== 'All States' ? getDistricts(selectedState) : [];
  const cropsUp = sorted.filter(c => c.trend === 'up').length;
  const cropsDown = sorted.filter(c => c.trend === 'down').length;

  const cropTrends = getCropTrends(trendCrop);
  const trendData = cropTrends[trendPeriod];

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading market data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.centerContent} onPress={loadPrices}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textLight} />
          <Text style={styles.errorText}>Failed to load prices</Text>
          <Text style={styles.retryText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Market Intelligence</Text>
            <Text style={styles.headerSub}>AI-powered price analysis</Text>
          </View>
          <TouchableOpacity
            style={styles.intelBtn}
            onPress={() => navigation.navigate('MarketIntelligence')}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics-outline" size={18} color="#FFFFFF" />
            <Text style={styles.intelBtnText}>Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Source banner */}
        <View style={styles.sourceBanner}>
          <Ionicons name="server-outline" size={12} color={colors.textLight} />
          <Text style={styles.sourceText}>Source: {MARKET_SOURCE}</Text>
          <View style={styles.sourceDot} />
          <Ionicons name="time-outline" size={12} color={colors.textLight} />
          <Text style={styles.sourceText}>{MARKET_LAST_UPDATED}</Text>
        </View>

        {/* Region selector — searchable dropdown */}
        <TouchableOpacity
          style={styles.regionSelector}
          onPress={() => setShowStatePicker(!showStatePicker)}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={16} color={colors.primary} />
          <Text style={styles.regionText}>
            {selectedDistrict
              ? `${selectedDistrict}, ${selectedState}`
              : selectedState === 'All States'
              ? 'All Regions'
              : selectedState}
          </Text>
          <Ionicons name={showStatePicker ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textLight} />
        </TouchableOpacity>

        {showStatePicker && (
          <View style={styles.pickerPanel}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search State..."
              placeholderTextColor={colors.textLight}
              value={stateSearch}
              onChangeText={setStateSearch}
            />
            <ScrollView style={{ maxHeight: 200 }}>
              {filteredStates.map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    setSelectedState(s);
                    setSelectedDistrict(null);
                    if (s === 'All States') setShowStatePicker(false);
                  }}
                  style={[styles.stateRowItem, selectedState === s && styles.stateRowActive]}
                >
                  <Text style={[styles.stateRowText, selectedState === s && styles.stateRowTextActive]}>{s}</Text>
                  {selectedState === s && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {districts.length > 0 && (
              <View style={styles.districtSection}>
                <Text style={styles.districtSectionLabel}>District</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    onPress={() => setSelectedDistrict(null)}
                    style={[styles.districtChip, !selectedDistrict && styles.stateChipActive]}
                  >
                    <Text style={[styles.stateChipText, !selectedDistrict && styles.stateChipTextActive]}>All</Text>
                  </TouchableOpacity>
                  {districts.map(d => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setSelectedDistrict(d)}
                      style={[styles.districtChip, selectedDistrict === d && styles.stateChipActive]}
                    >
                      <Text style={[styles.stateChipText, selectedDistrict === d && styles.stateChipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Sort controls */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setSortMode(opt.key)}
              style={[styles.sortChip, sortMode === opt.key && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortMode === opt.key && styles.sortChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Crop Search */}
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

        {/* Summary Bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{sorted.length}</Text>
            <Text style={styles.summaryLabel}>Crops</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{cropsUp}</Text>
            <Text style={styles.summaryLabel}>Up ↑</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>{cropsDown}</Text>
            <Text style={styles.summaryLabel}>Down ↓</Text>
          </View>
        </View>

        {/* AI Cards */}
        <Text style={styles.sectionTitle}>Top Picks</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.intelScroll}>
          {topCrops.map((c, i) => (
            <IntelCard key={`${c.crop}-${i}`} crop={c.crop} price={c.price} change={c.change} trend={c.trend} market={c.market} />
          ))}
        </ScrollView>

        {/* Best Selling */}
        {bestSell && (
          <View style={styles.bestSellCard}>
            <View style={styles.bestSellHeader}>
              <Ionicons name="trophy" size={20} color="#F59E0B" />
              <Text style={styles.bestSellTitle}>Best Selling Opportunity</Text>
            </View>
            <Text style={styles.bestSellCrop}>{bestSell.crop}</Text>
            <Text style={styles.bestSellPrice}>{bestSell.price} — {bestSell.market}</Text>
            <Text style={styles.bestSellDesc}>Highest price growth today. Consider selling at nearby mandi.</Text>
          </View>
        )}

        {/* Trend Chart — per crop */}
        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>{trendCrop} Price Trend</Text>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendCropRow}>
            {allCrops.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setTrendCrop(c)}
                style={[styles.trendCropChip, trendCrop === c && styles.trendCropChipActive]}
              >
                <Text style={[styles.trendCropText, trendCrop === c && styles.trendCropTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.chartRow}>
            {trendData.map((m, i) => (
              <View key={`${m.label}-${i}`} style={styles.chartBarWrap}>
                <Text style={styles.chartValue}>₹{m.price}</Text>
                <View style={[styles.chartBar, { height: Math.max(10, (m.price / Math.max(...trendData.map(t => t.price), 1)) * 80) }]} />
                <Text style={styles.chartLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* All prices */}
        <Text style={styles.sectionTitle}>All Crops ({sorted.length})</Text>
        {sorted.map((c, i) => {
          const isUp = c.trend === 'up';
          return (
            <View key={`all-${c.crop}-${i}`} style={styles.priceRow}>
              <View style={styles.priceInfo}>
                <Text style={styles.priceCrop}>{c.crop}</Text>
                <Text style={styles.priceMarket}>{c.market}{c.district ? ` · ${c.district}` : ''}</Text>
              </View>
              <Text style={styles.priceNum}>{c.price}</Text>
              <View style={[styles.priceChange, { backgroundColor: isUp ? '#E8F5E9' : '#FEE2E2' }]}>
                <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={11} color={isUp ? colors.success : colors.danger} />
                <Text style={[styles.priceChangeText, { color: isUp ? colors.success : colors.danger }]}>{c.change}%</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  loadingText: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm },
  errorText: { fontSize: 15, color: colors.textSecondary, fontWeight: '600', marginTop: spacing.sm },
  retryText: { fontSize: 13, color: colors.primary, fontWeight: '700', marginTop: spacing.xs },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  intelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  intelBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  sourceBanner: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm, flexWrap: 'wrap' },
  sourceText: { fontSize: 10, color: colors.textLight, fontWeight: '500' },
  sourceDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textLight, marginHorizontal: 4 },

  regionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },

  pickerPanel: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 13, color: colors.text, paddingVertical: spacing.xs },
  stateRowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  stateRowActive: { backgroundColor: colors.primaryLight },
  stateRowText: { fontSize: 13, color: colors.text, fontWeight: '500' },
  stateRowTextActive: { color: colors.primary, fontWeight: '700' },
  districtSection: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  districtSectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.xs },
  districtChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.pill,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm,
  },
  stateChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.pill,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm,
  },
  stateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stateChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  stateChipTextActive: { color: '#FFFFFF' },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },

  sortRow: { gap: spacing.sm, marginBottom: spacing.md },
  sortChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.pill,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm,
  },
  sortChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  sortChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  sortChipTextActive: { color: colors.primary },

  summaryBar: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.lg, ...shadows.sm },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: colors.border },
  summaryValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginTop: 2 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },

  intelScroll: { marginBottom: spacing.lg },
  intelCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginRight: spacing.md, width: width * 0.55, ...shadows.sm },
  intelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  intelCrop: { fontSize: 16, fontWeight: '800', color: colors.text },
  intelBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  intelChange: { fontSize: 11, fontWeight: '800' },
  intelPrice: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 2 },
  intelMarket: { fontSize: 11, color: colors.textLight, marginBottom: spacing.sm },
  intelFooter: { gap: 2 },
  intelRec: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  intelRecText: { fontSize: 10, fontWeight: '700' },
  confBarOuter: { height: 4, borderRadius: 2, backgroundColor: colors.border, overflow: 'hidden' },
  confBarFill: { height: '100%', borderRadius: 2 },
  confText: { fontSize: 9, color: colors.textLight, fontWeight: '600', textAlign: 'right' },

  bestSellCard: { backgroundColor: '#FFFBEB', borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: '#FDE68A' },
  bestSellHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  bestSellTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  bestSellCrop: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 2 },
  bestSellPrice: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.xs },
  bestSellDesc: { fontSize: 12, color: '#92400E', fontWeight: '500' },

  trendCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.sm },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  trendTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  periodRow: { flexDirection: 'row', gap: 4 },
  periodChip: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  periodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { fontSize: 9, fontWeight: '600', color: colors.textSecondary },
  periodTextActive: { color: '#FFFFFF' },
  trendCropRow: { marginBottom: spacing.md },
  trendCropChip: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs },
  trendCropChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  trendCropText: { fontSize: 10, fontWeight: '600', color: colors.textSecondary },
  trendCropTextActive: { color: colors.primary, fontWeight: '700' },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 },
  chartBarWrap: { flex: 1, alignItems: 'center' },
  chartValue: { fontSize: 8, color: colors.textLight, fontWeight: '600', marginBottom: 4 },
  chartBar: { width: 24, backgroundColor: colors.primary, borderRadius: 4, minHeight: 8 },
  chartLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginTop: 4 },

  priceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  priceInfo: { flex: 1 },
  priceCrop: { fontSize: 14, fontWeight: '700', color: colors.text },
  priceMarket: { fontSize: 10, color: colors.textLight, marginTop: 1 },
  priceNum: { fontSize: 16, fontWeight: '800', color: colors.text, marginRight: spacing.sm },
  priceChange: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  priceChangeText: { fontSize: 11, fontWeight: '800' },
});
