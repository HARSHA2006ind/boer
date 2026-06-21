import { supabase } from './supabase';
import { Expense, IncomeRecord } from '../types';
import { financeRepository } from '../repositories/financeRepository';
import { syncQueue } from './syncQueue';

export const EXPENSE_CATEGORIES = [
  'Seeds', 'Fertilizers', 'Pesticides', 'Labour',
  'Machinery', 'Irrigation', 'Transportation', 'Miscellaneous',
] as const;

export async function getExpenses(farmId?: string) {
  try {
    let query = supabase
      .from('expenses')
      .select('*, farms(name)')
      .order('expense_date', { ascending: false });
    if (farmId) query = query.eq('farm_id', farmId);
    const { data, error } = await query;
    if (error) throw error;
    const expenses = data as (Expense & { farms: { name: string } })[];
    for (const e of expenses) await financeRepository.upsertExpense(e);
    return expenses;
  } catch {
    const local = await financeRepository.getExpenses(farmId);
    return local.map(e => ({ ...e, farms: { name: '' } })) as (Expense & { farms: { name: string } })[];
  }
}

export async function getExpense(id: string) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, farms(name)')
      .eq('id', id)
      .single();
    if (error) throw error;
    await financeRepository.upsertExpense(data as Expense);
    return data as Expense & { farms: { name: string } };
  } catch {
    const local = await financeRepository.getExpenseById(id);
    if (!local) throw new Error('Expense not found');
    return { ...local, farms: { name: '' } } as Expense & { farms: { name: string } };
  }
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = new Date().toISOString();
  const full: Expense = { ...expense, id, created_at: now, updated_at: now } as Expense;

  await financeRepository.upsertExpense(full);
  await syncQueue.add('expense', id, 'create', full);

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([full])
      .select()
      .single();
    if (error) throw error;
    const server = data as Expense;
    await financeRepository.markExpenseSynced(id);
    return server;
  } catch {
    return full;
  }
}

export async function updateExpense(id: string, expense: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>) {
  const now = new Date().toISOString();
  const updates = { ...expense, updated_at: now };

  const existing = await financeRepository.getExpenseById(id);
  if (existing) {
    const merged = { ...existing, ...updates };
    await financeRepository.upsertExpense(merged as Expense);
  }
  await syncQueue.add('expense', id, 'update', updates);

  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const server = data as Expense;
    await financeRepository.upsertExpense(server);
    await financeRepository.markExpenseSynced(id);
    return server;
  } catch {
    return existing ? { ...existing, ...updates } : updates;
  }
}

export async function deleteExpense(id: string) {
  await financeRepository.removeExpense(id);
  await syncQueue.add('expense', id, 'delete', { id });

  try {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  } catch {}
}

export async function getIncomeRecords(farmId?: string) {
  try {
    let query = supabase
      .from('income_records')
      .select('*, farms(name)')
      .order('income_date', { ascending: false });
    if (farmId) query = query.eq('farm_id', farmId);
    const { data, error } = await query;
    if (error) throw error;
    const records = data as (IncomeRecord & { farms: { name: string } })[];
    for (const r of records) await financeRepository.upsertIncome(r);
    return records;
  } catch {
    const local = await financeRepository.getIncome(farmId);
    return local.map(r => ({ ...r, farms: { name: '' } })) as (IncomeRecord & { farms: { name: string } })[];
  }
}

export async function getIncomeRecord(id: string) {
  try {
    const { data, error } = await supabase
      .from('income_records')
      .select('*, farms(name)')
      .eq('id', id)
      .single();
    if (error) throw error;
    await financeRepository.upsertIncome(data as IncomeRecord);
    return data as IncomeRecord & { farms: { name: string } };
  } catch {
    const local = await financeRepository.getIncomeById(id);
    if (!local) throw new Error('Income record not found');
    return { ...local, farms: { name: '' } } as IncomeRecord & { farms: { name: string } };
  }
}

export async function createIncomeRecord(income: Omit<IncomeRecord, 'id' | 'created_at' | 'updated_at'>) {
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = new Date().toISOString();
  const full: IncomeRecord = { ...income, id, created_at: now, updated_at: now } as IncomeRecord;

  await financeRepository.upsertIncome(full);
  await syncQueue.add('income_record', id, 'create', full);

  try {
    const { data, error } = await supabase
      .from('income_records')
      .insert([full])
      .select()
      .single();
    if (error) throw error;
    const server = data as IncomeRecord;
    await financeRepository.markIncomeSynced(id);
    return server;
  } catch {
    return full;
  }
}

export async function updateIncomeRecord(id: string, income: Partial<Omit<IncomeRecord, 'id' | 'created_at' | 'updated_at'>>) {
  const now = new Date().toISOString();
  const updates = { ...income, updated_at: now };

  const existing = await financeRepository.getIncomeById(id);
  if (existing) {
    const merged = { ...existing, ...updates };
    await financeRepository.upsertIncome(merged as IncomeRecord);
  }
  await syncQueue.add('income_record', id, 'update', updates);

  try {
    const { data, error } = await supabase
      .from('income_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const server = data as IncomeRecord;
    await financeRepository.upsertIncome(server);
    await financeRepository.markIncomeSynced(id);
    return server;
  } catch {
    return existing ? { ...existing, ...updates } : updates;
  }
}

export async function deleteIncomeRecord(id: string) {
  await financeRepository.removeIncome(id);
  await syncQueue.add('income_record', id, 'delete', { id });

  try {
    const { error } = await supabase.from('income_records').delete().eq('id', id);
    if (error) throw error;
  } catch {}
}

export async function getMonthlyExpenses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount, expense_date, category')
      .eq('user_id', userId);
    if (error) throw error;
    return data as { amount: number; expense_date: string; category: string }[];
  } catch {
    const rows = await financeRepository.getExpenses();
    return rows.filter(r => r.user_id === userId).map(r => ({
      amount: r.amount, expense_date: r.expense_date || '', category: r.category || ''
    }));
  }
}

export async function getTotalExpenses(userId: string) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId);
    if (error) throw error;
    return (data as { amount: number }[]).reduce((s, e) => s + (e.amount || 0), 0);
  } catch {
    return financeRepository.getTotalExpenses(userId);
  }
}

export async function getTotalIncome(userId: string) {
  try {
    const { data, error } = await supabase
      .from('income_records')
      .select('amount')
      .eq('user_id', userId);
    if (error) throw error;
    return (data as { amount: number }[]).reduce((s, e) => s + (e.amount || 0), 0);
  } catch {
    return financeRepository.getTotalIncome(userId);
  }
}

export const ExpenseService = {
  getExpenses, getExpense, createExpense, updateExpense, deleteExpense,
  getMonthlyExpenses, getTotalExpenses, EXPENSE_CATEGORIES,
};

export const IncomeService = {
  getIncomeRecords, getIncomeRecord, createIncomeRecord, updateIncomeRecord, deleteIncomeRecord, getTotalIncome,
};
