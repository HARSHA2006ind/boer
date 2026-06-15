import { supabase } from './supabase';
import { Expense } from '../types';

export const EXPENSE_CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Labour',
  'Machinery',
  'Irrigation',
  'Transportation',
  'Miscellaneous',
] as const;

export async function getExpenses(farmId?: string) {
  let query = supabase
    .from('expenses')
    .select('*, farms(name)')
    .order('expense_date', { ascending: false });
  if (farmId) query = query.eq('farm_id', farmId);
  const { data, error } = await query;
  if (error) throw error;
  return data as (Expense & { farms: { name: string } })[];
}

export async function getExpense(id: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, farms(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Expense & { farms: { name: string } };
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
    .single();
  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(id: string, expense: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getMonthlyExpenses(userId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount, expense_date, category')
    .eq('user_id', userId);
  if (error) throw error;
  return data as { amount: number; expense_date: string; category: string }[];
}

export async function getTotalExpenses(userId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as { amount: number }[]).reduce((sum, e) => sum + (e.amount || 0), 0);
}

export const ExpenseService = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlyExpenses,
  getTotalExpenses,
  EXPENSE_CATEGORIES,
};
