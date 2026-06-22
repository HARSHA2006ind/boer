import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n/LanguageContext';
import { spacing, radius, shadows } from '../theme';

interface Props {
  revenue: number;
  expenses: number;
  profit: number;
  month: string;
  onViewDetails: () => void;
}

function FinanceSnapshotCard({ revenue, expenses, profit, month, onViewDetails }: Props) {
  const { t } = useLanguage();
  const currency = '₹';

  const hasData = revenue > 0 || expenses > 0;

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(450)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="wallet-outline" size={16} color="#14B8A6" />
          <Text style={styles.title}>{t('home.finance.title')}</Text>
        </View>
        <Text style={styles.month}>{month}</Text>
      </View>
      {hasData ? (
        <>
          <View style={styles.row}>
            <FinanceItem label={t('home.finance.revenue')} value={`${currency}${revenue.toLocaleString('en-IN')}`} color="#22C55E" icon="trending-up" />
            <View style={styles.divider} />
            <FinanceItem label={t('home.finance.expenses')} value={`${currency}${expenses.toLocaleString('en-IN')}`} color="#EF4444" icon="trending-down" />
          </View>
          <View style={styles.profitRow}>
            <View style={[styles.profitBadge, profit >= 0 ? styles.profitPositive : styles.profitNegative]}>
              <Ionicons name={profit >= 0 ? 'arrow-up' : 'arrow-down'} size={12} color={profit >= 0 ? '#22C55E' : '#EF4444'} />
            </View>
            <View>
              <Text style={styles.profitLabel}>{t('home.finance.profit')}</Text>
              <Text style={[styles.profitValue, { color: profit >= 0 ? '#22C55E' : '#EF4444' }]}>
                {profit >= 0 ? '+' : ''}{currency}{Math.abs(profit).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="wallet-outline" size={24} color="#CBD5E1" />
          <Text style={styles.emptyText}>{t('home.finance.noData')}</Text>
        </View>
      )}
      <TouchableOpacity onPress={onViewDetails} style={styles.viewBtn} activeOpacity={0.7}>
        <Text style={styles.viewBtnText}>{t('home.finance.viewDetails')}</Text>
        <Ionicons name="chevron-forward" size={14} color="#14B8A6" />
      </TouchableOpacity>
    </Animated.View>
  );
}

function FinanceItem({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <View style={styles.financeItem}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={styles.financeLabel}>{label}</Text>
      <Text style={[styles.financeValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  month: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  financeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  financeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  financeValue: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  profitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F6F7FB',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  profitBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profitPositive: {
    backgroundColor: '#ECFDF5',
  },
  profitNegative: {
    backgroundColor: '#FEF2F2',
  },
  profitLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  profitValue: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    gap: 4,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14B8A6',
  },
});

export default memo(FinanceSnapshotCard);
