import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { Coordinates, PrayerTimes, CalculationMethod } from 'adhan';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/components/ui';
import { useTheme } from '@/hooks';
import { spacing } from '@/constants/Colors';
import { formatDateUrdu } from '@/utils/dateUtils';
import { scheduleAllNotifications } from '@/services/notifications';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface PrayerTimeData {
    name: string;
    nameUr: string;
    time: Date;
    icon: IoniconsName;
}

// Prayer icons mapping
const PRAYER_ICONS: Record<string, IoniconsName> = {
    fajr: 'moon-outline',
    sunrise: 'sunny-outline',
    dhuhr: 'sunny',
    asr: 'partly-sunny-outline',
    maghrib: 'cloudy-night-outline',
    isha: 'moon',
};

/**
 * Prayer Times Widget - Shows 5 prayers + sunrise with countdown
 */
export function PrayerTimesWidget() {
    const { colors, isDark } = useTheme();
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [cityName, setCityName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Request location permission and get location
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    // Default to Karachi if permission denied
                    setLocation({ latitude: 24.8607, longitude: 67.0011 });
                    setCityName('Karachi, PK');
                    setLoading(false);
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Low,
                });
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });

                // Reverse geocode to get city name
                try {
                    const [address] = await Location.reverseGeocodeAsync({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    });
                    if (address) {
                        const city = address.city || address.subregion || address.region || '';
                        const country = address.isoCountryCode || '';
                        setCityName(`${city}, ${country}`);
                    }
                } catch {
                    setCityName('');
                }
            } catch (error) {
                // Default to Karachi on error
                setLocation({ latitude: 24.8607, longitude: 67.0011 });
                setCityName('Karachi, PK');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Update current time every second for countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate prayer times
    const prayerTimes = useMemo(() => {
        if (!location) return null;

        const coordinates = new Coordinates(location.latitude, location.longitude);
        const params = CalculationMethod.Karachi();
        const date = new Date();

        return new PrayerTimes(coordinates, date, params);
    }, [location]);

    // Schedule notifications when prayer times are calculated
    useEffect(() => {
        if (prayerTimes) {
            scheduleAllNotifications(undefined, {
                fajr: prayerTimes.fajr,
                sunrise: prayerTimes.sunrise,
                dhuhr: prayerTimes.dhuhr,
                asr: prayerTimes.asr,
                maghrib: prayerTimes.maghrib,
                isha: prayerTimes.isha,
            });
        }
    }, [prayerTimes]);

    // Format prayer data
    const prayers = useMemo((): PrayerTimeData[] => {
        if (!prayerTimes) return [];

        return [
            { name: 'Fajr', nameUr: 'فجر', time: prayerTimes.fajr, icon: PRAYER_ICONS.fajr },
            { name: 'Sunrise', nameUr: 'طلوع', time: prayerTimes.sunrise, icon: PRAYER_ICONS.sunrise },
            { name: 'Dhuhr', nameUr: 'ظہر', time: prayerTimes.dhuhr, icon: PRAYER_ICONS.dhuhr },
            { name: 'Asr', nameUr: 'عصر', time: prayerTimes.asr, icon: PRAYER_ICONS.asr },
            { name: 'Maghrib', nameUr: 'مغرب', time: prayerTimes.maghrib, icon: PRAYER_ICONS.maghrib },
            { name: 'Isha', nameUr: 'عشاء', time: prayerTimes.isha, icon: PRAYER_ICONS.isha },
        ];
    }, [prayerTimes]);

    // Find current and next prayer
    const { nextPrayer, countdown } = useMemo(() => {
        if (!prayers.length) return { nextPrayer: null, countdown: '' };

        const now = currentTime;
        let next: PrayerTimeData | null = null;

        // Find the next prayer
        for (let i = 0; i < prayers.length; i++) {
            if (prayers[i].time > now) {
                next = prayers[i];
                break;
            }
        }

        // If no next prayer found today, next is tomorrow's Fajr
        if (!next) {
            next = prayers[0];
        }

        // Calculate countdown
        let diff = next.time.getTime() - now.getTime();
        if (diff < 0) {
            // Next prayer is tomorrow
            diff += 24 * 60 * 60 * 1000;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let countdownStr = '';
        if (hours > 0) {
            countdownStr = `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            countdownStr = `${minutes}m ${seconds}s`;
        } else {
            countdownStr = `${seconds}s`;
        }

        return { nextPrayer: next, countdown: countdownStr };
    }, [prayers, currentTime]);

    // Format time to display (12-hour format)
    const formatTime = (date: Date): string => {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        hours = hours % 12 || 12;
        return `${hours}:${minutes}`;
    };

    if (loading) {
        return (
            <Card variant="elevated" style={[styles.container, { backgroundColor: colors.surface }]}>
                <Text variant="body" color="secondary" align="center">
                    Loading prayer times...
                </Text>
            </Card>
        );
    }

    return (
        <Card variant="elevated" style={[styles.container, { backgroundColor: isDark ? 'rgba(64, 145, 108, 0.12)' : 'rgba(200, 230, 215, 0.5)' }]}>
            {/* Header with date and location */}
            <View style={styles.headerRow}>
                <Text variant="h3" weight="bold" style={{ writingDirection: 'rtl', color: colors.textPrimary }}>
                    {formatDateUrdu(currentTime)}
                </Text>
                {cityName && (
                    <View style={styles.locationBadge}>
                        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                        <Text variant="caption" color="muted">
                            {cityName}
                        </Text>
                    </View>
                )}
            </View>

            {/* Current prayer countdown */}
            {nextPrayer && (
                <View style={styles.countdownRow}>
                    <Ionicons name={nextPrayer.icon} size={20} color={colors.primary} />
                    <Text variant="body" weight="semibold" style={{ color: colors.textPrimary }}>
                        {nextPrayer.name} in {countdown}
                    </Text>
                </View>
            )}

            {/* Prayer times row */}
            <View style={styles.timesRow}>
                {prayers.map((prayer) => {
                    const isActive = nextPrayer?.name === prayer.name;

                    return (
                        <View key={prayer.name} style={styles.prayerItem}>
                            <Ionicons
                                name={prayer.icon}
                                size={18}
                                color={isActive ? colors.primary : colors.textMuted}
                            />
                            <Text
                                variant="caption"
                                weight={isActive ? 'semibold' : 'regular'}
                                style={{ color: isActive ? colors.primary : colors.textSecondary }}
                            >
                                {prayer.name}
                            </Text>
                            <Text
                                variant="body"
                                weight="semibold"
                                style={{ color: isActive ? colors.primary : colors.textPrimary }}
                            >
                                {formatTime(prayer.time)}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    countdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    timesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    prayerItem: {
        alignItems: 'center',
        gap: 2,
    },
});
