import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Card } from '@/components/ui';
import { useTheme } from '@/hooks';
import { spacing, borderRadius } from '@/constants/Colors';
import { LEVEL_SUMMARIES, LevelSummary } from '@/config/levelComparison';
import { getLevelConfig } from '@/config';

interface LevelComparisonDrawerProps {
    visible: boolean;
    onClose: () => void;
    currentLevel: string;
    targetLevel: string;
    onConfirm: (level: string) => void;
}

export function LevelComparisonDrawer({
    visible,
    onClose,
    currentLevel,
    targetLevel,
    onConfirm,
}: LevelComparisonDrawerProps) {
    const { colors, isDark } = useTheme();

    // We only need target to check if config exists initially, 
    // but the tab state drives the view now.
    const target = LEVEL_SUMMARIES[targetLevel];

    // Ensure we have a valid starting tab
    const initialTab = (targetLevel || currentLevel || 'beginner') as 'beginner' | 'intermediate' | 'advanced';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Safety check - if activeTab is invalid, fallback to beginner
    const activeLevelSummary = LEVEL_SUMMARIES[activeTab] || LEVEL_SUMMARIES.beginner;
    const activeLevelConfig = getLevelConfig(activeTab as 'beginner' | 'intermediate' | 'advanced');

    useEffect(() => {
        if (visible && targetLevel) {
            setActiveTab(targetLevel as 'beginner' | 'intermediate' | 'advanced');
        }
    }, [visible, targetLevel]);

    const handleProceed = () => {
        Alert.alert(
            'Reset Warning',
            'Switching levels will reset your current layout and remove any custom tasks. Are you sure you want to proceed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Reset & Switch',
                    style: 'destructive',
                    onPress: () => {
                        onConfirm(activeTab); // Switch to the currently viewed tab
                        onClose();
                    }
                },
            ]
        );
    };

    if (!target) return null;

    const tabs = ['beginner', 'intermediate', 'advanced'];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text variant="h3" weight="bold">Level Details</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Level Tabs */}
                <View style={styles.tabsContainer}>
                    {tabs.map((tabId) => {
                        const summary = LEVEL_SUMMARIES[tabId];
                        const isActive = activeTab === tabId;
                        return (
                            <TouchableOpacity
                                key={tabId}
                                style={[
                                    styles.tab,
                                    isActive && { borderBottomColor: summary.color, borderBottomWidth: 2 }
                                ]}
                                onPress={() => setActiveTab(tabId as 'beginner' | 'intermediate' | 'advanced')}
                            >
                                <Text
                                    variant="bodySmall"
                                    weight={isActive ? 'bold' : 'regular'}
                                    style={{ color: isActive ? summary.color : colors.textSecondary }}
                                >
                                    {summary.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Level Summary Banner */}
                    <Card
                        variant="elevated"
                        style={[styles.summaryBanner, { backgroundColor: activeLevelSummary.color + '15', borderColor: activeLevelSummary.color }]}
                    >
                        <View style={styles.bannerHeader}>
                            <Text variant="h3" weight="bold" style={{ color: activeLevelSummary.color }}>
                                {activeLevelSummary.title}
                            </Text>
                            {activeTab === currentLevel && (
                                <View style={[styles.badge, { backgroundColor: colors.textPrimary }]}>
                                    <Text variant="caption" style={{ color: colors.background, fontSize: 10 }} weight="bold">CURRENT</Text>
                                </View>
                            )}
                        </View>
                        <Text variant="caption" style={{ color: activeLevelSummary.color }}>{activeLevelSummary.estTime}</Text>
                        <Text variant="body" style={{ marginTop: spacing.xs, color: activeLevelSummary.color }}>{activeLevelSummary.description}</Text>
                        <Text variant="body" style={{ writingDirection: 'rtl', color: activeLevelSummary.color }}>{activeLevelSummary.descriptionUr}</Text>
                    </Card>

                    {/* Task List */}
                    <View style={styles.taskList}>
                        {activeLevelConfig.sections.map((section) => (
                            <View key={section.id} style={styles.section}>
                                <Text variant="body" weight="bold" style={styles.sectionTitle}>{section.title}</Text>
                                {section.categories.map((category) => (
                                    <View key={category.id} style={styles.categoryBlock}>
                                        <View style={styles.categoryHeader}>
                                            <Text variant="bodySmall" weight="semibold">{category.name}</Text>
                                        </View>

                                        {category.items.map((item: any) => (
                                            <View key={item.id} style={[styles.taskRow, { borderBottomColor: colors.border }]}>
                                                <View style={{ flex: 1 }}>
                                                    <Text variant="bodySmall">{item.name}</Text>
                                                    {item.nameUr && (
                                                        <Text variant="caption" color="secondary" style={{ writingDirection: 'rtl' }}>
                                                            {item.nameUr}
                                                        </Text>
                                                    )}
                                                </View>

                                                {item.count && (
                                                    <View style={[styles.countBadge, { backgroundColor: colors.surfaceVariant }]}>
                                                        <Text variant="caption" weight="bold">{item.count}x</Text>
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Footer Action */}
                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    <Button
                        variant="primary"
                        size="lg"
                        onPress={handleProceed}
                        style={{ backgroundColor: activeLevelSummary.color }}
                        disabled={activeTab === currentLevel}
                    >
                        {activeTab === currentLevel ? 'Current Plan' : `Switch to ${activeLevelSummary.title}`}
                    </Button>

                    {activeTab !== currentLevel && (
                        <Text variant="caption" style={{ marginTop: spacing.sm, color: '#DC3545' }} align="center">
                            ⚠️ Resets current layout & custom tasks
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        right: spacing.md,
        top: spacing.md,
        padding: 4,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
    summaryBanner: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    bannerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    taskList: {
        gap: spacing.md,
    },
    section: {
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        marginBottom: spacing.xs,
        opacity: 0.7,
        textTransform: 'uppercase',
        fontSize: 12,
    },
    categoryBlock: {
        marginBottom: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: borderRadius.md,
        padding: spacing.sm,
    },
    categoryHeader: {
        marginBottom: spacing.xs,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    taskRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    footer: {
        padding: spacing.md,
        paddingBottom: spacing.xl + 20,
        borderTopWidth: 1,
    },
});
