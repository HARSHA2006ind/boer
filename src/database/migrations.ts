import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES } from './schema';

export async function runMigrations(db: SQLite.SQLiteDatabase) {
  const version = await getVersion(db);
  if (version < 1) {
    await db.execAsync(CREATE_TABLES);
    await setVersion(db, 1);
  }
  if (version < 2) {
    await addColumnIfNotExists(db, 'ai_chat_cache', 'session_id', 'TEXT');
    await db.execAsync(V2_NEW_TABLES);
    await setVersion(db, 2);
  }
  if (version < 3) {
    await db.execAsync(V3_NEW_TABLES);
    await setVersion(db, 3);
  }
}

async function addColumnIfNotExists(db: SQLite.SQLiteDatabase, table: string, column: string, type: string) {
  try {
    const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
    if (!cols.some((c: any) => c.name === column)) {
      await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    }
  } catch {}
}

const V3_NEW_TABLES = `
  CREATE TABLE IF NOT EXISTS ai_smart_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium',
    action_required TEXT,
    is_read INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ai_market_advice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    crop_name TEXT,
    current_price REAL DEFAULT 0,
    demand_level TEXT DEFAULT 'medium',
    best_selling_time TEXT,
    price_forecast TEXT,
    demand_forecast TEXT,
    nearby_markets TEXT,
    created_at INTEGER NOT NULL
  );
`;

const V2_NEW_TABLES = `
  CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    message_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ai_disease_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    image_uri TEXT,
    disease_name TEXT,
    confidence TEXT,
    symptoms TEXT,
    treatment TEXT,
    prevention TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ai_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    input_data TEXT,
    results TEXT,
    type TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`;

async function getVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const row = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = 'db_version'`
    );
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    return 0;
  }
}

async function setVersion(db: SQLite.SQLiteDatabase, version: number) {
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_metadata (key, value) VALUES ('db_version', ?)`,
    String(version)
  );
}
