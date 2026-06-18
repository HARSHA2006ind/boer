import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

interface Props {
  title: string;
  summary: string;
  icon: string;
  readingTime: string;
  onPress: () => void;
}

export default function LearningCard({ title, summary, icon, readingTime, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.summary} numberOfLines={2}>{summary}</Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={12} color={colors.textLight} />
          <Text style={styles.time}>{readingTime}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

const styles = {
  card: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  icon: { fontSize: 28, marginRight: spacing.md },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700' as const, color: colors.text },
  summary: { fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 15 },
  meta: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4, marginTop: spacing.xs },
  time: { fontSize: 10, color: colors.textLight, fontWeight: '600' as const },
};
