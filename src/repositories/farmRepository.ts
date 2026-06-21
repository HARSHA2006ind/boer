import { getDatabase } from '../database/database';
import { Farm } from '../types';

function stripMeta(row: any): Omit<Farm, 'sync_status' | 'local_updated_at'> {
  const { sync_status, local_updated_at, ...rest } = row;
  return rest as Farm;
}

export const farmRepository = {
  async getAll(userId: string): Promise<Farm[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM farms WHERE user_id = ? ORDER BY local_updated_at DESC`,
      userId
    );
    return (rows as any[]).map(stripMeta);
  },

  async getById(id: string): Promise<Farm | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync(`SELECT * FROM farms WHERE id = ?`, id);
    return row ? stripMeta(row as any) : null;
  },

  async upsert(farm: Farm): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO farms (id, user_id, name, location, country, state, district, village, land_area_value, land_area_unit, soil_type, water_source, current_crop, notes, preferred_language, created_at, updated_at, sync_status, local_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      farm.id, farm.user_id, farm.name, farm.location, farm.country, farm.state,
      farm.district, farm.village, farm.land_area_value, farm.land_area_unit,
      farm.soil_type, farm.water_source, farm.current_crop, farm.notes,
      farm.preferred_language, farm.created_at, farm.updated_at, now
    );
  },

  async remove(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM farms WHERE id = ?`, id);
  },

  async getPendingSync(): Promise<Farm[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM farms WHERE sync_status = 'pending'`
    );
    return (rows as any[]).map(stripMeta);
  },

  async markSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE farms SET sync_status = 'synced' WHERE id = ?`, id);
  },

  async count(userId: string): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM farms WHERE user_id = ?`, userId
    );
    return row?.count ?? 0;
  }
};
