import { useAuthStore } from '@rocket/sdk-ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useSegments, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

export default function RootLayout() {
    const { loadSession, isLoggedIn } = useAuthStore();
    const [isReady, setIsReady] = useState(false);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        loadSession();
        setIsReady(true);
    }, [loadSession]);

    useEffect(() => {
        if (!isReady) return;

        const inAuthGroup = segments[0] === '(main)';
        const isAuthRoute = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'forgot-password' || segments[0] === 'verify-otp' || segments[0] === 'reset-password';
        const isIndex = (segments.length as number) === 0 || segments[0] === 'index';

        if (!isLoggedIn && inAuthGroup) {
            router.replace('/login');
        } else if (isLoggedIn && (isAuthRoute || isIndex)) {
            router.replace('/(main)/home');
        }
    }, [isLoggedIn, isReady, segments, router]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(main)" />
                </Stack>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
