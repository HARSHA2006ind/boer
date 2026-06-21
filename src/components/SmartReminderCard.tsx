import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, shadows } from '../theme';

export interface Reminder {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
}

interface Props {
  reminders: Reminder[];
  onViewAll: () => void;
  onPress?: () => void;
}

function SmartReminderCard({ reminders, onViewAll, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bulb-outline" size={16} color="#2F5D50" />
          <Text style={styles.title}>Smart Reminder</Text>
        </View>
      </View>
      {reminders.length > 0 ? (
        <View style={styles.list}>
          {reminders.slice(0, 3).map((r, i) => (
            <Animated.View
              key={r.id}
              entering={FadeInUp.duration(400).delay(350 + i * 100)}
              style={[styles.reminderCard, { backgroundColor: r.bgColor }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: r.color + '20' }]}>
                <Text style={styles.reminderIcon}>{r.icon}</Text>
              </View>
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitle}>{r.title}</Text>
                <Text style={styles.reminderSub}>{r.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={r.color} />
            </Animated.View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle" size={22} color="#2D8A4E" />
          <Text style={styles.emptyText}>All caught up</Text>
        </View>
      )}
      <TouchableOpacity onPress={onViewAll} style={styles.viewBtn} activeOpacity={0.7}>
        <Text style={styles.viewBtnText}>View Full Schedule</Text>
        <Ionicons name="chevron-forward" size={14} color="#2F5D50" />
      </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  list: {
    gap: spacing.sm,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderIcon: {
    fontSize: 18,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reminderSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
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
    color: '#2D8A4E',
    fontWeight: '600',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    gap: 4,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F5D50',
  },
});

export default memo(SmartReminderCard);
