import { useColorScheme } from 'react-native';
import { Colors, ThemeColors } from '@/constants/Colors';
import { useThemeStore, ThemeMode } from '@/stores';

/**
 * Get the effective color scheme based on user preference and system setting
 */
function useEffectiveColorScheme(): 'light' | 'dark' {
  const systemScheme = useColorScheme() ?? 'light';
  const themeMode = useThemeStore((state) => state.themeMode);
  
  if (themeMode === 'system') {
    return systemScheme;
  }
  return themeMode;
}

/**
 * Custom hook to get theme-aware colors
 * Returns the appropriate color palette based on user preference or device color scheme
 */
export function useThemeColor<K extends keyof ThemeColors>(
  colorName: K,
  props?: { light?: string; dark?: string }
): string {
  const theme = useEffectiveColorScheme();
  
  // If custom colors are provided, use them
  if (props) {
    const colorFromProps = props[theme];
    if (colorFromProps) {
      return colorFromProps;
    }
  }
  
  return Colors[theme][colorName];
}

/**
 * Get the full theme colors object based on user preference or system scheme
 */
export function useTheme(): {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  cycleTheme: () => void;
} {
  const effectiveScheme = useEffectiveColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const cycleTheme = useThemeStore((state) => state.cycleTheme);
  
  return {
    colors: Colors[effectiveScheme],
    isDark: effectiveScheme === 'dark',
    themeMode,
    setTheme,
    cycleTheme,
  };
}

/**
 * Hook to check if dark mode is active (considers user preference)
 */
export function useIsDarkMode(): boolean {
  return useEffectiveColorScheme() === 'dark';
}
