import { getDatabase } from '../database/database';
import { Crop } from '../types';

function stripMeta(row: any): Omit<Crop, 'sync_status' | 'local_updated_at'> {
  const { sync_status, local_updated_at, ...rest } = row;
  return rest as Crop;
}

export const cropRepository = {
  async getAll(farmId: string): Promise<Crop[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM crops WHERE farm_id = ? ORDER BY local_updated_at DESC`,
      farmId
    );
    return (rows as any[]).map(stripMeta);
  },

  async getById(id: string): Promise<Crop | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync(`SELECT * FROM crops WHERE id = ?`, id);
    return row ? stripMeta(row as any) : null;
  },

  async upsert(crop: Crop): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO crops (id, user_id, farm_id, crop_name, sowing_date, expected_harvest_date, season, area_allocated, area_unit, growth_stage, notes, created_at, updated_at, sync_status, local_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      crop.id, crop.user_id, crop.farm_id, crop.crop_name, crop.sowing_date,
      crop.expected_harvest_date, crop.season, crop.area_allocated, crop.area_unit,
      crop.growth_stage, crop.notes, crop.created_at, crop.updated_at, now
    );
  },

  async remove(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM crops WHERE id = ?`, id);
  },

  async getPendingSync(): Promise<Crop[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM crops WHERE sync_status = 'pending'`
    );
    return (rows as any[]).map(stripMeta);
  },

  async markSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE crops SET sync_status = 'synced' WHERE id = ?`, id);
  },

  async countForFarm(farmId: string): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM crops WHERE farm_id = ?`, farmId
    );
    return row?.count ?? 0;
  }
};
