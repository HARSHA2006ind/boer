import { Dimensions } from 'react-native';

export const lightColors = {
  background: '#F8F7F2',
  primary: '#2F5D50',
  primaryDark: '#1E4238',
  primaryLight: '#E8EDE0',
  secondary: '#F0EFE8',
  accent: '#708238',
  danger: '#C0392B',
  success: '#2D8A4E',
  warning: '#D4872F',
  info: '#4A90D9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E0D5',
  overlay: 'rgba(0,0,0,0.4)',
  glass: 'rgba(255,255,255,0.85)',
  glassBorder: 'rgba(255,255,255,0.95)',
  red: '#C0392B',
  orange: '#D4872F',
  yellow: '#D4A017',
  blue: '#4A90D9',
  sky: '#D8EDF8',
  teal: '#4A9E8E',
  emerald: '#2D8A4E',
  green: '#3A7D44',
  lime: '#8FAA4E',
  purple: '#7B6F9E',
  pink: '#C0808A',
  rose: '#C0392B',
  trueGray: '#737373',
  warmGray: '#8B7355',
  coolGray: '#6B7280',
  error: '#C0392B',
};

export const darkColors = {
  background: '#121212',
  primary: '#3A7D44',
  primaryDark: '#2F5D50',
  primaryLight: '#1E2E1A',
  secondary: '#1E1E1E',
  accent: '#8FAA4E',
  danger: '#E74C3C',
  success: '#2D8A4E',
  warning: '#D4872F',
  info: '#4A90D9',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  text: '#F5F5F5',
  textSecondary: '#9CA3AF',
  textLight: '#6B7280',
  border: '#333333',
  overlay: 'rgba(0,0,0,0.6)',
  glass: 'rgba(28,28,30,0.85)',
  glassBorder: 'rgba(28,28,30,0.95)',
  red: '#E74C3C',
  orange: '#D4872F',
  yellow: '#D4A017',
  blue: '#4A90D9',
  sky: '#1A3A4A',
  teal: '#4A9E8E',
  emerald: '#2D8A4E',
  green: '#3A7D44',
  lime: '#8FAA4E',
  purple: '#7B6F9E',
  pink: '#C0808A',
  rose: '#E74C3C',
  trueGray: '#737373',
  warmGray: '#8B7355',
  coolGray: '#6B7280',
  error: '#E74C3C',
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
