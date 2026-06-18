import { Dimensions } from 'react-native';

export const lightColors = {
  background: '#F7F8F6',
  primary: '#1E6F50',
  primaryDark: '#154D3A',
  primaryLight: '#E8F5E9',
  secondary: '#F0F1EF',
  accent: '#F6B93B',
  danger: '#EF4444',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  overlay: 'rgba(0,0,0,0.3)',
  glass: 'rgba(255,255,255,0.8)',
  glassBorder: 'rgba(255,255,255,0.9)',
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#EAB308',
  blue: '#3B82F6',
  sky: '#0EA5E9',
  teal: '#14B8A6',
  emerald: '#10B981',
  green: '#22C55E',
  lime: '#84CC16',
  purple: '#A855F7',
  pink: '#EC4899',
  rose: '#F43F5E',
  trueGray: '#737373',
  warmGray: '#78716C',
  coolGray: '#6B7280',
};

export const darkColors = {
  background: '#0F0F0F',
  primary: '#2D8A4E',
  primaryDark: '#1E6F50',
  primaryLight: '#1A3A2A',
  secondary: '#1A1A1A',
  accent: '#F6B93B',
  danger: '#EF4444',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  text: '#F5F5F5',
  textSecondary: '#9CA3AF',
  textLight: '#6B7280',
  border: '#333333',
  overlay: 'rgba(0,0,0,0.6)',
  glass: 'rgba(28,28,30,0.8)',
  glassBorder: 'rgba(28,28,30,0.9)',
  red: '#EF4444',
  orange: '#F97316',
  yellow: '#EAB308',
  blue: '#3B82F6',
  sky: '#0EA5E9',
  teal: '#14B8A6',
  emerald: '#10B981',
  green: '#22C55E',
  lime: '#84CC16',
  purple: '#A855F7',
  pink: '#EC4899',
  rose: '#F43F5E',
  trueGray: '#737373',
  warmGray: '#78716C',
  coolGray: '#6B7280',
};

export type ThemeColors = typeof lightColors;

export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 50,
};

export const typography = {
  hero: { fontSize: 36, fontWeight: '800' as const, lineHeight: 44, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.2 },
  h3: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};
