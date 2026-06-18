import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows } from '../../theme';

interface Props {
  name: string;
  icon: string;
  price: number;
  unit: string;
  change: number;
  trend: 'up' | 'down';
  isFav: boolean;
  onPress: () => void;
  onToggleFav: () => void;
}

export default function CropPriceCard({ name, icon, price, unit, change, trend, isFav, onPress, onToggleFav }: Props) {
  const isUp = trend === 'up';
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.unit}>per {unit}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>₹{price.toLocaleString('en-IN')}</Text>
        <View style={[styles.badge, isUp ? styles.up : styles.down]}>
          <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={12} color={isUp ? colors.success : colors.danger} />
          <Text style={[styles.change, isUp ? { color: colors.success } : { color: colors.danger }]}>{isUp ? '+' : ''}{change}%</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.fav} onPress={onToggleFav}>
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={18} color={isFav ? colors.danger : colors.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = {
  card: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
  left: { flexDirection: 'row' as const, alignItems: 'center' as const, flex: 1, gap: spacing.md },
  icon: { fontSize: 32 },
  name: { fontSize: 16, fontWeight: '700' as const, color: colors.text },
  unit: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  right: { alignItems: 'flex-end' as const, marginRight: spacing.sm },
  price: { fontSize: 17, fontWeight: '800' as const, color: colors.text },
  badge: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 2, marginTop: 2, paddingHorizontal: spacing.sm, paddingVertical: 1, borderRadius: radius.pill },
  up: { backgroundColor: '#E8F5E9' },
  down: { backgroundColor: '#FEE2E2' },
  change: { fontSize: 11, fontWeight: '700' as const },
  fav: { padding: spacing.xs },
};
