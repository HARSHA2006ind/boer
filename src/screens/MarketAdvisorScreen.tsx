import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { getAIProvider, MarketAdviceInput, MarketAdviceResult } from '../ai/aiProvider';
import { saveMarketAdvice, getMarketAdviceHistory } from '../services/aiStorage';

interface Props { navigation: any }

export default function MarketAdvisorScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [crop, setCrop] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketAdviceResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadFarm();
    }
  }, [user]);

  async function loadFarm() {
    if (!user) return;
    const { data } = await supabase.from('farms').select('*').eq('user_id', user.id);
    if (data && data.length > 0) {
      const f = data[0];
      setLocation([f.village, f.district].filter(Boolean).join(', '));
      setState(f.state || '');
      setCrop(f.current_crop || '');
    }
  }

  async function loadHistory() {
    if (!user) return;
    const h = await getMarketAdviceHistory(user.id);
    setHistory(h);
  }

  async function getAdvice() {
    if (!crop.trim()) { setError('Please enter a crop name'); return; }
    setLoading(true); setError(''); setResult(null);

    const input: MarketAdviceInput = {
      crop: crop.trim(),
      location: location || 'Not specified',
      state: state || 'Not specified',
      currentPrice: parseFloat(price) || 0,
    };

    try {
      const provider = getAIProvider();
      const res = await provider.getMarketAdvice(input);
      setResult(res);
      if (user) {
        await saveMarketAdvice(user.id, {
          crop_name: crop.trim(), current_price: parseFloat(price) || 0,
          demand_level: 'medium', best_selling_time: res.bestSellingTime,
          price_forecast: res.priceForecast, demand_forecast: res.demandForecast,
          nearby_markets: res.nearbyMarkets,
        });
        await loadHistory();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to get market advice');
    }
    setLoading(false);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Market Advisor</Text>
        <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={styles.backBtn}>
          <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showHistory ? (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}>
          {history.length === 0 ? (
            <View style={styles.center}><Text style={styles.emptyText}>No market advice history</Text></View>
          ) : (
            history.map((h: any, i: number) => (
              <TouchableOpacity key={i} style={styles.historyCard} onPress={() => {
                setCrop(h.crop_name); setPrice(String(h.current_price || ''));
                setShowHistory(false);
              }}>
                <Text style={styles.historyCrop}>{h.crop_name}</Text>
                <Text style={styles.historyDate}>{new Date(h.created_at).toLocaleDateString('en-IN')}</Text>
                <Text style={styles.historyDetail}>Best time: {h.best_selling_time}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}>
          <View style={styles.inputCard}>
            <Text style={styles.label}>Crop Name</Text>
            <TextInput style={styles.input} value={crop} onChangeText={setCrop} placeholder="e.g. Rice, Cotton, Tomato" placeholderTextColor={colors.textLight} />

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Village, District" placeholderTextColor={colors.textLight} />

            <Text style={styles.label}>State</Text>
            <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="e.g. Telangana" placeholderTextColor={colors.textLight} />

            <Text style={styles.label}>Current Market Price (₹/Quintal)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g. 2500" placeholderTextColor={colors.textLight} keyboardType="numeric" />

            <TouchableOpacity style={styles.adviceBtn} onPress={getAdvice} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <><Ionicons name="trending-up" size={18} color="#FFF" /><Text style={styles.adviceBtnText}> Get Market Advice</Text></>}
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {result && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons name="analytics" size={22} color={colors.primary} />
                <Text style={styles.resultTitle}>Market Analysis</Text>
              </View>
              <View style={styles.resultSection}>
                <Text style={styles.sectionLabel}>Best Time to Sell</Text>
                <Text style={styles.sectionValue}>{result.bestSellingTime}</Text>
              </View>
              <View style={styles.resultSection}>
                <Text style={styles.sectionLabel}>Demand Forecast</Text>
                <Text style={styles.sectionValue}>{result.demandForecast}</Text>
              </View>
              <View style={styles.resultSection}>
                <Text style={styles.sectionLabel}>Price Forecast (30 days)</Text>
                <Text style={styles.sectionValue}>{result.priceForecast}</Text>
              </View>
              <View style={styles.resultSection}>
                <Text style={styles.sectionLabel}>Nearby Mandis</Text>
                <Text style={styles.sectionValue}>{result.nearbyMarkets}</Text>
              </View>
              <View style={[styles.resultSection, styles.recoSection]}>
                <Ionicons name="bulb" size={16} color={colors.warning} />
                <Text style={styles.recoText}>{result.recommendation}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  list: { padding: spacing.md },
  scroll: { padding: spacing.md },
  center: { alignItems: 'center', paddingVertical: spacing.xxl * 2 },
  emptyText: { fontSize: 14, color: colors.textLight },
  inputCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadows.sm },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  adviceBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  adviceBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  errorText: { color: colors.danger, fontSize: 13, textAlign: 'center', marginTop: spacing.md },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginTop: spacing.md, ...shadows.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  resultTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  resultSection: { marginBottom: spacing.md },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textLight, marginBottom: 2 },
  sectionValue: { fontSize: 14, fontWeight: '600', color: colors.text, lineHeight: 20 },
  recoSection: { flexDirection: 'row', gap: spacing.sm, backgroundColor: '#FFF8E1', padding: spacing.md, borderRadius: radius.md, alignItems: 'flex-start' },
  recoText: { fontSize: 13, color: '#7B6F2E', fontWeight: '600', flex: 1, lineHeight: 18 },
  historyCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  historyCrop: { fontSize: 15, fontWeight: '700', color: colors.text },
  historyDate: { fontSize: 11, color: colors.textLight },
  historyDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
});
