/**
 * Date utilities for the app
 */

const URDU_MONTHS = [
    'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
];

const URDU_DAYS = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date as YYYY-MM-DD string
 */
export function getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
    return dateString === getTodayString();
}

/**
 * Check if a date string was yesterday
 */
export function isYesterday(dateString: string): boolean {
    return dateString === getYesterdayString();
}

/**
 * Format date in Urdu
 */
export function formatDateUrdu(date: Date = new Date()): string {
    const day = date.getDate();
    const month = URDU_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

/**
 * Get current day name in Urdu
 */
export function getDayNameUrdu(date: Date = new Date()): string {
    return URDU_DAYS[date.getDay()];
}

/**
 * Get the weekday index (0 = Monday, 6 = Sunday)
 */
export function getWeekdayIndex(date: Date = new Date()): number {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, shift others
}

/**
 * Get start of current week (Monday) as date string
 */
export function getWeekStartString(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);
    return monday.toISOString().split('T')[0];
}

/**
 * Calculate days between two date strings
 */
export function daysBetween(dateStr1: string, dateStr2: string): number {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get milliseconds until midnight
 */
export function msUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
}
