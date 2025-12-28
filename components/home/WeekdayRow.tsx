import { View, StyleSheet, TouchableOpacity, ScrollView, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks';
import { useRef, useEffect, useState } from 'react';
import { getTodayString } from '@/utils/dateUtils';

interface HistoryStat {
    percent: number;
    completed: boolean;
}

interface WeekdayRowProps {
    selectedDate: string; // YYYY-MM-DD
    onSelectDate: (date: string) => void;
    historyStats?: Record<string, HistoryStat>; // date -> stat
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Premium weekday progress row
 * Shows checkmarks for completed days, X for failed days, current day highlighted
 */
export function WeekdayRow({ selectedDate, onSelectDate, historyStats = {} }: WeekdayRowProps) {
    const { colors, isDark } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);
    const today = getTodayString();

    // Generate last 30 days
    const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i)); // -29 to 0 (today)
        return {
            date: d.toISOString().split('T')[0],
            dayName: DAYS[d.getDay()], // Sun-Sat
            dayNum: d.getDate(),
            fullDate: d,
        };
    });

    useEffect(() => {
        // Scroll to end (today) on mount
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 100);
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
            >
                {days.map((dayItem, index) => {
                    const isSelected = dayItem.date === selectedDate;
                    const isToday = dayItem.date === today;
                    const isFuture = dayItem.fullDate > new Date(); // Basic check, though logic prevents future gen

                    const stat = historyStats[dayItem.date];
                    const hasData = !!stat;
                    const isSuccess = stat?.completed || (stat?.percent || 0) >= 60;

                    return (
                        <TouchableOpacity
                            key={dayItem.date}
                            style={styles.dayItem}
                            onPress={() => onSelectDate(dayItem.date)}
                            activeOpacity={0.7}
                        >
                            {/* Day label */}
                            <Text
                                variant="caption"
                                color={isSelected ? 'primary' : 'muted'}
                                weight={isSelected ? 'bold' : 'regular'}
                                style={styles.dayLabel}
                            >
                                {dayItem.dayName}
                            </Text>

                            {/* Day indicator */}
                            <View
                                style={[
                                    styles.dayCircle,
                                    // Default background
                                    {
                                        backgroundColor: isSelected ? colors.surfaceVariant : (isDark ? '#4A4A4A' : '#E9ECEF'),
                                        borderWidth: isSelected ? 2 : 0,
                                        borderColor: colors.primary,
                                    },
                                    // Success/Fail colors (if not selected, or subtle if selected)
                                    !isSelected && hasData && !isToday && isSuccess && {
                                        backgroundColor: '#D4EFDF', // Pastel Green
                                        borderColor: 'transparent',
                                    },
                                    !isSelected && hasData && !isToday && !isSuccess && {
                                        backgroundColor: '#FADBD8', // Pastel Red
                                        borderColor: 'transparent',
                                    },
                                    // Today highlight (always show border if today, unless selected overrides)
                                    isToday && !isSelected && {
                                        backgroundColor: 'transparent',
                                        borderWidth: 1.5,
                                        borderColor: colors.primary, // Theme primary green
                                    }
                                ]}
                            >
                                {/* Text or Icon */}
                                {isSelected ? (
                                    <Text variant="bodySmall" weight="bold" style={{ color: colors.textPrimary }}>
                                        {dayItem.dayNum}
                                    </Text>
                                ) : (
                                    isToday ? (
                                        <Text variant="bodySmall" weight="semibold" style={{ color: colors.textPrimary }}>
                                            {dayItem.dayNum}
                                        </Text>
                                    ) : (
                                        hasData ? (
                                            <Ionicons
                                                name={isSuccess ? "checkmark" : "close"}
                                                size={18}
                                                color={isSuccess ? "#27AE60" : "#C0392B"}
                                            />
                                        ) : (
                                            <Text variant="bodySmall" style={{ color: colors.textMuted }}>
                                                {dayItem.dayNum}
                                            </Text>
                                        )
                                    )
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 88,
        marginBottom: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    dayItem: {
        alignItems: 'center',
        gap: 8,
        width: 44, // Fixed width for alignment
    },
    dayLabel: {
        fontSize: 12,
    },
    dayCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currentDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1A1A2E',
    },
});
