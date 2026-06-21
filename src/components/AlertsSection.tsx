import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, shadows } from '../theme';

export interface HomeAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedFarm?: string;
}

const ALERT_META: Record<string, { icon: string; label: string }> = {
  heavy_rain: { icon: 'rainy-outline', label: 'Weather' },
  cyclone: { icon: 'alert-circle-outline', label: 'Storm' },
  heat_wave: { icon: 'sunny-outline', label: 'Heat' },
  flood: { icon: 'water-outline', label: 'Flood' },
  pest: { icon: 'bug-outline', label: 'Pest' },
};

const SEV_CONFIG: Record<string, { bg: string; dot: string; label: string }> = {
  critical: { bg: '#FDF2F2', dot: '#C0392B', label: 'CRITICAL' },
  high: { bg: '#FFF8F0', dot: '#D4872F', label: 'HIGH' },
  medium: { bg: '#EFF6FF', dot: '#3B82F6', label: 'MEDIUM' },
  low: { bg: '#F3F4F6', dot: '#6B7280', label: 'LOW' },
};

interface Props {
  alerts: HomeAlert[];
  onViewAll: () => void;
  onPress?: () => void;
}

function AlertsSection({ alerts, onViewAll, onPress }: Props) {
  const visible = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Animated.View entering={FadeInUp.duration(500).delay(200)} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBadge}>
              <Ionicons name="warning" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Alert Center</Text>
          </View>
          {visible.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{visible.length}</Text>
            </View>
          )}
        </View>
        {alerts.length > 0 ? (
          <View style={styles.list}>
            {alerts.slice(0, 3).map((alert, i) => {
              const meta = ALERT_META[alert.type] || { icon: 'warning-outline', label: 'Alert' };
              const sev = SEV_CONFIG[alert.severity] || SEV_CONFIG.medium;
              return (
                <Animated.View
                  key={alert.id}
                  entering={FadeInUp.duration(400).delay(300 + i * 100)}
                  style={[styles.alertCard, { backgroundColor: sev.bg }]}
                >
                  <View style={styles.alertLeft}>
                    <View style={[styles.sevDot, { backgroundColor: sev.dot }]} />
                    <Ionicons name={meta.icon as any} size={16} color={sev.dot} />
                  </View>
                  <View style={styles.alertMid}>
                    <View style={styles.alertTitleRow}>
                      <Text style={[styles.alertTitle, { color: sev.dot }]}>{alert.title}</Text>
                      <Text style={styles.alertSev}>{sev.label}</Text>
                    </View>
                    {alert.description ? (
                      <Text style={styles.alertDesc} numberOfLines={1}>{alert.description}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                </Animated.View>
              );
            })}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="shield-checkmark" size={18} color="#2D8A4E" />
            </View>
            <Text style={styles.emptyText}>All clear — no active alerts</Text>
          </View>
        )}
        <View style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>View All Alerts</Text>
          <Ionicons name="chevron-forward" size={14} color="#2F5D50" />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#C0392B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  countBadge: {
    backgroundColor: '#C0392B',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  countText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  list: { gap: spacing.sm },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sevDot: { width: 4, height: 24, borderRadius: 2 },
  alertMid: { flex: 1 },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  alertTitle: { fontSize: 13, fontWeight: '700' },
  alertSev: { fontSize: 8, fontWeight: '800', color: '#9CA3AF', letterSpacing: 0.5 },
  alertDesc: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: 13, color: '#2D8A4E', fontWeight: '600' },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    gap: 4,
  },
  viewBtnText: { fontSize: 13, fontWeight: '600', color: '#2F5D50' },
});

export default memo(AlertsSection);
