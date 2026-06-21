import { getDatabase } from '../database/database';

export interface CachedWeather {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  forecast: any[];
  cachedAt: string;
}

export interface CachedAlert {
  type: string;
  data: any;
  cachedAt: string;
}

export const weatherRepository = {
  async getWeather(location: string): Promise<CachedWeather | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ data: string; cached_at: string }>(
      `SELECT data, cached_at FROM weather_cache WHERE location = ?`, location
    );
    if (!row) return null;
    return { ...JSON.parse(row.data), cachedAt: row.cached_at };
  },

  async saveWeather(location: string, data: any): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR REPLACE INTO weather_cache (location, data, cached_at) VALUES (?, ?, ?)`,
      location, JSON.stringify(data), now
    );
  },

  async getAlerts(): Promise<CachedAlert[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ alert_type: string; data: string; cached_at: string }>(
      `SELECT * FROM alerts_cache ORDER BY cached_at DESC`
    );
    return rows.map(r => ({ type: r.alert_type, data: JSON.parse(r.data), cachedAt: r.cached_at }));
  },

  async saveAlerts(alerts: any[]): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(`DELETE FROM alerts_cache`);
    for (const alert of alerts) {
      await db.runAsync(
        `INSERT INTO alerts_cache (alert_type, data, cached_at) VALUES (?, ?, ?)`,
        alert.type || 'general', JSON.stringify(alert), now
      );
    }
  },

  async getForecast(location: string): Promise<any[] | null> {
    const weather = await this.getWeather(location);
    return weather?.forecast ?? null;
  }
};
