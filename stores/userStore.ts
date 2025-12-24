/**
 * User store - Profile, streaks, and hasanat tracking
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayString, isYesterday, daysBetween } from '@/utils/dateUtils';

export interface UserState {
    // Profile
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    joinDate: string;
    
    // Streaks
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
    streakBroken: boolean; // Flag for showing alert
    
    // Hasanat
    totalHasanat: number;
    todayHasanat: number;
    
    // Chillah tracking
    chillahDay: number;
    chillahStartDate: string | null;
    
    // Actions
    setName: (name: string) => void;
    setLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
    addHasanat: (amount: number) => void;
    recordDayCompletion: (completionPercent: number) => void;
    dismissStreakAlert: () => void;
    resetChillah: () => void;
    checkNewDay: () => boolean;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // Initial state
            name: 'Your Name',
            level: 'beginner',
            joinDate: getTodayString(),
            
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedDate: null,
            streakBroken: false,
            
            totalHasanat: 0,
            todayHasanat: 0,
            
            chillahDay: 1,
            chillahStartDate: null,
            
            // Actions
            setName: (name) => set({ name }),
            
            setLevel: (level) => set({ level }),
            
            addHasanat: (amount) => set((state) => ({
                totalHasanat: state.totalHasanat + amount,
                todayHasanat: state.todayHasanat + amount,
            })),
            
            recordDayCompletion: (completionPercent) => {
                const state = get();
                const today = getTodayString();
                
                // Already recorded today
                if (state.lastCompletedDate === today) return;
                
                // Check if met 60% threshold
                if (completionPercent >= 60) {
                    // Continue or start streak
                    const isConsecutive = state.lastCompletedDate && 
                        isYesterday(state.lastCompletedDate);
                    
                    const newStreak = isConsecutive ? state.currentStreak + 1 : 1;
                    const newChillahDay = isConsecutive ? 
                        Math.min(state.chillahDay + 1, 40) : 1;
                    
                    set({
                        currentStreak: newStreak,
                        longestStreak: Math.max(state.longestStreak, newStreak),
                        lastCompletedDate: today,
                        chillahDay: newChillahDay,
                        chillahStartDate: isConsecutive ? 
                            state.chillahStartDate : today,
                    });
                } else {
                    // Failed to meet threshold - break streak
                    set({
                        currentStreak: 0,
                        lastCompletedDate: today,
                        streakBroken: state.currentStreak > 0,
                        chillahDay: 1,
                        chillahStartDate: null,
                    });
                }
            },
            
            dismissStreakAlert: () => set({ streakBroken: false }),
            
            resetChillah: () => set({
                chillahDay: 1,
                chillahStartDate: getTodayString(),
            }),
            
            checkNewDay: () => {
                const state = get();
                const today = getTodayString();
                
                // Check if last completion was before yesterday (streak broken)
                if (state.lastCompletedDate && 
                    !isYesterday(state.lastCompletedDate) && 
                    state.lastCompletedDate !== today &&
                    state.currentStreak > 0) {
                    
                    set({
                        streakBroken: true,
                        currentStreak: 0,
                        chillahDay: 1,
                        todayHasanat: 0,
                    });
                    return true;
                }
                
                // Reset today's hasanat if it's a new day
                if (state.lastCompletedDate !== today) {
                    set({ todayHasanat: 0 });
                }
                
                return false;
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
