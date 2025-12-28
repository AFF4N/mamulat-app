import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Checkbox, TimePicker } from '@/components/ui';
import { WeekdayRow, ScoreCard, ProgressBar, QuickStats, PrayerTimesWidget, MaamulatEditor } from '@/components/home';
import { useTheme } from '@/hooks';
import { useMaamulatStore, useUserStore } from '@/stores';
import { calculateTaskHasanat, formatHasanat } from '@/utils/hasanat';
import { formatDateUrdu, getWeekdayIndex, msUntilMidnight, getTodayString } from '@/utils/dateUtils';
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
    readOnly = false,
}: {
    category: { id: string; name: string; color: string; emoji?: string; items: { id: string; name: string; completed: boolean; isTime?: boolean; timeValue?: string }[] };
    onToggleItem: (categoryId: string, itemId: string) => void;
    onSetTime?: (categoryId: string, itemId: string, time: string) => void;
    readOnly?: boolean;
}) {
    const { colors } = useTheme();
    const completedCount = category.items.filter(i => i.completed).length;

    // Default emojis for built-in categories
    const defaultEmojis: Record<string, string> = {
        faraiz: '🕋',
        quran: '📖',
        'azkar-morning': '☀️',
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
                            <View style={[styles.timeItemRow, readOnly && { opacity: 0.5 }]}>
                                <Text variant="body" style={{ flex: 1, textAlign: 'left' }}>
                                    {item.name}
                                </Text>
                                <View pointerEvents={readOnly ? 'none' : 'auto'}>
                                    <TimePicker
                                        value={item.timeValue || null}
                                        onChange={(time) => onSetTime?.(category.id, item.id, time)}
                                    />
                                </View>
                            </View>
                        ) : (
                            // Checkbox for regular items
                            <Checkbox
                                checked={item.completed}
                                onToggle={() => !readOnly && onToggleItem(category.id, item.id)}
                                label={item.name}
                                labelPosition="left"
                                disabled={readOnly}
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
    // Stores
    const {
        categories,
        weeklyProgress,
        toggleItem,
        setItemTime,
        getCompletionStats,
        checkAndResetDay,
        recordDayEnd,
        dayRecords,
        history,
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

    // UI State
    const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayString());
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showEditor, setShowEditor] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    useScrollToTop(scrollRef);
    const listYRef = useRef(0);
    const today = getTodayString();

    const isTodayView = selectedDateStr === getTodayString();

    // Auto-scroll to history when past date selected
    useEffect(() => {
        if (!isTodayView && listYRef.current > 0) {
            scrollRef.current?.scrollTo({ y: listYRef.current, animated: true });
        }
    }, [selectedDateStr, isTodayView]);

    // Get categories to display (Today or History)
    const displayCategories = isTodayView ? categories : (history?.[selectedDateStr] || []);

    // Memoize history stats for WeekdayRow
    const historyStats = useMemo(() => {
        const stats: Record<string, { percent: number; completed: boolean }> = {};
        if (dayRecords) {
            dayRecords.forEach(day => {
                stats[day.date] = {
                    percent: day.completionPercent,
                    completed: day.completionPercent >= 60
                };
            });
        }
        const today = getTodayString();
        const todayStats = getCompletionStats();
        // Only override if live
        stats[today] = {
            percent: todayStats.percent,
            completed: todayStats.percent >= 60
        };
        return stats;
    }, [dayRecords, categories, getCompletionStats]);

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

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

                {/* Weekday Progress Row - Scrollable History */}
                <WeekdayRow
                    selectedDate={selectedDateStr}
                    onSelectDate={setSelectedDateStr}
                    historyStats={historyStats}
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
                <View
                    style={styles.categoriesSection}
                    onLayout={(event) => {
                        listYRef.current = event.nativeEvent.layout.y;
                    }}
                >
                    <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
                        {isTodayView ? "Today's Maamulat" : "History"}
                    </Text>

                    {displayCategories.length > 0 ? (
                        displayCategories.map((category) => (
                            <CategorySection
                                key={category.id}
                                category={category}
                                onToggleItem={isTodayView ? handleToggleItem : () => { }}
                                onSetTime={isTodayView ? setItemTime : () => { }}
                                readOnly={!isTodayView}
                            />
                        ))
                    ) : (
                        <View style={{ padding: 32, alignItems: 'center', opacity: 0.7 }}>
                            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                            <Text variant="body" color="secondary" style={{ marginTop: 12 }}>
                                No history recorded for this day
                            </Text>
                        </View>
                    )}

                    {/* Edit Maamulat Button - Today Only */}
                    {isTodayView && (
                        <TouchableOpacity
                            style={[styles.editButton, { borderColor: colors.border }]}
                            onPress={() => setShowEditor(true)}
                        >
                            <Ionicons name="create-outline" size={20} color={colors.primary} />
                            <Text variant="body" weight="semibold" style={{ color: colors.primary }}>
                                Edit Maamulat
                            </Text>
                        </TouchableOpacity>
                    )}
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
