import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

interface Props {
  farmerName: string;
  village: string;
  district: string;
  time: string;
  type: string;
  content: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  onPress: () => void;
  onLike: () => void;
}

const BADGES: Record<string, { bg: string; text: string; label: string }> = {
  pest_alert: { bg: '#FEE2E2', text: colors.danger, label: '⚠️ Alert' },
  success_story: { bg: '#FEF3C7', text: '#92400E', label: '🌟 Story' },
  question: { bg: '#DBEAFE', text: '#1E40AF', label: '❓ Q&A' },
  tip: { bg: '#D1FAE5', text: '#065F46', label: '💡 Tip' },
};

export default function CommunityPostCard({ farmerName, village, district, time, type, content, likes, comments, isLiked, onPress, onLike }: Props) {
  const badge = BADGES[type];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.95} onPress={onPress}>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={36} color={colors.primary} />
        <View style={styles.meta}>
          <Text style={styles.name}>{farmerName}</Text>
          <Text style={styles.loc}>{village}, {district} · {time}</Text>
        </View>
        {badge && <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}><Text style={[styles.typeText, { color: badge.text }]}>{badge.label}</Text></View>}
      </View>
      <Text style={styles.content}>{content}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={onLike}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={18} color={isLiked ? colors.danger : colors.textSecondary} />
          <Text style={styles.actionText}>{likes + (isLiked ? 1 : 0)}</Text>
        </TouchableOpacity>
        <View style={styles.action}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.actionText}>{comments}</Text>
        </View>
        <TouchableOpacity style={styles.action}>
          <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: spacing.sm },
  meta: { flex: 1, marginLeft: spacing.sm },
  name: { fontSize: 14, fontWeight: '700' as const, color: colors.text },
  loc: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  typeBadge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  typeText: { fontSize: 10, fontWeight: '700' as const },
  content: { fontSize: 14, lineHeight: 20, color: colors.text, fontWeight: '500' as const, marginBottom: spacing.md },
  actions: { flexDirection: 'row' as const, gap: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  action: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.xs },
  actionText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' as const },
};
