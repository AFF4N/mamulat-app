import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks';

type IoniconsName = keyof typeof Ionicons.glyphMap;

/**
 * Tab navigation layout with 4 main tabs:
 * - Home (maamulat checklist)
 * - Counter (tasbih)
 * - Achievements (badges & streaks)
 * - Profile (settings)
 */
export default function TabLayout() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const renderTabIcon = (name: IoniconsName, focused: boolean) => (
        <Ionicons
            name={name}
            size={24}
            color={focused ? colors.tabIconSelected : colors.tabIconDefault}
            style={focused && styles.iconFocused}
        />
    );

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.tabIconSelected,
                tabBarInactiveTintColor: colors.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: Math.max(insets.bottom, 8),
                    height: 60 + Math.max(insets.bottom, 8),
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginTop: 4,
                },
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                },
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerTitle: 'Maamulat',
                    tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'home' : 'home-outline', focused),
                }}
            />
            <Tabs.Screen
                name="counter"
                options={{
                    title: 'Counter',
                    headerTitle: 'Tasbih Counter',
                    tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'radio-button-on' : 'radio-button-off', focused),
                }}
            />
            <Tabs.Screen
                name="achievements"
                options={{
                    title: 'Achievements',
                    tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'trophy' : 'trophy-outline', focused),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => renderTabIcon(focused ? 'person' : 'person-outline', focused),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconFocused: {
        transform: [{ scale: 1.1 }],
    },
});
