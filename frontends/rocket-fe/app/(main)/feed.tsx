import { FeedScreen } from '@rocket/sdk-ui';
import { useRouter } from 'expo-router';
import React from 'react';

export default function FeedRoute() {
    const router = useRouter();

    return <FeedScreen onInviteFriends={() => router.push('/(main)/friends')} />;
}
