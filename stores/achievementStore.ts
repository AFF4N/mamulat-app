/**
 * Achievement store - Track unlocked badges
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayString } from '@/utils/dateUtils';

export interface Achievement {
    id: string;
    name: string;
    nameUr: string;
    description: string;
    icon: string;
    iconColor: string;
    target: number;
    unlocked: boolean;
    unlockedDate: string | null;
}

interface AchievementState {
    achievements: Achievement[];
    checkAndUnlock: (stats: {
        streak: number;
        totalHasanat: number;
        tahajjudCount: number;
        quranDays: number;
        perfectDays: number;
    }) => string[]; // Returns newly unlocked achievement IDs
    getProgress: (achievementId: string, currentValue: number) => number;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'streak-7',
        name: '7 Day Streak',
        nameUr: 'سات دن مسلسل',
        description: 'Complete maamulat for 7 consecutive days',
        icon: 'flame',
        iconColor: '#FF6B35',
        target: 7,
        unlocked: false,
        unlockedDate: null,
    },
    {
        id: 'streak-40',
        name: 'Chillah Complete',
        nameUr: 'چلہ مکمل',
        description: 'Complete a 40-day spiritual journey',
        icon: 'moon',
        iconColor: '#9B59B6',
        target: 40,
        unlocked: false,
        unlockedDate: null,
    },
    {
        id: 'streak-100',
        name: 'Century',
        nameUr: 'سو دن',
        description: 'Maintain streak for 100 days',
        icon: 'ribbon',
        iconColor: '#D4AF37',
        target: 100,
        unlocked: false,
        unlockedDate: null,
    },
    {
        id: 'hasanat-1000',
        name: 'Hasanat Hunter',
        nameUr: 'حسنات ہنٹر',
        description: 'Earn 1,000 total hasanat',
        icon: 'star',
        iconColor: '#D4AF37',
        target: 1000,
        unlocked: false,
        unlockedDate: null,
    },
    {
        id: 'hasanat-10000',
        name: 'Hasanat Master',
        nameUr: 'حسنات ماسٹر',
        description: 'Earn 10,000 total hasanat',
        icon: 'star',
        iconColor: '#D4AF37',
        target: 10000,
        unlocked: false,
        unlockedDate: null,
    },
    {
        id: 'tahajjud-7',
        name: 'Night Warrior',
        nameUr: 'رات کا سپاہی',
        description: 'Pray Tahajjud for 7 days',
        icon: 'cloudy-night',
        iconColor: '#1A1A2E',
        target: 7,
        unlocked: false,
        unlockedDate: null,
    },
    {
        id: 'quran-30',
        name: 'Quran Journey',
        nameUr: 'قرآن سفر',
        description: 'Read Quran surahs daily for 30 days',
        icon: 'book',
        iconColor: '#3498DB',
        target: 30,
        unlocked: false,
        unlockedDate: null,
    },
    {
        id: 'perfect-1',
        name: 'Perfect Day',
        nameUr: 'کامل دن',
        description: 'Complete all maamulat in a single day',
        icon: 'sparkles',
        iconColor: '#D4AF37',
        target: 1,
        unlocked: false,
        unlockedDate: null,
    },
];

export const useAchievementStore = create<AchievementState>()(
    persist(
        (set, get) => ({
            achievements: DEFAULT_ACHIEVEMENTS,
            
            checkAndUnlock: (stats) => {
                const { achievements } = get();
                const today = getTodayString();
                const newlyUnlocked: string[] = [];
                
                const updated = achievements.map(achievement => {
                    if (achievement.unlocked) return achievement;
                    
                    let shouldUnlock = false;
                    
                    // Check unlock conditions
                    if (achievement.id.startsWith('streak-')) {
                        shouldUnlock = stats.streak >= achievement.target;
                    } else if (achievement.id.startsWith('hasanat-')) {
                        shouldUnlock = stats.totalHasanat >= achievement.target;
                    } else if (achievement.id === 'tahajjud-7') {
                        shouldUnlock = stats.tahajjudCount >= achievement.target;
                    } else if (achievement.id === 'quran-30') {
                        shouldUnlock = stats.quranDays >= achievement.target;
                    } else if (achievement.id === 'perfect-1') {
                        shouldUnlock = stats.perfectDays >= achievement.target;
                    }
                    
                    if (shouldUnlock) {
                        newlyUnlocked.push(achievement.id);
                        return {
                            ...achievement,
                            unlocked: true,
                            unlockedDate: today,
                        };
                    }
                    
                    return achievement;
                });
                
                if (newlyUnlocked.length > 0) {
                    set({ achievements: updated });
                }
                
                return newlyUnlocked;
            },
            
            getProgress: (achievementId, currentValue) => {
                const achievement = get().achievements.find(a => a.id === achievementId);
                if (!achievement) return 0;
                return Math.min((currentValue / achievement.target) * 100, 100);
            },
        }),
        {
            name: 'achievement-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
