import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { getAIProvider, CropRecommendationInput } from '../ai/aiProvider';
import { saveRecommendation, getRecentRecommendations } from '../services/aiStorage';
import { useWeather } from '../hooks/useWeather';

interface Props { navigation: any }

const SOIL_TYPES = ['Loamy', 'Clay', 'Sandy', 'Silty', 'Black Cotton', 'Red', 'Laterite', 'Alluvial'];
const WATER_SOURCES = ['Rainfed', 'Canal', 'Borewell', 'Well', 'Drip', 'Sprinkler', 'Tank', 'None'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Summer', 'Winter', 'Round the Year'];

export default function CropRecommendationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [soilType, setSoilType] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [season, setSeason] = useState('');
  const [landArea, setLandArea] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const defaultFarm = farms[0];
  const weatherLocation = defaultFarm ? [defaultFarm.village, defaultFarm.district, defaultFarm.state].filter(Boolean).join(', ') : undefined;
  const { weather } = useWeather(weatherLocation, defaultFarm?.name);

  useEffect(() => { if (user) { fetchFarms(); loadHistory(); } }, [user]);

  async function fetchFarms() {
    if (!user) return;
    const { data } = await supabase.from('farms').select('*').eq('user_id', user.id);
    if (data) {
      setFarms(data);
      if (data.length > 0) {
        setSelectedFarm(data[0]);
        setSoilType(data[0].soil_type || '');
        setWaterSource(data[0].water_source || '');
        setLocation([data[0].village, data[0].district, data[0].state].filter(Boolean).join(', '));
      }
    }
  }

  async function loadHistory() {
    if (!user) return;
    const h = await getRecentRecommendations(user.id, 'crop_recommendation');
    setHistory(h);
  }

  async function recommend() {
    if (!soilType || !waterSource || !season) { setError('Please select all options'); return; }
    setLoading(true); setError(''); setResults([]);

    const input: CropRecommendationInput = {
      soilType, waterSource, season, landArea: parseFloat(landArea) || 0, location,
    };

    try {
      const provider = getAIProvider();
      const res = await provider.recommendCrops(input);
      setResults(res);
      if (user) {
        await saveRecommendation(user.id, 'crop_recommendation', JSON.stringify(input), JSON.stringify(res));
        await loadHistory();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to get recommendations');
    }
    setLoading(false);
  }

  function useFarmData(farm: any) {
    setSelectedFarm(farm);
    setSoilType(farm.soil_type || '');
    setWaterSource(farm.water_source || '');
    setLocation([farm.village, farm.district, farm.state].filter(Boolean).join(', '));
  }

  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#8B7355', '#6B7280'];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crop Recommendation</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadHistory} />}>
        {farms.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Your Farms</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {farms.map(f => (
                <TouchableOpacity key={f.id} style={[styles.farmChip, selectedFarm?.id === f.id && styles.farmChipActive]}
                  onPress={() => useFarmData(f)}>
                  <Ionicons name="leaf" size={14} color={selectedFarm?.id === f.id ? '#FFF' : colors.primary} />
                  <Text style={[styles.farmChipText, selectedFarm?.id === f.id && styles.farmChipTextActive]}>{f.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Farm Conditions</Text>

          <Text style={styles.label}>Soil Type</Text>
          <View style={styles.chipGrid}>
            {SOIL_TYPES.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, soilType === s && styles.chipActive]}
                onPress={() => setSoilType(s)}>
                <Text style={[styles.chipText, soilType === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Water Source</Text>
          <View style={styles.chipGrid}>
            {WATER_SOURCES.map(w => (
              <TouchableOpacity key={w} style={[styles.chip, waterSource === w && styles.chipActive]}
                onPress={() => setWaterSource(w)}>
                <Text style={[styles.chipText, waterSource === w && styles.chipTextActive]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Season</Text>
          <View style={styles.chipGrid}>
            {SEASONS.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, season === s && styles.chipActive]}
                onPress={() => setSeason(s)}>
                <Text style={[styles.chipText, season === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput style={styles.landInput} value={landArea} onChangeText={setLandArea}
            placeholder="Land area (acres) — optional" placeholderTextColor={colors.textLight} keyboardType="numeric" />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.recommendBtn} onPress={recommend} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <><Ionicons name="leaf-outline" size={18} color="#FFF" /><Text style={styles.recommendBtnText}> Get Recommendations</Text></>
            )}
          </TouchableOpacity>
        </View>

        {results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Recommended Crops</Text>
            {results.map((crop, i) => (
              <View key={i} style={[styles.cropCard, { borderLeftColor: rankColors[i] || '#6B7280', borderLeftWidth: 4 }]}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{i + 1}</Text>
                </View>
                <View style={styles.cropInfo}>
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <View style={styles.cropDetails}>
                    <View style={styles.cropDetail}>
                      <Ionicons name="water-outline" size={14} color={colors.info} />
                      <Text style={styles.cropDetailText}>{crop.waterRequirement}</Text>
                    </View>
                    <View style={styles.cropDetail}>
                      <Ionicons name="cash-outline" size={14} color={colors.success} />
                      <Text style={styles.cropDetailText}>{crop.profitPotential}</Text>
                    </View>
                    <View style={styles.cropDetail}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.cropDetailText}>{crop.harvestDuration}</Text>
                    </View>
                    <View style={styles.cropDetail}>
                      <Ionicons name="analytics-outline" size={14} color={colors.warning} />
                      <Text style={styles.cropDetailText}>{crop.difficulty}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {history.length > 0 && results.length === 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent Recommendations</Text>
            {history.slice(0, 3).map((h, i) => {
              let data;
              try { data = JSON.parse(h.results); } catch { data = null; }
              return (
                <TouchableOpacity key={i} style={styles.historyItem} onPress={() => { if (data) setResults(data); }}>
                  <Ionicons name="time-outline" size={14} color={colors.textLight} />
                  <Text style={styles.historyDate}>{new Date(h.created_at).toLocaleDateString()}</Text>
                  <Text style={styles.historyText} numberOfLines={1}>{data?.[0]?.name || 'Recommendations'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FAF0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { padding: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.md },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  farmChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  farmChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  farmChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  farmChipTextActive: { color: '#FFF' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: '#2D6A4F', borderColor: '#2D6A4F' },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  landInput: { backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 15, color: colors.text, marginTop: spacing.sm },
  error: { color: colors.error, fontSize: 13, fontWeight: '500', marginTop: spacing.sm },
  recommendBtn: { flexDirection: 'row', backgroundColor: '#2D6A4F', borderRadius: radius.pill, paddingVertical: spacing.md, justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  recommendBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  resultsSection: { marginBottom: spacing.md },
  resultsTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  cropCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm, overflow: 'hidden' },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md, marginTop: 2 },
  rankText: { fontSize: 14, fontWeight: '800', color: colors.primary },
  cropInfo: { flex: 1 },
  cropName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  cropDetails: { gap: spacing.xs },
  cropDetail: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cropDetailText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  historySection: { marginTop: spacing.md },
  historyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.xs },
  historyDate: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  historyText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', flex: 1 },
});
