import React from 'react';
import {
    TouchableOpacity,
    TouchableOpacityProps,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import { useTheme } from '@/hooks';
import { spacing, borderRadius, typography } from '@/constants/Colors';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

/**
 * Themed Button component with multiple variants
 */
export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    disabled,
    children,
    style,
    ...props
}: ButtonProps) {
    const { colors } = useTheme();

    const sizeConfig = {
        sm: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            fontSize: typography.sizes.sm,
            minHeight: 36,
        },
        md: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            fontSize: typography.sizes.base,
            minHeight: 44,
        },
        lg: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            fontSize: typography.sizes.lg,
            minHeight: 52,
        },
    };

    const variantStyles = {
        primary: {
            backgroundColor: colors.primary,
            borderWidth: 0,
        },
        secondary: {
            backgroundColor: colors.surfaceVariant,
            borderWidth: 0,
        },
        outline: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.primary,
        },
        ghost: {
            backgroundColor: 'transparent',
            borderWidth: 0,
        },
    };

    const textColors = {
        primary: '#FFFFFF',
        secondary: colors.textPrimary,
        outline: colors.primary,
        ghost: colors.primary,
    };

    const config = sizeConfig[size];
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={isDisabled}
            style={[
                styles.button,
                variantStyles[variant],
                {
                    paddingVertical: config.paddingVertical,
                    paddingHorizontal: config.paddingHorizontal,
                    minHeight: config.minHeight,
                    opacity: isDisabled ? 0.5 : 1,
                },
                style,
            ]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={textColors[variant]} size="small" />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && (
                        <View style={styles.iconLeft}>{icon}</View>
                    )}
                    {typeof children === 'string' ? (
                        <Text
                            style={[
                                { fontSize: config.fontSize, color: textColors[variant] },
                            ]}
                            weight="semibold"
                        >
                            {children}
                        </Text>
                    ) : (
                        children
                    )}
                    {icon && iconPosition === 'right' && (
                        <View style={styles.iconRight}>{icon}</View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: spacing.sm,
    },
    iconRight: {
        marginLeft: spacing.sm,
    },
});
