import { getDatabase } from '../database/database';
import { Expense, IncomeRecord } from '../types';

type ExpenseClean = Omit<Expense, 'sync_status' | 'local_updated_at'>;
type IncomeClean = Omit<IncomeRecord, 'sync_status' | 'local_updated_at'>;

export const financeRepository = {
  async getExpenses(farmId?: string): Promise<ExpenseClean[]> {
    const db = await getDatabase();
    let sql = `SELECT * FROM expenses`;
    const params: any[] = [];
    if (farmId) {
      sql += ` WHERE farm_id = ?`;
      params.push(farmId);
    }
    sql += ` ORDER BY expense_date DESC`;
    const rows = await db.getAllAsync(sql, ...params);
    return (rows as any[]).map((r) => { const { sync_status, local_updated_at, ...rest } = r; return rest; });
  },

  async getExpenseById(id: string): Promise<ExpenseClean | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync(`SELECT * FROM expenses WHERE id = ?`, id);
    if (!row) return null;
    const { sync_status, local_updated_at, ...rest } = row as any;
    return rest;
  },

  async upsertExpense(expense: Expense): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO expenses (id, user_id, farm_id, title, category, amount, expense_date, description, created_at, updated_at, sync_status, local_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      expense.id, expense.user_id, expense.farm_id, expense.title, expense.category,
      expense.amount, expense.expense_date, expense.description, expense.created_at,
      expense.updated_at, now
    );
  },

  async removeExpense(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM expenses WHERE id = ?`, id);
  },

  async getIncome(farmId?: string): Promise<IncomeClean[]> {
    const db = await getDatabase();
    let sql = `SELECT * FROM income_records`;
    const params: any[] = [];
    if (farmId) {
      sql += ` WHERE farm_id = ?`;
      params.push(farmId);
    }
    sql += ` ORDER BY income_date DESC`;
    const rows = await db.getAllAsync(sql, ...params);
    return (rows as any[]).map((r) => { const { sync_status, local_updated_at, ...rest } = r; return rest; });
  },

  async getIncomeById(id: string): Promise<IncomeClean | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync(`SELECT * FROM income_records WHERE id = ?`, id);
    if (!row) return null;
    const { sync_status, local_updated_at, ...rest } = row as any;
    return rest;
  },

  async upsertIncome(income: IncomeRecord): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO income_records (id, user_id, farm_id, crop_id, crop_name, amount, quantity, quantity_unit, income_date, buyer_name, notes, created_at, updated_at, sync_status, local_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      income.id, income.user_id, income.farm_id, income.crop_id, income.crop_name,
      income.amount, income.quantity, income.quantity_unit, income.income_date,
      income.buyer_name, income.notes, income.created_at, income.updated_at, now
    );
  },

  async removeIncome(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM income_records WHERE id = ?`, id);
  },

  async getPendingExpenses(): Promise<Expense[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync(`SELECT * FROM expenses WHERE sync_status = 'pending'`);
    return rows as Expense[];
  },

  async getPendingIncome(): Promise<IncomeRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync(`SELECT * FROM income_records WHERE sync_status = 'pending'`);
    return rows as IncomeRecord[];
  },

  async markExpenseSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE expenses SET sync_status = 'synced' WHERE id = ?`, id);
  },

  async markIncomeSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE income_records SET sync_status = 'synced' WHERE id = ?`, id);
  },

  async getTotalExpenses(userId: string): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?`, userId
    );
    return row?.total ?? 0;
  },

  async getTotalIncome(userId: string): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM income_records WHERE user_id = ?`, userId
    );
    return row?.total ?? 0;
  }
};
