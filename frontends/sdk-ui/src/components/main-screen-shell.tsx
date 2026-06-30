import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppNavBar } from '../components/app-nav-bar';
import type { AppNavTab } from '../theme/app-assets';
import { colors } from '../theme/colors';

interface MainScreenShellProps {
    children: React.ReactNode;
    showNav?: boolean;
    activeTab?: AppNavTab;
    onNavGrid?: () => void;
    onNavChat?: () => void;
    onNavHome?: () => void;
    onNavMemory?: () => void;
}

export function MainScreenShell({
    children,
    showNav = true,
    activeTab = 'home',
    onNavGrid,
    onNavChat,
    onNavHome,
    onNavMemory,
}: MainScreenShellProps) {
    return (
        <View style={styles.root}>
            {children}
            {showNav ? (
                <AppNavBar
                    active={activeTab}
                    onPressGrid={onNavGrid ?? (() => undefined)}
                    onPressChat={onNavChat ?? (() => undefined)}
                    onPressHome={onNavHome ?? (() => undefined)}
                    onPressMemory={onNavMemory ?? (() => undefined)}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
