import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

type AlertFilter = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'unread' | 'resolved';

interface AlertItem {
  id: string;
  type: 'rain' | 'pest' | 'heat' | 'irrigation' | 'harvest' | 'market' | 'fertilizer';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  farm: string;
  timestamp: string;
  resolved: boolean;
  read: boolean;
}

const MOCK_ALERTS: AlertItem[] = [
  { id: '1', type: 'rain', title: 'Heavy Rain Expected Tomorrow', description: 'Up to 80mm rainfall expected. Prepare drainage systems and delay irrigation.', severity: 'critical', farm: 'North Field', timestamp: 'Today, 2:30 PM', resolved: false, read: false },
  { id: '2', type: 'pest', title: 'Pest Risk Warning — Aphids', description: 'Aphid infestation reported in nearby farms within 5km radius.', severity: 'high', farm: 'All Farms', timestamp: 'Today, 11:00 AM', resolved: false, read: false },
  { id: '3', type: 'heat', title: 'Heat Wave Advisory', description: 'Temperature expected to reach 42°C. Keep livestock shaded and hydrated.', severity: 'critical', farm: 'South Field', timestamp: 'Yesterday, 4:00 PM', resolved: false, read: true },
  { id: '4', type: 'irrigation', title: 'Irrigation Recommended', description: 'Soil moisture at 28%. Schedule irrigation within 48 hours.', severity: 'medium', farm: 'East Field', timestamp: 'Yesterday, 9:00 AM', resolved: false, read: true },
  { id: '5', type: 'harvest', title: 'Harvest Window Closing', description: 'Optimal moisture content for wheat harvest ends in 3 days.', severity: 'high', farm: 'West Field', timestamp: '2 days ago', resolved: false, read: true },
  { id: '6', type: 'market', title: 'Cotton Price Surge', description: 'Cotton prices up 12% across APMC mandis. Consider selling this week.', severity: 'medium', farm: 'All Farms', timestamp: '2 days ago', resolved: true, read: true },
  { id: '7', type: 'fertilizer', title: 'Fertilizer Application Due', description: 'NPK 20-20-20 application recommended for active growth stage.', severity: 'low', farm: 'North Field', timestamp: '3 days ago', resolved: false, read: true },
];

const SEVERITY_META: Record<string, { icon: string; color: string; bg: string; desc: string }> = {
  critical: { icon: 'alert-circle', color: '#D62828', bg: '#FEE2E2', desc: 'Critical' },
  high: { icon: 'warning', color: '#D97706', bg: '#FFF7ED', desc: 'High' },
  medium: { icon: 'alert-outline', color: '#457B9D', bg: '#EFF6FF', desc: 'Medium' },
  low: { icon: 'information-circle-outline', color: '#6B7280', bg: '#F3F4F6', desc: 'Low' },
};

const ALERT_ICONS: Record<string, string> = {
  rain: 'rainy-outline', pest: 'bug-outline', heat: 'sunny-outline',
  irrigation: 'water-outline', harvest: 'crop-outline', market: 'trending-up-outline', fertilizer: 'flask-outline',
};

const FILTERS: { key: AlertFilter; label: string }[] = [
  { key: 'all', label: 'alert.filter.all' },
  { key: 'critical', label: 'alert.filter.critical' },
  { key: 'high', label: 'alert.filter.high' },
  { key: 'medium', label: 'alert.filter.medium' },
  { key: 'low', label: 'alert.filter.low' },
  { key: 'unread', label: 'alert.filter.unread' },
  { key: 'resolved', label: 'alert.filter.resolved' },
];

interface Props { navigation: any }

