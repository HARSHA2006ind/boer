import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { getAIProvider } from '../ai/aiProvider';
import { saveRecommendation, getRecentRecommendations } from '../services/aiStorage';
import { useLanguage } from '../i18n/LanguageContext';

interface Props { navigation: any }

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const CATEGORIES = ['Small Farmer', 'Marginal Farmer', 'Women Farmer', 'Young Farmer', 'SC/ST Farmer', 'General'];

const QUICK_QUERIES = [
  'What subsidies are available for drip irrigation?',
  'Tell me about PM-KISAN scheme',
  'How to apply for Kisan Credit Card?',
  'What is PMFBY crop insurance?',
  'Schemes for organic farming',
  'Solar pump subsidy details',
];

export default function SchemesAssistantScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { language } = useLanguage();
  useEffect(() => { getAIProvider().setLanguage(language); }, [language]);
  const [query, setQuery] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [landSize, setLandSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { if (user) loadHistory(); }, [user]);

  async function loadHistory() {
    if (!user) return;
    const h = await getRecentRecommendations(user.id, 'scheme');
    setHistory(h);
  }

  async function searchSchemes() {
    const q = query.trim() || (category ? `Schemes for ${category} farmers in ${state || 'India'}` : `Agriculture schemes for ${state || 'my region'}`);
    if (!q.trim() && !category) { setError('Enter a query or select filters'); return; }
    setLoading(true); setError(''); setResult('');

    let fullQuery = q;
    if (state || category || landSize) {
      fullQuery += `\n\nFarmer Profile:\n- State: ${state || 'Not specified'}\n- Category: ${category || 'Not specified'}\n- Land Size: ${landSize || 'Not specified'}`;
    }

    try {
      const provider = getAIProvider();
      const res = await provider.getGovernmentSchemeInfo(fullQuery);
      setResult(res);
      if (user) {
        await saveRecommendation(user.id, 'scheme', JSON.stringify({ query: fullQuery }), res);
        await loadHistory();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch scheme information');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schemes Assistant</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadHistory} />}>
        <View style={styles.card}>
          <View style={styles.iconHeader}>
            <Ionicons name="shield-checkmark" size={28} color="#F59E0B" />
            <View>
              <Text style={styles.cardTitle}>Government Schemes</Text>
              <Text style={styles.cardSub}>Find schemes, subsidies & benefits</Text>
            </View>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput style={styles.searchInput} value={query} onChangeText={setQuery}
              placeholder="e.g., PM-KISAN, crop insurance, subsidies..."
              placeholderTextColor={colors.textLight} />
          </View>

          {showFilters && (
            <View style={styles.filters}>
              <Text style={styles.label}>State</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {STATES.slice(0, 10).map(s => (
                  <TouchableOpacity key={s} style={[styles.chip, state === s && styles.chipActive]}
                    onPress={() => setState(state === s ? '' : s)}>
                    <Text style={[styles.chipText, state === s && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Farmer Category</Text>
              <View style={styles.chipGrid}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]}
                    onPress={() => setCategory(category === c ? '' : c)}>
                    <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={styles.landInput} value={landSize} onChangeText={setLandSize}
                placeholder="Land size (acres)" placeholderTextColor={colors.textLight} keyboardType="numeric" />
            </View>
          )}

          <TouchableOpacity style={styles.searchBtn} onPress={searchSchemes} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <><Ionicons name="search" size={18} color="#FFF" /><Text style={styles.searchBtnText}> Search Schemes</Text></>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.quickLabel}>Quick Queries</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
          {QUICK_QUERIES.map((q, i) => (
            <TouchableOpacity key={i} style={styles.quickChip} onPress={() => { setQuery(q); setShowFilters(false); }}>
              <Ionicons name="flash-outline" size={14} color="#F59E0B" />
              <Text style={styles.quickText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
              <Text style={styles.resultTitle}>Scheme Information</Text>
            </View>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}

        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent Queries</Text>
            {history.slice(0, 5).map((h, i) => (
              <TouchableOpacity key={i} style={styles.historyItem} onPress={() => { setResult(h.results); }}>
                <Ionicons name="time-outline" size={14} color={colors.textLight} />
                <Text style={styles.historyDate}>{new Date(h.created_at).toLocaleDateString()}</Text>
                <Text style={styles.historyText} numberOfLines={1}>Query result</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { padding: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.md },
  iconHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
  searchInput: { flex: 1, paddingVertical: spacing.sm + 4, fontSize: 15, color: colors.text },
  filters: { marginBottom: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.sm },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border, marginRight: spacing.xs },
  chipActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  landInput: { backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 15, color: colors.text, marginTop: spacing.sm },
  searchBtn: { flexDirection: 'row', backgroundColor: '#F59E0B', borderRadius: radius.pill, paddingVertical: spacing.md, justifyContent: 'center', alignItems: 'center', marginTop: spacing.md },
  searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  quickLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  quickRow: { marginBottom: spacing.md },
  quickChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, borderWidth: 1, borderColor: '#E8D5B5', marginRight: spacing.sm },
  quickText: { fontSize: 12, color: '#64748B', fontWeight: '600', maxWidth: 180 },
  error: { color: colors.error, fontSize: 13, fontWeight: '500', marginBottom: spacing.sm },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  resultTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  resultText: { fontSize: 14, lineHeight: 22, color: colors.text, fontWeight: '500' },
  historySection: { marginTop: spacing.md },
  historyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.xs },
  historyDate: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  historyText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', flex: 1 },
});
