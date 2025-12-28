/**
 * Level Comparison Configuration
 * Defines the features and differences between maamulat levels
 */

export interface LevelFeature {
    label: string;
    labelUr: string;
    beginner: string | boolean;
    intermediate: string | boolean;
    advanced: string | boolean;
}

export interface LevelSummary {
    id: 'beginner' | 'intermediate' | 'advanced';
    title: string;
    titleUr: string;
    description: string;
    descriptionUr: string;
    color: string;
    estTime: string;
}

export const LEVEL_SUMMARIES: Record<string, LevelSummary> = {
    beginner: {
        id: 'beginner',
        title: 'Beginner',
        titleUr: 'مبتدی',
        description: 'Focus on Faraiz & basic Sunnah',
        descriptionUr: 'فرائض اور بنیادی سنتوں پر توجہ',
        color: '#27AE60',
        estTime: '15-20 min/day',
    },
    intermediate: {
        id: 'intermediate',
        title: 'Intermediate',
        titleUr: 'درمیانہ',
        description: 'Added Azkar & Nafl prayers',
        descriptionUr: 'مزید اذکار اور نوافل کا اضافہ',
        color: '#D68910',
        estTime: '30-40 min/day',
    },
    advanced: {
        id: 'advanced',
        title: 'Advanced',
        titleUr: 'اعلیٰ',
        description: 'Complete spiritual routine',
        descriptionUr: 'مکمل روحانی معمولات',
        color: '#E74C3C',
        estTime: '60+ min/day',
    },
};

export const COMPARISON_FEATURES: LevelFeature[] = [
    {
        label: 'Faraiz Prayers',
        labelUr: 'فرائض نمازیں',
        beginner: '✅',
        intermediate: '✅',
        advanced: '✅',
    },
    {
        label: 'Quran Recitation',
        labelUr: 'تلاوت قرآن',
        beginner: 'Selected Surahs',
        intermediate: '1 Juz',
        advanced: '1-3 Juz',
    },
    {
        label: 'Daily Azkar',
        labelUr: 'روزانہ اذکار',
        beginner: '100x each',
        intermediate: '300x each',
        advanced: '1000x each',
    },
    {
        label: 'Tahajjud',
        labelUr: 'تہجد',
        beginner: 'Optional',
        intermediate: 'Recommended',
        advanced: 'Required',
    },
    {
        label: 'Nafl Prayers',
        labelUr: 'نوافل',
        beginner: '❌',
        intermediate: 'Ishraq/Chasht',
        advanced: 'All Nafl',
    },
    {
        label: 'Protection Duas',
        labelUr: 'حفاظتی دعائیں',
        beginner: 'Basic',
        intermediate: 'Standard',
        advanced: 'Complete Manzil',
    },
];
