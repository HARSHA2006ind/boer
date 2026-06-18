import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { Farm } from '../types';
import { colors, spacing, radius, shadows } from '../theme';

const { width } = Dimensions.get('window');

interface Props { navigation: any; route: any }

const GROWTH_STAGES = [
  { label: 'Sowing', icon: '🌱' },
  { label: 'Vegetative', icon: '🌿' },
  { label: 'Flowering', icon: '🌸' },
  { label: 'Fruiting', icon: '🍎' },
  { label: 'Harvest', icon: '🌾' },
];

export default function FarmDetailScreen({ navigation, route }: Props) {
  const { farmId } = route.params;
  const insets = useSafeAreaInsets();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFarm(); }, [farmId]);

  async function fetchFarm() {
    try {
      const { data, error } = await supabase.from('farms').select('*').eq('id', farmId).single();
      if (error) throw error;
      setFarm(data);
    } catch {}
    finally { setLoading(false); }
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading farm...</Text>
        </View>
      </View>
    );
  }

  if (!farm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Farm not found</Text>
        </View>
      </View>
    );
  }

  const currentStageIndex = farm.current_crop ? 2 : 0; // Mock: would come from crop data
  const healthScore = farm.current_crop ? 92 : 65;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{farm.name}</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Hero Stats */}
        <View style={styles.heroSection}>
          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <View style={[styles.heroCircle, { borderColor: colors.success }]}>
                <Text style={styles.heroScore}>{healthScore}</Text>
              </View>
              <Text style={styles.heroStatLabel}>Health Score</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroValue}>{farm.land_area_value || 0}</Text>
              <Text style={styles.heroUnit}>{farm.land_area_unit || 'ac'}</Text>
              <Text style={styles.heroStatLabel}>Area</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroValue}>{farm.current_crop ? '🌾' : '—'}</Text>
              <Text style={styles.heroUnit}>{farm.current_crop || 'No crop'}</Text>
              <Text style={styles.heroStatLabel}>Current Crop</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.location}>{[farm.village, farm.district, farm.state].filter(Boolean).join(', ')}</Text>

        {/* Crop Timeline */}
        {farm.current_crop && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crop Timeline</Text>
            <Text style={styles.cardSubtitle}>{farm.current_crop} · Growth Progress</Text>
            <View style={styles.timeline}>
              {GROWTH_STAGES.map((stage, i) => {
                const isPast = i <= currentStageIndex;
                const isCurrent = i === currentStageIndex;
                return (
                  <View key={i} style={styles.timelineItem}>
                    <View style={styles.timelinePoint}>
                      <View style={[styles.timelineDot, isPast && styles.timelineDotActive, isCurrent && styles.timelineDotCurrent]}>
                        <Text style={styles.timelineEmoji}>{stage.icon}</Text>
                      </View>
                      {i < GROWTH_STAGES.length - 1 && <View style={[styles.timelineLine, isPast && styles.timelineLineActive]} />}
                    </View>
                    <Text style={[styles.timelineLabel, isCurrent && styles.timelineLabelCurrent]}>{stage.label}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((currentStageIndex + 1) / GROWTH_STAGES.length) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(((currentStageIndex + 1) / GROWTH_STAGES.length) * 100)}% complete</Text>
          </View>
        )}

        {/* Health Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Farm Analytics</Text>
          <View style={styles.metricsGrid}>
            <MetricTile icon="💧" label="Water Status" value={farm.water_source || '—'} color="#3B82F6" />
            <MetricTile icon="🦠" label="Disease Risk" value={farm.current_crop ? 'Low' : '—'} color={colors.success} />
            <MetricTile icon="🌤️" label="Weather Impact" value="Favorable" color="#F59E0B" />
            <MetricTile icon="💰" label="Expected Yield" value={farm.current_crop ? '2.4 t/ha' : '—'} color={colors.primary} />
          </View>
        </View>

        {/* Expected Revenue */}
        {farm.current_crop && (
          <View style={[styles.card, styles.revenueCard]}>
            <Text style={styles.cardTitle}>Expected Revenue</Text>
            <Text style={styles.revenueAmount}>₹1,85,000</Text>
            <Text style={styles.revenueSub}>Estimated at current market rates</Text>
          </View>
        )}

        {/* Soil & Water */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Soil & Water</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Soil Type</Text>
            <Text style={styles.infoValue}>{farm.soil_type || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Water Source</Text>
            <Text style={styles.infoValue}>{farm.water_source || '—'}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CropList', { farmId: farm.id })}>
            <Ionicons name="leaf-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Crop Diary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionOutline]} onPress={() => navigation.navigate('AddEditFarm', { farmId: farm.id })}>
            <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Edit Farm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricTile({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: colors.textSecondary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1, textAlign: 'center' },
  heroSection: { marginHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadows.sm, marginBottom: spacing.xs },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xs },
  heroScore: { fontSize: 18, fontWeight: '800', color: colors.primary },
  heroDivider: { width: 1, height: 40, backgroundColor: colors.border },
  heroValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  heroUnit: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  heroStatLabel: { fontSize: 10, color: colors.textLight, fontWeight: '600', marginTop: 2 },
  location: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, fontWeight: '500' },
  card: { marginHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardSubtitle: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.md, marginTop: 2 },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, paddingVertical: spacing.md },
  timelineItem: { alignItems: 'center', flex: 1 },
  timelinePoint: { alignItems: 'center', marginBottom: spacing.xs },
  timelineDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  timelineDotActive: { backgroundColor: colors.primaryLight },
  timelineDotCurrent: { backgroundColor: colors.primary },
  timelineEmoji: { fontSize: 16 },
  timelineLine: { width: '100%', height: 2, backgroundColor: colors.border, position: 'absolute', top: 17, left: '50%', zIndex: -1 },
  timelineLineActive: { backgroundColor: colors.primary },
  timelineLabel: { fontSize: 9, color: colors.textLight, fontWeight: '600', textAlign: 'center' },
  timelineLabelCurrent: { color: colors.primary, fontWeight: '800' },
  progressBar: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  progressText: { fontSize: 10, color: colors.textLight, fontWeight: '600', marginTop: spacing.xs, textAlign: 'right' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  metricTile: { width: (width - spacing.md * 2 - spacing.lg * 2 - spacing.sm) / 2, backgroundColor: colors.secondary, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' },
  metricIcon: { fontSize: 24, marginBottom: spacing.xs },
  metricValue: { fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' },
  metricLabel: { fontSize: 10, color: colors.textLight, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  revenueCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  revenueAmount: { fontSize: 32, fontWeight: '800', color: colors.primary, marginTop: spacing.sm, letterSpacing: -0.5 },
  revenueSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: '500' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md, marginTop: spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, ...shadows.sm },
  actionOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  actionText: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
