import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, spacing, radius, typography, shadows, ThemeColors } from './index';

export type ColorMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  colorMode: ColorMode;
  isDark: boolean;
  resolvedTheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colorMode: 'system',
  isDark: false,
  resolvedTheme: 'light',
  colors: lightColors,
  spacing,
  radius,
  typography,
  shadows,
  setColorMode: () => {},
});

const STORAGE_KEY = 'boer_color_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [colorMode, setColorModeState] = useState<ColorMode>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setColorModeState(val);
      }
      setReady(true);
    });
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (colorMode === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return colorMode;
  }, [colorMode, systemScheme]);

  const isDark = resolvedTheme === 'dark';
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
  const value = useMemo(
    () => ({ colorMode, isDark, resolvedTheme, colors, spacing, radius, typography, shadows, setColorMode }),
    [colorMode, isDark, resolvedTheme, colors, setColorMode],
  );

  if (!ready) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
