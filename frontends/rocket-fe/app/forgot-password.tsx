import { AuthScreen } from '@rocket/sdk-ui';
import { useRouter } from 'expo-router';
import React from 'react';

export default function ForgotPasswordRoute() {
    const router = useRouter();

    return (
        <AuthScreen
            mode="forgotPassword"
            onNavigateToMode={() => router.replace('/login')}
        />
    );
}
