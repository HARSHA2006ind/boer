import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { getAIProvider, IrrigationInput } from '../ai/aiProvider';
import { saveRecommendation, getRecentRecommendations } from '../services/aiStorage';
import { useWeather } from '../hooks/useWeather';
import { useLanguage } from '../i18n/LanguageContext';

interface Props { navigation: any }

const SOIL_TYPES = ['Loamy', 'Clay', 'Sandy', 'Silty', 'Black Cotton', 'Red', 'Laterite', 'Alluvial'];
const GROWTH_STAGES = ['Sowing', 'Vegetative', 'Flowering', 'Fruiting', 'Grain Filling', 'Maturity'];

export default function IrrigationAdvisorScreen({ navigation }: Props) {
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
  const [refreshing, setRefreshing] = useState(false);
  const [crops, setCrops] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const defaultFarm = farms[0];
  const weatherLocation = defaultFarm ? [defaultFarm.village, defaultFarm.district, defaultFarm.state].filter(Boolean).join(', ') : undefined;
  const { weather } = useWeather(weatherLocation, defaultFarm?.name);

  useEffect(() => { if (user) { fetchCrops(); loadHistory(); fetchFarms(); } }, [user]);

  async function fetchFarms() {
    if (!user) return;
    const { data } = await supabase.from('farms').select('*').eq('user_id', user.id);
    if (data) setFarms(data);
  }

  async function fetchCrops() {
    if (!user) return;
    const { data } = await supabase.from('crops').select('*').eq('user_id', user.id);
    if (data) setCrops(data);
  }

  async function loadHistory() {
    if (!user) return;
    const h = await getRecentRecommendations(user.id, 'irrigation');
    setHistory(h);
  }

  async function getAdvice() {
    if (!crop || !soilType || !growthStage) { setError('Please select all options'); return; }
    setLoading(true); setError(''); setAdvice(null);

    const input: IrrigationInput = {
      crop, soilType, growthStage,
      rainChance: weather.rainChance || 0,
      temperature: weather.temperature || 28,
      humidity: weather.humidity || 65,
    };

    try {
      const provider = getAIProvider();
      const result = await provider.getIrrigationAdvice(input);
      setAdvice(result);
      if (user) {
        await saveRecommendation(user.id, 'irrigation', JSON.stringify(input), JSON.stringify(result));
        await loadHistory();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to get advice');
    }
    setLoading(false);
  }

  const actionColors: Record<string, string> = {
    water_today: '#2D6A4F',
    delay_irrigation: '#E07B3A',
    increase_irrigation: '#1E6B9F',
  };

  const actionLabels: Record<string, string> = {
    water_today: 'Water Today',
    delay_irrigation: 'Delay Irrigation',
    increase_irrigation: 'Increase Water',
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Irrigation Advisor</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadHistory} />}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Crop</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {crops.length > 0 ? crops.map(c => (
              <TouchableOpacity key={c.id} style={[styles.chip, crop === c.crop_name && styles.chipActive]}
                onPress={() => setCrop(c.crop_name)}>
                <Text style={[styles.chipText, crop === c.crop_name && styles.chipTextActive]}>{c.crop_name}</Text>
              </TouchableOpacity>
            )) : (
              <TextInputChip value={crop} onChange={setCrop} placeholder="Enter crop name..." />
            )}
          </ScrollView>

          <Text style={styles.sectionTitle}>Soil Type</Text>
          <View style={styles.chipGrid}>
            {SOIL_TYPES.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, soilType === s && styles.chipActive]}
                onPress={() => setSoilType(s)}>
                <Text style={[styles.chipText, soilType === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Growth Stage</Text>
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
              <><Ionicons name="water-outline" size={18} color="#FFF" /><Text style={styles.adviseBtnText}> Get Irrigation Advice</Text></>
            )}
          </TouchableOpacity>
        </View>

        {advice && (
          <View style={[styles.resultCard, { borderLeftColor: actionColors[advice.action] || colors.primary, borderLeftWidth: 4 }]}>
            <View style={styles.resultHeader}>
              <Ionicons name="water" size={24} color={actionColors[advice.action] || colors.primary} />
              <Text style={[styles.resultAction, { color: actionColors[advice.action] || colors.primary }]}>
                {actionLabels[advice.action] || advice.action}
              </Text>
            </View>
            <Text style={styles.resultReason}>{advice.reason}</Text>
            {advice.estimatedWater ? (
              <View style={styles.waterRow}>
                <Ionicons name="calculator-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.waterText}>Est. Water: {advice.estimatedWater}</Text>
              </View>
            ) : null}
          </View>
        )}

        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent Advice</Text>
            {history.slice(0, 5).map((h, i) => {
              let data;
              try { data = JSON.parse(h.results); } catch { data = null; }
              return (
                <View key={i} style={styles.historyItem}>
                  <Text style={styles.historyDate}>{new Date(h.created_at).toLocaleDateString()}</Text>
                  <Text style={styles.historyText}>{data?.action ? (actionLabels[data.action] || data.action) : 'Advice'}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TextInputChip({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      style={{ backgroundColor: colors.secondary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, minWidth: 120, color: colors.text }}
      value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textLight}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F7FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { padding: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.md },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.md },
  chipsRow: { marginBottom: spacing.sm },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: '#1E6B9F', borderColor: '#1E6B9F' },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  error: { color: colors.error, fontSize: 13, fontWeight: '500', marginTop: spacing.sm },
  adviseBtn: { flexDirection: 'row', backgroundColor: '#1E6B9F', borderRadius: radius.pill, paddingVertical: spacing.md, justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  adviseBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  resultAction: { fontSize: 18, fontWeight: '700' },
  resultReason: { fontSize: 14, lineHeight: 21, color: colors.text, fontWeight: '500' },
  waterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  waterText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  historySection: { marginTop: spacing.md },
  historyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.xs },
  historyDate: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  historyText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
});
