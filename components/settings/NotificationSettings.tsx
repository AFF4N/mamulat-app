import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Text, Card } from '@/components/ui';
import { useTheme } from '@/hooks';
import { spacing } from '@/constants/Colors';
import {
    getNotificationSettings,
    toggleNotification,
    requestNotificationPermissions,
    type NotificationConfig,
    type NotificationType,
} from '@/services/notifications';

/**
 * Notification Settings Component - Toggle individual notifications
 */
export function NotificationSettings() {
    const { colors } = useTheme();
    const [settings, setSettings] = useState<NotificationConfig[]>([]);
    const [permissionGranted, setPermissionGranted] = useState(false);

    // Load settings on mount
    useEffect(() => {
        (async () => {
            const granted = await requestNotificationPermissions();
            setPermissionGranted(granted);

            if (granted) {
                const storedSettings = await getNotificationSettings();
                setSettings(storedSettings);
            }
        })();
    }, []);

    const handleToggle = async (id: NotificationType, enabled: boolean) => {
        // Update local state immediately
        setSettings(prev =>
            prev.map(s => s.id === id ? { ...s, enabled } : s)
        );

        // Persist and reschedule
        await toggleNotification(id, enabled);
    };

    if (!permissionGranted) {
        return (
            <Card variant="outlined" style={styles.container}>
                <Text variant="body" color="secondary" align="center">
                    Notification permission not granted.
                </Text>
                <Text variant="caption" color="muted" align="center">
                    Enable in device settings to receive reminders.
                </Text>
            </Card>
        );
    }

    return (
        <Card variant="outlined" style={styles.container}>
            <Text variant="h3" weight="semibold" style={styles.title}>
                Notification Reminders
            </Text>

            {settings.map((setting) => (
                <View
                    key={setting.id}
                    style={[styles.row, { borderBottomColor: colors.border }]}
                >
                    <View style={styles.labelContainer}>
                        <Text variant="body">{setting.title}</Text>
                        <Text variant="caption" color="secondary" style={{ writingDirection: 'rtl' }}>
                            {setting.titleUr}
                        </Text>
                    </View>
                    <Switch
                        value={setting.enabled}
                        onValueChange={(value) => handleToggle(setting.id, value)}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        thumbColor={setting.enabled ? colors.primary : colors.textMuted}
                    />
                </View>
            ))}
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
    },
    title: {
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
    },
    labelContainer: {
        flex: 1,
        gap: 2,
    },
});
