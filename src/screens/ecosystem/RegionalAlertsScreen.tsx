import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';
import { fetchAlerts } from '../../services/alertService';
import { RegionalAlert } from '../../types';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#991B1B', bg: '#FEE2E2', label: 'Critical' },
  high: { color: '#92400E', bg: '#FEF3C7', label: 'High' },
  medium: { color: '#1E40AF', bg: '#DBEAFE', label: 'Medium' },
  low: { color: '#065F46', bg: '#D1FAE5', label: 'Low' },
};

const TYPE_ICONS: Record<string, string> = { pest: 'bug', disease: 'medkit', weather: 'rainy', price: 'trending-up' };

export default function RegionalAlertsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState<RegionalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    const data = await fetchAlerts();
    setAlerts(data);
    setLoading(false);
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.filterRow}>
        {['all', 'pest', 'disease', 'weather', 'price'].map(f => {
          const active = filter === f;
          return (
            <TouchableOpacity key={f} style={[styles.filterChip, active && styles.filterActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}>
        {loading ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            <Text style={styles.emptyText}>No alerts in this category</Text>
          </View>
        ) : (
          filtered.map(alert => {
            const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.medium;
            const icon = TYPE_ICONS[alert.type] || 'warning';
            return (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={[styles.severityDot, { backgroundColor: sev.color }]} />
                  <View style={[styles.iconCircle, { backgroundColor: sev.bg }]}>
                    <Ionicons name={icon as any} size={16} color={sev.color} />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertArea}>{alert.affected_area}</Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
                    <Text style={[styles.severityLabel, { color: sev.color }]}>{sev.label}</Text>
                  </View>
                </View>
                <Text style={styles.alertDesc}>{alert.description}</Text>
                <View style={styles.alertFooter}>
                  <View style={styles.actionRow}>
                    <Ionicons name="bulb-outline" size={13} color={colors.primary} />
                    <Text style={styles.actionText}>{alert.recommended_action}</Text>
                  </View>
                  <View style={styles.reporterRow}>
                    <Ionicons name="person-outline" size={11} color={colors.textLight} />
                    <Text style={styles.reporterText}>{alert.farmer_name} · {getTimeAgo(alert.created_at)}</Text>
                  </View>
                </View>
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
  loadingContainer: { paddingVertical: spacing.xxl * 2, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { paddingVertical: spacing.xxl * 2, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textLight, fontWeight: '500' },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterLabelActive: { color: '#FFFFFF' },
  list: { padding: spacing.md },
  alertCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  severityDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  alertArea: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  severityBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  severityLabel: { fontSize: 10, fontWeight: '700' },
  alertDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.sm },
  alertFooter: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, gap: spacing.xs },
  actionRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start' },
  actionText: { fontSize: 12, color: colors.text, fontWeight: '500', flex: 1, lineHeight: 17 },
  reporterRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  reporterText: { fontSize: 10, color: colors.textLight, fontWeight: '500' },
});
