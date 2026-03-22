import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface ErrorTextProps {
    message?: string;
}

export const ErrorText: React.FC<ErrorTextProps> = ({ message }) => {
    if (!message) return null;
    return (
        <Text style={styles.errorText}>
            {message}
        </Text>
    );
};

const styles = StyleSheet.create({
    errorText: {
        fontSize: 12,
        color: colors.danger,
        marginTop: 4,
        marginLeft: 4,
    },
});
