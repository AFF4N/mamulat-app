/**
 * Hasanat (reward) calculation utilities
 * Based on Islamic teachings about the rewards for various acts of worship
 */

// Reward values for different actions
export const HASANAT_VALUES = {
    // Fardh prayers
    fardh: {
        alone: 1,
        congregation: 27,
        takbeerOola: 50, // Bonus for first takbeer
    },
    
    // Nawafil prayers
    nawafil: {
        tahajjud: 100,
        ishraq: 50,
        chasht: 50,
        awabeen: 50,
    },
    
    // Quran
    quran: {
        perAyah: 10,
        yaseen: 100,     // Special surahs
        waqiah: 100,
        mulk: 100,
        tilawat: 50,     // General recitation
    },
    
    // Adhkar
    adhkar: {
        tasbih: 1,           // Per count
        istighfar: 10,       // Per 100
        durood: 10,          // Per 100
        kalima: 10,          // Per 100
    },
};

/**
 * Calculate hasanat for completing a task
 */
export function calculateTaskHasanat(
    categoryId: string, 
    taskId: string, 
    inCongregation: boolean = true
): number {
    // Fardh prayers
    if (categoryId === 'faraiz') {
        const prayers = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];
        if (prayers.includes(taskId)) {
            const base = inCongregation ? HASANAT_VALUES.fardh.congregation : HASANAT_VALUES.fardh.alone;
            return base;
        }
        if (taskId === 'takbeer') {
            return HASANAT_VALUES.fardh.takbeerOola;
        }
    }
    
    // Quran
    if (categoryId === 'quran') {
        if (taskId === 'yaseen') return HASANAT_VALUES.quran.yaseen;
        if (taskId === 'waqiah') return HASANAT_VALUES.quran.waqiah;
        if (taskId === 'mulk') return HASANAT_VALUES.quran.mulk;
        if (taskId === 'tilawat') return HASANAT_VALUES.quran.tilawat;
    }
    
    // Adhkar
    if (categoryId === 'azkar-morning' || categoryId === 'azkar-evening') {
        if (taskId.includes('istighfar')) return HASANAT_VALUES.adhkar.istighfar;
        if (taskId.includes('durood')) return HASANAT_VALUES.adhkar.durood;
        if (taskId.includes('kalima')) return HASANAT_VALUES.adhkar.kalima;
    }
    
    // Nawafil
    if (categoryId === 'nawafil') {
        if (taskId === 'tahajjud') return HASANAT_VALUES.nawafil.tahajjud;
        if (taskId === 'ishraq') return HASANAT_VALUES.nawafil.ishraq;
        if (taskId === 'chasht') return HASANAT_VALUES.nawafil.chasht;
        if (taskId === 'awabeen') return HASANAT_VALUES.nawafil.awabeen;
    }
    
    // Default reward
    return 10;
}

/**
 * Calculate hasanat for tasbih counts
 */
export function calculateTasbihHasanat(count: number): number {
    return count * HASANAT_VALUES.adhkar.tasbih;
}

/**
 * Format hasanat number with suffix
 */
export function formatHasanat(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
}
