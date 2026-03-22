import React from 'react';
import {ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native';
import {colors} from '@/theme/colors';

type BaseButtonVariant = 'PRIMARY' | 'BASE';

type BaseButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: BaseButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export default function BaseButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'PRIMARY',
  style,
}: BaseButtonProps) {
  const isPrimary = variant === 'PRIMARY';
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : '#6B7280'} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? styles.primaryText : styles.secondaryText,
            isDisabled && styles.disabledText,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: '#F3F4F6',
  },
  disabled: {
    backgroundColor: '#E5E7EB',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: colors.text,
  },
  disabledText: {
    color: '#9CA3AF',
  },
});
