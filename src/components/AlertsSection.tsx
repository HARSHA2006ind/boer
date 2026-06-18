import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import { spacing, radius, shadows } from '../theme';

export interface HomeAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const severityConfig: Record<string, { color: string; bg: string; icon: string }> = {
  critical: { color: '#EF4444', bg: '#FEF2F2', icon: 'warning' },
  high: { color: '#F97316', bg: '#FFF7ED', icon: 'alert-circle' },
  medium: { color: '#6B7280', bg: '#F3F4F6', icon: 'information-circle' },
  low: { color: '#3B82F6', bg: '#EFF6FF', icon: 'information-circle-outline' },
};

interface Props {
  alerts: HomeAlert[];
  onViewAll: () => void;
}

function AlertsSection({ alerts, onViewAll }: Props) {
  const { t } = useLanguage();
  const visible = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high');

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(200)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications" size={16} color="#1E6F50" />
          <Text style={styles.title}>{t('home.alerts.title')}</Text>
        </View>
        <Text style={styles.count}>
          {visible.length > 0
            ? `${visible.length} ${t('home.alerts.requireAttention').replace('{count}', visible.length.toString())}`
            : t('home.alerts.title')}
        </Text>
      </View>
      {alerts.length > 0 ? (
        <View style={styles.list}>
          {alerts.slice(0, 3).map((alert, i) => {
            const cfg = severityConfig[alert.severity] || severityConfig.low;
            return (
              <Animated.View
                key={alert.id}
                entering={FadeInUp.duration(400).delay(300 + i * 100)}
                style={[styles.alertCard, { borderLeftColor: cfg.color }]}
              >
                <View style={[styles.alertIcon, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDesc} numberOfLines={1}>
                    {alert.description}
                  </Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.severityText, { color: cfg.color }]}>
                    {t(`home.alerts.severity.${alert.severity}`)}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.emptyText}>{t('home.todayPlan.noTasks')}</Text>
        </View>
      )}
      <TouchableOpacity onPress={onViewAll} style={styles.viewAllBtn} activeOpacity={0.7}>
        <Text style={styles.viewAllText}>{t('home.alerts.viewAll')}</Text>
        <Ionicons name="chevron-forward" size={14} color="#1E6F50" />
      </TouchableOpacity>
    </Animated.View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  count: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  list: {
    gap: spacing.sm,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8F6',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderLeftWidth: 3,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  alertDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  severityBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: spacing.xs,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E6F50',
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  emptyText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
});

export default memo(AlertsSection);
