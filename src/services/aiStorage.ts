import { getDatabase } from '../database/database';

async function db() { return await getDatabase(); }

export async function saveChatSession(userId: string, sessionId: string, title: string) {
  const now = Date.now();
  const d = await db();
  await d.runAsync(
    `INSERT OR REPLACE INTO ai_chat_sessions (session_id, user_id, title, created_at, updated_at, message_count)
     VALUES (?, ?, ?, ?, ?, COALESCE((SELECT message_count FROM ai_chat_sessions WHERE session_id = ?), 0))`,
    [sessionId, userId, title, now, now, sessionId]
  );
}

export async function saveChatMessage(userId: string, sessionId: string, role: string, text: string, image?: string) {
  const now = Date.now();
  const d = await db();
  await d.runAsync(
    `INSERT INTO ai_chat_cache (user_id, session_id, role, text, image, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, sessionId, role, text, image || null, now]
  );
  await d.runAsync(
    `UPDATE ai_chat_sessions SET updated_at = ?, message_count = message_count + 1 WHERE session_id = ?`,
    [now, sessionId]
  );
}

export async function getChatSessions(userId: string): Promise<any[]> {
  const d = await db();
  return await d.getAllAsync(
    `SELECT * FROM ai_chat_sessions WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId]
  );
}

export async function searchChatSessions(userId: string, query: string): Promise<any[]> {
  const d = await db();
  return await d.getAllAsync(
    `SELECT DISTINCT s.* FROM ai_chat_sessions s
     JOIN ai_chat_cache m ON m.session_id = s.session_id
     WHERE s.user_id = ? AND (m.text LIKE ? OR s.title LIKE ?)
     ORDER BY s.updated_at DESC`,
    [userId, `%${query}%`, `%${query}%`]
  );
}

export async function deleteChatSession(sessionId: string) {
  const d = await db();
  await d.runAsync(`DELETE FROM ai_chat_cache WHERE session_id = ?`, [sessionId]);
  await d.runAsync(`DELETE FROM ai_chat_sessions WHERE session_id = ?`, [sessionId]);
}

export async function getChatMessages(sessionId: string): Promise<any[]> {
  const d = await db();
  return await d.getAllAsync(
    `SELECT * FROM ai_chat_cache WHERE session_id = ? ORDER BY timestamp ASC`,
    [sessionId]
  );
}

export async function saveDiseaseScan(userId: string, imageUri: string | null, diseaseName: string, confidence: string, symptoms: string, treatment: string, prevention: string) {
  const d = await db();
  await d.runAsync(
    `INSERT INTO ai_disease_scans (user_id, image_uri, disease_name, confidence, symptoms, treatment, prevention, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, imageUri, diseaseName, confidence, symptoms, treatment, prevention, Date.now()]
  );
}

export async function getDiseaseScans(userId: string): Promise<any[]> {
  const d = await db();
  return await d.getAllAsync(
    `SELECT * FROM ai_disease_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );
}

export async function saveRecommendation(userId: string, type: string, inputData: string, results: string) {
  const d = await db();
  await d.runAsync(
    `INSERT INTO ai_recommendations (user_id, input_data, results, type, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, inputData, results, type, Date.now()]
  );
}

export async function getRecentRecommendations(userId: string, type: string): Promise<any[]> {
  const d = await db();
  return await d.getAllAsync(
    `SELECT * FROM ai_recommendations WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 20`,
    [userId, type]
  );
}

export async function saveSmartAlert(userId: string, alert: any) {
  const d = await db();
  await d.runAsync(
    `INSERT INTO ai_smart_alerts (user_id, alert_type, title, description, severity, action_required, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, alert.alertType, alert.title, alert.description, alert.severity, alert.actionRequired, 0, Date.now()]
  );
}

export async function saveSmartAlerts(userId: string, alerts: any[]) {
  for (const a of alerts) await saveSmartAlert(userId, a);
}

export async function getSmartAlerts(userId: string): Promise<any[]> {
  const d = await db();
  return await d.getAllAsync(
    `SELECT * FROM ai_smart_alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );
}

export async function markAlertRead(alertId: number) {
  const d = await db();
  await d.runAsync(`UPDATE ai_smart_alerts SET is_read = 1 WHERE id = ?`, [alertId]);
}

export async function deleteSmartAlert(alertId: number) {
  const d = await db();
  await d.runAsync(`DELETE FROM ai_smart_alerts WHERE id = ?`, [alertId]);
}

export async function saveMarketAdvice(userId: string, advice: any) {
  const d = await db();
  await d.runAsync(
    `INSERT INTO ai_market_advice (user_id, crop_name, current_price, demand_level, best_selling_time, price_forecast, demand_forecast, nearby_markets, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, advice.crop_name || '', advice.current_price || 0, advice.demand_level || 'medium',
     advice.best_selling_time || '', advice.price_forecast || '', advice.demand_forecast || '',
     advice.nearby_markets || '', Date.now()]
  );
}

export async function getMarketAdviceHistory(userId: string): Promise<any[]> {
  const d = await db();
  return await d.getAllAsync(
    `SELECT * FROM ai_market_advice WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
    [userId]
  );
}
