import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks';

/**
 * Root layout - provides the Stack navigator and status bar configuration
 */
export default function RootLayout() {
    const { colors, isDark } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerTintColor: colors.textPrimary,
                    headerTitleStyle: {
                        fontWeight: '600',
                    },
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="counter/[type]"
                    options={{
                        title: 'Tasbih Counter',
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="challenge/[id]"
                    options={{
                        title: 'Challenge',
                        presentation: 'card',
                    }}
                />
            </Stack>
        </>
    );
}
