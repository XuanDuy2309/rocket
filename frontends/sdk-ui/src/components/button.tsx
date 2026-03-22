import React from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps {
    label: string;
    onPress?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    style?: ViewStyle;
    textStyle?: TextStyle;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export const Button = ({
    label,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    loading,
    disabled,
    icon,
}: ButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.base,
                variant === 'primary' && styles.primary,
                variant === 'secondary' && styles.secondary,
                variant === 'outline' && styles.outline,
                variant === 'ghost' && styles.ghost,
                pressed && variant === 'primary' && styles.primaryPressed,
                pressed && variant === 'secondary' && styles.secondaryPressed,
                pressed && variant === 'outline' && styles.outlinePressed,
                pressed && variant === 'ghost' && styles.ghostPressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? colors.background : colors.text} />
            ) : (
                <>
                    <Text style={[styles.text, variant === 'primary' && styles.primaryText, variant === 'secondary' && styles.secondaryText, variant === 'outline' && styles.outlineText, variant === 'ghost' && styles.ghostText, textStyle]}>
                        {label}
                    </Text>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                </>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 28,
        paddingHorizontal: 24,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    primaryPressed: {
        backgroundColor: colors.primaryDark,
    },
    secondary: {
        backgroundColor: colors.surface,
    },
    secondaryPressed: {
        backgroundColor: colors.border,
    },
    outline: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    outlinePressed: {
        backgroundColor: colors.surface,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    ghostPressed: {
        backgroundColor: colors.surface,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    primaryText: {
        color: colors.background,
    },
    secondaryText: {
        color: colors.text,
    },
    outlineText: {
        color: colors.text,
    },
    ghostText: {
        color: colors.text,
    },
    disabled: {
        opacity: 0.5,
    },
    iconContainer: {
        marginLeft: 8,
    },
});
