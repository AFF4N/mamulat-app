import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ImageBackground,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Button, Card } from '@/components/ui';
import { useTheme } from '@/hooks';
import { spacing, borderRadius } from '@/constants/Colors';

// Mock challenge data - would come from backend
const CHALLENGES = {
    'trees-jannah': {
        id: 'trees-jannah',
        name: '1000 Trees in Jannah',
        nameUr: 'جنت میں ہزار درخت',
        description: 'Say "SubhanAllah wa bihamdihi" 1000 times to plant trees in Jannah',
        dhikr: 'سبحان اللہ وبحمدہ',
        dhikrEn: 'SubhanAllah wa bihamdihi',
        target: 1000,
        reward: 'A tree planted in Jannah for each recitation',
        endDate: '2025-01-01',
        daysLeft: 9,
    },
    'ramadan-prep': {
        id: 'ramadan-prep',
        name: 'Ramadan Preparation',
        nameUr: 'رمضان کی تیاری',
        description: 'Prepare for the blessed month with increased dhikr',
        dhikr: 'استغفراللہ',
        dhikrEn: 'Astaghfirullah',
        target: 10000,
        reward: 'Start Ramadan with a clean slate',
        endDate: '2025-02-28',
        daysLeft: 67,
    },
};

/**
 * Challenge Detail Screen - Dynamic seasonal challenge with counter
 */
export default function ChallengeScreen() {
    const { colors, isDark } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const challenge = CHALLENGES[id as keyof typeof CHALLENGES] ?? CHALLENGES['trees-jannah'];

    const [count, setCount] = useState(456); // Mock existing progress
    const [sessionCount, setSessionCount] = useState(0);

    const progress = (count / challenge.target) * 100;

    const handleCount = () => {
        setCount(prev => prev + 1);
        setSessionCount(prev => prev + 1);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header with gradient effect */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <View style={styles.headerContent}>
                    <Text variant="h2" weight="bold" style={{ color: '#FFFFFF' }}>
                        {challenge.name}
                    </Text>
                    <Text style={[styles.headerSubtitle, { writingDirection: 'rtl' }]}>
                        {challenge.nameUr}
                    </Text>
                    <View style={styles.timerBadge}>
                        <Text variant="bodySmall" style={{ color: '#FFFFFF' }}>
                            ⏰ {challenge.daysLeft} days left
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                {/* Progress Card */}
                <Card variant="elevated" style={styles.progressCard}>
                    <Text variant="h1" weight="bold" align="center" style={{ color: colors.accent }}>
                        {count.toLocaleString()}
                    </Text>
                    <Text variant="body" color="secondary" align="center">
                        / {challenge.target.toLocaleString()}
                    </Text>

                    <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${Math.min(progress, 100)}%`,
                                    backgroundColor: colors.primary,
                                }
                            ]}
                        />
                    </View>

                    <Text variant="caption" color="muted" align="center">
                        {progress.toFixed(1)}% complete
                    </Text>
                </Card>

                {/* Dhikr Display */}
                <View style={styles.dhikrSection}>
                    <Text variant="h2" weight="semibold" align="center" style={{ writingDirection: 'rtl' }}>
                        {challenge.dhikr}
                    </Text>
                    <Text variant="body" color="secondary" align="center">
                        {challenge.dhikrEn}
                    </Text>
                </View>

                {/* Counter Button */}
                <Pressable
                    onPress={handleCount}
                    style={({ pressed }) => [
                        styles.counterButton,
                        {
                            backgroundColor: colors.primary,
                            transform: [{ scale: pressed ? 0.95 : 1 }],
                        },
                    ]}
                >
                    <Text style={styles.buttonText}>🌳 Tap to Count</Text>
                    <Text style={styles.sessionText}>
                        +{sessionCount} this session
                    </Text>
                </Pressable>

                {/* Reward Info */}
                <Card variant="outlined" style={styles.rewardCard}>
                    <Text variant="bodySmall" weight="semibold">🎁 Reward</Text>
                    <Text variant="caption" color="secondary">
                        {challenge.reward}
                    </Text>
                </Card>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button variant="outline" onPress={() => router.back()}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onPress={() => {
                            console.log('Saved session count:', sessionCount);
                            router.back();
                        }}
                    >
                        Save & Exit
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.md,
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: borderRadius.xl,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18,
        marginTop: spacing.xs,
    },
    timerBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginTop: spacing.sm,
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
    progressCard: {
        marginTop: -spacing.lg,
        paddingVertical: spacing.lg,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    dhikrSection: {
        marginVertical: spacing.lg,
        paddingVertical: spacing.md,
    },
    counterButton: {
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    sessionText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: spacing.xs,
    },
    rewardCard: {
        marginTop: spacing.lg,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        marginTop: spacing.lg,
    },
});
