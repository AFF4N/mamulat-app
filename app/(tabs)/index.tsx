import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Checkbox, TimePicker } from '@/components/ui';
import { WeekdayRow, ScoreCard, ProgressBar, QuickStats, PrayerTimesWidget, MaamulatEditor } from '@/components/home';
import { useTheme } from '@/hooks';
import { useMaamulatStore, useUserStore } from '@/stores';
import { calculateTaskHasanat, formatHasanat } from '@/utils/hasanat';
import { formatDateUrdu, getWeekdayIndex, msUntilMidnight } from '@/utils/dateUtils';
import { spacing, categoryColors } from '@/constants/Colors';


/**
 * Streak Broken Alert Banner
 */
function StreakBrokenBanner({ onDismiss }: { onDismiss: () => void }) {
    return (
        <View style={[styles.alertBanner, { backgroundColor: '#FFEAEA' }]}>
            <View style={{ flex: 1 }}>
                <Text variant="body" weight="semibold" style={{ color: '#DC3545' }}>
                    Streak Broken 😔
                </Text>
                <Text variant="caption" style={{ color: '#B02A37' }}>
                    You missed completing 60% of tasks yesterday. Start fresh today!
                </Text>
            </View>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={18} color="#DC3545" />
            </TouchableOpacity>
        </View>
    );
}

/**
 * Category section with items
 */
function CategorySection({
    category,
    onToggleItem,
    onSetTime,
}: {
    category: { id: string; name: string; color: string; emoji?: string; items: { id: string; name: string; completed: boolean; isTime?: boolean; timeValue?: string }[] };
    onToggleItem: (categoryId: string, itemId: string) => void;
    onSetTime?: (categoryId: string, itemId: string, time: string) => void;
}) {
    const { colors } = useTheme();
    const completedCount = category.items.filter(i => i.completed).length;

    // Default emojis for built-in categories
    const defaultEmojis: Record<string, string> = {
        faraiz: '🕋',
        quran: '📖',
        'azkar-morning': '🌅',
        nawafil: '🌙',
    };
    const emoji = category.emoji || defaultEmojis[category.id] || '📿';

    return (
        <Card variant="outlined" style={styles.categoryCard}>
            <View style={[styles.categoryHeader, { borderBottomColor: colors.border }]}>
                <View style={styles.categoryTitleRow}>
                    <Text style={{ fontSize: 16 }}>{emoji}</Text>
                    <Text variant="body" weight="semibold" style={{ writingDirection: 'rtl' }}>
                        {category.name}
                    </Text>
                </View>
                <Text variant="caption" color="secondary">
                    {completedCount}/{category.items.length}
                </Text>
            </View>

            <View style={styles.categoryItems}>
                {category.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                        {item.isTime ? (
                            // Time picker for schedule items
                            <View style={styles.timeItemRow}>
                                <Text variant="body" style={{ flex: 1, textAlign: 'left' }}>
                                    {item.name}
                                </Text>
                                <TimePicker
                                    value={item.timeValue || null}
                                    onChange={(time) => onSetTime?.(category.id, item.id, time)}
                                />
                            </View>
                        ) : (
                            // Checkbox for regular items
                            <Checkbox
                                checked={item.completed}
                                onToggle={() => onToggleItem(category.id, item.id)}
                                label={item.name}
                                labelPosition="left"
                            />
                        )}
                    </View>
                ))}
            </View>
        </Card>
    );
}

/**
 * Home screen - Premium maamulat dashboard
 */
