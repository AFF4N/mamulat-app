/**
 * Level configuration loader
 * Loads task configurations based on user's selected level
 */
import beginnerConfig from '@/config/levels/beginner.json';
import intermediateConfig from '@/config/levels/intermediate.json';
import advancedConfig from '@/config/levels/advanced.json';

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface TaskItem {
    id: string;
    name: string;
    hasanat: number;
    isTime?: boolean; // For sleep/wake time fields
}

export interface Category {
    id: string;
    name: string;
    nameEn: string;
    color: string;
    emoji?: string;
    bulletEmoji?: string;
    items: TaskItem[];
}

export interface Section {
    id: string;
    title: string;
    titleUr: string;
    categories: Category[];
}

export interface LevelConfig {
    sections: Section[];
}

const configs: Record<Level, LevelConfig> = {
    beginner: beginnerConfig as LevelConfig,
    intermediate: intermediateConfig as LevelConfig,
    advanced: advancedConfig as LevelConfig,
};

/**
 * Get the task configuration for a specific level
 */
export function getLevelConfig(level: Level): LevelConfig {
    return configs[level] || configs.beginner;
}

/**
 * Get all categories from all sections (flattened)
 */
export function getAllCategories(level: Level): Category[] {
    const config = getLevelConfig(level);
    return config.sections.flatMap(section => section.categories);
}

/**
 * Get total number of tasks for a level
 */
export function getTotalTasks(level: Level): number {
    return getAllCategories(level).reduce((sum, cat) => sum + cat.items.length, 0);
}
