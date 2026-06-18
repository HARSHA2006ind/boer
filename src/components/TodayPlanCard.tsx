import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import { spacing, radius, shadows } from '../theme';

export interface PlanTask {
  id: string;
  title: string;
  completed: boolean;
  icon?: string;
}

interface Props {
  tasks: PlanTask[];
  onViewFull: () => void;
}

function TodayPlanCard({ tasks, onViewFull }: Props) {
  const { t } = useLanguage();
  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? done / total : 0;

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(350)} style={styles.container}>
      <View style={styles.topBanner}>
        <View style={styles.bannerLeft}>
          <Ionicons name="calendar" size={16} color="#FFFFFF" />
          <Text style={styles.bannerTitle}>{t('home.todayPlan.title')}</Text>
        </View>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>{done}/{total}</Text>
        </View>
      </View>
      {total > 0 ? (
        <View style={styles.body}>
          {tasks.slice(0, 4).map((task, i) => (
            <Animated.View
              key={task.id}
              entering={FadeInUp.duration(300).delay(400 + i * 80)}
              style={styles.taskRow}
            >
              <View style={[styles.taskDot, task.completed && styles.taskDotDone]} />
              <Text style={[styles.taskTitle, task.completed && styles.taskDone]}>
                {task.title}
              </Text>
              <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
                {task.completed && <Ionicons name="checkmark" size={10} color="#FFFFFF" />}
              </View>
            </Animated.View>
          ))}
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {t('home.todayPlan.ofCompleted').replace('{done}', done.toString()).replace('{total}', total.toString())}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle" size={22} color="#10B981" />
          <Text style={styles.emptyText}>{t('home.todayPlan.noTasks')}</Text>
        </View>
      )}
      <TouchableOpacity onPress={onViewFull} style={styles.viewBtn} activeOpacity={0.7}>
        <Text style={styles.viewBtnText}>{t('home.todayPlan.viewFull')}</Text>
        <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  topBanner: {
    backgroundColor: '#1E6F50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  bannerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  taskDotDone: {
    backgroundColor: '#10B981',
  },
  taskTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: '#1E6F50',
    borderColor: '#1E6F50',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F1EF',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E6F50',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
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
  viewBtn: {
    backgroundColor: '#154D3A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: 4,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default memo(TodayPlanCard);
