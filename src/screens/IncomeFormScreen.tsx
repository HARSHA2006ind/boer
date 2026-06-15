import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { getIncomeRecord, createIncomeRecord, updateIncomeRecord } from '../services/incomeService';
import { colors, radius, spacing } from '../theme';
import Button from '../components/Button';
import Loading from '../components/Loading';
import SearchableSelect from '../components/SearchableSelect';
import { CROPS } from '../data/farming';
import { Farm } from '../types';

const QUANTITY_UNITS = ['Kg', 'Quintal', 'Ton', 'Bags', 'Pieces', 'Crates', 'Boxes', 'Litres', 'Other'];

interface Props { navigation: any; route: any }

export default function IncomeFormScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { incomeId, farmId: paramFarmId } = route.params || {};
  const [cropName, setCropName] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('Kg');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [buyerName, setBuyerName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState(paramFarmId || '');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { loadFarms(); if (incomeId) loadIncome(); else setFetching(false); }, [incomeId]);

  async function loadFarms() { try { const { data, error } = await supabase.from('farms').select('*').eq('user_id', user!.id).order('name'); if (error) throw error; setFarms(data || []); } catch (err) { console.error(err); } }

  async function loadIncome() { try { const d = await getIncomeRecord(incomeId); setCropName(d.crop_name); setAmount(String(d.amount)); setQuantity(String(d.quantity || '')); setQuantityUnit(d.quantity_unit || 'Kg'); setIncomeDate(d.income_date || ''); setBuyerName(d.buyer_name || ''); setNotes(d.notes || ''); setSelectedFarmId(d.farm_id); } catch (err: any) { Alert.alert('Error', err.message); navigation.goBack(); } finally { setFetching(false); } }

  async function handleSave() {
    if (!cropName.trim() || !amount || !selectedFarmId) { Alert.alert('Validation', 'Crop name, amount, and farm are required'); return; }
    setLoading(true);
    const payload = { user_id: user!.id, farm_id: selectedFarmId, crop_id: null, crop_name: cropName.trim(), amount: parseFloat(amount) || 0, quantity: parseFloat(quantity) || 0, quantity_unit: quantityUnit, income_date: incomeDate, buyer_name: buyerName.trim(), notes: notes.trim() };
    try { if (incomeId) await updateIncomeRecord(incomeId, payload); else await createIncomeRecord(payload); navigation.goBack(); }
    catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  }

  if (fetching) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{incomeId ? 'Edit Income' : 'Add Income'}</Text>

      <Text style={styles.label}>Farm</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {farms.map(f => (
          <TouchableOpacity key={f.id} style={[styles.chip, selectedFarmId === f.id && styles.chipActive]} onPress={() => setSelectedFarmId(f.id)}>
            <Text style={[styles.chipText, selectedFarmId === f.id && styles.chipTextActive]}>{f.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SearchableSelect label="Crop Sold *" options={CROPS} value={cropName} onSelect={setCropName} icon="🌾" searchPlaceholder="Search crops..." />
      <InputField label="Amount Received (₹)" value={amount} onChangeText={setAmount} placeholder="e.g. 50000" keyboardType="decimal-pad" />
      <InputField label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="e.g. 100" keyboardType="decimal-pad" />
      <SearchableSelect label="Quantity Unit" options={QUANTITY_UNITS} value={quantityUnit} onSelect={setQuantityUnit} icon="⚖️" />
      <InputField label="Date (YYYY-MM-DD)" value={incomeDate} onChangeText={setIncomeDate} placeholder="2026-06-14" />
      <InputField label="Buyer Name" value={buyerName} onChangeText={setBuyerName} placeholder="Mandi Trader" />
      <InputField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes..." multiline style={styles.multiline} />

      <View style={styles.buttons}>
        <Button title={incomeId ? 'Update Income' : 'Save Income'} onPress={handleSave} loading={loading} size="lg" />
        <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} />
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
