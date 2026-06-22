import { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import { duration } from '../theme/motion';

export interface HomeAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedFarm?: string;
}

const SEV_META: Record<string, { color: string; bg: string; icon: string }> = {
  critical: { color: '#EF4444', bg: '#FEE2E2', icon: 'alert-circle' },
  high: { color: '#F59E0B', bg: '#FFF7ED', icon: 'warning' },
  medium: { color: '#3B82F6', bg: '#EFF6FF', icon: 'alert-outline' },
  low: { color: '#64748B', bg: '#F3F4F6', icon: 'information-circle-outline' },
};

interface Props {
  alerts: HomeAlert[];
  onViewAll: () => void;
  onAlertPress: (alert: HomeAlert) => void;
}

function AlertsSection({ alerts, onViewAll, onAlertPress }: Props) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const visible = useMemo(() => alerts.filter(a => a.severity === 'critical' || a.severity === 'high'), [alerts]);

  return (
    <Animated.View entering={FadeIn.duration(duration.normal)} style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: SEV_META.critical.color }]}>
            <Ionicons name="warning" size={12} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('alert.title')}</Text>
          {visible.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: SEV_META.critical.color }]}>
              <Text style={styles.countText}>{visible.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>{t('home.alerts.viewAll')}</Text>
        </TouchableOpacity>
      </View>
      {alerts.length > 0 ? (
        <View style={styles.list}>
          {alerts.slice(0, 3).map((alert, i) => {
            const sev = SEV_META[alert.severity] || SEV_META.medium;
            return (
              <Animated.View key={alert.id} entering={FadeIn.duration(300).delay(i * 60)}>
                <TouchableOpacity
                  style={[styles.alertCard, { backgroundColor: sev.bg }]}
                  onPress={() => onAlertPress(alert)}
                  activeOpacity={0.8}
                >
                  <View style={styles.alertLeft}>
                    <Ionicons name={sev.icon as any} size={18} color={sev.color} />
                  </View>
                  <View style={styles.alertMid}>
                    <Text style={[styles.alertTitle, { color: sev.color }]} numberOfLines={1}>{alert.title}</Text>
                    {alert.description ? <Text style={styles.alertDesc} numberOfLines={1}>{alert.description}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={sev.color} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      ) : (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="shield-checkmark" size={18} color="#059669" />
          </View>
          <Text style={styles.emptyText}>All clear — no active alerts</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  countBadge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 1 },
  countText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  viewAllText: { fontSize: 13, fontWeight: '600' },
  list: { gap: spacing.sm },
  alertCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, padding: spacing.sm + 2, gap: spacing.sm },
  alertLeft: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  alertMid: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: '700' },
  alertDesc: { fontSize: 11, color: '#64748B', marginTop: 1 },
  empty: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, justifyContent: 'center' },
  emptyIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#059669', fontWeight: '600' },
});

export default memo(AlertsSection);