export default function AlertHistoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('all');

  const handleFilter = useCallback((f: AlertFilter) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveFilter(f);
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return MOCK_ALERTS;
    if (activeFilter === 'critical') return MOCK_ALERTS.filter(a => a.severity === 'critical');
    if (activeFilter === 'high') return MOCK_ALERTS.filter(a => a.severity === 'high');
    if (activeFilter === 'medium') return MOCK_ALERTS.filter(a => a.severity === 'medium');
    if (activeFilter === 'low') return MOCK_ALERTS.filter(a => a.severity === 'low');
    if (activeFilter === 'unread') return MOCK_ALERTS.filter(a => !a.read);
    if (activeFilter === 'resolved') return MOCK_ALERTS.filter(a => a.resolved);
    return MOCK_ALERTS;
  }, [activeFilter]);

  const unreadCount = useMemo(() => MOCK_ALERTS.filter(a => !a.read).length, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.secondary }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.text }]}>{t('alert.title')}</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.secondary }]}>
          <Ionicons name="checkmark-done-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => {
          const active = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.segment, active && { backgroundColor: colors.primary }]}
              onPress={() => handleFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.segmentLabel, { color: active ? '#FFFFFF' : colors.textSecondary }]}>
                {t(f.label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('alert.title')}</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>{t('alert.noAlerts')}</Text>
          </View>
        ) : (
          filtered.map((alert, i) => {
            const sev = SEVERITY_META[alert.severity];
            const iconName = ALERT_ICONS[alert.type] || 'warning-outline';
            return (
              <Animated.View key={alert.id} entering={FadeIn.duration(300).delay(i * 40)}>
                <TouchableOpacity
                  style={[styles.alertCard, { backgroundColor: colors.surface, borderLeftColor: sev.color }]}
                  onPress={() => navigation.navigate('AlertDetail', { alert })}
                  activeOpacity={0.85}
                >
                  {/* Severity stripe */}
                  <View style={[styles.sevStripe, { backgroundColor: sev.color }]} />

                  <View style={styles.alertContent}>
                    <View style={styles.alertTop}>
                      <View style={[styles.alertIconWrap, { backgroundColor: sev.bg }]}>
                        <Ionicons name={sev.icon as any} size={16} color={sev.color} />
                      </View>
                      <View style={styles.alertInfo}>
                        <View style={styles.alertTitleRow}>
                          <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={1}>{alert.title}</Text>
                          {!alert.read && <View style={styles.unreadDot} />}
                        </View>
                        <View style={styles.alertMeta}>
                          <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
                            <Text style={[styles.sevText, { color: sev.color }]}>{sev.desc}</Text>
                          </View>
                          <Text style={[styles.alertFarm, { color: colors.textLight }]}>{alert.farm}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                    </View>

                    <Text style={[styles.alertDesc, { color: colors.textSecondary }]} numberOfLines={2}>{alert.description}</Text>

                    <View style={styles.alertBottom}>
                      <View style={styles.alertBottomLeft}>
                        <Ionicons name={iconName as any} size={14} color={colors.textLight} />
                        <Text style={[styles.alertTime, { color: colors.textLight }]}>{alert.timestamp}</Text>
                      </View>
                      {alert.resolved ? (
                        <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
                          <Ionicons name="checkmark-circle" size={12} color="#059669" />
                          <Text style={styles.statusText}>{t('alert.resolved')}</Text>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.resolveBtn} onPress={() => {}}>
                          <Text style={[styles.resolveText, { color: colors.primary }]}>{t('alert.action.markResolved')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 17, fontWeight: '700' },
  unreadBadge: { backgroundColor: '#D62828', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadCount: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  filterScroll: { maxHeight: 52, marginVertical: spacing.sm },
  filterContent: { paddingHorizontal: spacing.md, gap: spacing.sm, alignItems: 'center', flexDirection: 'row' },
  segment: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: 'transparent' },
  segmentLabel: { fontSize: 13, fontWeight: '600' },
  list: { padding: spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl * 2, gap: spacing.sm },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', paddingHorizontal: spacing.xl },
  alertCard: { flexDirection: 'row', borderRadius: radius.xl, marginBottom: spacing.sm, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  sevStripe: { width: 4 },
  alertContent: { flex: 1, padding: spacing.md },
  alertTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  alertIconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  alertInfo: { flex: 1, marginRight: spacing.xs },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  alertTitle: { fontSize: 14, fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626' },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  sevBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  sevText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  alertFarm: { fontSize: 11, fontWeight: '500' },
  alertDesc: { fontSize: 13, lineHeight: 18, marginBottom: spacing.sm },
  alertBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertBottomLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  alertTime: { fontSize: 11, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#059669' },
  resolveBtn: {},
  resolveText: { fontSize: 12, fontWeight: '600' },
});
