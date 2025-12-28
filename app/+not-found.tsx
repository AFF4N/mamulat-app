import { Link, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/hooks';

/**
 * 404 Not Found screen for unmatched routes
 */
export default function NotFoundScreen() {
    const { colors } = useTheme();

    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text variant="h2" weight="bold" style={{ color: colors.textPrimary }}>
                    Page Not Found
                </Text>
                <Text variant="body" color="secondary" style={{ marginTop: 8 }}>
                    This screen doesn't exist.
                </Text>
                <Link href="/" style={styles.link}>
                    <Text variant="body" style={{ color: colors.primary }}>
                        Go to home screen
                    </Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    link: {
        marginTop: 16,
        paddingVertical: 8,
    },
});
