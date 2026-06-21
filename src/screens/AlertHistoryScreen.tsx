import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { spacing, radius, colors } from '../theme';

const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;
type Severity = (typeof SEVERITY_LEVELS)[number];

interface AlertItem {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: Severity;
  source: string;
  affectedFarm?: string;
  status: string;
  date: string;
  time: string;
}

const severityConfig: Record<Severity, { indicator: string; label: string; cardBg: string; indicatorBg: string; textColor: string }> = {
  critical: { indicator: '#DC2626', label: 'Critical', cardBg: '#FEF2F2', indicatorBg: '#FEE2E2', textColor: '#991B1B' },
  high: { indicator: '#EA580C', label: 'High', cardBg: '#FFF7ED', indicatorBg: '#FED7AA', textColor: '#9A3412' },
  medium: { indicator: '#CA8A04', label: 'Medium', cardBg: '#FEFCE8', indicatorBg: '#FEF08A', textColor: '#854D0E' },
  low: { indicator: '#3B82F6', label: 'Low', cardBg: '#EFF6FF', indicatorBg: '#BFDBFE', textColor: '#1E40AF' },
};

const MOCK_ALERTS: AlertItem[] = [
  { id: '1', type: 'heat_wave', title: 'Heat Wave Warning', description: 'Temperature expected to reach 42°C in your region. Keep livestock hydrated.', severity: 'critical', source: 'IMD Weather', affectedFarm: 'Main Farm', status: 'Active', date: '20 Jun 2026', time: '2 hours ago' },
  { id: '2', type: 'heavy_rain', title: 'Heavy Rain Expected', description: '80% chance of heavy rainfall tomorrow. Prepare drainage systems.', severity: 'high', source: 'IMD Weather', affectedFarm: 'Main Farm', status: 'Active', date: '20 Jun 2026', time: '5 hours ago' },
  { id: '3', type: 'pest', title: 'Pest Risk Warning', description: 'Aphids reported in nearby cotton fields. Inspect your crop immediately.', severity: 'high', source: 'Community Report', status: 'Active', date: '19 Jun 2026', time: '1 day ago' },
  { id: '4', type: 'flood', title: 'Waterlogging Risk', description: 'Continuous rainfall may cause waterlogging in low-lying areas.', severity: 'medium', source: 'IMD Weather', affectedFarm: 'Organic Plot', status: 'Monitoring', date: '18 Jun 2026', time: '2 days ago' },
  { id: '5', type: 'pest', title: 'Fungal Infection Advisory', description: 'Humid conditions favor fungal growth. Apply fungicide as precaution.', severity: 'medium', source: 'Agriculture Dept', status: 'Resolved', date: '17 Jun 2026', time: '3 days ago' },
];

const alertIcons: Record<string, string> = {
  heavy_rain: 'rainy-outline',
  cyclone: 'alert-circle-outline',
  heat_wave: 'sunny-outline',
  flood: 'water-outline',
  pest: 'bug-outline',
};

interface Props { navigation: any }

export default function AlertHistoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<Severity | 'all'>('all');

  const filtered = useMemo(
    () => activeFilter === 'all' ? MOCK_ALERTS : MOCK_ALERTS.filter(a => a.severity === activeFilter),
    [activeFilter],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Alert History</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {(['all', ...SEVERITY_LEVELS] as const).map(level => {
          const config = level !== 'all' ? severityConfig[level] : null;
          return (
            <TouchableOpacity
              key={level}
              onPress={() => setActiveFilter(level)}
              style={[styles.filterChip, activeFilter === level && { backgroundColor: config?.indicator || '#2F5D50', borderColor: config?.indicator || '#2F5D50' }]}
            >
              {config && <View style={[styles.filterDot, { backgroundColor: config.indicator }]} />}
              <Text style={[styles.filterText, activeFilter === level && { color: '#FFFFFF' }]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        {filtered.map((alert, i) => {
          const config = severityConfig[alert.severity];
          const icon = alertIcons[alert.type] || 'warning-outline';
          const isResolved = alert.status === 'Resolved';
          return (
            <Animated.View key={alert.id} entering={FadeInUp.duration(400).delay(i * 80)}>
              <View style={[styles.alertCard, { backgroundColor: config.cardBg }]}>
                {/* Severity indicator bar */}
                <View style={[styles.severityBar, { backgroundColor: config.indicator }]} />

                <View style={styles.cardContent}>
                  {/* Top row: icon + title + severity badge */}
                  <View style={styles.alertTop}>
                    <View style={[styles.iconWrap, { backgroundColor: config.indicatorBg }]}>
                      <Ionicons name={icon as any} size={18} color={config.indicator} />
                    </View>
                    <View style={styles.alertInfo}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      <Text style={[styles.alertSeverity, { color: config.textColor }]}>{config.label}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isResolved ? '#D1FAE5' : '#FEF3C7' }]}>
                      <Text style={[styles.statusText, { color: isResolved ? '#065F46' : '#92400E' }]}>{alert.status}</Text>
                    </View>
                  </View>

                  {/* Description */}
                  <Text style={styles.alertDesc}>{alert.description}</Text>

                  {/* Meta row: date, source, farm */}
                  <View style={styles.alertMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                      <Text style={styles.metaText}>{alert.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="server-outline" size={11} color="#9CA3AF" />
                      <Text style={styles.metaText}>{alert.source}</Text>
                    </View>
                    {alert.affectedFarm && (
                      <View style={styles.metaItem}>
                        <Ionicons name="leaf-outline" size={11} color="#9CA3AF" />
                        <Text style={styles.metaText}>{alert.affectedFarm}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F2' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E7E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  filterRow: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingVertical: spacing.sm },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  list: { padding: spacing.md, gap: spacing.md },
  alertCard: {
    borderRadius: radius.md,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  severityBar: { width: 5 },
  cardContent: { flex: 1, padding: spacing.md, gap: spacing.sm },
  alertTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  iconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', lineHeight: 18 },
  alertSeverity: { fontSize: 10, fontWeight: '700', marginTop: 1 },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  statusText: { fontSize: 9, fontWeight: '700' },
  alertDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginLeft: 0 },
  alertMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
});
