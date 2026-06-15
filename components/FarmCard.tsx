import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadows } from '../theme';

interface Props {
  name: string;
  village: string;
  landArea?: string;
  soilType?: string;
  currentCrop?: string;
  weatherStatus?: string;
  aiActive?: boolean;
  onPress: () => void;
}

export default function FarmCard({ name, village, landArea, soilType, currentCrop, weatherStatus, aiActive, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <LinearGradient colors={['#4A6B12', '#6B8E23', '#8FB848']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            {soilType && <View style={styles.badge}><Text style={styles.badgeText}>{soilType}</Text></View>}
            {weatherStatus && <View style={styles.badge}><Text style={styles.badgeText}>{weatherStatus}</Text></View>}
          </View>
          {aiActive && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiText}>🤖 Active</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.location}>{village}</Text>
          <View style={styles.metaRow}>
            {landArea && <Text style={styles.meta}>{landArea}</Text>}
            {currentCrop && <Text style={styles.meta}>• {currentCrop}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.lg, overflow: 'hidden', height: 190, marginBottom: spacing.md, ...shadows.lg },
  gradient: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, justifyContent: 'space-between', padding: spacing.md, backgroundColor: 'rgba(0,0,0,0.25)' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, flex: 1, flexWrap: 'wrap' },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.pill },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  aiBadge: { backgroundColor: 'rgba(67,56,202,0.7)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill },
  aiText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  info: {},
  name: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  location: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  metaRow: { flexDirection: 'row', gap: spacing.xs },
  meta: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
});
