import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Switch,
    TouchableOpacity,
    TextInput,
    Share,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, SelectPicker } from '@/components/ui';
import { NotificationSettings } from '@/components/settings';
import { useTheme } from '@/hooks';
import { useUserStore, useMaamulatStore } from '@/stores';
import { formatHasanat } from '@/utils/hasanat';
import { formatDateUrdu } from '@/utils/dateUtils';
import { spacing, borderRadius } from '@/constants/Colors';

/**
 * Settings row component
 */
function SettingRow({
    label,
    value,
    onPress,
    showArrow = false,
    switchValue,
    onSwitchChange,
}: {
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
}) {
    const { colors } = useTheme();

    const content = (
        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Text variant="body">{label}</Text>
            <View style={styles.settingValue}>
                {value && <Text variant="body" color="secondary">{value}</Text>}
                {switchValue !== undefined && (
                    <Switch
                        value={switchValue}
                        onValueChange={onSwitchChange}
                        trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                        thumbColor={switchValue ? '#FFFFFF' : colors.textMuted}
                    />
                )}
                {showArrow && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
            </View>
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

/**
 * Generate share progress message in exact template format
 */
const CATEGORY_EMOJIS: Record<string, { header: string; bullet: string }> = {
    'faraiz': { header: '🟠', bullet: '🔸' },
    'quran': { header: '🔵', bullet: '🔹' },
    'azkar-morning': { header: '', bullet: '🔺' },
    'azkar-evening': { header: '', bullet: '🔺' },
    'nawafil': { header: '🟢', bullet: '🟩' },
    'duas': { header: '⚫', bullet: '◼' },
    'hifazat': { header: '🟡', bullet: '🟨' },
    'schedule': { header: '🟤', bullet: '🟫' },
};

function generateShareMessage(
    chillahDay: number,
    categories: Array<{
        id: string;
        name: string;
        items: Array<{ id: string; name: string; completed: boolean; isTime?: boolean }>;
    }>
) {
    const date = formatDateUrdu(new Date());

    let message = `‎*تاریخ:  ${date}*
‎*چلہ کا دن: ${chillahDay}/40    

`;

    categories.forEach(category => {
        const emojis = CATEGORY_EMOJIS[category.id] || { header: '', bullet: '•' };

        // Category header
        if (emojis.header) {
            message += `‎*${emojis.header} ${category.name}*\n`;
        } else {
            message += `‎*${category.name}* \n`;
        }

        // Items with completion status
        category.items.forEach(item => {
            const isTime = (item as any).isTime || item.id.includes('time');

            if (isTime) {
                // Time fields - show time value (placeholder for now)
                message += `${emojis.bullet} 8:00  ${item.name} \n`;
            } else {
                const status = item.completed ? '✅' : '❌';
                message += `‎${emojis.bullet} ${item.name} ${status}\n`;
            }
        });

        message += '\n';
    });

    return message.trim();
}

/**
 * Profile Screen - User settings and preferences
 */
export default function ProfileScreen() {
    const { colors, isDark, themeMode, setTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState('en');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');

    // Stores
    const {
        name,
        level,
        setName,
        setLevel,
        currentStreak,
        longestStreak,
        totalHasanat,
        chillahDay,
        joinDate,
    } = useUserStore();

    const { getCompletionStats, categories, loadLevelTasks } = useMaamulatStore();

    // Handle name edit
    const startEditingName = () => {
        setEditedName(name);
        setIsEditingName(true);
    };

    const saveName = () => {
        if (editedName.trim()) {
            setName(editedName.trim());
        }
        setIsEditingName(false);
    };

    // Handle share progress
    const handleShareProgress = async () => {
        // Map categories with emoji data from config
        const categoriesWithEmoji = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            items: cat.items.map(item => ({
                id: item.id,
                name: item.name,
                completed: item.completed,
                isTime: (item as any).isTime || false,
            })),
        }));

        const message = generateShareMessage(chillahDay, categoriesWithEmoji);

        try {
            await Share.share({
                message,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share progress');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <Card variant="elevated" style={styles.profileCard}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                    </View>

                    {/* Editable Name */}
                    {isEditingName ? (
                        <View style={styles.nameEditContainer}>
                            <TextInput
                                style={[styles.nameInput, {
                                    color: colors.textPrimary,
                                    borderColor: colors.primary,
                                    backgroundColor: colors.surface,
                                }]}
                                value={editedName}
                                onChangeText={setEditedName}
                                placeholder="Enter name"
                                placeholderTextColor={colors.textMuted}
                                autoFocus
                            />
                            <TouchableOpacity onPress={saveName} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
                                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={startEditingName} style={styles.nameContainer}>
                            <Text variant="h2" weight="bold">{name}</Text>
                            <Ionicons name="pencil" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}

                    <View style={[styles.levelBadge, { backgroundColor: colors.accent + '20' }]}>
                        <Text variant="caption" weight="semibold" style={{ color: colors.accent }}>
                            {level === 'beginner' ? 'Beginner' : level === 'intermediate' ? 'Intermediate' : 'Advanced'}
                        </Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text variant="h3" weight="bold">{currentStreak}</Text>
                            <Text variant="caption" color="secondary">Day Streak</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text variant="h3" weight="bold">{formatHasanat(totalHasanat)}</Text>
                            <Text variant="caption" color="secondary">Hasanat</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text variant="h3" weight="bold">{chillahDay}/40</Text>
                            <Text variant="caption" color="secondary">Chillah</Text>
                        </View>
                    </View>
                </Card>

                {/* App Settings */}
                <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
                    Settings
                </Text>

                <Card variant="outlined" style={styles.settingsCard}>
                    {/* Language Picker */}
                    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                        <Text variant="body">Language</Text>
                        <SelectPicker
                            value={language}
                            onChange={setLanguage}
                            options={[
                                { value: 'en', label: 'English' },
                                { value: 'ur', label: 'اردو' },
                            ]}
                        />
                    </View>

                    {/* Appearance Picker */}
                    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                        <Text variant="body">Appearance</Text>
                        <SelectPicker
                            value={themeMode}
                            onChange={(val) => setTheme(val as 'light' | 'dark' | 'system')}
                            options={[
                                { value: 'light', label: 'Light' },
                                { value: 'dark', label: 'Dark' },
                                { value: 'system', label: 'System' },
                            ]}
                        />
                    </View>

                    <SettingRow
                        label="Notifications"
                        switchValue={notifications}
                        onSwitchChange={setNotifications}
                    />

                    {/* Level Picker */}
                    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                        <Text variant="body">Level</Text>
                        <SelectPicker
                            value={level}
                            onChange={(val) => {
                                const newLevel = val as 'beginner' | 'intermediate' | 'advanced';
                                setLevel(newLevel);
                                loadLevelTasks(newLevel);
                            }}
                            options={[
                                { value: 'beginner', label: 'Beginner' },
                                { value: 'intermediate', label: 'Intermediate' },
                                { value: 'advanced', label: 'Advanced' },
                            ]}
                        />
                    </View>
                </Card>

                {/* Notification Settings */}
                <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
                    Notifications
                </Text>
                <NotificationSettings />

                {/* Account Settings */}
                <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
                    Data
                </Text>

                <Card variant="outlined" style={styles.settingsCard}>
                    <SettingRow
                        label="Share Progress"
                        onPress={handleShareProgress}
                        showArrow
                    />
                    <SettingRow
                        label="About"
                        value="v1.0.0"
                        onPress={() => Alert.alert('Maamulat', 'A spiritual habit tracker for Muslims.\n\nMade with ❤️ for the Ummah')}
                        showArrow
                    />
                </Card>

                <Text variant="caption" color="muted" align="center" style={styles.footer}>
                    Maamulat • Made with ❤️ for the Ummah
                </Text>
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
    profileCard: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        marginBottom: spacing.lg,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    nameEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    nameInput: {
        fontSize: 20,
        fontWeight: '600',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 2,
        borderRadius: 8,
        minWidth: 150,
        textAlign: 'center',
    },
    saveButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginTop: spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        width: '100%',
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
    },
    sectionTitle: {
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    settingsCard: {
        padding: 0,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
    },
    settingValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    footer: {
        marginTop: spacing.xl,
    },
});
