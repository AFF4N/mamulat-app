/**
 * Maamulat store - Daily tasks and completion tracking
 * Uses JSON configs based on user's level
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayString, getWeekStartString, getWeekdayIndex } from '@/utils/dateUtils';
import { getLevelConfig, getAllCategories, type Level, type Category, type TaskItem } from '@/config';

export interface MaamulatItem extends TaskItem {
    completed: boolean;
    timeValue?: string; // For time items like wake/sleep time
}

export interface MaamulatCategory {
    id: string;
    name: string;
    nameEn: string;
    color: string;
    emoji?: string;
    items: MaamulatItem[];
}

interface DayRecord {
    date: string;
    completedCount: number;
    totalCount: number;
    completionPercent: number;
}

export interface MaamulatState {
    // Current day
    currentDate: string;
    currentLevel: Level;
    categories: MaamulatCategory[];
    
    // Weekly tracking
    weekStart: string;
    weeklyProgress: boolean[]; // Mo-Su completion status
    
    // History
    dayRecords: DayRecord[];
    
    // Basic Actions
    toggleItem: (categoryId: string, itemId: string) => void;
    setItemTime: (categoryId: string, itemId: string, time: string) => void;
    getCompletionStats: () => { completed: number; total: number; percent: number };
    checkAndResetDay: () => boolean;
    recordDayEnd: () => DayRecord;
    loadLevelTasks: (level: Level) => void;
    
    // Editing Actions
    addItem: (categoryId: string, item: Omit<MaamulatItem, 'completed'>) => void;
    removeItem: (categoryId: string, itemId: string) => void;
    updateItem: (categoryId: string, itemId: string, updates: Partial<MaamulatItem>) => void;
    addCategory: (category: Omit<MaamulatCategory, 'items'>) => void;
    removeCategory: (categoryId: string) => void;
    updateCategory: (categoryId: string, updates: Partial<MaamulatCategory>) => void;
    reorderCategories: (fromIndex: number, toIndex: number) => void;
    reorderItems: (categoryId: string, fromIndex: number, toIndex: number) => void;
}

// Convert config categories to store categories (with completed state)
function configToStoreCategories(level: Level): MaamulatCategory[] {
    const categories = getAllCategories(level);
    return categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => ({
            ...item,
            completed: false,
        })),
    }));
}

// Helper to reset all items to uncompleted
function resetCategories(categories: MaamulatCategory[]): MaamulatCategory[] {
    return categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => ({ ...item, completed: false })),
    }));
}

export const useMaamulatStore = create<MaamulatState>()(
    persist(
        (set, get) => ({
            currentDate: getTodayString(),
            currentLevel: 'beginner',
            categories: configToStoreCategories('beginner'),
            weekStart: getWeekStartString(),
            weeklyProgress: [false, false, false, false, false, false, false],
            dayRecords: [],
            
            toggleItem: (categoryId, itemId) => set((state) => ({
                categories: state.categories.map(cat =>
                    cat.id === categoryId
                        ? {
                            ...cat,
                            items: cat.items.map(item =>
                                item.id === itemId
                                    ? { ...item, completed: !item.completed }
                                    : item
                            ),
                        }
                        : cat
                ),
            })),
            
            setItemTime: (categoryId, itemId, time) => set((state) => ({
                categories: state.categories.map(cat =>
                    cat.id === categoryId
                        ? {
                            ...cat,
                            items: cat.items.map(item =>
                                item.id === itemId
                                    ? { ...item, timeValue: time, completed: true }
                                    : item
                            ),
                        }
                        : cat
                ),
            })),
            
            getCompletionStats: () => {
                const { categories } = get();
                let completed = 0;
                let total = 0;
                
                categories.forEach(cat => {
                    cat.items.forEach(item => {
                        total++;
                        if (item.completed) completed++;
                    });
                });
                
                return {
                    completed,
                    total,
                    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
                };
            },
            
            checkAndResetDay: () => {
                const state = get();
                const today = getTodayString();
                const weekStart = getWeekStartString();
                
                if (state.currentDate !== today) {
                    // New day - reset tasks
                    let newWeeklyProgress = [...state.weeklyProgress];
                    
                    // Check if new week
                    if (state.weekStart !== weekStart) {
                        newWeeklyProgress = [false, false, false, false, false, false, false];
                    }
                    
                    set({
                        currentDate: today,
                        categories: resetCategories(state.categories),
                        weekStart,
                        weeklyProgress: newWeeklyProgress,
                    });
                    
                    return true;
                }
                
                return false;
            },
            
            recordDayEnd: () => {
                const state = get();
                const stats = state.getCompletionStats();
                const today = getTodayString();
                const dayIndex = getWeekdayIndex();
                
                const record: DayRecord = {
                    date: today,
                    completedCount: stats.completed,
                    totalCount: stats.total,
                    completionPercent: stats.percent,
                };
                
                // Update weekly progress
                const newWeeklyProgress = [...state.weeklyProgress];
                newWeeklyProgress[dayIndex] = stats.percent >= 60;
                
                set({
                    weeklyProgress: newWeeklyProgress,
                    dayRecords: [...state.dayRecords.slice(-30), record],
                });
                
                return record;
            },
            
            loadLevelTasks: (level: Level) => {
                set({
                    currentLevel: level,
                    categories: configToStoreCategories(level),
                });
            },
            
            // Editing Actions
            addItem: (categoryId, item) => set((state) => ({
                categories: state.categories.map(cat =>
                    cat.id === categoryId
                        ? { ...cat, items: [...cat.items, { ...item, completed: false }] }
                        : cat
                ),
            })),
            
            removeItem: (categoryId, itemId) => set((state) => ({
                categories: state.categories.map(cat =>
                    cat.id === categoryId
                        ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
                        : cat
                ),
            })),
            
            updateItem: (categoryId, itemId, updates) => set((state) => ({
                categories: state.categories.map(cat =>
                    cat.id === categoryId
                        ? {
                            ...cat,
                            items: cat.items.map(item =>
                                item.id === itemId ? { ...item, ...updates } : item
                            ),
                        }
                        : cat
                ),
            })),
            
            addCategory: (category) => set((state) => ({
                categories: [...state.categories, { ...category, items: [] }],
            })),
            
            removeCategory: (categoryId) => set((state) => ({
                categories: state.categories.filter(cat => cat.id !== categoryId),
            })),
            
            updateCategory: (categoryId, updates) => set((state) => ({
                categories: state.categories.map(cat =>
                    cat.id === categoryId ? { ...cat, ...updates } : cat
                ),
            })),
            
            reorderCategories: (fromIndex, toIndex) => set((state) => {
                const newCategories = [...state.categories];
                const [removed] = newCategories.splice(fromIndex, 1);
                newCategories.splice(toIndex, 0, removed);
                return { categories: newCategories };
            }),
            
            reorderItems: (categoryId, fromIndex, toIndex) => set((state) => ({
                categories: state.categories.map(cat => {
                    if (cat.id !== categoryId) return cat;
                    const newItems = [...cat.items];
                    const [removed] = newItems.splice(fromIndex, 1);
                    newItems.splice(toIndex, 0, removed);
                    return { ...cat, items: newItems };
                }),
            })),
        }),
        {
            name: 'maamulat-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
