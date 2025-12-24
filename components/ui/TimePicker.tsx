import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks';

interface TimePickerProps {
    value: string | null; // Time in "HH:MM" format or null
    onChange: (time: string) => void;
    label?: string;
}

/**
 * Time picker component for sleep/wake time tracking
 */
export function TimePicker({ value, onChange, label }: TimePickerProps) {
    const { colors } = useTheme();
    const [showPicker, setShowPicker] = useState(false);

    // Parse time string to Date
    const getTimeDate = (): Date => {
        if (value) {
            const [hours, minutes] = value.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
        }
        return new Date();
    };

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            onChange(`${hours}:${minutes}`);
        }
    };

    const showTimePicker = () => {
        setShowPicker(true);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={showTimePicker}
                style={[
                    styles.timeButton,
                    {
                        backgroundColor: colors.surfaceVariant,
                        borderColor: value ? colors.primary : colors.border,
                    }
                ]}
            >
                <Ionicons
                    name="time-outline"
                    size={18}
                    color={value ? colors.primary : colors.textMuted}
                />
                <Text
                    variant="body"
                    weight={value ? 'semibold' : 'regular'}
                    style={{ color: value ? colors.textPrimary : colors.textMuted }}
                >
                    {value || '--:--'}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={getTimeDate()}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
});
