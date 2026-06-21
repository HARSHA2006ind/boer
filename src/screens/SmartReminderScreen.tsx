import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { spacing, radius } from '../theme';

interface ReminderItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  date: string;
}

interface WeatherTip {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const REMINDERS: ReminderItem[] = [
  { id: '1', icon: '💧', title: 'Irrigation Recommended Today', subtitle: 'Soil moisture levels at 32%. Water required for rice field.', color: '#3B82F6', bgColor: '#EFF6FF', date: 'Today' },
  { id: '2', icon: '🌾', title: 'Harvest Window Opens In 3 Days', subtitle: 'Paddy in North field ready for harvest from Jun 22.', color: '#2D8A4E', bgColor: '#ECFDF5', date: 'Jun 22' },
  { id: '3', icon: '🧪', title: 'Fertilizer Application Due', subtitle: 'Apply NPK (20-10-10) to active wheat crop.', color: '#D4872F', bgColor: '#FFF8F0', date: 'Jun 20' },
  { id: '4', icon: '🔧', title: 'Equipment Maintenance Due', subtitle: 'Tractor service overdue by 15 days.', color: '#6B7280', bgColor: '#F3F4F6', date: 'Overdue' },
  { id: '5', icon: '🌱', title: 'Sowing Window Opens Next Week', subtitle: 'Optimal time for Kharif cropping from Jun 25.', color: '#6B705C', bgColor: '#F0FDF4', date: 'Jun 25' },
];

const WEATHER_TIPS: WeatherTip[] = [
  { id: 'w1', icon: '🌡️', title: 'Temperature Alert', desc: 'Max 42°C tomorrow. Irrigate early morning.' },
  { id: 'w2', icon: '🌧️', title: 'Rain Expected', desc: '80% chance of rain. Delay fertilizer application.' },
  { id: 'w3', icon: '💨', title: 'Wind Advisory', desc: 'High winds (25 km/h). Secure crop covers.' },
];

interface Props { navigation: any }

export default function SmartReminderScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Smart Reminder</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Weather Tips */}
        <Text style={styles.sectionTitle}>Weather-Based Suggestions</Text>
        <View style={styles.tipsRow}>
          {WEATHER_TIPS.map((tip, i) => (
            <Animated.View key={tip.id} entering={FadeInUp.duration(400).delay(i * 100)} style={styles.tipCard}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Reminders */}
        <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
        {REMINDERS.map((r, i) => (
          <Animated.View key={r.id} entering={FadeInUp.duration(400).delay(300 + i * 80)}>
            <View style={[styles.reminderCard, { backgroundColor: r.bgColor }]}>
              <View style={[styles.iconWrap, { backgroundColor: r.color + '20' }]}>
                <Text style={styles.reminderIcon}>{r.icon}</Text>
              </View>
              <View style={styles.reminderContent}>
                <View style={styles.reminderTop}>
                  <Text style={styles.reminderTitle}>{r.title}</Text>
                  <Text style={[styles.reminderDate, { color: r.color }]}>{r.date}</Text>
                </View>
                <Text style={styles.reminderSub}>{r.subtitle}</Text>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* Crop Calendar */}
        <Text style={styles.sectionTitle}>Crop Calendar</Text>
        <Animated.View entering={FadeInUp.duration(400).delay(800)} style={styles.calendarCard}>
          <View style={styles.calRow}>
            <View style={styles.calDot} />
            <Text style={styles.calText}>Jun Sowing Season Begins</Text>
          </View>
          <View style={styles.calRow}>
            <View style={[styles.calDot, { backgroundColor: '#D4872F' }]} />
            <Text style={styles.calText}>Jul — Fertilizer Application</Text>
          </View>
          <View style={styles.calRow}>
            <View style={[styles.calDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.calText}>Aug — Pest Control Schedule</Text>
          </View>
          <View style={styles.calRow}>
            <View style={[styles.calDot, { backgroundColor: '#2D8A4E' }]} />
            <Text style={styles.calText}>Sep — Harvest Period</Text>
          </View>
        </Animated.View>

        {/* Soil Health */}
        <Text style={styles.sectionTitle}>Soil Health</Text>
        <Animated.View entering={FadeInUp.duration(400).delay(900)} style={styles.soilCard}>
          <View style={styles.soilRow}>
            <Text style={styles.soilLabel}>pH Level</Text>
            <View style={styles.soilBar}>
              <View style={[styles.soilFill, { width: '65%', backgroundColor: '#2D8A4E' }]} />
            </View>
            <Text style={styles.soilValue}>6.5</Text>
          </View>
          <View style={styles.soilRow}>
            <Text style={styles.soilLabel}>Nitrogen</Text>
            <View style={styles.soilBar}>
              <View style={[styles.soilFill, { width: '45%', backgroundColor: '#D4872F' }]} />
            </View>
            <Text style={styles.soilValue}>Medium</Text>
          </View>
          <View style={styles.soilRow}>
            <Text style={styles.soilLabel}>Phosphorus</Text>
            <View style={styles.soilBar}>
              <View style={[styles.soilFill, { width: '30%', backgroundColor: '#C0392B' }]} />
            </View>
            <Text style={styles.soilValue}>Low</Text>
          </View>
          <View style={styles.soilRow}>
            <Text style={styles.soilLabel}>Potassium</Text>
            <View style={styles.soilBar}>
              <View style={[styles.soilFill, { width: '55%', backgroundColor: '#3B82F6' }]} />
            </View>
            <Text style={styles.soilValue}>Medium</Text>
          </View>
        </Animated.View>
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
  scroll: { paddingBottom: spacing.xl },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  tipsRow: { paddingHorizontal: spacing.md, gap: spacing.sm },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipIcon: { fontSize: 22 },
  tipTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  tipDesc: { fontSize: 11, color: '#6B7280' },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  reminderIcon: { fontSize: 20 },
  reminderContent: { flex: 1 },
  reminderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reminderTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  reminderDate: { fontSize: 11, fontWeight: '700', marginLeft: spacing.xs },
  reminderSub: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  calRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  calDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6B705C' },
  calText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  soilCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  soilRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  soilLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', width: 70 },
  soilBar: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  soilFill: { height: '100%', borderRadius: 4 },
  soilValue: { fontSize: 12, fontWeight: '700', color: '#374151', width: 50, textAlign: 'right' },
});
