import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const { width } = Dimensions.get('window');

const CHART_DATA = [2400, 2450, 2380, 2500, 2480, 2550, 2520, 2600, 2580, 2650, 2620, 2700];
const CHART_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const NEARBY_MARKETS = [
  { name: 'Sangareddy Mandi', price: 2700 },
  { name: 'Hyderabad Market', price: 2680 },
  { name: 'Patancheru Mandi', price: 2650 },
  { name: 'Medchal Mandi', price: 2720 },
];

interface Props { navigation: any; route: any }

export default function CropPriceDetailScreen({ navigation, route }: Props) {
  const { cropName } = route.params;
  const insets = useSafeAreaInsets();
  const maxVal = Math.max(...CHART_DATA, 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cropName}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.priceCard}>
          <Text style={styles.currentPrice}>₹2,700</Text>
          <Text style={styles.currentUnit}>per Quintal</Text>
          <View style={[styles.changeBadge, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="trending-up" size={14} color={colors.success} />
            <Text style={styles.changeText}>+3.2% today</Text>
          </View>
          <Text style={styles.yesterday}>Yesterday: ₹2,620</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Price Trend (12 Months)</Text>
          <View style={styles.chartRow}>
            {CHART_DATA.map((val, i) => (
              <View key={i} style={styles.chartBarWrap}>
                <View style={[styles.chartBar, { height: (val / maxVal) * 120 }]} />
                {i % 3 === 0 && <Text style={styles.chartLabel}>{CHART_LABELS[i]}</Text>}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nearby Market Prices</Text>
          {NEARBY_MARKETS.map((m, i) => (
            <View key={i} style={[styles.marketRow, i < NEARBY_MARKETS.length - 1 && styles.marketBorder]}>
              <Text style={styles.marketName}>{m.name}</Text>
              <Text style={styles.marketPrice}>₹{m.price}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.aiCard]}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.aiTitle}>AI Price Summary</Text>
          </View>
          <Text style={styles.aiText}>
            {cropName} prices increased 8% this week. Market conditions suggest holding for better prices next week. Demand is strong in nearby mandis.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  priceCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md, ...shadows.md },
  currentPrice: { fontSize: 48, fontWeight: '200', color: colors.text, letterSpacing: -1 },
  currentUnit: { fontSize: 13, color: colors.textSecondary, marginTop: -4 },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, marginTop: spacing.sm },
  changeText: { fontSize: 13, fontWeight: '700', color: colors.success },
  yesterday: { fontSize: 12, color: colors.textLight, marginTop: spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  chartCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140 },
  chartBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBar: { width: 14, backgroundColor: colors.primary, borderRadius: 4, minHeight: 4 },
  chartLabel: { fontSize: 8, color: colors.textLight, fontWeight: '600', marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  marketRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  marketBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  marketName: { fontSize: 14, color: colors.text, fontWeight: '600' },
  marketPrice: { fontSize: 14, fontWeight: '700', color: colors.primary },
  aiCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  aiTitle: { fontSize: 14, fontWeight: '700', color: colors.primary },
  aiText: { fontSize: 13, lineHeight: 20, color: colors.text, fontWeight: '500' },
});
