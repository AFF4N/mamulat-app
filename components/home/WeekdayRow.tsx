import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks';

interface WeekdayRowProps {
    completedDays: boolean[]; // Array of 7 booleans for Mo-Su (true=passed 60%, false=failed)
    currentDayIndex: number; // 0-6 (Mon-Sun)
    onDayPress?: (index: number) => void;
}

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Premium weekday progress row
 * Shows checkmarks for completed days, X for failed days, current day highlighted
 */
export function WeekdayRow({ completedDays, currentDayIndex, onDayPress }: WeekdayRowProps) {
    const { colors, isDark } = useTheme();

    return (
        <View style={styles.container}>
            {DAYS.map((day, index) => {
                const isPast = index < currentDayIndex;
                const isCurrent = index === currentDayIndex;
                const isFuture = index > currentDayIndex;
                const wasCompleted = completedDays[index];

                return (
                    <TouchableOpacity
                        key={day}
                        style={styles.dayItem}
                        onPress={() => onDayPress?.(index)}
                        activeOpacity={0.7}
                        disabled={isFuture}
                    >
                        {/* Day label */}
                        <Text
                            variant="caption"
                            color={isCurrent ? 'primary' : 'muted'}
                            weight={isCurrent ? 'semibold' : 'regular'}
                            style={styles.dayLabel}
                        >
                            {day}
                        </Text>

                        {/* Day indicator */}
                        <View
                            style={[
                                styles.dayCircle,
                                // Past days - show result
                                isPast && wasCompleted && {
                                    backgroundColor: '#27AE60',
                                },
                                isPast && !wasCompleted && {
                                    backgroundColor: isDark ? '#4A4A4A' : '#E9ECEF',
                                },
                                // Current day - gold highlight
                                isCurrent && {
                                    backgroundColor: '#D4AF37',
                                    borderWidth: 0,
                                },
                                // Future days - empty outline
                                isFuture && {
                                    backgroundColor: 'transparent',
                                    borderWidth: 2,
                                    borderColor: isDark ? '#3A3A3A' : '#DEE2E6',
                                },
                            ]}
                        >
                            {/* Past completed - checkmark */}
                            {isPast && wasCompleted && (
                                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                            )}

                            {/* Past failed - X mark */}
                            {isPast && !wasCompleted && (
                                <Ionicons name="close" size={18} color={colors.textMuted} />
                            )}

                            {/* Current day - dot */}
                            {isCurrent && (
                                <View style={styles.currentDot} />
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 16,
    },
    dayItem: {
        alignItems: 'center',
        gap: 8,
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
