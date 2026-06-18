import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { LanguageCode, translations, LANGUAGES as LangList } from './translations';
export { LangList as LANGUAGES };

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: string) => key,
});

const STORAGE_KEY = 'boer_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved: string | null) => {
      if (saved && ['en','ta','hi','te','kn','ml','bn','mr','gu','pa','or','as','ur'].includes(saved)) {
        setLanguageState(saved as LanguageCode);
      }
      setReady(true);
    });
  }, []);

  const setLanguage = useCallback(async (lang: LanguageCode) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
    try { await supabase.auth.updateUser({ data: { preferred_language: lang === 'en' ? 'English' : lang === 'te' ? 'Telugu' : lang === 'hi' ? 'Hindi' : lang === 'ta' ? 'Tamil' : lang === 'kn' ? 'Kannada' : lang === 'ml' ? 'Malayalam' : lang === 'bn' ? 'Bengali' : lang === 'mr' ? 'Marathi' : lang === 'gu' ? 'Gujarati' : lang === 'pa' ? 'Punjabi' : lang === 'or' ? 'Odia' : lang === 'as' ? 'Assamese' : lang === 'ur' ? 'Urdu' : 'English' } }); }
    catch {}
  }, []);

  const t = useCallback((key: string): string => {
    const map = translations[language];
    return map?.[key] || translations.en?.[key] || key;
  }, [language]);

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