export default function HomeScreen() {
    const { colors } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showEditor, setShowEditor] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    // Stores
    const {
        categories,
        weeklyProgress,
        toggleItem,
        setItemTime,
        getCompletionStats,
        checkAndResetDay,
        recordDayEnd,
    } = useMaamulatStore();

    const {
        currentStreak,
        totalHasanat,
        todayHasanat,
        streakBroken,
        chillahDay,
        addHasanat,
        recordDayCompletion,
        dismissStreakAlert,
        checkNewDay,
    } = useUserStore();

    // Check for new day on mount and set up midnight timer
    useEffect(() => {
        // Check if it's a new day
        const wasReset = checkAndResetDay();
        const hadBrokenStreak = checkNewDay();

        // Set up timer for midnight reset
        const msToMidnight = msUntilMidnight();
        const midnightTimer = setTimeout(() => {
            checkAndResetDay();
            checkNewDay();
            setCurrentDate(new Date());
        }, msToMidnight);

        // Update date every minute
        const dateTimer = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000);

        return () => {
            clearTimeout(midnightTimer);
            clearInterval(dateTimer);
        };
    }, []);

    // Handle task toggle with hasanat calculation
    const handleToggleItem = (categoryId: string, itemId: string) => {
        const category = categories.find(c => c.id === categoryId);
        const item = category?.items.find(i => i.id === itemId);

        // Toggle the item
        toggleItem(categoryId, itemId);

        // Add hasanat if completing (not uncompleting)
        if (item && !item.completed) {
            const hasanat = calculateTaskHasanat(categoryId, itemId, true);
            addHasanat(hasanat);
        }

        // Check completion and update streak
        setTimeout(() => {
            const stats = getCompletionStats();
            recordDayEnd();

            // Check if day is complete enough
            if (stats.percent >= 60) {
                recordDayCompletion(stats.percent);
            }
        }, 100);
    };

    // Get current stats
    const stats = getCompletionStats();
    const score = stats.percent;
    const dayIndex = getWeekdayIndex(currentDate);

    // Quick stats data
    const quickStatsData = [
        { icon: 'checkmark-circle', iconColor: '#27AE60', value: stats.completed, suffix: `/${stats.total}`, label: 'Tasks' },
        { icon: 'flame', iconColor: '#FF6B35', value: currentStreak, label: 'Streak' },
        { icon: 'star', iconColor: '#D4AF37', value: formatHasanat(totalHasanat), label: 'Hasanat' },
        { icon: 'calendar', iconColor: '#9B59B6', value: chillahDay, suffix: '/40', label: 'Chillah' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Streak Broken Alert */}
                {streakBroken && (
                    <StreakBrokenBanner onDismiss={dismissStreakAlert} />
                )}

                {/* Weekday Progress Row */}
                <WeekdayRow
                    completedDays={weeklyProgress}
                    currentDayIndex={dayIndex}
                />

                {/* Prayer Times Widget */}
                <View style={styles.section}>
                    <PrayerTimesWidget />
                </View>

                {/* Score Card */}
                <View style={styles.section}>
                    <ScoreCard
                        score={score}
                        streakDays={currentStreak}
                        motivationalText={score >= 60 ? "You're doing great!" : score >= 30 ? "Keep going!" : "Start your day!"}
                        subtitle={`Day ${chillahDay}/40 of your spiritual journey`}
                    />
                </View>

                {/* Progress Bar */}
                <View style={styles.section}>
                    <ProgressBar
                        progress={score}
                        label={score >= 60 ? "On track for streak!" : `Need ${60 - score}% more to maintain streak`}
                    />
                </View>

                {/* Quick Stats */}
                <View style={styles.section}>
                    <QuickStats stats={quickStatsData as any} />
                </View>

                {/* Maamulat Categories */}
                <View style={styles.categoriesSection}>
                    <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
                        Today's Maamulat
                    </Text>

                    {categories.map((category) => (
                        <CategorySection
                            key={category.id}
                            category={category}
                            onToggleItem={handleToggleItem}
                            onSetTime={setItemTime}
                        />
                    ))}

                    {/* Edit Maamulat Button */}
                    <TouchableOpacity
                        style={[styles.editButton, { borderColor: colors.border }]}
                        onPress={() => setShowEditor(true)}
                    >
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                        <Text variant="body" weight="semibold" style={{ color: colors.primary }}>
                            Edit Maamulat
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Scroll to Top */}
                <TouchableOpacity onPress={scrollToTop} style={{ padding: spacing.md, alignItems: 'center' }}>
                    <Text variant="caption" color="secondary">Scroll to Top ↑</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Maamulat Editor Modal */}
            <MaamulatEditor
                visible={showEditor}
                onClose={() => setShowEditor(false)}
            />
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
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxl,
    },
    section: {
        marginBottom: spacing.md,
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#DC3545',
    },
    dateHeader: {
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
    },
    categoriesSection: {
        gap: spacing.sm,
    },
    sectionTitle: {
        marginBottom: spacing.xs,
    },
    categoryCard: {
        paddingVertical: spacing.sm,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.xs,
        borderBottomWidth: 1,
        paddingBottom: spacing.sm,
    },
    categoryTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    categoryItems: {
        paddingHorizontal: spacing.sm,
    },
    itemRow: {
        paddingVertical: 2,
    },
    timeItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        paddingVertical: spacing.xs,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        marginTop: spacing.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
    },
});
