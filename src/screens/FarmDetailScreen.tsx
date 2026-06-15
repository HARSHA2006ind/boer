import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { Farm } from '../types';
import { colors, spacing, radius } from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';

interface Props { navigation: any; route: any }

export default function FarmDetailScreen({ navigation, route }: Props) {
  const { farmId } = route.params;
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFarm(); }, [farmId]);

  async function fetchFarm() {
    try {
      const { data, error } = await supabase.from('farms').select('*').eq('id', farmId).single();
      if (error) throw error;
      setFarm(data);
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }

  const handleDelete = () => {
    Alert.alert('Delete Farm', `Delete "${farm?.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await supabase.from('farms').delete().eq('id', farmId); navigation.goBack(); }
        catch (err: any) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  if (loading) return <Loading fullScreen />;
  if (!farm) return <Loading fullScreen message="Farm not found" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={['#4A6B12', '#6B8E23', '#8FB848']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.heroOverlay}>
          <Text style={styles.heroName}>{farm.name}</Text>
          <View style={styles.badgeRow}>
            {farm.soil_type ? <View style={styles.badge}><Text style={styles.badgeText}>{farm.soil_type}</Text></View> : null}
            {farm.water_source ? <View style={styles.badge}><Text style={styles.badgeText}>{farm.water_source}</Text></View> : null}
            {farm.current_crop ? <View style={styles.badge}><Text style={styles.badgeText}>{farm.current_crop}</Text></View> : null}
          </View>
        </View>
      </LinearGradient>

      <Card title="Location">
        <InfoRow label="Country" value={farm.country} />
        <InfoRow label="State" value={farm.state} />
        <InfoRow label="District" value={farm.district} />
        <InfoRow label="Village" value={farm.village} />
        <InfoRow label="Area" value={farm.location} />
      </Card>

      <Card title="Land Details">
        <InfoRow label="Land Area" value={`${farm.land_area_value || 0} ${farm.land_area_unit || ''}`} />
        <InfoRow label="Soil Type" value={farm.soil_type} />
        <InfoRow label="Water Source" value={farm.water_source} />
        <InfoRow label="Current Crop" value={farm.current_crop} />
      </Card>

      {farm.notes ? (
        <Card title="Notes"><Text style={styles.notes}>{farm.notes}</Text></Card>
      ) : null}

      <View style={styles.actions}>
        <Button title="🌱 View Crops" onPress={() => navigation.navigate('CropList', { farmId: farm.id })} />
        <Button title="✏️ Edit Farm" variant="outline" onPress={() => navigation.navigate('AddEditFarm', { farmId: farm.id })} />
        <Button title="🗑️ Delete Farm" variant="outline" onPress={handleDelete} textStyle={{ color: colors.error }} style={{ borderColor: colors.error }} />
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
  hero: { height: 200, justifyContent: 'flex-end', padding: spacing.md },
  heroOverlay: { backgroundColor: 'rgba(0,0,0,0.3)', padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
  heroName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: spacing.sm },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.pill },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  notes: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  actions: { padding: spacing.md, gap: spacing.sm },
});
