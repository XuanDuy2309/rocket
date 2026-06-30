import { ResetPasswordScreen } from '@rocket/sdk-ui';
import { useForgotPasswordStore } from '@rocket/sdk-ts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';

export default function ResetPasswordRoute() {
    const router = useRouter();
    const resetStore = useForgotPasswordStore((s) => s.reset);
    const { emailOrPhone, otp } = useLocalSearchParams<{ emailOrPhone: string; otp: string }>();

    useEffect(() => {
        if (!emailOrPhone || !otp) {
            router.replace('/forgot-password');
        }
    }, [emailOrPhone, otp, router]);

    if (!emailOrPhone || !otp) {
        return null;
    }

    return (
        <ResetPasswordScreen
            emailOrPhone={emailOrPhone}
            otp={otp}
            onSuccess={() => {
                resetStore();
                Alert.alert('Thành công', 'Đặt lại mật khẩu thành công', [
                    { text: 'Đăng nhập', onPress: () => router.replace('/login') },
                ]);
            }}
            onBack={() => router.back()}
        />
    );
}
