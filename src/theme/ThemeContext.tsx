import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, spacing, radius, typography, shadows, ThemeColors } from './index';

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  spacing,
  radius,
  typography,
  shadows,
  toggleDark: () => {},
});

const STORAGE_KEY = 'boer_dark_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'true') setIsDark(true);
      setReady(true);
    });
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
      return next;
    });
  }, []);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
  const value = useMemo(() => ({ isDark, colors, spacing, radius, typography, shadows, toggleDark }), [isDark, colors, toggleDark]);

  if (!ready) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
