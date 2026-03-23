import { useAuthStore, useAuthSubmit, type AuthMode } from '@rocket/sdk-ts';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from 'react-native';
import { Button } from '../components';
import { Row, Stack } from '../components/common';

interface AuthScreenProps {
    mode: AuthMode;
    onAuthenticated?: () => void;
    onNavigateToMode?: (mode: AuthMode) => void;
}

const palette = {
    background: '#0B0F0C',
    card: '#3A3E38',
    text: '#F4F6F3',
    muted: '#8B9288',
    subtle: '#6D746A',
    accent: '#4BE48A',
    accentSoft: '#B6C3FF',
    danger: '#FFB4AE',
    border: 'rgba(255,255,255,0.08)',
    errorBorder: 'rgba(255, 180, 174, 0.45)',
};

export function AuthScreen({ mode, onAuthenticated, onNavigateToMode }: AuthScreenProps) {
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const loginValues = useAuthStore((state) => state.login);
    const registerValues = useAuthStore((state) => state.register);
    const setField = useAuthStore((state) => state.setField);
    const isRegister = mode === 'register';
    const values = isRegister ? registerValues : loginValues;
    const mutation = useAuthSubmit(mode, {
        onSuccess: onAuthenticated,
    });

    const content = useMemo(() => {
        if (isRegister) {
            return {
                title: (
                    <Text style={styles.title}>
                        Bắt đầu{'\n'}
                        <Text style={styles.titleAccent}>Hành trình của bạn</Text>
                    </Text>
                ),
                subtitle: 'Lưu giữ dòng thời gian sống động trong từng khoảnh khắc.',
                cta: 'Đăng ký tài khoản',
                switchText: 'Đã có tài khoản?',
                switchAction: 'Đăng nhập',
                switchMode: 'login' as const,
                helper: 'Bằng cách đăng ký, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Quyền riêng tư của The Living Chronology.',
            };
        }

        return {
            title: <Text style={styles.title}>The Living Chronology</Text>,
            subtitle: 'Ghi lại dòng chảy của những khoảnh khắc.',
            cta: 'Đăng nhập',
            switchText: 'Chưa có tài khoản?',
            switchAction: 'Đăng ký ngay',
            switchMode: 'register' as const,
            helper: '',
        };
    }, [isRegister]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Stack style={styles.topGlow} />

                <Row style={styles.topBar}>
                    {isRegister ? (
                        <Stack style={styles.heroBadge}>
                            <Text style={styles.heroBadgeText}>✦</Text>
                        </Stack>
                    ) : (
                        <Row style={styles.localeWrap}>
                            <Stack style={styles.localeIcon}>
                                <Text style={styles.localeIconText}>◎</Text>
                            </Stack>
                            <Text style={styles.localeText}>VN | EN</Text>
                        </Row>
                    )}
                    <Stack style={styles.ghostIcon} />
                </Row>

                <Stack style={styles.headingBlock}>
                    {content.title}
                    <Text style={styles.subtitle}>{content.subtitle}</Text>
                </Stack>

                <Stack style={styles.form}>
                    {isRegister ? (
                        <>
                            <Text style={styles.formLabel}>Tên người dùng</Text>
                            <TextInput
                                value={registerValues.username}
                                onChangeText={(text) => setField(mode, 'username', text)}
                                placeholder="@nickname"
                                placeholderTextColor={palette.subtle}
                                style={styles.input}
                                autoCapitalize="none"
                            />
                            <Text style={styles.formHint}>TÊN HIỂN THỊ CÔNG KHAI TRÊN DÒNG THỜI GIAN</Text>
                        </>
                    ) : null}

                    <Stack style={styles.formGroup}>
                        <Text style={styles.formLabel}>Số điện thoại hoặc Email</Text>
                        <TextInput
                            value={values.email}
                            onChangeText={(text) => setField(mode, 'email', text)}
                            placeholder={isRegister ? 'email@vi-du.com' : 'example@chronology.com'}
                            placeholderTextColor={palette.subtle}
                            style={[styles.input, values.error === 'Email không hợp lệ' && styles.inputError]}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </Stack>

                    <Stack style={styles.formGroup}>
                        <Row style={styles.passwordHeader}>
                            <Text style={[styles.formLabel, styles.passwordLabel]}>Mật khẩu</Text>
                            {!isRegister ? <Text style={styles.linkText}>QUÊN MẬT KHẨU?</Text> : null}
                        </Row>
                        <Row
                            style={[
                                styles.input,
                                styles.passwordInput,
                                values.error === 'Mật khẩu cần ít nhất 8 ký tự' && styles.inputError,
                            ]}
                        >
                            <TextInput
                                value={values.password}
                                onChangeText={(text) => setField(mode, 'password', text)}
                                placeholder="••••••••"
                                placeholderTextColor={palette.subtle}
                                style={styles.passwordField}
                                secureTextEntry={secureTextEntry}
                            />
                            <Pressable onPress={() => setSecureTextEntry((current) => !current)} hitSlop={8}>
                                <Text style={styles.eyeText}>{secureTextEntry ? '◉' : '◌'}</Text>
                            </Pressable>
                        </Row>
                    </Stack>

                    {values.error ? (
                        <Text style={styles.errorText}>◉ {values.error}</Text>
                    ) : (
                        <Text style={styles.infoText}>
                            {isRegister ? '◉ Mật khẩu cần ít nhất 8 ký tự' : ' '}
                        </Text>
                    )}

                    <Button
                        label={content.cta}
                        variant="primary"
                        style={styles.submitButton}
                        onPress={() => mutation.mutate()}
                        loading={mutation.isPending}
                    />

                    <Row style={styles.switchRow}>
                        <Text style={styles.switchText}>{content.switchText} </Text>
                        <Pressable onPress={() => onNavigateToMode?.(content.switchMode)}>
                            <Text style={[styles.switchAction, !isRegister && styles.switchActionAlt]}>
                                {content.switchAction}
                            </Text>
                        </Pressable>
                    </Row>

                    {content.helper ? <Text style={styles.footerCopy}>{content.helper}</Text> : null}
                </Stack>

                {mutation.isPending ? (
                    <Stack style={styles.loadingDock}>
                        <ActivityIndicator color={palette.accent} />
                    </Stack>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: palette.background,
    },
    scroll: {
        flex: 1,
        backgroundColor: palette.background,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 34,
        paddingTop: 20,
        paddingBottom: 42,
    },
    topGlow: {
        position: 'absolute',
        top: -140,
        left: 78,
        width: 340,
        height: 340,
        borderRadius: 170,
        backgroundColor: 'rgba(75, 228, 138, 0.12)',
    },
    topBar: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    localeWrap: {
        alignItems: 'center',
    },
    localeIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    localeIconText: {
        color: palette.text,
        fontSize: 14,
    },
    localeText: {
        color: palette.text,
        fontSize: 15,
        letterSpacing: 1,
    },
    heroBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroBadgeText: {
        color: palette.accent,
        fontSize: 34,
    },
    ghostIcon: {
        width: 22,
        height: 30,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    headingBlock: {
        marginTop: 68,
    },
    title: {
        color: palette.text,
        fontSize: 38,
        lineHeight: 42,
        fontWeight: '900',
        letterSpacing: -1.6,
    },
    titleAccent: {
        color: palette.accent,
    },
    subtitle: {
        marginTop: 14,
        color: palette.muted,
        fontSize: 17,
        lineHeight: 25,
        maxWidth: 420,
    },
    form: {
        marginTop: 44,
    },
    formGroup: {
        marginTop: 22,
    },
    formLabel: {
        color: '#9BA294',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 2.2,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    passwordHeader: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    passwordLabel: {
        marginBottom: 0,
    },
    input: {
        width: '100%',
        height: 88,
        borderRadius: 28,
        backgroundColor: palette.card,
        paddingHorizontal: 26,
        color: palette.text,
        fontSize: 18,
        borderWidth: 1,
        borderColor: palette.border,
    },
    inputError: {
        borderColor: palette.errorBorder,
    },
    formHint: {
        marginTop: 12,
        color: '#62685E',
        fontSize: 11,
        letterSpacing: 1.8,
    },
    passwordInput: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    passwordField: {
        flex: 1,
        color: palette.text,
        fontSize: 18,
    },
    eyeText: {
        color: '#95A08F',
        fontSize: 26,
    },
    linkText: {
        color: palette.accentSoft,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1.2,
    },
    errorText: {
        marginTop: 14,
        color: palette.danger,
        fontSize: 14,
        fontWeight: '600',
    },
    infoText: {
        marginTop: 14,
        color: '#D6DFD3',
        fontSize: 14,
    },
    submitButton: {
        width: '100%',
        height: 72,
        borderRadius: 36,
        marginTop: 36,
        shadowColor: palette.accent,
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 10,
    },
    switchRow: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 92,
    },
    switchText: {
        color: '#C1C6BC',
        fontSize: 18,
        fontWeight: '500',
    },
    switchAction: {
        color: palette.accentSoft,
        fontSize: 18,
        fontWeight: '800',
    },
    switchActionAlt: {
        color: palette.accent,
    },
    footerCopy: {
        marginTop: 86,
        color: '#4A5047',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 24,
        paddingHorizontal: 24,
    },
    loadingDock: {
        position: 'absolute',
        top: 24,
        right: 24,
    },
});
