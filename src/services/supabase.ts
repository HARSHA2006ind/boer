import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_SIZE_LIMIT = 2048;

const SupabaseStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const val = await SecureStore.getItemAsync(key);
      if (val !== null) return val;
    } catch {}
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length < STORAGE_SIZE_LIMIT) {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch {}
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Failed writing session', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try { await SecureStore.deleteItemAsync(key); } catch {}
    try { await AsyncStorage.removeItem(key); } catch {}
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SupabaseStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
