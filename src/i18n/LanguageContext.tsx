import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { LanguageCode, translations, LANGUAGES as LangList } from './translations';
export { LangList as LANGUAGES };

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string) => string;
  showPicker: boolean;
  dismissPicker: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: string) => key,
  showPicker: false,
  dismissPicker: () => {},
});

const STORAGE_KEY = 'boer_language';
const CHOSEN_KEY = 'boer_language_chosen';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [ready, setReady] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(CHOSEN_KEY),
    ]).then(([saved, chosen]) => {
      if (saved && ['en','ta','hi','te','kn','ml','bn','mr','gu','pa','or','as','ur'].includes(saved)) {
        setLanguageState(saved as LanguageCode);
      }
      if (!chosen) {
        setShowPicker(true);
      }
      setReady(true);
    });
  }, []);

  const setLanguage = useCallback(async (lang: LanguageCode) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
    await AsyncStorage.setItem(CHOSEN_KEY, 'true');
    setShowPicker(false);
    try {
      const names: Record<string, string> = { en: 'English', ta: 'Tamil', te: 'Telugu', hi: 'Hindi', kn: 'Kannada', ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi', or: 'Odia', as: 'Assamese', ur: 'Urdu' };
      await supabase.auth.updateUser({ data: { preferred_language: names[lang] || 'English' } });
    } catch {}
  }, []);

  const dismissPicker = useCallback(() => {
    setShowPicker(false);
    AsyncStorage.setItem(CHOSEN_KEY, 'true');
  }, []);

  const t = useCallback((key: string): string => {
    const map = translations[language];
    return map?.[key] || translations.en?.[key] || key;
  }, [language]);

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, showPicker, dismissPicker }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  const { t } = useLanguage();
  return t;
}
