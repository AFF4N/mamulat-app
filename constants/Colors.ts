/**
 * Theme constants for Maamulat app
 * Minimal, clean design with light and dark mode support
 */

// Light theme colors
export const lightColors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#E9ECEF',
  
  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6C757D',
  textMuted: '#ADB5BD',
  
  // Brand colors
  primary: '#1B4332',      // Islamic green
  primaryLight: '#2D6A4F',
  accent: '#D4AF37',       // Gold for achievements
  
  // Status colors
  success: '#198754',
  warning: '#FFC107',
  error: '#DC3545',
  
  // UI elements
  border: '#DEE2E6',
  divider: '#E9ECEF',
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  
  // Tab bar
  tabBar: '#FFFFFF',
  tabIconDefault: '#687076',
  tabIconSelected: '#1B4332',
};

// Dark theme colors - Clean black/charcoal palette (matching fitness tracker)
export const darkColors = {
  // Backgrounds
  background: '#121212',      // True dark background
  surface: '#1E1E1E',         // Slightly lighter for cards
  surfaceVariant: '#2A2A2A',  // For secondary surfaces
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#808080',
  
  // Brand colors
  primary: '#40916C',         // Lighter green for dark mode
  primaryLight: '#52B788',
  accent: '#D4AF37',          // Gold stays the same
  
  // Status colors
  success: '#52B788',
  warning: '#FBBF24',
  error: '#EF4444',
  
  // UI elements
  border: '#333333',
  divider: '#2A2A2A',
  card: '#1E1E1E',
  cardShadow: 'rgba(0, 0, 0, 0.5)',
  
  // Tab bar
  tabBar: '#1E1E1E',
  tabIconDefault: '#808080',
  tabIconSelected: '#52B788',
};

// Semantic spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography scale
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Border radius
export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Category colors for maamulat sections
export const categoryColors = {
  faraiz: '#FF6B35',    // Orange for obligatory prayers
  quran: '#3498DB',     // Blue for Quran
  azkar: '#9B59B6',     // Purple for dhikr
  nawafil: '#27AE60',   // Green for optional prayers
  duas: '#1A1A2E',      // Dark for duas
  hifazat: '#F1C40F',   // Yellow for protection
  schedule: '#8B4513',  // Brown for sleep schedule
};

// Export theme type
export type ThemeColors = typeof lightColors;

export const Colors = {
  light: lightColors,
  dark: darkColors,
};

export default Colors;
