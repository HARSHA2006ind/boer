import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Expense } from '../types';
import { getExpenses, deleteExpense, EXPENSE_CATEGORIES } from '../services/expenseService';
import { colors, spacing, radius, shadows } from '../theme';
import Card from '../components/Card';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import showConfirm from '../components/ConfirmDialog';
import Button from '../components/Button';

interface Props { navigation: any; route: any }

const CATEGORY_COLORS: Record<string, string> = {
  Seeds: '#4CAF50', Fertilizers: '#FF9800', Pesticides: '#F44336',
  Labour: '#2196F3', Machinery: '#9C27B0', Irrigation: '#00BCD4',
  Transportation: '#FF5722', Miscellaneous: '#607D8B',
};

export default function ExpenseListScreen({ navigation, route }: Props) {
  const farmId = route.params?.farmId;
  const [expenses, setExpenses] = useState<(Expense & { farms: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try { setExpenses(await getExpenses(farmId)); }
    catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [farmId]);

  useEffect(() => { const unsub = navigation.addListener('focus', fetch); fetch(); return unsub; }, [navigation, fetch]);

  const handleDelete = (exp: Expense) => {
    showConfirm({ title: 'Delete', message: `Delete "${exp.title}"?`, destructive: true, onConfirm: async () => { try { await deleteExpense(exp.id); setExpenses(prev => prev.filter(e => e.id !== exp.id)); } catch (err: any) { console.error(err); } } });
  };

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  if (loading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses} keyExtractor={i => i.id} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            <Card><Text style={styles.totalLabel}>Total Expenses</Text><Text style={styles.totalAmount}>₹{total.toLocaleString()}</Text></Card>
            <Button title="+ Add Expense" onPress={() => navigation.navigate('ExpenseForm', { farmId })} style={styles.addBtn} />
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ExpenseForm', { expenseId: item.id })} activeOpacity={0.85}>
            <Card>
              <View style={styles.itemHeader}>
                <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[item.category] || '#607D8B' }]} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>{item.category} • {item.farms?.name || '—'}</Text>
                </View>
                <Text style={styles.amount}>₹{item.amount?.toLocaleString()}</Text>
              </View>
              <View style={styles.itemFooter}>
                <Text style={styles.date}>{item.expense_date || '—'}</Text>
                <TouchableOpacity onPress={() => handleDelete(item)}><Text style={styles.deleteIcon}>🗑️</Text></TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="💰" title="No Expenses" message="Track your farm expenses" actionLabel="+ Add Expense" onAction={() => navigation.navigate('ExpenseForm', { farmId })} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  totalLabel: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  totalAmount: { fontSize: 32, fontWeight: '800', color: colors.error, textAlign: 'center', marginTop: spacing.xs },
  addBtn: { marginBottom: spacing.md },
  itemHeader: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  itemMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  amount: { fontSize: 16, fontWeight: '700', color: colors.error },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginLeft: 18 },
  date: { fontSize: 12, color: colors.textLight },
  deleteIcon: { fontSize: 16 },
});
