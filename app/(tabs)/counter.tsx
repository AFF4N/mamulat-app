import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Pressable,
    Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text, Card, Button } from '@/components/ui';
import { useTheme } from '@/hooks';
import { spacing, borderRadius } from '@/constants/Colors';

// Preset dhikr options
const DHIKR_PRESETS = [
    { id: 'subhanallah', name: 'سبحان اللہ', nameEn: 'SubhanAllah', target: 33 },
    { id: 'alhamdulillah', name: 'الحمد للہ', nameEn: 'Alhamdulillah', target: 33 },
    { id: 'allahuakbar', name: 'اللہ اکبر', nameEn: 'Allahu Akbar', target: 34 },
    { id: 'istighfar', name: 'استغفار', nameEn: 'Istighfar', target: 100 },
    { id: 'kalimatayyab', name: 'پہلا کلمہ', nameEn: 'First Kalima', target: 100 },
    { id: 'kalimatamjeed', name: 'کلمہ تیسرا', nameEn: 'Third Kalima', target: 100 },
    { id: 'durood', name: 'درود شریف', nameEn: 'Durood Shareef', target: 100 },
];

/**
 * Tasbih Counter Screen - Digital tasbih with haptic feedback
 */
export default function CounterScreen() {
    const { colors, isDark } = useTheme();
    const [count, setCount] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState(DHIKR_PRESETS[0]);

    const handleCount = useCallback(() => {
        // Haptic feedback on each count
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setCount(prev => prev + 1);
    }, []);

    const handleReset = useCallback(() => {
        setCount(0);
    }, []);

    const progress = Math.min((count / selectedPreset.target) * 100, 100);
    const isComplete = count >= selectedPreset.target;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Dhikr Selector */}
                <View style={styles.presetSelector}>
                    {DHIKR_PRESETS.map((preset) => (
                        <TouchableOpacity
                            key={preset.id}
                            onPress={() => {
                                setSelectedPreset(preset);
                                setCount(0);
                            }}
                            style={[
                                styles.presetButton,
                                {
                                    backgroundColor: selectedPreset.id === preset.id
                                        ? colors.primary
                                        : colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Text
                                variant="bodySmall"
                                style={{
                                    color: selectedPreset.id === preset.id
                                        ? '#FFFFFF'
                                        : colors.textPrimary,
                                }}
                            >
                                {preset.nameEn}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Current Dhikr Display */}
                <View style={styles.dhikrDisplay}>
                    <Text variant="h2" weight="bold" style={{ writingDirection: 'rtl' }}>
                        {selectedPreset.name}
                    </Text>
                    <Text variant="body" color="secondary">
                        Target: {selectedPreset.target}
                    </Text>
                </View>

                {/* Main Counter Button */}
                <View style={styles.counterSection}>
                    <Pressable
                        onPress={handleCount}
                        style={({ pressed }) => [
                            styles.counterButton,
                            {
                                backgroundColor: isComplete ? colors.accent : colors.primary,
                                transform: [{ scale: pressed ? 0.95 : 1 }],
                            },
                        ]}
                    >
                        <Text style={styles.countText}>{count}</Text>
                        <View style={styles.progressRing}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${progress}%`,
                                        backgroundColor: isComplete ? '#27AE60' : colors.primaryLight,
                                    },
                                ]}
                            />
                        </View>
                    </Pressable>

                    {/* Progress indicator */}
                    <Text
                        variant="body"
                        color="secondary"
                        align="center"
                        style={{ marginTop: spacing.md }}
                    >
                        {count} / {selectedPreset.target}
                        {isComplete && ' ✅ Complete!'}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <Button variant="outline" size="lg" onPress={handleReset}>
                        Reset
                    </Button>
                </View>

                {/* Instructions */}
                <Card variant="elevated" style={styles.instructions}>
                    <Text variant="caption" color="secondary" align="center">
                        Tap the circle to count. Haptic feedback enabled on device.
                    </Text>
                </Card>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
    presetSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    presetButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    dhikrDisplay: {
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    counterSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        overflow: 'hidden',
    },
    countText: {
        fontSize: 64,
        lineHeight: 80,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    progressRing: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    progressFill: {
        height: '100%',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    instructions: {
        marginTop: spacing.lg,
        paddingVertical: spacing.sm,
    },
});
