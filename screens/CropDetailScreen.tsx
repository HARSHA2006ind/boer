import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getCrop, deleteCrop } from '../services/cropService';
import { Crop } from '../types';
import { colors, spacing, radius } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import showConfirm from '../components/ConfirmDialog';

interface Props { navigation: any; route: any }

export default function CropDetailScreen({ navigation, route }: Props) {
  const { cropId } = route.params;
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCrop(); }, [cropId]);

  async function fetchCrop() {
    try { setCrop(await getCrop(cropId)); }
    catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }

  const handleDelete = () => {
    showConfirm({
      title: 'Delete Crop', message: `Delete "${crop?.crop_name}"?`, destructive: true,
      onConfirm: async () => { try { await deleteCrop(cropId); navigation.goBack(); } catch (err: any) { Alert.alert('Error', err.message); } },
    });
  };

  if (loading) return <Loading fullScreen />;
  if (!crop) return <Loading fullScreen message="Crop not found" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={['#D4A843', '#E8B84A', '#F0D68A']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.heroOverlay}>
          <Text style={styles.cropIcon}>🌱</Text>
          <Text style={styles.cropName}>{crop.crop_name}</Text>
          <View style={styles.badgeRow}>
            {crop.season ? <View style={styles.badge}><Text style={styles.badgeText}>{crop.season}</Text></View> : null}
          </View>
        </View>
      </LinearGradient>
      <Card title="Timeline">
        <InfoRow label="Sowing Date" value={crop.sowing_date} />
        <InfoRow label="Expected Harvest" value={crop.expected_harvest_date} />

      </Card>
      <Card title="Area">
        <InfoRow label="Area Allocated" value={crop.area_allocated ? `${crop.area_allocated} ${crop.area_unit}` : '—'} />
      </Card>
      {crop.notes ? (
        <Card title="Notes"><Text style={styles.notes}>{crop.notes}</Text></Card>
      ) : null}
      <View style={styles.actions}>
        <Button title="✏️ Edit Crop" variant="outline" onPress={() => navigation.navigate('CropForm', { farmId: crop.farm_id, cropId: crop.id })} />
        <Button title="🗑️ Delete Crop" variant="outline" onPress={handleDelete} textStyle={{ color: colors.error }} style={{ borderColor: colors.error }} />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: { height: 180, justifyContent: 'flex-end', padding: spacing.md, marginBottom: spacing.md },
  heroOverlay: { backgroundColor: 'rgba(0,0,0,0.2)', padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  cropIcon: { fontSize: 40, marginBottom: spacing.sm },
  cropName: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: spacing.xs },
  badgeRow: { flexDirection: 'row', gap: spacing.sm },
  badge: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.xs, borderRadius: radius.pill },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  notes: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  actions: { padding: spacing.md, gap: spacing.sm },
});
