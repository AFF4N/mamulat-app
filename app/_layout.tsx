import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold, PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { NotoNastaliqUrdu_400Regular, NotoNastaliqUrdu_700Bold } from '@expo-google-fonts/noto-nastaliq-urdu';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useTheme } from '@/hooks';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * Root layout - provides the Stack navigator and status bar configuration
 */
export default function RootLayout() {
    const { colors, isDark } = useTheme();

    const [fontsLoaded] = useFonts({
        'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
        'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
        'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
        'PlayfairDisplay-BoldItalic': PlayfairDisplay_700Bold_Italic,
        'NotoNastaliqUrdu-Regular': NotoNastaliqUrdu_400Regular,
        'NotoNastaliqUrdu-Bold': NotoNastaliqUrdu_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

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
                        // fontWeight: '600',
                        fontFamily: 'PlayfairDisplay-BoldItalic',
                        fontSize: 20,
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


