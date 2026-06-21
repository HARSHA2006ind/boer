import { getDatabase } from '../database/database';

export async function getLastSync(): Promise<Date | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM sync_metadata WHERE key = 'last_sync'`
  );
  return row ? new Date(row.value) : null;
}

export async function setLastSync(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_metadata (key, value) VALUES ('last_sync', ?)`,
    new Date().toISOString()
  );
}

export function formatLastSync(date: Date | null): string {
  if (!date) return 'Never';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ` ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}
