import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Farm } from '../types';
import { colors, spacing } from '../theme';
import FarmCard from '../components/FarmCard';
import Loading from '../components/Loading';
import Button from '../components/Button';

interface Props { navigation: any }

export default function FarmListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFarms = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('farms').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setFarms(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { const unsub = navigation.addListener('focus', fetchFarms); fetchFarms(); return unsub; }, [navigation, fetchFarms]);

  if (loading) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFarms(); }} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Farms</Text>
        <Text style={styles.subtitle}>{farms.length} farm{farms.length !== 1 ? 's' : ''} registered</Text>
      </View>

      {farms.map((farm) => (
        <FarmCard
          key={farm.id}
          name={farm.name}
          village={farm.village}
          landArea={`${farm.land_area_value || ''} ${farm.land_area_unit || ''}`.trim()}
          soilType={farm.soil_type}
          onPress={() => navigation.navigate('FarmDetail', { farmId: farm.id })}
        />
      ))}

      <Button title="+ Add New Farm" onPress={() => navigation.navigate('AddEditFarm')} style={styles.addBtn} />

      {farms.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🌾</Text>
          <Text style={styles.emptyTitle}>No Farms Yet</Text>
          <Text style={styles.emptyText}>Add your first farm to start tracking</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.md },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  addBtn: { marginTop: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});
