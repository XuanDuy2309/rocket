import { AuthScreen } from '@rocket/sdk-ui';
import { useRouter } from 'expo-router';
import React from 'react';

export default function LoginRoute() {
    const router = useRouter();

    return (
        <AuthScreen
            mode="login"
            onAuthenticated={() => router.replace('/')}
            onNavigateToMode={(mode) => {
                if (mode === 'register') {
                    router.push('/register');
                    return;
                }

                if (mode === 'forgotPassword') {
                    router.push('/forgot-password');
                    return;
                }

                router.replace('/login');
            }}
        />
    );
}
