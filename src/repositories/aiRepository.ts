import { getDatabase } from '../database/database';

export interface ChatMessage {
  id?: number;
  user_id: string;
  role: 'user' | 'ai';
  text: string;
  image?: string;
  timestamp: number;
  pending: number;
}

export const aiRepository = {
  async getMessages(userId: string): Promise<ChatMessage[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ChatMessage>(
      `SELECT * FROM ai_chat_cache WHERE user_id = ? ORDER BY timestamp ASC`,
      userId
    );
    return rows;
  },

  async saveMessage(msg: ChatMessage): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO ai_chat_cache (user_id, role, text, image, timestamp, pending) VALUES (?, ?, ?, ?, ?, ?)`,
      msg.user_id, msg.role, msg.text, msg.image || null, msg.timestamp, msg.pending
    );
  },

  async getPendingMessages(userId: string): Promise<ChatMessage[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ChatMessage>(
      `SELECT * FROM ai_chat_cache WHERE user_id = ? AND pending = 1 ORDER BY timestamp ASC`,
      userId
    );
    return rows;
  },

  async markProcessed(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE ai_chat_cache SET pending = 0 WHERE id = ?`, id);
  },

  async clearHistory(userId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM ai_chat_cache WHERE user_id = ?`, userId);
  },

  async getLastMessages(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ChatMessage>(
      `SELECT * FROM ai_chat_cache WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?`,
      userId, limit
    );
    return rows.reverse();
  }
};
