import {
    useForgotPasswordStore,
    useResendForgotPasswordOtp,
    useVerifyForgotPasswordOtp,
} from '@rocket/sdk-ts';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { ArrowRightIcon } from '../components/arrow-right-icon';
import { Button } from '../components/button';
import { Stack } from '../components/common';
import { authFlowPalette, authFlowStyles as styles } from './auth-flow-theme';

const RESEND_COOLDOWN_SEC = 60;

interface VerifyOtpScreenProps {
    emailOrPhone: string;
    onVerified?: (emailOrPhone: string, otp: string) => void;
    onBack?: () => void;
}

export function VerifyOtpScreen({ emailOrPhone, onVerified, onBack }: VerifyOtpScreenProps) {
    const otp = useForgotPasswordStore((s) => s.otp);
    const error = useForgotPasswordStore((s) => s.error);
    const setField = useForgotPasswordStore((s) => s.setField);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);

    const verifyMutation = useVerifyForgotPasswordOtp(emailOrPhone, {
        onSuccess: () => onVerified?.(emailOrPhone, otp.trim()),
    });
    const resendMutation = useResendForgotPasswordOtp(emailOrPhone);

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }
        const timer = setInterval(() => {
            setCooldown((value) => (value > 0 ? value - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleResend = () => {
        if (cooldown > 0 || resendMutation.isPending) {
            return;
        }
        resendMutation.mutate(undefined, {
            onSuccess: () => setCooldown(RESEND_COOLDOWN_SEC),
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Stack style={styles.topGlow} />
                <Stack style={styles.topGlowSecondary} />

                <View style={styles.badge}>
                    <Text style={styles.badgeIcon}>✉</Text>
                </View>

                <Stack style={styles.headingBlock}>
                    <Text style={styles.title}>Nhập mã{'\n'}xác thực</Text>
                    <Text style={styles.subtitle}>
                        Mã 6 số đã được gửi đến{'\n'}
                        <Text style={{ color: authFlowPalette.text }}>{emailOrPhone}</Text>
                    </Text>
                </Stack>

                <Stack style={styles.form}>
                    <Stack style={styles.formGroup}>
                        <Text style={styles.formLabel}>MÃ XÁC THỰC</Text>
                        <TextInput
                            value={otp}
                            onChangeText={(text) => setField('otp', text.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            placeholderTextColor={authFlowPalette.subtle}
                            style={[styles.input, styles.otpInput, error && styles.inputError]}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </Stack>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        label="Xác nhận"
                        variant="primary"
                        style={styles.submitButton}
                        loading={verifyMutation.isPending}
                        onPress={() => verifyMutation.mutate()}
                        icon={<ArrowRightIcon size={14} color={authFlowPalette.accentDark} />}
                    />

                    <Pressable onPress={handleResend} disabled={cooldown > 0 || resendMutation.isPending}>
                        <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
                            {cooldown > 0 ? (
                                `Gửi lại mã sau ${cooldown}s`
                            ) : (
                                <>
                                    Chưa nhận được mã?{' '}
                                    <Text style={styles.resendAction}>Gửi lại</Text>
                                </>
                            )}
                        </Text>
                    </Pressable>
                </Stack>

                <Pressable style={styles.backRow} onPress={onBack}>
                    <Text style={styles.backText}>← Quay lại</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
