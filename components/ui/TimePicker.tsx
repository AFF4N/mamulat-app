import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Modal,
    KeyboardAvoidingView,
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
 * Uses native picker in a modal for stable UI
 */
export function TimePicker({ value, onChange, label }: TimePickerProps) {
    const { colors, isDark } = useTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(new Date());

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

    // Format time for display
    const formatTime = (timeStr: string | null): string => {
        if (!timeStr) return '--:--';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
            if (event.type === 'set' && selectedDate) {
                const hours = selectedDate.getHours().toString().padStart(2, '0');
                const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                onChange(`${hours}:${minutes}`);
            }
        } else if (selectedDate) {
            setTempDate(selectedDate);
        }
    };

    const handleConfirm = () => {
        const hours = tempDate.getHours().toString().padStart(2, '0');
        const minutes = tempDate.getMinutes().toString().padStart(2, '0');
        onChange(`${hours}:${minutes}`);
        setShowPicker(false);
    };

    const openPicker = () => {
        setTempDate(getTimeDate());
        setShowPicker(true);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={openPicker}
                style={[
                    styles.timeButton,
                    {
                        backgroundColor: value ? (isDark ? colors.primary + '20' : colors.primary + '10') : colors.surfaceVariant,
                        borderColor: value ? colors.primary : colors.border,
                    }
                ]}
            >
                <Ionicons
                    name="time-outline"
                    size={16}
                    color={value ? colors.primary : colors.textMuted}
                />
                <Text
                    variant="caption"
                    weight={value ? 'semibold' : 'regular'}
                    style={{ color: value ? colors.primary : colors.textMuted }}
                >
                    {formatTime(value)}
                </Text>
            </TouchableOpacity>

            {/* Android - inline picker */}
            {Platform.OS === 'android' && showPicker && (
                <DateTimePicker
                    value={getTimeDate()}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={handleChange}
                />
            )}

            {/* iOS - Modal picker centered */}
            {Platform.OS === 'ios' && (
                <Modal
                    visible={showPicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowPicker(false)}
                >
                    <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            activeOpacity={1}
                            onPress={() => setShowPicker(false)}
                        />
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                                <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.headerButton}>
                                    <Text variant="body" style={{ color: '#DC3545' }}>Cancel</Text>
                                </TouchableOpacity>
                                <Text variant="body" weight="semibold" style={{ color: colors.textPrimary }}>Select Time</Text>
                                <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
                                    <Text variant="body" weight="semibold" style={{ color: colors.primary }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.pickerContainer}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="time"
                                    is24Hour={false}
                                    display="spinner"
                                    onChange={handleChange}
                                    textColor={colors.textPrimary}
                                    themeVariant={isDark ? 'dark' : 'light'}
                                    style={styles.picker}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexShrink: 0,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        minWidth: 95,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderRadius: 16,
        width: '85%',
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    pickerContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    picker: {
        width: 280,
        height: 180,
    },
});
