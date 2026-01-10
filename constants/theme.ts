// constants/theme.ts

export const lightTheme = {
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F1F3F5',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    accent: '#8B5CF6',
  },

  // Accent colors
  accent: {
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    tertiary: '#6D28D9',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Border colors
  border: {
    primary: '#E5E7EB',
    secondary: '#D1D5DB',
    focus: '#8B5CF6',
  },

  // Card colors
  card: {
    background: '#FFFFFF',
    hover: '#F9FAFB',
    pressed: '#F3F4F6',
  },

  // Player colors
  player: {
    background: '#FFFFFF',
    progress: '#8B5CF6',
    progressBackground: '#E5E7EB',
    controlBackground: '#F3F4F6',
    controlActive: '#8B5CF6',
  },

  // Gradient colors
  gradient: {
    start: '#8B5CF6',
    middle: '#7C3AED',
    end: '#6D28D9',
  },

  // Shadow
  shadow: {
    color: '#000000',
    opacity: 0.08,
  },
};

export const darkTheme = {
  // Background colors
  background: {
    primary: '#0A0A0A',
    secondary: '#1A1A1A',
    tertiary: '#2A2A2A',
    elevated: '#1F1F1F',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    inverse: '#1A1A1A',
    accent: '#A78BFA',
  },

  // Accent colors
  accent: {
    primary: '#A78BFA',
    secondary: '#8B5CF6',
    tertiary: '#7C3AED',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },

  // Border colors
  border: {
    primary: '#3A3A3A',
    secondary: '#4A4A4A',
    focus: '#A78BFA',
  },

  // Card colors
  card: {
    background: '#1A1A1A',
    hover: '#2A2A2A',
    pressed: '#3A3A3A',
  },

  // Player colors
  player: {
    background: '#1A1A1A',
    progress: '#A78BFA',
    progressBackground: '#3A3A3A',
    controlBackground: '#2A2A2A',
    controlActive: '#A78BFA',
  },

  // Gradient colors
  gradient: {
    start: '#5B21B6',
    middle: '#6D28D9',
    end: '#7C3AED',
  },

  // Shadow
  shadow: {
    color: '#000000',
    opacity: 0.4,
  },
};

// Re-export useThemeContext from ThemeContext for accessing just the theme
// Note: This must be imported after the theme objects are defined to avoid circular deps
export { useTheme } from '@/contexts/ThemeContext';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  xxxxl: 32,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 40,
};
