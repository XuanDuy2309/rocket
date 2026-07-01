import { ProfileScreen } from '@rocket/sdk-ui';
import { useAuthStore } from '@rocket/sdk-ts';
import { useRouter } from 'expo-router';
import React from 'react';

export default function ProfileRoute() {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);

    return (
        <ProfileScreen
            onLogout={() => {
                logout();
                router.replace('/login');
            }}
        />
    );
}
