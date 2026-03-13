import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from '../constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Core
  background: string;
  card: string;
  text: string;
  border: string;
  // Extended
  textSecondary: string;
  textMuted: string;
  surface: string;
  surfaceHigh: string;
}

const LIGHT_THEME: ThemeColors = {
  background: COLORS.background,      // #F4F6F7
  card: COLORS.card,                   // #FFFFFF
  text: COLORS.text,                   // #2F3E46
  border: COLORS.secondary,           // #3F9EA3
  textSecondary: COLORS.dark,          // #4F6A7A
  textMuted: '#6B7A8F',
  surface: COLORS.card,                // #FFFFFF
  surfaceHigh: '#F0F2F3',
};

const DARK_THEME: ThemeColors = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#E2E8F0',
  border: '#334155',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  surface: '#1E293B',
  surfaceHigh: '#283548',
};

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  showTelemetry: boolean;
  toggleTelemetry: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>('light');
  
  // Determine if dark mode is active
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  
  // Get current theme colors
  const colors = isDark ? DARK_THEME : LIGHT_THEME;
  
  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Telemetry tab visibility
  const [showTelemetry, setShowTelemetry] = useState(false);
  const toggleTelemetry = () => setShowTelemetry(prev => !prev);
  
  const value = {
    theme,
    isDark,
    colors,
    setTheme,
    toggleTheme,
    showTelemetry,
    toggleTelemetry,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
