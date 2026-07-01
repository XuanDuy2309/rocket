import { MemoryScreen } from '@rocket/sdk-ui';
import { useRouter } from 'expo-router';
import React from 'react';

export default function MemoryRoute() {
    const router = useRouter();

    return <MemoryScreen onOpenSettings={() => router.push('/(main)/profile')} />;
}
