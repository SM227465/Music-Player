// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '@/constants/theme';
import { useSettings } from '@/hooks/useStorage';

type Theme = typeof lightTheme;
type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useColorScheme();
  const { settings, updateSettings } = useSettings();
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!settings) {
      return;
    }

    const themeMode = settings.theme || 'auto';
    let shouldBeDark = false;

    if (themeMode === 'auto') {
      shouldBeDark = deviceColorScheme === 'dark';
    } else {
      shouldBeDark = themeMode === 'dark';
    }

    const newTheme = shouldBeDark ? darkTheme : lightTheme;

    setIsDark(shouldBeDark);
    setCurrentTheme(newTheme);
  }, [settings, deviceColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await updateSettings({ theme: mode });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const value: ThemeContextType = {
    theme: currentTheme,
    themeMode: settings?.theme || 'auto',
    isDark,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

// Simplified hook that just returns the theme object
export function useTheme() {
  const { theme } = useThemeContext();
  return theme;
}
