import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { IncomeRecord } from '../types';
import { getIncomeRecords, deleteIncomeRecord } from '../services/incomeService';
import { colors, spacing, radius } from '../theme';
import Card from '../components/Card';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import showConfirm from '../components/ConfirmDialog';
import Button from '../components/Button';

interface Props { navigation: any; route: any }

export default function IncomeListScreen({ navigation, route }: Props) {
  const farmId = route.params?.farmId;
  const [records, setRecords] = useState<(IncomeRecord & { farms: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try { setRecords(await getIncomeRecords(farmId)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [farmId]);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); fetch(); return unsub; }, [navigation, fetch]);

  const handleDelete = (rec: IncomeRecord) => {
    showConfirm({ title: 'Delete', message: `Delete income from "${rec.buyer_name || '—'}"?`, destructive: true, onConfirm: async () => { try { await deleteIncomeRecord(rec.id); setRecords(prev => prev.filter(r => r.id !== rec.id)); } catch (err: any) { console.error(err); } } });
  };

  const total = records.reduce((s, r) => s + (r.amount || 0), 0);
  if (loading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={records} keyExtractor={i => i.id} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            <Card><Text style={styles.totalLabel}>Total Income</Text><Text style={styles.totalAmount}>₹{total.toLocaleString()}</Text></Card>
            <Button title="+ Add Income" onPress={() => navigation.navigate('IncomeForm', { farmId })} style={styles.addBtn} />
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('IncomeForm', { incomeId: item.id })} activeOpacity={0.85}>
            <Card>
              <View style={styles.itemHeader}>
                <Text style={styles.cropName}>{item.crop_name}</Text>
                <Text style={styles.amount}>₹{item.amount?.toLocaleString()}</Text>
              </View>
              <Text style={styles.meta}>{item.farms?.name || '—'} {item.buyer_name ? `• Buyer: ${item.buyer_name}` : ''}</Text>
              <View style={styles.itemFooter}>
                <Text style={styles.date}>{item.income_date || '—'} • {item.quantity} {item.quantity_unit}</Text>
                <TouchableOpacity onPress={() => handleDelete(item)}><Text style={styles.deleteIcon}>🗑️</Text></TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="💵" title="No Income Records" message="Record your crop sales" actionLabel="+ Add Income" onAction={() => navigation.navigate('IncomeForm', { farmId })} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  totalLabel: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  totalAmount: { fontSize: 32, fontWeight: '800', color: colors.success, textAlign: 'center', marginTop: spacing.xs },
  addBtn: { marginBottom: spacing.md },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  cropName: { fontSize: 16, fontWeight: '600', color: colors.text },
  amount: { fontSize: 16, fontWeight: '700', color: colors.success },
  meta: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: colors.textLight },
  deleteIcon: { fontSize: 16 },
});
