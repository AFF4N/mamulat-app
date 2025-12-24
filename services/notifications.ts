/**
 * Notification Service - Local push notifications for maamulat reminders
 * Works completely offline by scheduling notifications on device
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Notification types
export type NotificationType = 
    | 'fajr_reminder'
    | 'morning_azkar'
    | 'zuhr_reminder'
    | 'asr_reminder'
    | 'evening_azkar'
    | 'maghrib_reminder'
    | 'isha_reminder'
    | 'night_checkin';

// Notification config
export interface NotificationConfig {
    id: NotificationType;
    title: string;
    titleUr: string;
    body: string;
    bodyUr: string;
    enabled: boolean;
}

// Default notification settings
export const DEFAULT_NOTIFICATIONS: NotificationConfig[] = [
    {
        id: 'fajr_reminder',
        title: 'Fajr Time',
        titleUr: 'وقت فجر',
        body: 'Time for Fajr prayer',
        bodyUr: 'فجر کی نماز کا وقت ہو گیا',
        enabled: true,
    },
    {
        id: 'morning_azkar',
        title: 'Morning Adhkar',
        titleUr: 'صبح کے اذکار',
        body: 'Complete your morning adhkar',
        bodyUr: 'صبح کے اذکار مکمل کریں',
        enabled: true,
    },
    {
        id: 'zuhr_reminder',
        title: 'Zuhr Time',
        titleUr: 'وقت ظہر',
        body: 'Time for Zuhr prayer',
        bodyUr: 'ظہر کی نماز کا وقت ہو گیا',
        enabled: true,
    },
    {
        id: 'asr_reminder',
        title: 'Asr Time',
        titleUr: 'وقت عصر',
        body: 'Time for Asr prayer',
        bodyUr: 'عصر کی نماز کا وقت ہو گیا',
        enabled: true,
    },
    {
        id: 'evening_azkar',
        title: 'Evening Adhkar',
        titleUr: 'شام کے اذکار',
        body: 'Complete your evening adhkar',
        bodyUr: 'شام کے اذکار مکمل کریں',
        enabled: true,
    },
    {
        id: 'maghrib_reminder',
        title: 'Maghrib Time',
        titleUr: 'وقت مغرب',
        body: 'Time for Maghrib prayer',
        bodyUr: 'مغرب کی نماز کا وقت ہو گیا',
        enabled: true,
    },
    {
        id: 'isha_reminder',
        title: 'Isha Time',
        titleUr: 'وقت عشاء',
        body: 'Time for Isha prayer',
        bodyUr: 'عشاء کی نماز کا وقت ہو گیا',
        enabled: true,
    },
    {
        id: 'night_checkin',
        title: 'Daily Check-in',
        titleUr: 'روزانہ معمولات',
        body: 'How did your maamulat go today?',
        bodyUr: 'آج کے معمولات مکمل کریں',
        enabled: true,
    },
];

const STORAGE_KEY = 'notification-settings';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
        return false;
    }
    
    // Android-specific channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('maamulat-reminders', {
            name: 'Maamulat Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#27AE60',
        });
    }
    
    return true;
}

/**
 * Get notification settings from storage
 */
export async function getNotificationSettings(): Promise<NotificationConfig[]> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading notification settings:', error);
    }
    return DEFAULT_NOTIFICATIONS;
}

/**
 * Save notification settings
 */
export async function saveNotificationSettings(settings: NotificationConfig[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving notification settings:', error);
    }
}

/**
 * Toggle a specific notification type
 */
export async function toggleNotification(id: NotificationType, enabled: boolean): Promise<void> {
    const settings = await getNotificationSettings();
    const updated = settings.map(s => 
        s.id === id ? { ...s, enabled } : s
    );
    await saveNotificationSettings(updated);
    
    // Re-schedule notifications
    await scheduleAllNotifications(updated);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule a single notification
 */
export async function scheduleNotification(
    config: NotificationConfig,
    triggerDate: Date
): Promise<string | null> {
    if (!config.enabled) return null;
    
    // Don't schedule if time has passed
    if (triggerDate <= new Date()) {
        // Schedule for tomorrow
        triggerDate.setDate(triggerDate.getDate() + 1);
    }
    
    try {
        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: config.titleUr,
                body: config.bodyUr,
                data: { type: config.id },
                sound: true,
            },
            trigger: {
                date: triggerDate,
                channelId: Platform.OS === 'android' ? 'maamulat-reminders' : undefined,
            } as any,
        });
        return identifier;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
}

/**
 * Schedule notifications based on prayer times
 */
export async function scheduleAllNotifications(
    settings?: NotificationConfig[],
    prayerTimes?: {
        fajr: Date;
        sunrise: Date;
        dhuhr: Date;
        asr: Date;
        maghrib: Date;
        isha: Date;
    }
): Promise<void> {
    // Cancel existing notifications first
    await cancelAllNotifications();
    
    if (!prayerTimes) return;
    
    const notificationSettings = settings || await getNotificationSettings();
    
    for (const config of notificationSettings) {
        if (!config.enabled) continue;
        
        let triggerTime: Date | null = null;
        
        switch (config.id) {
            case 'fajr_reminder':
                triggerTime = new Date(prayerTimes.fajr);
                break;
            case 'morning_azkar':
                // 15 minutes after sunrise
                triggerTime = new Date(prayerTimes.sunrise);
                triggerTime.setMinutes(triggerTime.getMinutes() + 15);
                break;
            case 'zuhr_reminder':
                triggerTime = new Date(prayerTimes.dhuhr);
                break;
            case 'asr_reminder':
                triggerTime = new Date(prayerTimes.asr);
                break;
            case 'evening_azkar':
                // 30 minutes before maghrib
                triggerTime = new Date(prayerTimes.maghrib);
                triggerTime.setMinutes(triggerTime.getMinutes() - 30);
                break;
            case 'maghrib_reminder':
                triggerTime = new Date(prayerTimes.maghrib);
                break;
            case 'isha_reminder':
                triggerTime = new Date(prayerTimes.isha);
                break;
            case 'night_checkin':
                // 9 PM
                triggerTime = new Date();
                triggerTime.setHours(21, 0, 0, 0);
                break;
        }
        
        if (triggerTime) {
            await scheduleNotification(config, triggerTime);
        }
    }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
}
