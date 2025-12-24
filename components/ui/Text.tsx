import React from 'react';
import {
    Text as RNText,
    TextProps as RNTextProps,
    StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks';
import { typography } from '@/constants/Colors';

interface TextProps extends RNTextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption';
    color?: 'primary' | 'secondary' | 'muted' | 'accent';
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
    align?: 'left' | 'center' | 'right';
}

/**
 * Themed Text component with typography variants
 */
export function Text({
    variant = 'body',
    color = 'primary',
    weight,
    align,
    style,
    children,
    ...props
}: TextProps) {
    const { colors } = useTheme();

    const colorMap = {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
        muted: colors.textMuted,
        accent: colors.accent,
    };

    const variantStyles = {
        h1: {
            fontSize: typography.sizes.xxxl,
            fontWeight: typography.weights.bold,
            lineHeight: typography.sizes.xxxl * typography.lineHeights.tight,
        },
        h2: {
            fontSize: typography.sizes.xxl,
            fontWeight: typography.weights.semibold,
            lineHeight: typography.sizes.xxl * typography.lineHeights.tight,
        },
        h3: {
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.semibold,
            lineHeight: typography.sizes.xl * typography.lineHeights.normal,
        },
        body: {
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.regular,
            lineHeight: typography.sizes.base * typography.lineHeights.normal,
        },
        bodySmall: {
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.regular,
            lineHeight: typography.sizes.sm * typography.lineHeights.normal,
        },
        caption: {
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.regular,
            lineHeight: typography.sizes.xs * typography.lineHeights.normal,
        },
    };

    return (
        <RNText
            style={[
                variantStyles[variant],
                { color: colorMap[color] },
                weight && { fontWeight: typography.weights[weight] },
                align && { textAlign: align },
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
}
