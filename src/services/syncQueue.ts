import { getDatabase } from '../database/database';

export type SyncEntity = 'farm' | 'crop' | 'crop_diary' | 'expense' | 'income_record' | 'transaction';
export type SyncOp = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
  id: number;
  entity_type: SyncEntity;
  entity_id: string;
  operation: SyncOp;
  payload: string;
  created_at: string;
  sync_status: 'pending' | 'syncing' | 'failed';
  retry_count: number;
  last_error: string | null;
}

export const syncQueue = {
  async add(entity_type: SyncEntity, entity_id: string, operation: SyncOp, payload: Record<string, any>): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at, sync_status, retry_count)
       VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
      entity_type, entity_id, operation, JSON.stringify(payload), new Date().toISOString()
    );
  },

  async getPending(): Promise<SyncQueueItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SyncQueueItem>(
      `SELECT * FROM sync_queue WHERE sync_status = 'pending' ORDER BY created_at ASC`
    );
    return rows;
  },

  async getFailed(): Promise<SyncQueueItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SyncQueueItem>(
      `SELECT * FROM sync_queue WHERE sync_status = 'failed' ORDER BY created_at ASC`
    );
    return rows;
  },

  async markDone(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, id);
  },

  async markFailed(id: number, error: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE sync_queue SET sync_status = 'failed', retry_count = retry_count + 1, last_error = ? WHERE id = ?`,
      error, id
    );
  },

  async markSyncing(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE sync_queue SET sync_status = 'syncing' WHERE id = ?`, id);
  },

  async pendingCount(): Promise<number> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE sync_status IN ('pending', 'failed')`
    );
    return row?.count ?? 0;
  },

  async clearFailed(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM sync_queue WHERE sync_status = 'failed'`);
  },

  async clearAll(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM sync_queue`);
  }
};
