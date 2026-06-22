import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

interface Props {
  name: string;
  description: string;
  benefits: string;
  onPress: () => void;
}

export default function SchemeCard({ name, description, benefits, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </View>
      <View style={styles.footer}>
        <View style={styles.tag}><Text style={styles.tagText}>{benefits.substring(0, 30)}...</Text></View>
      </View>
    </TouchableOpacity>
  );
}

const styles = {
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, justifyContent: 'center' as const, alignItems: 'center' as const, marginRight: spacing.md },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700' as const, color: colors.text },
  desc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 17 },
  footer: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  tag: { backgroundColor: colors.secondary, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'flex-start' as const },
  tagText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' as const },
};
