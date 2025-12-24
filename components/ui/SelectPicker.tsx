import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ActionSheetIOS,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectPickerProps {
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
}

/**
 * Native OS select picker using ActionSheet (iOS) or Alert (Android)
 */
export function SelectPicker({ value, options, onChange, placeholder = 'Select...' }: SelectPickerProps) {
    const { colors } = useTheme();

    const selectedOption = options.find(opt => opt.value === value);

    const showPicker = () => {
        if (Platform.OS === 'ios') {
            // Use native iOS ActionSheet
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [...options.map(o => o.label), 'Cancel'],
                    cancelButtonIndex: options.length,
                },
                (buttonIndex) => {
                    if (buttonIndex < options.length) {
                        onChange(options[buttonIndex].value);
                    }
                }
            );
        } else {
            // Use Alert for Android (native feel)
            Alert.alert(
                'Select Option',
                undefined,
                [
                    ...options.map(option => ({
                        text: option.label,
                        onPress: () => onChange(option.value),
                    })),
                    { text: 'Cancel', style: 'cancel' as const },
                ]
            );
        }
    };

    return (
        <TouchableOpacity
            onPress={showPicker}
            style={[
                styles.trigger,
                {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                }
            ]}
        >
            <Text variant="body" style={{ color: selectedOption ? colors.textPrimary : colors.textMuted }}>
                {selectedOption?.label || placeholder}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 100,
        gap: 8,
    },
});
