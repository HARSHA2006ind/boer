import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('boer_offline.db');
    await initSchema(db);
  }
  return db;
}

async function initSchema(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT,
      mobile_number TEXT,
      email TEXT,
      preferred_language TEXT DEFAULT 'en',
      country TEXT DEFAULT 'IN',
      state TEXT,
      district TEXT,
      village TEXT,
      avatar_url TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS farms (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      location TEXT,
      country TEXT DEFAULT 'IN',
      state TEXT,
      district TEXT,
      village TEXT,
      land_area_value REAL DEFAULT 0,
      land_area_unit TEXT DEFAULT 'Hectares',
      soil_type TEXT,
      water_source TEXT,
      current_crop TEXT,
      notes TEXT,
      preferred_language TEXT DEFAULT 'en',
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      local_updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS crops (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      farm_id TEXT NOT NULL,
      crop_name TEXT NOT NULL,
      sowing_date TEXT,
      expected_harvest_date TEXT,
      season TEXT,
      area_allocated REAL DEFAULT 0,
      area_unit TEXT DEFAULT 'Hectares',
      growth_stage TEXT,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      local_updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      farm_id TEXT,
      title TEXT NOT NULL,
      category TEXT,
      amount REAL NOT NULL,
      expense_date TEXT,
      description TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      local_updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS income_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      farm_id TEXT,
      crop_id TEXT,
      crop_name TEXT,
      amount REAL NOT NULL,
      quantity REAL DEFAULT 0,
      quantity_unit TEXT,
      income_date TEXT,
      buyer_name TEXT,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      local_updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS weather_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      data TEXT NOT NULL,
      cached_at TEXT NOT NULL,
      UNIQUE(location)
    );

    CREATE TABLE IF NOT EXISTS alerts_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_type TEXT,
      data TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      image TEXT,
      timestamp INTEGER NOT NULL,
      pending INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS market_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );
  `);
}

export async function clearAllData() {
  const database = await getDb();
  await database.execAsync(`
    DELETE FROM user_profiles;
    DELETE FROM farms;
    DELETE FROM crops;
    DELETE FROM expenses;
    DELETE FROM income_records;
    DELETE FROM weather_cache;
    DELETE FROM alerts_cache;
    DELETE FROM ai_chat_history;
    DELETE FROM market_cache;
  `);
}

export async function getStorageInfo() {
  const database = await getDb();
  const tables = ['farms', 'crops', 'expenses', 'income_records', 'weather_cache', 'alerts_cache', 'ai_chat_history', 'market_cache'];
  const counts: Record<string, number> = {};
  for (const table of tables) {
    const row = await database.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`);
    counts[table] = row?.count ?? 0;
  }
  return counts;
}
