import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, radius, shadows } from '../theme';

const { width } = Dimensions.get('window');

interface Props { navigation: any }

export default function FinancialDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const startOfMonth = new Date(); startOfMonth.setDate(1);
        const [incomeRes, expenseRes] = await Promise.all([
          supabase.from('income_records').select('amount').eq('user_id', user.id).gte('income_date', startOfMonth.toISOString()),
          supabase.from('expenses').select('amount').eq('user_id', user.id).gte('expense_date', startOfMonth.toISOString()),
        ]);
        if (incomeRes.data) setIncome(incomeRes.data.reduce((s, r) => s + Number(r.amount), 0));
        if (expenseRes.data) setExpenses(expenseRes.data.reduce((s, r) => s + Number(r.amount), 0));
      } catch {}
      finally { setLoading(false); }
    }
    fetchData();
  }, [user]);

  const profit = income - expenses;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finance</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Month</Text>
          <Text style={[styles.summaryAmount, { color: profit >= 0 ? colors.success : colors.danger }]}>
            {profit >= 0 ? '+' : ''}₹{Math.abs(profit).toLocaleString('en-IN')}
          </Text>
          <Text style={styles.summarySub}>{profit >= 0 ? 'Net Profit' : 'Net Loss'}</Text>
        </View>

        {/* Income / Expenses */}
        <View style={styles.breakdownRow}>
          <View style={[styles.breakdownCard, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="trending-up" size={20} color={colors.success} />
            <Text style={styles.breakdownLabel}>Income</Text>
            <Text style={[styles.breakdownAmount, { color: colors.success }]}>₹{income.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.breakdownCard, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="trending-down" size={20} color={colors.danger} />
            <Text style={styles.breakdownLabel}>Expenses</Text>
            <Text style={[styles.breakdownAmount, { color: colors.danger }]}>₹{expenses.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.linksCard}>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('IncomeForm')}>
            <View style={[styles.linkIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="add-circle-outline" size={20} color={colors.success} />
            </View>
            <Text style={styles.linkLabel}>Add Income</Text>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.linkDivider} />
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('ExpenseForm')}>
            <View style={[styles.linkIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="remove-circle-outline" size={20} color={colors.danger} />
            </View>
            <Text style={styles.linkLabel}>Add Expense</Text>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </TouchableOpacity>
          <View style={styles.linkDivider} />
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('TransactionHistory')}>
            <View style={[styles.linkIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.linkLabel}>View All Transactions</Text>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  summaryCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md, ...shadows.sm },
  summaryLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryAmount: { fontSize: 40, fontWeight: '800', marginVertical: spacing.xs, letterSpacing: -1 },
  summarySub: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  breakdownRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  breakdownCard: { flex: 1, borderRadius: radius.xl, padding: spacing.md, alignItems: 'center' },
  breakdownLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginTop: spacing.xs },
  breakdownAmount: { fontSize: 22, fontWeight: '800', marginTop: spacing.xs },
  linksCard: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadows.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  linkIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  linkLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '600' },
  linkDivider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 36 + spacing.md },
});
