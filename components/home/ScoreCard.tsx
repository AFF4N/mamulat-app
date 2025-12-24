import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks';

interface ScoreCardProps {
    score: number; // 0-100
    streakDays: number;
    motivationalText?: string;
    subtitle?: string;
}

/**
 * Premium score card with animated circular progress ring
 */
export function ScoreCard({
    score,
    streakDays,
    motivationalText = "You're doing great!",
    subtitle = "Keep it up to hit your weekly goal."
}: ScoreCardProps) {
    const { colors, isDark } = useTheme();

    // Circle dimensions
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate progress (0-100 scale)
    const progress = Math.min(Math.max(score, 0), 100);
    const strokeDashoffset = circumference * (1 - progress / 100);

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: isDark
                    ? 'rgba(64, 145, 108, 0.15)'
                    : 'rgba(200, 230, 215, 0.6)',
                borderColor: isDark ? 'rgba(64, 145, 108, 0.3)' : 'rgba(100, 180, 140, 0.3)',
            }
        ]}>
            {/* Circular Progress */}
            <View style={styles.scoreContainer}>
                <Svg width={size} height={size} style={styles.svg}>
                    {/* Background circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.primary}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </Svg>

                {/* Score text overlay */}
                <View style={styles.scoreTextContainer}>
                    <Text style={[styles.scoreNumber, { color: colors.primary }]}>
                        {score}
                    </Text>
                    <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                        Score
                    </Text>
                </View>
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
                <Text variant="h3" weight="bold" style={{ color: colors.textPrimary }}>
                    {motivationalText}
                </Text>
                <View style={styles.streakRow}>
                    <Ionicons name="flame" size={16} color="#FF6B35" />
                    <Text variant="body" weight="semibold" style={{ color: colors.textPrimary }}>
                        {streakDays} Days Streak!
                    </Text>
                </View>
                <Text variant="bodySmall" color="secondary">
                    {subtitle}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 16,
        alignItems: 'center',
    },
    scoreContainer: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    svg: {
        position: 'absolute',
    },
    scoreTextContainer: {
        alignItems: 'center',
    },
    scoreNumber: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 28,
    },
    scoreLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
});
