import React from 'react';
import {
    View as RNView,
    ViewProps as RNViewProps,
    StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks';
import { spacing, borderRadius } from '@/constants/Colors';

interface CardProps extends RNViewProps {
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Themed Card component with elevation and outline variants
 */
export function Card({
    variant = 'default',
    padding = 'md',
    style,
    children,
    ...props
}: CardProps) {
    const { colors } = useTheme();

    const paddingMap = {
        none: 0,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
    };

    const baseStyle = {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: paddingMap[padding],
    };

    const variantStyles = {
        default: {},
        elevated: {
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: 4,
        },
        outlined: {
            borderWidth: 1,
            borderColor: colors.border,
        },
    };

    return (
        <RNView style={[baseStyle, variantStyles[variant], style]} {...props}>
            {children}
        </RNView>
    );
}
