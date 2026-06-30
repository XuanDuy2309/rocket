import {
    useForgotPasswordStore,
    useSendForgotPasswordOtp,
} from '@rocket/sdk-ts';
import React from 'react';
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

interface ForgotPasswordScreenProps {
    onOtpSent?: (emailOrPhone: string) => void;
    onBackToLogin?: () => void;
}

export function ForgotPasswordScreen({ onOtpSent, onBackToLogin }: ForgotPasswordScreenProps) {
    const emailOrPhone = useForgotPasswordStore((s) => s.emailOrPhone);
    const error = useForgotPasswordStore((s) => s.error);
    const setField = useForgotPasswordStore((s) => s.setField);
    const mutation = useSendForgotPasswordOtp({
        onSuccess: () => onOtpSent?.(emailOrPhone.trim()),
    });

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
                    <Text style={styles.badgeIcon}>⟲</Text>
                </View>

                <Stack style={styles.headingBlock}>
                    <Text style={styles.title}>
                        Khôi phục{'\n'}mật khẩu
                    </Text>
                    <Text style={styles.subtitle}>
                        Nhập email hoặc số điện thoại để nhận mã xác thực
                    </Text>
                </Stack>

                <Stack style={styles.form}>
                    <Stack style={styles.formGroup}>
                        <Text style={styles.formLabel}>SĐT/EMAIL</Text>
                        <TextInput
                            value={emailOrPhone}
                            onChangeText={(text) => setField('emailOrPhone', text)}
                            placeholder="example@chronology.com"
                            placeholderTextColor={authFlowPalette.subtle}
                            style={[styles.input, error && styles.inputError]}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </Stack>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        label="Gửi mã xác thực"
                        variant="primary"
                        style={styles.submitButton}
                        loading={mutation.isPending}
                        onPress={() => mutation.mutate()}
                        icon={<ArrowRightIcon size={14} color={authFlowPalette.accentDark} />}
                    />
                </Stack>

                <Pressable style={styles.backRow} onPress={onBackToLogin}>
                    <Text style={styles.backText}>← Quay lại Đăng nhập</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
