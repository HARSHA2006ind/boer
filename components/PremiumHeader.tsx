import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: { icon: string; onPress: () => void };
}

export default function PremiumHeader({ title, subtitle, onBack, rightAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>{rightAction.icon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  left: { width: 48, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 48, alignItems: 'flex-end' },
  backBtn: { padding: spacing.sm },
  backIcon: { fontSize: 24, color: colors.primary, fontWeight: '700' },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  actionBtn: { padding: spacing.sm },
  actionIcon: { fontSize: 22 },
});
