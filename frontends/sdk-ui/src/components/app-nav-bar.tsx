import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { AppNavTab } from '../theme/app-assets';
import { colors } from '../theme/colors';
import { CameraNavIcon, ChatNavIcon, GridNavIcon, MemoryNavIcon } from './nav-icons';

interface AppNavBarProps {
    active: AppNavTab;
    onPressGrid: () => void;
    onPressChat: () => void;
    onPressHome: () => void;
    onPressMemory: () => void;
}

export function AppNavBar({
    active,
    onPressGrid,
    onPressChat,
    onPressHome,
    onPressMemory,
}: AppNavBarProps) {
    const inactive = 'rgba(242, 242, 242, 0.55)';
    const activeColor = colors.primary;

    return (
        <View style={styles.wrap} pointerEvents="box-none">
            <View style={styles.bar}>
                <Pressable style={styles.tab} onPress={onPressGrid} hitSlop={8}>
                    <GridNavIcon color={active === 'grid' ? activeColor : inactive} />
                </Pressable>

                <Pressable style={styles.tab} onPress={onPressChat} hitSlop={8}>
                    <ChatNavIcon color={active === 'chat' ? activeColor : inactive} />
                </Pressable>

                <Pressable style={styles.homeButton} onPress={onPressHome} hitSlop={8}>
                    <View style={styles.homeGlow} />
                    <View style={styles.homeInner}>
                        <CameraNavIcon color="#002109" />
                    </View>
                </Pressable>

                <Pressable style={styles.tab} onPress={onPressMemory} hitSlop={8}>
                    <MemoryNavIcon color={active === 'memory' ? activeColor : '#F2F4F2'} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 28,
        alignItems: 'center',
        zIndex: 20,
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        paddingHorizontal: 25,
        paddingVertical: 25,
        borderRadius: 40,
        backgroundColor: 'rgba(11, 15, 12, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 12,
    },
    tab: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    homeButton: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeGlow: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'transparent',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
    },
    homeInner: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
