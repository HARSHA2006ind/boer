import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, shadows } from '../theme';

interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'image';
}

export default function Card({ title, subtitle, children, style, variant = 'default' }: Props) {
  return (
    <View style={[
      styles.base,
      variant === 'glass' && styles.glass,
      variant === 'image' && styles.image,
      style,
    ]}>
      {title && <Text style={[styles.title, variant === 'glass' && styles.titleGlass]}>{title}</Text>}
      {subtitle && <Text style={[styles.subtitle, variant === 'glass' && styles.subtitleGlass]}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  glass: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  image: {
    backgroundColor: 'transparent',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  titleGlass: { color: '#FFFFFF' },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  subtitleGlass: { color: 'rgba(255,255,255,0.7)' },
});
