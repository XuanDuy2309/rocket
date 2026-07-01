import { VerifyOtpScreen } from '@rocket/sdk-ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

export default function VerifyOtpRoute() {
    const router = useRouter();
    const { emailOrPhone } = useLocalSearchParams<{ emailOrPhone: string }>();

    useEffect(() => {
        if (!emailOrPhone) {
            router.replace('/forgot-password');
        }
    }, [emailOrPhone, router]);

    if (!emailOrPhone) {
        return null;
    }

    return (
        <VerifyOtpScreen
            emailOrPhone={emailOrPhone}
            onVerified={(identifier, otp) =>
                router.push({
                    pathname: '/reset-password',
                    params: { emailOrPhone: identifier, otp },
                })
            }
            onBack={() => router.back()}
        />
    );
}
