import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadows } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  gradient?: [string, string];
}

export default function QuickActionCard({ icon, title, subtitle, onPress, gradient }: Props) {
  const content = (
    <View style={styles.content}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      <Text style={styles.arrow}>→</Text>
    </View>
  );

  if (gradient) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.container}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.container}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: { fontSize: 28, marginRight: spacing.md },
  textBlock: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 18, color: colors.textLight, marginLeft: spacing.sm },
});
