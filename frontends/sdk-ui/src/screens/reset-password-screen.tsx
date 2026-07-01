import { useForgotPasswordStore, useResetForgotPassword } from '@rocket/sdk-ts';
import React, { useState } from 'react';
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

interface ResetPasswordScreenProps {
    emailOrPhone: string;
    otp: string;
    onSuccess?: () => void;
    onBack?: () => void;
}

export function ResetPasswordScreen({ emailOrPhone, otp, onSuccess, onBack }: ResetPasswordScreenProps) {
    const newPassword = useForgotPasswordStore((s) => s.newPassword);
    const confirmPassword = useForgotPasswordStore((s) => s.confirmPassword);
    const error = useForgotPasswordStore((s) => s.error);
    const setField = useForgotPasswordStore((s) => s.setField);
    const [secureNew, setSecureNew] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);

    const mutation = useResetForgotPassword(emailOrPhone, otp, {
        onSuccess,
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
                    <Text style={styles.badgeIcon}>🔒</Text>
                </View>

                <Stack style={styles.headingBlock}>
                    <Text style={styles.title}>
                        Đặt mật khẩu{'\n'}
                        <Text style={styles.titleAccent}>mới</Text>
                    </Text>
                    <Text style={styles.subtitle}>Mật khẩu cần ít nhất 6 ký tự</Text>
                </Stack>

                <Stack style={styles.form}>
                    <Stack style={styles.formGroup}>
                        <Text style={styles.formLabel}>MẬT KHẨU MỚI</Text>
                        <View style={[styles.input, styles.passwordInput]}>
                            <TextInput
                                value={newPassword}
                                onChangeText={(text) => setField('newPassword', text)}
                                placeholder="••••••••"
                                placeholderTextColor={authFlowPalette.subtle}
                                style={styles.passwordField}
                                secureTextEntry={secureNew}
                            />
                            <Pressable onPress={() => setSecureNew((v) => !v)} hitSlop={8}>
                                <Text style={styles.eyeText}>{secureNew ? '◉' : '◌'}</Text>
                            </Pressable>
                        </View>
                    </Stack>

                    <Stack style={styles.formGroup}>
                        <Text style={styles.formLabel}>XÁC NHẬN MẬT KHẨU</Text>
                        <View style={[styles.input, styles.passwordInput]}>
                            <TextInput
                                value={confirmPassword}
                                onChangeText={(text) => setField('confirmPassword', text)}
                                placeholder="••••••••"
                                placeholderTextColor={authFlowPalette.subtle}
                                style={styles.passwordField}
                                secureTextEntry={secureConfirm}
                            />
                            <Pressable onPress={() => setSecureConfirm((v) => !v)} hitSlop={8}>
                                <Text style={styles.eyeText}>{secureConfirm ? '◉' : '◌'}</Text>
                            </Pressable>
                        </View>
                    </Stack>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        label="Hoàn tất"
                        variant="primary"
                        style={styles.submitButton}
                        loading={mutation.isPending}
                        onPress={() => mutation.mutate()}
                        icon={<ArrowRightIcon size={14} color={authFlowPalette.accentDark} />}
                    />
                </Stack>

                <Pressable style={styles.backRow} onPress={onBack}>
                    <Text style={styles.backText}>← Quay lại</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
