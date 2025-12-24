import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/hooks';
import { spacing, borderRadius } from '@/constants/Colors';

// Dhikr types with their details
const DHIKR_TYPES = {
    subhanallah: {
        name: 'سبحان اللہ',
        nameEn: 'SubhanAllah',
        translation: 'Glory be to Allah',
        target: 33,
    },
    alhamdulillah: {
        name: 'الحمد للہ',
        nameEn: 'Alhamdulillah',
        translation: 'All praise is due to Allah',
        target: 33,
    },
    allahuakbar: {
        name: 'اللہ اکبر',
        nameEn: 'Allahu Akbar',
        translation: 'Allah is the Greatest',
        target: 34,
    },
    istighfar: {
        name: 'استغفرللہ',
        nameEn: 'Astaghfirullah',
        translation: 'I seek forgiveness from Allah',
        target: 100,
    },
    custom: {
        name: 'Custom',
        nameEn: 'Custom',
        translation: 'Custom dhikr',
        target: 100,
    },
};

/**
 * Counter Modal - Dedicated counting screen for specific dhikr
 */
export default function CounterModal() {
    const { colors } = useTheme();
    const { type } = useLocalSearchParams<{ type: string }>();
    const dhikr = DHIKR_TYPES[type as keyof typeof DHIKR_TYPES] ?? DHIKR_TYPES.subhanallah;

    const [count, setCount] = useState(0);
    const isComplete = count >= dhikr.target;

    const handleCount = () => {
        setCount(prev => prev + 1);
    };

    const handleReset = () => {
        setCount(0);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Dhikr Name */}
                <View style={styles.header}>
                    <Text variant="h1" weight="bold" style={{ writingDirection: 'rtl' }}>
                        {dhikr.name}
                    </Text>
                    <Text variant="body" color="secondary">
                        {dhikr.translation}
                    </Text>
                </View>

                {/* Main Counter */}
                <View style={styles.counterSection}>
                    <Pressable
                        onPress={handleCount}
                        style={({ pressed }) => [
                            styles.counterButton,
                            {
                                backgroundColor: isComplete ? colors.accent : colors.primary,
                                transform: [{ scale: pressed ? 0.92 : 1 }],
                            },
                        ]}
                    >
                        <Text style={styles.countText}>{count}</Text>
                    </Pressable>

                    <Text variant="h3" color="secondary" align="center" style={{ marginTop: spacing.md }}>
                        / {dhikr.target}
                    </Text>

                    {isComplete && (
                        <Text variant="body" align="center" style={{ color: colors.accent, marginTop: spacing.sm }}>
                            ✅ Target Reached!
                        </Text>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button variant="outline" onPress={handleReset}>
                        Reset
                    </Button>
                    <Button
                        variant="primary"
                        onPress={() => {
                            console.log('Saved:', count);
                            router.back();
                        }}
                    >
                        Done
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
    content: {
        flex: 1,
        padding: spacing.md,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    counterSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterButton: {
        width: 220,
        height: 220,
        borderRadius: 110,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    countText: {
        fontSize: 72,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },
});
