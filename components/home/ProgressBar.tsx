import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/components/ui';
import { useTheme } from '@/hooks';

interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
    showPercentage?: boolean;
}

/**
 * Premium progress bar with gradient colors
 */
export function ProgressBar({
    progress,
    label = "Your progress is on track",
    showPercentage = true
}: ProgressBarProps) {
    const { colors, isDark } = useTheme();
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <Card variant="outlined" style={[
            styles.container,
            { backgroundColor: isDark ? colors.surface : '#FFFFFF' }
        ]}>
            <View style={styles.barContainer}>
                {/* Multi-color gradient bar */}
                <View style={styles.barBackground}>
                    <View style={[styles.barSegment, { backgroundColor: '#FF6B6B', flex: 1 }]} />
                    <View style={[styles.barSegment, { backgroundColor: '#FFA94D', flex: 1 }]} />
                    <View style={[styles.barSegment, { backgroundColor: '#FFD43B', flex: 1 }]} />
                    <View style={[styles.barSegment, { backgroundColor: '#69DB7C', flex: 1 }]} />
                </View>

                {/* Progress overlay */}
                <View style={styles.progressOverlay}>
                    <View
                        style={[
                            styles.progressMask,
                            {
                                width: `${100 - clampedProgress}%`,
                                backgroundColor: isDark ? colors.background : '#F8F9FA',
                            }
                        ]}
                    />
                </View>

                {/* Progress indicator */}
                <View style={[styles.indicator, { left: `${clampedProgress}%` }]}>
                    <View style={[styles.indicatorDot, { backgroundColor: colors.textPrimary }]} />
                </View>
            </View>

            <View style={styles.labelRow}>
                <Ionicons
                    name={clampedProgress >= 60 ? "checkmark-circle" : "time"}
                    size={16}
                    color={clampedProgress >= 60 ? colors.primary : colors.textMuted}
                />
                <Text variant="bodySmall" color="secondary" style={styles.label}>
                    {label}
                </Text>
                {showPercentage && (
                    <Text variant="bodySmall" weight="semibold" style={{ color: colors.primary }}>
                        {clampedProgress}%
                    </Text>
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    barContainer: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    barBackground: {
        flexDirection: 'row',
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barSegment: {
        height: '100%',
    },
    progressOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    progressMask: {
        height: '100%',
    },
    indicator: {
        position: 'absolute',
        top: -4,
        marginLeft: -8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicatorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        flex: 1,
    },
});
