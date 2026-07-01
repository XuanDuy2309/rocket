import { MainScreenShell } from '@rocket/sdk-ui';
import type { AppNavTab } from '@rocket/sdk-ui';
import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';

function resolveActiveTab(pathname: string): AppNavTab {
    if (pathname.includes('/friends')) return 'grid';
    if (pathname.includes('/chat')) return 'chat';
    if (pathname.includes('/memory')) return 'memory';
    return 'home';
}

function shouldShowNav(pathname: string): boolean {
    return !pathname.includes('/home') && !pathname.includes('/profile');
}

export default function MainLayout() {
    const pathname = usePathname();
    const router = useRouter();
    const showNav = useMemo(() => shouldShowNav(pathname), [pathname]);
    const activeTab = useMemo(() => resolveActiveTab(pathname), [pathname]);

    return (
        <MainScreenShell
            showNav={showNav}
            activeTab={activeTab}
            onNavGrid={() => router.push('/(main)/friends')}
            onNavChat={() => router.push('/(main)/chat')}
            onNavHome={() => router.push('/(main)/home')}
            onNavMemory={() => router.push('/(main)/memory')}
        >
            <Slot />
        </MainScreenShell>
    );
}
