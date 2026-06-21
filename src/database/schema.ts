export const CREATE_TABLES = `
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
    sync_status TEXT DEFAULT 'pending',
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
    sync_status TEXT DEFAULT 'pending',
    local_updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS crop_diary (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    farm_id TEXT,
    crop_id TEXT,
    entry_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    activity_date TEXT,
    image_urls TEXT,
    created_at TEXT,
    updated_at TEXT,
    sync_status TEXT DEFAULT 'pending',
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
    sync_status TEXT DEFAULT 'pending',
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
    sync_status TEXT DEFAULT 'pending',
    local_updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT,
    description TEXT,
    transaction_date TEXT,
    reference_id TEXT,
    reference_type TEXT,
    created_at TEXT,
    updated_at TEXT,
    sync_status TEXT DEFAULT 'pending',
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

  CREATE TABLE IF NOT EXISTS ai_chat_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_id TEXT,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    image TEXT,
    timestamp INTEGER NOT NULL,
    pending INTEGER DEFAULT 0
  );

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

  CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    last_error TEXT
  );

  CREATE TABLE IF NOT EXISTS sync_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;
