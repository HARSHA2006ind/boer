import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getExpenses, getMonthlyExpenses, EXPENSE_CATEGORIES } from '../services/expenseService';
import { getIncomeRecords } from '../services/incomeService';
import { Expense, IncomeRecord } from '../types';
import { colors, spacing, radius } from '../theme';
import Card from '../components/Card';
import Loading from '../components/Loading';

interface Props { navigation: any }

const CATEGORY_COLORS: Record<string, string> = {
  Seeds: '#4CAF50', Fertilizers: '#FF9800', Pesticides: '#F44336',
  Labour: '#2196F3', Machinery: '#9C27B0', Irrigation: '#00BCD4',
  Transportation: '#FF5722', Miscellaneous: '#607D8B',
};

export default function FinancialDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<(Expense & { farms: { name: string } })[]>([]);
  const [incomes, setIncomes] = useState<(IncomeRecord & { farms: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    try { const [exp, inc] = await Promise.all([getExpenses(), getIncomeRecords()]); setExpenses(exp); setIncomes(inc); }
    catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { const unsub = navigation.addListener('focus', fetchAll); fetchAll(); return unsub; }, [navigation, fetchAll]);

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalIncome = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  const categoryTotals = EXPENSE_CATEGORIES.map(cat => ({ category: cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0) })).filter(c => c.total > 0);
  const recentTransactions = [
    ...incomes.slice(0, 5).map(i => ({ type: 'income' as const, title: i.crop_name, amount: i.amount, date: i.income_date, farm: i.farms?.name })),
    ...expenses.slice(0, 5).map(e => ({ type: 'expense' as const, title: e.title, amount: e.amount, date: e.expense_date, farm: e.farms?.name })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 10);

  if (loading) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={colors.primary} />}
    >
      <Card>
        <Text style={styles.netLabel}>Net {netProfit >= 0 ? 'Profit' : 'Loss'}</Text>
        <Text style={[styles.netAmount, netProfit >= 0 ? styles.profit : styles.loss]}>₹{Math.abs(netProfit).toLocaleString()}</Text>
        <View style={styles.netRow}>
          <View style={styles.netItem}><Text style={styles.netItemLabel}>Income</Text><Text style={[styles.netItemValue, { color: colors.success }]}>₹{totalIncome.toLocaleString()}</Text></View>
          <View style={styles.netItem}><Text style={styles.netItemLabel}>Expenses</Text><Text style={[styles.netItemValue, { color: colors.error }]}>₹{totalExpenses.toLocaleString()}</Text></View>
        </View>
      </Card>

      <View style={styles.quickLinks}>
        <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('ExpenseList')}><Text style={styles.quickIcon}>💰</Text><Text style={styles.quickLabel}>Expenses</Text></TouchableOpacity>
        <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('IncomeList')}><Text style={styles.quickIcon}>💵</Text><Text style={styles.quickLabel}>Income</Text></TouchableOpacity>
        <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('ExpenseForm')}><Text style={styles.quickIcon}>➕</Text><Text style={styles.quickLabel}>Add Expense</Text></TouchableOpacity>
        <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('IncomeForm')}><Text style={styles.quickIcon}>➕</Text><Text style={styles.quickLabel}>Add Income</Text></TouchableOpacity>
      </View>

      {categoryTotals.length > 0 && (
        <Card title="Expenses by Category">
          {categoryTotals.map(c => (
            <View key={c.category} style={styles.catRow}>
              <View style={styles.catLeft}><View style={[styles.catDot, { backgroundColor: CATEGORY_COLORS[c.category] || '#607D8B' }]} /><Text style={styles.catName}>{c.category}</Text></View>
              <Text style={styles.catAmount}>₹{c.total.toLocaleString()}</Text>
            </View>
          ))}
        </Card>
      )}

      {recentTransactions.length > 0 && (
        <Card title="Recent Transactions">
          {recentTransactions.map((t, i) => (
            <View key={i} style={styles.txRow}>
              <View style={styles.txLeft}>
                <Text style={[styles.txType, t.type === 'income' ? styles.txIncome : styles.txExpense]}>{t.type === 'income' ? '↓' : '↑'}</Text>
                <View style={styles.txInfo}><Text style={styles.txTitle}>{t.title}</Text><Text style={styles.txMeta}>{t.farm || '—'} • {t.date || '—'}</Text></View>
              </View>
              <Text style={[styles.txAmount, t.type === 'income' ? styles.txIncome : styles.txExpense]}>₹{t.amount?.toLocaleString()}</Text>
            </View>
          ))}
        </Card>
      )}

      {recentTransactions.length === 0 && (
        <Card><Text style={styles.empty}>No transactions yet. Start tracking!</Text></Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  netLabel: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  netAmount: { fontSize: 36, fontWeight: '800', textAlign: 'center', marginVertical: spacing.sm },
  profit: { color: colors.success },
  loss: { color: colors.error },
  netRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.sm },
  netItem: { alignItems: 'center' },
  netItemLabel: { fontSize: 12, color: colors.textLight },
  netItemValue: { fontSize: 18, fontWeight: '700', marginTop: spacing.xs },
  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  quickLink: { flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  quickIcon: { fontSize: 28, marginBottom: spacing.xs },
  quickLabel: { fontSize: 13, color: colors.text, fontWeight: '500' },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  catLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  catDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  catName: { fontSize: 14, color: colors.textSecondary },
  catAmount: { fontSize: 14, fontWeight: '600', color: colors.text },
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
