import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    View,
} from 'react-native';
import { useTheme } from '@/hooks';
import { spacing, borderRadius } from '@/constants/Colors';
import { Text } from './Text';

interface CheckboxProps {
    checked: boolean;
    onToggle: () => void;
    label?: string;
    labelPosition?: 'left' | 'right';
    disabled?: boolean;
}

/**
 * Themed Checkbox component for maamulat items
 */
export function Checkbox({
    checked,
    onToggle,
    label,
    labelPosition = 'right',
    disabled = false,
}: CheckboxProps) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggle}
            disabled={disabled}
            style={[
                styles.container,
                labelPosition === 'left' && styles.containerReverse,
                disabled && { opacity: 0.5 },
            ]}
        >
            {label && labelPosition === 'left' && (
                <Text style={[styles.label, styles.labelLeft]}>{label}</Text>
            )}

            <View
                style={[
                    styles.checkbox,
                    {
                        borderColor: checked ? colors.primary : colors.border,
                        backgroundColor: checked ? colors.primary : 'transparent',
                    },
                ]}
            >
                {checked && (
                    <Text style={styles.checkmark}>✓</Text>
                )}
            </View>

            {label && labelPosition === 'right' && (
                <Text style={styles.label}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.md,
    },
    containerReverse: {
        flexDirection: 'row-reverse',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    label: {
        marginLeft: 0,
        flex: 1,
    },
    labelLeft: {
        marginLeft: 0,
        marginRight: 0,
    },
});
