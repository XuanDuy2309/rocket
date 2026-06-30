import { AuthScreen } from '@rocket/sdk-ui';
import { useRouter } from 'expo-router';
import React from 'react';

export default function RegisterRoute() {
    const router = useRouter();

    return (
        <AuthScreen
            mode="register"
            onAuthenticated={() => router.replace('/(main)/home')}
            onNavigateToMode={() => router.replace('/login')}
        />
    );
}
