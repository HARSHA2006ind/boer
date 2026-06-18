import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getExpenses } from '../services/expenseService';
import { getIncomeRecords } from '../services/incomeService';
import { Expense, IncomeRecord } from '../types';
import { colors, spacing, radius, shadows } from '../theme';
import Card from '../components/Card';
import Loading from '../components/Loading';

type Transaction = {
  type: 'income' | 'expense';
  title: string;
  amount: number;
  date: string;
  farm?: string;
  category?: string;
};

export default function TransactionHistoryScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const fetchAll = useCallback(async () => {
    if (!user) return;
    try {
      const [exp, inc] = await Promise.all([getExpenses(), getIncomeRecords()]);
      const tx: Transaction[] = [
        ...inc.map(i => ({ type: 'income' as const, title: i.crop_name, amount: i.amount, date: i.income_date, farm: i.farms?.name })),
        ...exp.map(e => ({ type: 'expense' as const, title: e.title, amount: e.amount, date: e.expense_date, farm: e.farms?.name, category: e.category })),
      ];
      tx.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setTransactions(tx);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  if (loading) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={colors.primary} />}
    >
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>₹{totalIncome.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>₹{totalExpense.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={[styles.summaryValue, { color: totalIncome - totalExpense >= 0 ? colors.success : colors.error }]}>
            ₹{(totalIncome - totalExpense).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as const).map(f => (
          <Text key={f} style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'income' ? '💰 Income' : '💸 Expense'}
          </Text>
        ))}
      </View>

      {filtered.length > 0 ? (
        <Card>
          {filtered.map((t, i) => (
            <View key={i} style={styles.txRow}>
              <View style={styles.txLeft}>
                <Text style={[styles.txType, t.type === 'income' ? styles.txIncome : styles.txExpense]}>
                  {t.type === 'income' ? '↓' : '↑'}
                </Text>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{t.title}</Text>
                  <Text style={styles.txMeta}>
                    {t.farm || '—'} • {t.date || '—'}
                    {t.category ? ` • ${t.category}` : ''}
                  </Text>
                </View>
              </View>
              <Text style={[styles.txAmount, t.type === 'income' ? styles.txIncome : styles.txExpense]}>
                ₹{t.amount?.toLocaleString()}
              </Text>
            </View>
          ))}
        </Card>
      ) : (
        <Card><Text style={styles.empty}>No transactions found.</Text></Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  summaryRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.md },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: colors.border },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  summaryValue: { fontSize: 16, fontWeight: '800', marginTop: spacing.xs },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  filterBtn: { flex: 1, textAlign: 'center', paddingVertical: spacing.sm + 2, borderRadius: radius.pill, backgroundColor: colors.surface, fontSize: 12, fontWeight: '600', color: colors.textSecondary, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  filterActive: { backgroundColor: colors.primaryDark, color: '#FFFFFF', borderColor: colors.primaryDark },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  txType: { fontSize: 16, fontWeight: '700', marginRight: spacing.sm, width: 24, textAlign: 'center' },
  txIncome: { color: colors.success },
  txExpense: { color: colors.error },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  txMeta: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '600' },
  empty: { fontSize: 14, color: colors.textLight, textAlign: 'center', paddingVertical: spacing.lg },
});
