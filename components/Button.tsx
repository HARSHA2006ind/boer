import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export default function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, style, textStyle, icon }: Props) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isGlass = variant === 'glass';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        isGlass && styles.glass,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : colors.primary} />
      ) : (
        <>
          {icon ? <Text style={[styles.icon, isPrimary && styles.iconPrimary]}>{icon}</Text> : null}
          <Text style={[
            styles.text,
            isPrimary && styles.textPrimary,
            isOutline && styles.textOutline,
            isGhost && styles.textGhost,
            isGlass && styles.textGlass,
            size === 'sm' && styles.textSm,
            size === 'lg' && styles.textLg,
            textStyle,
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  glass: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  lg: { paddingVertical: spacing.lg - 4, paddingHorizontal: spacing.xl },
  disabled: { opacity: 0.5 },
  icon: { fontSize: 18 },
  iconPrimary: { color: '#FFF' },
  text: { ...typography.button },
  textPrimary: { color: '#FFFFFF' },
  textOutline: { color: colors.primary },
  textGhost: { color: colors.primary },
  textGlass: { color: '#FFFFFF' },
  textSm: { fontSize: 14 },
  textLg: { fontSize: 18 },
});
