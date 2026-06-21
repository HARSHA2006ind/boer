import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { getCrops } from '../services/cropService';
import { Crop } from '../types';
import { colors, spacing, radius } from '../theme';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Button from '../components/Button';

interface Props { navigation: any; route: any }

export default function CropListScreen({ navigation, route }: Props) {
  const { farmId } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) return;
    try { setCrops(await getCrops(farmId)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user, farmId]);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); fetch(); return unsub; }, [navigation, fetch]);

  if (loading) return <Loading fullScreen />;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Crop Diary</Text>
      <Text style={styles.subtitle}>{crops.length} crop{crops.length !== 1 ? 's' : ''} recorded</Text>
      <Button title="+ Record New Crop" onPress={() => navigation.navigate('CropForm', { farmId })} style={styles.addBtn} />
      {crops.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyText}>No crops recorded yet</Text>
        </View>
      ) : crops.map((crop) => (
        <TouchableOpacity key={crop.id} onPress={() => navigation.navigate('CropDetail', { cropId: crop.id })} activeOpacity={0.85}>
          <Card>
            <View style={styles.cropHeader}>
              <Text style={styles.cropName}>{crop.crop_name}</Text>
              <Text style={styles.cropSeason}>{crop.season}</Text>
            </View>
            <Text style={styles.cropMeta}>Sown: {crop.sowing_date || '—'} • Harvest: {crop.expected_harvest_date || '—'}</Text>
            {crop.area_allocated ? <Text style={styles.cropArea}>{crop.area_allocated} {crop.area_unit}</Text> : null}
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
  addBtn: { marginBottom: spacing.md },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  cropHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  cropName: { fontSize: 16, fontWeight: '600', color: colors.text },
  cropSeason: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  cropMeta: { fontSize: 13, color: colors.textSecondary },
  cropArea: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
