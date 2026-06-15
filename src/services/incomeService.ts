import { supabase } from './supabase';
import { IncomeRecord } from '../types';

export async function getIncomeRecords(farmId?: string) {
  let query = supabase
    .from('income_records')
    .select('*, farms(name)')
    .order('income_date', { ascending: false });
  if (farmId) query = query.eq('farm_id', farmId);
  const { data, error } = await query;
  if (error) throw error;
  return data as (IncomeRecord & { farms: { name: string } })[];
}

export async function getIncomeRecord(id: string) {
  const { data, error } = await supabase
    .from('income_records')
    .select('*, farms(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as IncomeRecord & { farms: { name: string } };
}

export async function createIncomeRecord(income: Omit<IncomeRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('income_records')
    .insert([income])
    .select()
    .single();
  if (error) throw error;
  return data as IncomeRecord;
}

export async function updateIncomeRecord(id: string, income: Partial<Omit<IncomeRecord, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('income_records')
    .update(income)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as IncomeRecord;
}

export async function deleteIncomeRecord(id: string) {
  const { error } = await supabase
    .from('income_records')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getTotalIncome(userId: string) {
  const { data, error } = await supabase
    .from('income_records')
    .select('amount')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as { amount: number }[]).reduce((sum, e) => sum + (e.amount || 0), 0);
}

export const IncomeService = {
  getIncomeRecords,
  getIncomeRecord,
  createIncomeRecord,
  updateIncomeRecord,
  deleteIncomeRecord,
  getTotalIncome,
};
