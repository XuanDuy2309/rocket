import { OnboardingScreen } from '@rocket/sdk-ui';
import { useRouter } from 'expo-router';
import React from 'react';

export default function OnboardingRoute() {
    const router = useRouter();

    return (
        <OnboardingScreen
            onLogin={() => router.push('/login')}
            onSignUp={() => router.push('/register')}
        />
    );
}
