import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/components/ui';
import { useTheme } from '@/hooks';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface QuickStatItem {
    icon: IoniconsName;
    iconColor: string;
    value: string | number;
    label: string;
    suffix?: string;
}

interface QuickStatsProps {
    stats: QuickStatItem[];
}

/**
 * Quick stats row showing 4 metrics
 * Each with an icon, value, and label
 */
export function QuickStats({ stats }: QuickStatsProps) {
    const { colors, isDark } = useTheme();

    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <Card
                    key={index}
                    variant="outlined"
                    style={[
                        styles.statCard,
                        { backgroundColor: isDark ? colors.surface : '#FFFFFF' }
                    ]}
                >
                    <Ionicons
                        name={stat.icon}
                        size={24}
                        color={stat.iconColor}
                    />
                    <View style={styles.valueRow}>
                        <Text style={[styles.value, { color: colors.textPrimary }]}>
                            {stat.value}
                        </Text>
                        {stat.suffix && (
                            <Text style={[styles.suffix, { color: colors.textMuted }]}>
                                {stat.suffix}
                            </Text>
                        )}
                    </View>
                    <Text variant="caption" color="secondary" style={styles.label}>
                        {stat.label}
                    </Text>
                </Card>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 10,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 16,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 8,
    },
    value: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 24,
    },
    suffix: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 2,
    },
    label: {
        marginTop: 2,
        textAlign: 'center',
    },
});
