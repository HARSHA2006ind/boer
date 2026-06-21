import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { CREATE_TABLES } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('boer.db');
    await runMigrations(db);
  }
  return db;
}

export async function resetDatabase() {
  if (db) {
    await db.closeAsync();
    db = null;
  }
  db = await SQLite.openDatabaseAsync('boer.db');
  await db.execAsync(`
    DROP TABLE IF EXISTS farms;
    DROP TABLE IF EXISTS crops;
    DROP TABLE IF EXISTS crop_diary;
    DROP TABLE IF EXISTS expenses;
    DROP TABLE IF EXISTS income_records;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS weather_cache;
    DROP TABLE IF EXISTS alerts_cache;
    DROP TABLE IF EXISTS ai_chat_cache;
    DROP TABLE IF EXISTS sync_queue;
    DROP TABLE IF EXISTS sync_metadata;
  `);
  await db.execAsync(CREATE_TABLES);
}

export async function getTableCounts(): Promise<Record<string, number>> {
  const database = await getDatabase();
  const tables = ['farms', 'crops', 'crop_diary', 'expenses', 'income_records', 'transactions', 'weather_cache', 'alerts_cache', 'ai_chat_cache', 'sync_queue'];
  const counts: Record<string, number> = {};
  for (const table of tables) {
    const row = await database.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`);
    counts[table] = row?.count ?? 0;
  }
  return counts;
}

export async function clearCache() {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM weather_cache;
    DELETE FROM alerts_cache;
    DELETE FROM ai_chat_cache;
  `);
}
