import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

const ALERTS = [
  { id: '1', type: 'pest', title: 'Fall Armyworm Reported', area: 'Coimbatore, Tamil Nadu', severity: 'high', action: 'Inspect maize crops immediately. Apply recommended pesticides.', time: '2h ago', reporter: 'Kumaraswamy' },
  { id: '2', type: 'disease', title: 'Tomato Disease Outbreak', area: 'Kolar, Karnataka', severity: 'critical', action: 'Remove infected plants. Apply copper fungicide. Avoid overhead irrigation.', time: '4h ago', reporter: 'Venkatesh' },
  { id: '3', type: 'weather', title: 'Heavy Rainfall Warning', area: 'Sangareddy, Telangana', severity: 'high', action: 'Delay irrigation. Check drainage systems. Secure standing crops.', time: '6h ago', reporter: 'Boer Weather' },
  { id: '4', type: 'pest', title: 'Pest Spread Risk Increased', area: 'Guntur, Andhra Pradesh', severity: 'medium', action: 'Monitor crops daily. Set up pheromone traps. Apply preventive spray.', time: '12h ago', reporter: 'Agriculture Dept' },
  { id: '5', type: 'disease', title: 'Powdery Mildew in Grapes', area: 'Nashik, Maharashtra', severity: 'high', action: 'Apply sulfur spray. Improve air circulation by pruning.', time: '1d ago', reporter: 'Rahul Sharma' },
  { id: '6', type: 'weather', title: 'Heat Wave Expected', area: 'Nagpur, Maharashtra', severity: 'medium', action: 'Increase irrigation frequency. Provide shade for young plants.', time: '1d ago', reporter: 'Boer Weather' },
];

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#991B1B', bg: '#FEE2E2', label: 'Critical' },
  high: { color: '#92400E', bg: '#FEF3C7', label: 'High' },
  medium: { color: '#1E40AF', bg: '#DBEAFE', label: 'Medium' },
  low: { color: '#065F46', bg: '#D1FAE5', label: 'Low' },
};

const TYPE_ICONS: Record<string, string> = { pest: 'bug', disease: 'medkit', weather: 'rainy', price: 'trending-up' };

export default function RegionalAlertsScreen() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? ALERTS : ALERTS.filter(a => a.type === filter);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {['all', 'pest', 'disease', 'weather'].map(f => {
          const active = filter === f;
          return (
            <TouchableOpacity key={f} style={[styles.filterChip, active && styles.filterActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map(alert => {
          const sev = SEVERITY_CONFIG[alert.severity];
          return (
            <View key={alert.id} style={[styles.alertCard, { borderLeftColor: sev.color, borderLeftWidth: 4 }]}>
              <View style={styles.alertHeader}>
                <View style={styles.alertTypeRow}>
                  <View style={[styles.alertIconBg, { backgroundColor: sev.bg }]}>
                    <Ionicons name={TYPE_ICONS[alert.type] as any} size={18} color={sev.color} />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertArea}>{alert.area}</Text>
                  </View>
                </View>
                <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
                  <Text style={[styles.sevText, { color: sev.color }]}>{sev.label}</Text>
                </View>
              </View>

              <View style={styles.alertBody}>
                <Text style={styles.alertAction}>⚠️ {alert.action}</Text>
              </View>

              <View style={styles.alertFooter}>
                <Text style={styles.alertReporter}>Reported by {alert.reporter}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterLabelActive: { color: '#FFFFFF' },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  alertCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  alertTypeRow: { flexDirection: 'row', flex: 1, gap: spacing.md },
  alertIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  alertArea: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  sevBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  sevText: { fontSize: 10, fontWeight: '800' },
  alertBody: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  alertAction: { fontSize: 13, lineHeight: 18, color: colors.text, fontWeight: '500' },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  alertReporter: { fontSize: 10, color: colors.textLight, fontWeight: '600' },
  alertTime: { fontSize: 10, color: colors.textLight, fontWeight: '600' },
});
