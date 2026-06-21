import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { getAIProvider, FertilizerInput } from '../ai/aiProvider';
import { saveRecommendation, getRecentRecommendations } from '../services/aiStorage';
import { useLanguage } from '../i18n/LanguageContext';

interface Props { navigation: any }

const SOIL_TYPES = ['Loamy', 'Clay', 'Sandy', 'Silty', 'Black Cotton', 'Red', 'Laterite', 'Alluvial'];
const GROWTH_STAGES = ['Sowing', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Grain Filling', 'Maturity'];

export default function FertilizerAdvisorScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { language } = useLanguage();
  useEffect(() => { getAIProvider().setLanguage(language); }, [language]);
  const [crop, setCrop] = useState('');
  const [soilType, setSoilType] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<any>(null);
  const [error, setError] = useState('');
  const [crops, setCrops] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { if (user) { fetchCrops(); loadHistory(); } }, [user]);

  async function fetchCrops() {
    if (!user) return;
    const { data } = await supabase.from('crops').select('*').eq('user_id', user.id);
    if (data) setCrops(data);
  }

  async function loadHistory() {
    if (!user) return;
    const h = await getRecentRecommendations(user.id, 'fertilizer');
    setHistory(h);
  }

  async function getAdvice() {
    if (!crop || !soilType || !growthStage) { setError('Please select all options'); return; }
    setLoading(true); setError(''); setAdvice(null);

    const input: FertilizerInput = { crop, soilType, growthStage };

    try {
      const provider = getAIProvider();
      const result = await provider.getFertilizerAdvice(input);
      setAdvice(result);
      if (user) {
        await saveRecommendation(user.id, 'fertilizer', JSON.stringify(input), JSON.stringify(result));
        await loadHistory();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to get advice');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fertilizer Advisor</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadHistory} />}>
        <View style={styles.card}>
          <View style={styles.iconHeader}>
            <Ionicons name="flask" size={28} color="#7C3AED" />
            <Text style={styles.cardTitle}>Get Fertilizer Recommendations</Text>
          </View>

          <Text style={styles.label}>Crop Name</Text>
          {crops.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {crops.map(c => (
                <TouchableOpacity key={c.id} style={[styles.chip, crop === c.crop_name && styles.chipActive]}
                  onPress={() => setCrop(c.crop_name)}>
                  <Text style={[styles.chipText, crop === c.crop_name && styles.chipTextActive]}>{c.crop_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <TextInput style={styles.textInput} value={crop} onChangeText={setCrop} placeholder="e.g., Rice, Wheat, Cotton" placeholderTextColor={colors.textLight} />
          )}

          <Text style={styles.label}>Soil Type</Text>
          <View style={styles.chipGrid}>
            {SOIL_TYPES.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, soilType === s && styles.chipActive]}
                onPress={() => setSoilType(s)}>
                <Text style={[styles.chipText, soilType === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Growth Stage</Text>
          <View style={styles.chipGrid}>
            {GROWTH_STAGES.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, growthStage === s && styles.chipActive]}
                onPress={() => setGrowthStage(s)}>
                <Text style={[styles.chipText, growthStage === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.adviseBtn} onPress={getAdvice} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <><Ionicons name="leaf-outline" size={18} color="#FFF" /><Text style={styles.adviseBtnText}> Get Recommendation</Text></>
            )}
          </TouchableOpacity>
        </View>

        {advice && (
          <>
            <View style={styles.sectionHeader}><Ionicons name="checkmark-circle" size={20} color="#7C3AED" /><Text style={styles.sectionTitle}>Recommendation</Text></View>
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Fertilizer Recommendation</Text>
              <Text style={styles.resultText}>{advice.recommendation}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Application Timing</Text>
              <Text style={styles.resultText}>{advice.timing}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Nutrient Requirements</Text>
              <Text style={styles.resultText}>{advice.nutrients}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Organic Alternatives</Text>
              <Text style={styles.resultText}>{advice.organicAlternatives}</Text>
            </View>

            <View style={styles.disclaimerCard}>
              <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
              <Text style={styles.disclaimerText}>{advice.disclaimer}</Text>
            </View>
          </>
        )}

        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Advice</Text>
            {history.slice(0, 3).map((h, i) => (
              <View key={i} style={styles.historyItem}>
                <Ionicons name="time-outline" size={14} color={colors.textLight} />
                <Text style={styles.historyDate}>{new Date(h.created_at).toLocaleDateString()}</Text>
                <Text style={styles.historyText} numberOfLines={1}>{h.input_data ? JSON.parse(h.input_data).crop : 'Advice'}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { padding: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.md },
  iconHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.md },
  chipsRow: { marginBottom: spacing.sm },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  textInput: { backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 15, color: colors.text },
  error: { color: colors.error, fontSize: 13, fontWeight: '500', marginTop: spacing.sm },
  adviseBtn: { flexDirection: 'row', backgroundColor: '#7C3AED', borderRadius: radius.pill, paddingVertical: spacing.md, justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  adviseBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  resultLabel: { fontSize: 12, fontWeight: '600', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  resultText: { fontSize: 14, lineHeight: 21, color: colors.text, fontWeight: '500' },
  disclaimerCard: { flexDirection: 'row', gap: spacing.sm, backgroundColor: '#FFF8E1', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  disclaimerText: { fontSize: 12, color: '#7B6F2E', fontWeight: '500', flex: 1 },
  historySection: { marginTop: spacing.lg },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.xs },
  historyDate: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  historyText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', flex: 1 },
});
