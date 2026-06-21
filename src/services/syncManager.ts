import { supabase } from './supabase';
import { syncQueue, SyncQueueItem } from './syncQueue';
import { getDatabase } from '../database/database';
import { getLastSync, setLastSync } from './syncTracker';

let syncing = false;
type SyncCallback = (status: 'syncing' | 'synced' | 'error', count?: number) => void;
let callbacks: SyncCallback[] = [];

export function onSyncStatusChange(cb: SyncCallback) {
  callbacks.push(cb);
  return () => { callbacks = callbacks.filter(c => c !== cb); };
}

function notify(status: 'syncing' | 'synced' | 'error', count?: number) {
  callbacks.forEach(cb => cb(status, count));
}

async function processEntity(item: SyncQueueItem) {
  const payload = JSON.parse(item.payload);

  if (item.operation === 'delete') {
    const { error } = await supabase
      .from(getTableName(item.entity_type))
      .delete()
      .eq('id', item.entity_id);
    if (error) throw error;
    await syncQueue.markDone(item.id);
    return;
  }

  const table = getTableName(item.entity_type);
  const { data: existing } = await supabase
    .from(table)
    .select('updated_at')
    .eq('id', item.entity_id)
    .maybeSingle();

  if (existing && existing.updated_at && payload.updated_at && payload.updated_at < existing.updated_at) {
    const { data: serverData } = await supabase.from(table).select('*').eq('id', item.entity_id).single();
    if (serverData) {
      const db = await getDatabase();
      const keys = Object.keys(serverData);
      const vals = Object.values(serverData);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      await db.runAsync(
        `UPDATE ${table} SET ${setClause} WHERE id = ?`,
        ...vals as [any, ...any[]],
        item.entity_id
      );
    }
    await syncQueue.markDone(item.id);
    return;
  }

  const { error } = await supabase
    .from(table)
    .upsert({ id: item.entity_id, ...payload })
    .eq('id', item.entity_id);
  if (error) throw error;

  await syncQueue.markDone(item.id);
}

function getTableName(entityType: string): string {
  switch (entityType) {
    case 'income_record': return 'income_records';
    case 'crop_diary': return 'crop_diary';
    case 'farm': return 'farms';
    case 'crop': return 'crops';
    case 'expense': return 'expenses';
    case 'transaction': return 'transactions';
    default: return entityType + 's';
  }
}

async function pullFromCloud() {
  const tables = ['farms', 'crops', 'expenses', 'income_records'];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error || !data) continue;

    const db = await getDatabase();
    for (const row of data) {
      const keys = Object.keys(row);
      const vals = Object.values(row);
      const placeholders = keys.map(() => '?').join(', ');
      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
        ...vals as [any, ...any[]]
      );
    }
  }
}

export async function processSyncQueue() {
  if (syncing) return;
  syncing = true;
  notify('syncing');

  try {
    const items = await syncQueue.getPending();
    for (const item of items) {
      try {
        await processEntity(item);
      } catch (err: any) {
        await syncQueue.markFailed(item.id, err.message || 'Unknown error');
      }
    }

    await pullFromCloud();

    const remaining = await syncQueue.pendingCount();
    await setLastSync();
    syncing = false;
    notify(remaining === 0 ? 'synced' : 'error', remaining);
  } catch {
    syncing = false;
    notify('error');
  }
}

export function isSyncInProgress() {
  return syncing;
}
