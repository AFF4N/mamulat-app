import React, { useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/components/ui';
import { useTheme } from '@/hooks';
import { useAchievementStore, useUserStore } from '@/stores';
import { spacing, borderRadius } from '@/constants/Colors';

type IoniconsName = keyof typeof Ionicons.glyphMap;

/**
 * Achievement Badge Component
 */
function AchievementBadge({
    achievement,
    currentProgress,
}: {
    achievement: {
        id: string;
        name: string;
        nameUr: string;
        description: string;
        icon: string;
        iconColor: string;
        target: number;
        unlocked: boolean;
    };
    currentProgress: number;
}) {
    const { colors } = useTheme();
    const progressPercent = Math.min((currentProgress / achievement.target) * 100, 100);

    return (
        <Card
            variant={achievement.unlocked ? 'elevated' : 'outlined'}
            style={[
                styles.badge,
                !achievement.unlocked && { opacity: 0.7 },
            ]}
        >
            <View style={[
                styles.iconContainer,
                {
                    backgroundColor: achievement.unlocked
                        ? achievement.iconColor + '20'
                        : colors.surface,
                },
            ]}>
                <Ionicons
                    name={achievement.icon as IoniconsName}
                    size={28}
                    color={achievement.unlocked ? achievement.iconColor : colors.textMuted}
                />
                {achievement.unlocked && (
                    <View style={[styles.unlockedBadge, { backgroundColor: colors.accent }]}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                )}
            </View>

            <Text variant="bodySmall" weight="semibold" align="center">
                {achievement.name}
            </Text>

            <Text variant="caption" color="secondary" align="center" style={{ writingDirection: 'rtl' }}>
                {achievement.nameUr}
            </Text>

            {!achievement.unlocked && (
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${progressPercent}%`,
                                    backgroundColor: colors.primary,
                                }
                            ]}
                        />
                    </View>
                    <Text variant="caption" color="muted">
                        {currentProgress}/{achievement.target}
                    </Text>
                </View>
            )}
        </Card>
    );
}

/**
 * Achievements Screen - Display badges and progress
 */
export default function AchievementsScreen() {
    const { colors } = useTheme();
    const { achievements, checkAndUnlock } = useAchievementStore();
    const { currentStreak, totalHasanat } = useUserStore();

    // Check for new unlocks when screen loads
    useEffect(() => {
        const newlyUnlocked = checkAndUnlock({
            streak: currentStreak,
            totalHasanat,
            tahajjudCount: 0, // TODO: Track separately
            quranDays: 0,     // TODO: Track separately
            perfectDays: 0,   // TODO: Track separately
        });

        if (newlyUnlocked.length > 0) {
            // Could show a celebration modal here
            console.log('Newly unlocked:', newlyUnlocked);
        }
    }, [currentStreak, totalHasanat]);

    // Get current progress for each achievement type
    const getProgress = (achievement: typeof achievements[0]) => {
        if (achievement.id.startsWith('streak-')) {
            return currentStreak;
        }
        if (achievement.id.startsWith('hasanat-')) {
            return totalHasanat;
        }
        // TODO: Add more progress tracking
        return 0;
    };

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Stats */}
                <Card variant="elevated" style={styles.headerCard}>
                    <View style={styles.headerContent}>
                        <Ionicons name="trophy" size={40} color={colors.accent} />
                        <View style={styles.headerText}>
                            <Text variant="h2" weight="bold">
                                {unlockedCount}/{achievements.length}
                            </Text>
                            <Text variant="body" color="secondary">
                                Achievements Unlocked
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Achievements Grid */}
                <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
                    All Achievements
                </Text>

                <View style={styles.grid}>
                    {achievements.map((achievement) => (
                        <AchievementBadge
                            key={achievement.id}
                            achievement={achievement}
                            currentProgress={getProgress(achievement)}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    headerCard: {
        marginBottom: spacing.lg,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
    },
    headerText: {
        flex: 1,
    },
    sectionTitle: {
        marginBottom: spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    badge: {
        width: '48%',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    unlockedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        width: '100%',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.sm,
        gap: 4,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
