import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function ChatScreen() {
    return (
        <View style={styles.root}>
            <Text style={styles.title}>Chat</Text>
            <Text style={styles.subtitle}>Tính năng nhắn tin sẽ sớm có mặt.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingBottom: 120,
    },
    title: { color: '#F2F4F2', fontSize: 28, fontWeight: '800', marginBottom: 8 },
    subtitle: { color: '#A8B2AA', fontSize: 16, textAlign: 'center' },
});
