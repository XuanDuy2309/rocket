import { CameraHomeScreen } from '@rocket/sdk-ui';
import { useRouter } from 'expo-router';
import React from 'react';

export default function HomeRoute() {
    const router = useRouter();

    return (
        <CameraHomeScreen
            onSwipeUp={() => router.push('/(main)/feed')}
            onOpenProfile={() => router.push('/(main)/profile')}
            onOpenSettings={() => router.push('/(main)/profile')}
        />
    );
}
