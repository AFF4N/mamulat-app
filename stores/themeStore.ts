import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  cycleTheme: () => void;
}

/**
 * Theme store with persistence
 * Allows user to override system theme or follow device settings
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      
      setTheme: (mode: ThemeMode) => set({ themeMode: mode }),
      
      cycleTheme: () => {
        const current = get().themeMode;
        const modes: ThemeMode[] = ['system', 'light', 'dark'];
        const nextIndex = (modes.indexOf(current) + 1) % modes.length;
        set({ themeMode: modes[nextIndex] });
      },
    }),
    {
      name: 'maamulat-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Get display label for theme mode
 */
export function getThemeLabel(mode: ThemeMode): string {
  switch (mode) {
    case 'light': return 'Light';
    case 'dark': return 'Dark';
    case 'system': return 'System';
  }
}
