import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { getExpense, createExpense, updateExpense, EXPENSE_CATEGORIES } from '../services/expenseService';
import { colors, radius, spacing } from '../theme';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { Farm } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface Props { navigation: any; route: any }

export default function ExpenseFormScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { expenseId, farmId: paramFarmId } = route.params || {};
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState(paramFarmId || '');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { loadFarms(); if (expenseId) loadExpense(); else setFetching(false); }, [expenseId]);

  async function loadFarms() { try { const { data, error } = await supabase.from('farms').select('*').eq('user_id', user!.id).order('name'); if (error) throw error; setFarms(data || []); } catch (err) { console.error(err); } }

  async function loadExpense() { try { const d = await getExpense(expenseId); setTitle(d.title); setAmount(String(d.amount)); setCategory(d.category); setExpenseDate(d.expense_date || ''); setDescription(d.description || ''); setSelectedFarmId(d.farm_id); } catch (err: any) { Alert.alert('Error', err.message); navigation.goBack(); } finally { setFetching(false); } }

  async function handleSave() {
    if (!title.trim() || !amount || !selectedFarmId) { Alert.alert('Validation', `${t('expense.title')}, ${t('expense.amount')}, ${t('expense.farm')} ${t('common.required')}`); return; }
    setLoading(true);
    const payload = { user_id: user!.id, farm_id: selectedFarmId, title: title.trim(), category, amount: parseFloat(amount) || 0, expense_date: expenseDate, description: description.trim() };
    try { if (expenseId) await updateExpense(expenseId, payload); else await createExpense(payload); navigation.goBack(); }
    catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }

  if (fetching) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{expenseId ? t('expense.edit') : t('expense.add')}</Text>

      <Text style={styles.label}>{t('expense.farm')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {farms.map(f => (
          <TouchableOpacity key={f.id} style={[styles.chip, selectedFarmId === f.id && styles.chipActive]} onPress={() => setSelectedFarmId(f.id)}>
            <Text style={[styles.chipText, selectedFarmId === f.id && styles.chipTextActive]}>{f.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>{t('expense.category')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {EXPENSE_CATEGORIES.map(c => (
          <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <InputField label={t('expense.title')} value={title} onChangeText={setTitle} placeholder="e.g. Purchased seeds" />
      <InputField label={`${t('expense.amount')} (₹)`} value={amount} onChangeText={setAmount} placeholder="e.g. 5000" keyboardType="decimal-pad" />
      <InputField label={`${t('expense.date')} (YYYY-MM-DD)`} value={expenseDate} onChangeText={setExpenseDate} placeholder="2026-06-14" />
      <InputField label={t('expense.description')} value={description} onChangeText={setDescription} placeholder="Optional details..." multiline style={styles.multiline} />

      <View style={styles.buttons}>
        <Button title={expenseId ? t('expense.update') : t('expense.save')} onPress={handleSave} loading={loading} size="lg" />
        <Button title={t('common.cancel')} variant="outline" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

function InputField(props: any) {
  return (
    <View style={fieldStyles.group}>
      {props.label && <Text style={fieldStyles.label}>{props.label}</Text>}
      <TextInput style={[fieldStyles.input, props.multiline && fieldStyles.multiline]} placeholderTextColor={colors.textLight} {...props} />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: { marginBottom: spacing.sm + 4 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginLeft: 4 },
  input: { backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md - 2, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  chipScroll: { marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  buttons: { marginTop: spacing.md, gap: spacing.sm },
});
