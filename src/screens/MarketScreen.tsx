import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, typography } from '../theme';
import { fetchMarketPrices, getPriceTrend, getBestSellingRecommendation, getStates, MarketPrice, PriceTrend } from '../services/marketService';

const { width } = Dimensions.get('window');
interface Props { navigation: any }

const CHART_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

function rTrendMax(trend: PriceTrend[]): number {
  return Math.max(...trend.map(t => t.price), 1);
}

function IntelligenceCard({ crop, price, change, trend, market, onPress }: { crop: string; price: string; change: string; trend: string; market: string; onPress?: () => void }) {
  const isUp = trend === 'up';
  const conf = isUp ? Math.floor(70 + Math.random() * 25) : Math.floor(65 + Math.random() * 25);
  const rec = isUp ? 'Hold for better price' : 'Sell Now';

  return (
    <TouchableOpacity style={styles.intelCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.intelHeader}>
        <Text style={styles.intelCrop}>{crop}</Text>
        <View style={[styles.intelBadge, { backgroundColor: isUp ? '#E8F5E9' : '#FEE2E2' }]}>
          <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={14} color={isUp ? colors.success : colors.danger} />
          <Text style={[styles.intelChange, { color: isUp ? colors.success : colors.danger }]}>{change}</Text>
        </View>
      </View>
      <Text style={styles.intelPrice}>{price}</Text>
      <Text style={styles.intelMarket}>{market}</Text>
      <View style={styles.intelFooter}>
        <View style={styles.intelRec}>
          <Ionicons name={isUp ? 'time-outline' : 'checkmark-circle'} size={14} color={isUp ? '#F59E0B' : colors.success} />
          <Text style={[styles.intelRecText, { color: isUp ? '#F59E0B' : colors.success }]}>AI: {rec}</Text>
        </View>
        <View style={styles.intelConf}>
          <View style={[styles.confBar, { width: `${conf}%`, backgroundColor: isUp ? '#F59E0B' : colors.success }]} />
          <Text style={styles.confText}>{conf}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MarketScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadPrices = useCallback(async () => {
    setLoading(true); setError(false);
    try { const data = await fetchMarketPrices(); setPrices(data); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPrices(); }, [loadPrices]);

  const riceTrend = getPriceTrend('Rice');
  const bestSell = getBestSellingRecommendation(prices);
  const topCrops = prices.slice(0, 4);
  const cropsUp = prices.filter(c => c.trend === 'up').length;
  const cropsDown = prices.filter(c => c.trend === 'down').length;

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
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Market Intelligence</Text>
          <Text style={styles.headerSub}>AI-powered price analysis</Text>
        </View>

        {/* Summary Bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{prices.length}</Text>
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

        {/* AI Intelligence Cards */}
        <Text style={styles.sectionTitle}>Top Recommendations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.intelScroll}>
          {topCrops.map((c, i) => (
            <IntelligenceCard key={`${c.crop}-${i}`} crop={c.crop} price={c.price} change={c.change} trend={c.trend} market={c.market} />
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

        {/* Price Trend */}
        <View style={styles.trendCard}>
          <Text style={styles.trendTitle}>Rice Price Trend</Text>
          <Text style={styles.trendSub}>6 month · Sangareddy Mandi</Text>
          <View style={styles.chartRow}>
            {riceTrend.map((m, i) => (
              <View key={m.month} style={styles.chartBarWrap}>
                <Text style={styles.chartValue}>₹{m.price}</Text>
                <View style={[styles.chartBar, { height: Math.max(8, (m.price / rTrendMax(riceTrend)) * 80) }]} />
                <Text style={styles.chartLabel}>{m.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* All prices - simple list */}
        <Text style={styles.sectionTitle}>All Crops</Text>
        {prices.map((c, i) => {
          const isUp = c.trend === 'up';
          return (
            <View key={`all-${c.crop}-${i}`} style={styles.priceRow}>
              <View style={styles.priceInfo}>
                <Text style={styles.priceCrop}>{c.crop}</Text>
                <Text style={styles.priceMarket}>{c.market}</Text>
              </View>
              <Text style={styles.priceNum}>{c.price}</Text>
              <View style={[styles.priceChange, { backgroundColor: isUp ? '#E8F5E9' : '#FEE2E2' }]}>
                <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={12} color={isUp ? colors.success : colors.danger} />
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

  header: { marginBottom: spacing.lg },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

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
  intelFooter: { gap: spacing.xs },
  intelRec: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  intelRecText: { fontSize: 11, fontWeight: '700' },
  intelConf: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  confBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border, overflow: 'hidden' },
  confText: { fontSize: 10, color: colors.textLight, fontWeight: '600', width: 28, textAlign: 'right' },

  bestSellCard: { backgroundColor: '#FFFBEB', borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: '#FDE68A' },
  bestSellHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  bestSellTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  bestSellCrop: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 2 },
  bestSellPrice: { fontSize: 14, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.xs },
  bestSellDesc: { fontSize: 12, color: '#92400E', fontWeight: '500' },

  trendCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.sm },
  trendTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  trendSub: { fontSize: 11, color: colors.textLight, marginBottom: spacing.md },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 },
  chartBarWrap: { flex: 1, alignItems: 'center' },
  chartValue: { fontSize: 8, color: colors.textLight, fontWeight: '600', marginBottom: 4 },
  chartBar: { width: 24, backgroundColor: colors.primary, borderRadius: 4, minHeight: 8 },
  chartLabel: { fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginTop: 4 },

  priceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  priceInfo: { flex: 1 },
  priceCrop: { fontSize: 14, fontWeight: '700', color: colors.text },
  priceMarket: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  priceNum: { fontSize: 16, fontWeight: '800', color: colors.text, marginRight: spacing.sm },
  priceChange: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  priceChangeText: { fontSize: 11, fontWeight: '800' },
});
