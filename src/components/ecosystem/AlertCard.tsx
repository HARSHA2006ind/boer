import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

interface Props {
  title: string;
  area: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  type: string;
  time: string;
  reporter: string;
}

const SEV: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#991B1B', bg: '#FEE2E2', label: 'Critical' },
  high: { color: '#92400E', bg: '#FEF3C7', label: 'High' },
  medium: { color: '#1E40AF', bg: '#DBEAFE', label: 'Medium' },
  low: { color: '#065F46', bg: '#D1FAE5', label: 'Low' },
};

const TYPE_ICONS: Record<string, string> = { pest: 'bug', disease: 'medkit', weather: 'rainy', price: 'trending-up' };

export default function AlertCard({ title, area, severity, action, type, time, reporter }: Props) {
  const sev = SEV[severity] || SEV.medium;
  return (
    <View style={[styles.card, { borderLeftColor: sev.color, borderLeftWidth: 4 }]}>
      <View style={styles.header}>
        <View style={styles.typeRow}>
          <View style={[styles.icon, { backgroundColor: sev.bg }]}>
            <Ionicons name={TYPE_ICONS[type] as any} size={18} color={sev.color} />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.area}>{area}</Text>
          </View>
        </View>
        <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
          <Text style={[styles.sevText, { color: sev.color }]}>{sev.label}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.action}>⚠️ {action}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.reporter}>Reported by {reporter}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

const styles = {
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  header: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'flex-start' as const },
  typeRow: { flexDirection: 'row' as const, flex: 1, gap: spacing.md },
  icon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center' as const, alignItems: 'center' as const },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700' as const, color: colors.text },
  area: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  sevBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  sevText: { fontSize: 10, fontWeight: '800' as const },
  body: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  action: { fontSize: 13, lineHeight: 18, color: colors.text, fontWeight: '500' as const },
  footer: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginTop: spacing.sm },
  reporter: { fontSize: 10, color: colors.textLight, fontWeight: '600' as const },
  time: { fontSize: 10, color: colors.textLight, fontWeight: '600' as const },
};
