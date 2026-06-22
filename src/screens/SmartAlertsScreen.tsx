import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { getAIProvider, SmartAlert, WeatherInterpretationInput, FarmAlertContext } from '../ai/aiProvider';
import { useWeather } from '../hooks/useWeather';
import { saveSmartAlerts, getSmartAlerts } from '../services/aiStorage';
import { useLanguage } from '../i18n/LanguageContext';

interface Props { navigation: any }

const ALERT_ICONS: Record<string, string> = {
  rain: 'rainy-outline', pest: 'bug-outline', harvest: 'crop-outline',
  irrigation: 'water-outline', fertilizer: 'flask-outline', market_price: 'trending-up-outline', weather: 'cloud-outline',
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string }> = {
  critical: { color: '#EF4444', bg: '#FEE2E2' },
  high: { color: '#F59E0B', bg: '#FFF7ED' },
  medium: { color: '#3B82F6', bg: '#EFF6FF' },
  low: { color: '#64748B', bg: '#F3F4F6' },
};

export default function SmartAlertsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { weather } = useWeather();
  const { language } = useLanguage();
  useEffect(() => { getAIProvider().setLanguage(language); }, [language]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const loadAlerts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const cached = await getSmartAlerts(user.id);
    setAlerts(cached);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  async function generateAlerts() {
    if (!user) return;
    setGenerating(true); setError('');
    try {
      const { data: farms } = await supabase.from('farms').select('*').eq('user_id', user.id);
      const farmAlerts: FarmAlertContext[] = (farms || []).map((f: any) => ({
        name: f.name || 'Farm',
        currentCrop: f.current_crop || '',
        soilType: f.soil_type || 'Loamy',
        waterSource: f.water_source || '',
        growthStage: f.growth_stage || '',
      }));
      const weatherInput: WeatherInterpretationInput = {
        temperature: weather.temperature || 28,
        humidity: weather.humidity || 65,
        rainChance: weather.rainChance || 0,
        windSpeed: weather.windSpeed || 12,
        condition: weather.condition || 'Sunny',
      };
      const provider = getAIProvider();
      const aiAlerts = await provider.generateSmartAlerts(farmAlerts, weatherInput);
      if (aiAlerts.length > 0) {
        await saveSmartAlerts(user.id, aiAlerts);
        await loadAlerts();
      } else {
        setError('No alerts generated. Try again with more farm data.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate alerts');
    }
    setGenerating(false);
  }

  const filtered = filter === 'all' ? alerts : alerts.filter((a: any) => a.alert_type === filter);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Smart Alerts</Text>
        <TouchableOpacity style={styles.genBtn} onPress={generateAlerts} disabled={generating}>
          {generating ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="sparkles" size={18} color="#FFF" />}
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {['all', 'weather', 'irrigation', 'pest', 'harvest', 'fertilizer', 'market_price'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>{f === 'all' ? 'All' : f.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : error ? (
          <View style={styles.center}><Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={generateAlerts}><Text style={styles.retryText}>Try Again</Text></TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No alerts</Text>
            <Text style={styles.emptySub}>Tap the sparkle icon to generate AI-powered alerts for your farm</Text>
          </View>
        ) : (
          filtered.map((alert: any, i: number) => {
            const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
            const icon = ALERT_ICONS[alert.alert_type] || 'warning-outline';
            return (
              <View key={alert.id || i} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={[styles.iconWrap, { backgroundColor: sev.bg }]}>
                    <Ionicons name={icon as any} size={20} color={sev.color} />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertDate}>{new Date(alert.createdAt || alert.created_at).toLocaleDateString('en-IN')}</Text>
                  </View>
                  <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
                    <Text style={[styles.sevText, { color: sev.color }]}>{alert.severity}</Text>
                  </View>
                </View>
                <Text style={styles.alertDesc}>{alert.description}</Text>
                {alert.actionRequired || alert.action_required ? (
                  <View style={styles.actionRow}>
                    <Ionicons name="bulb-outline" size={14} color={colors.primary} />
                    <Text style={styles.actionText}>{alert.actionRequired || alert.action_required}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  genBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  filterScroll: { maxHeight: 48, marginVertical: spacing.sm },
  filterContent: { paddingHorizontal: spacing.md, gap: spacing.sm, alignItems: 'center' },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterLabelActive: { color: '#FFFFFF' },
  list: { padding: spacing.md },
  center: { alignItems: 'center', paddingVertical: spacing.xxl * 2, gap: spacing.sm },
  errorText: { fontSize: 14, color: colors.danger, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: 18 },
  alertCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  iconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  alertDate: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  sevBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  sevText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  alertDesc: { fontSize: 13, lineHeight: 18, color: colors.textSecondary, marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  actionText: { fontSize: 12, color: colors.text, fontWeight: '500', flex: 1, lineHeight: 17 },
});
