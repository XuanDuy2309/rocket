import { useAuthStore, useAuthSubmit, type AuthMode, type ForgotPasswordResponse } from '@rocket/sdk-ts';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface AuthScreenProps {
    mode: AuthMode;
    onAuthenticated?: () => void;
    onNavigateToMode?: (mode: AuthMode) => void;
    onForgotPassword?: () => void;
}

type AuthCopy = {
    title: string;
    subtitle: string;
    cta: string;
    secondaryLabel: string;
    secondaryTarget: AuthMode;
    helper?: string;
};

type FieldTone = 'default' | 'error';

const palette = {
    background: '#101411',
    surface: 'rgba(50,54,50,0.5)',
    surfaceStrong: '#272B27',
    border: 'rgba(134,149,133,0.2)',
    borderStrong: 'rgba(255,180,171,0.3)',
    text: '#E0E3DE',
    textMuted: '#869585',
    textSoft: 'rgba(134,149,133,0.4)',
    accent: '#4BE277',
    accentSecondary: '#46E0A4',
    accentBlue: '#ADC6FF',
    danger: '#FFB4AB',
    buttonText: '#002109',
    shadowGreen: 'rgba(34,197,94,0.25)',
};

const authCopy: Record<AuthMode, AuthCopy> = {
    login: {
        title: 'The Living\nChronology',
        subtitle: 'Ghi lại dòng chảy của những khoảnh khắc.',
        cta: 'Đăng nhập',
        secondaryLabel: 'Đăng ký ngay',
        secondaryTarget: 'register',
    },
    register: {
        title: 'Bắt đầu\nHành trình',
        subtitle: 'Lưu giữ dòng thời gian sống động trong từng khoảnh khắc.',
        cta: 'Đăng ký tài khoản',
        secondaryLabel: 'Đăng nhập',
        secondaryTarget: 'login',
        helper: 'Bằng cách đăng ký, bạn đồng ý với Điều khoản và Quyền riêng tư của The Living Chronology.',
    },
    forgotPassword: {
        title: 'Khôi phục\nmật khẩu',
        subtitle: 'Nhập email hoặc số điện thoại để nhận mã xác thực',
        cta: 'Gửi mã xác thực',
        secondaryLabel: 'Quay lại Đăng nhập',
        secondaryTarget: 'login',
    },
};

export function AuthScreen({ mode, onAuthenticated, onNavigateToMode, onForgotPassword }: AuthScreenProps) {
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const loginValues = useAuthStore((state) => state.login);
    const registerValues = useAuthStore((state) => state.register);
    const forgotPasswordValues = useAuthStore((state) => state.forgotPassword);
    const setField = useAuthStore((state) => state.setField);
    const values =
        mode === 'register'
            ? registerValues
            : mode === 'forgotPassword'
              ? forgotPasswordValues
              : loginValues;
    const isRegister = mode === 'register';
    const isForgotPassword = mode === 'forgotPassword';
    const isLogin = mode === 'login';
    const passwordValue = isRegister ? registerValues.password : loginValues.password;
    const mutation = useAuthSubmit(mode, {
        onSuccess: () => {
            if (mode !== 'forgotPassword') {
                onAuthenticated?.();
            }
        },
    });
    const copy = authCopy[mode];
    const forgotPasswordResult = mutation.data as ForgotPasswordResponse | undefined;

    const fieldTones = useMemo(
        () => ({
            email:
                values.error?.toLowerCase().includes('email') ||
                values.error?.toLowerCase().includes('số điện thoại') ||
                values.error?.toLowerCase().includes('sdt'),
            password: values.error?.toLowerCase().includes('mật khẩu'),
            username: values.error?.toLowerCase().includes('tên người dùng'),
        }),
        [values.error]
    );

    const handleModeNavigation = (targetMode: AuthMode) => {
        mutation.reset();
        onNavigateToMode?.(targetMode);
    };

    const actionBlock = isForgotPassword && mutation.isSuccess ? (
        <ForgotPasswordSuccess
            result={forgotPasswordResult}
            onBack={() => handleModeNavigation('login')}
            onReset={() => mutation.reset()}
        />
    ) : (
        <>
            {isRegister ? (
                <AuthField
                    label="TÊN NGƯỜI DÙNG"
                    value={registerValues.username}
                    onChangeText={(text) => setField('register', 'username', text)}
                    placeholder="Nhập tên người dùng"
                    tone={fieldTones.username ? 'error' : 'default'}
                    error={fieldTones.username ? values.error : undefined}
                />
            ) : null}

            <AuthField
                label="SDT/EMAIL"
                value={values.email}
                onChangeText={(text) => setField(mode, 'email', text)}
                placeholder="example@chronology.com"
                keyboardType="email-address"
                autoCapitalize="none"
                tone={fieldTones.email ? 'error' : 'default'}
                error={fieldTones.email ? values.error : undefined}
            />

            {!isForgotPassword ? (
                <AuthField
                    label="MẬT KHẨU"
                    value={passwordValue}
                    onChangeText={(text) => setField(mode, 'password', text)}
                    placeholder="Nhập mật khẩu"
                    secureTextEntry={secureTextEntry}
                    tone={fieldTones.password ? 'error' : 'default'}
                    error={fieldTones.password ? values.error : undefined}
                    rightSlot={
                        isLogin ? (
                            <Pressable onPress={() => handleModeNavigation('forgotPassword')}>
                                <Text style={styles.inlineLink}>QUÊN MẬT KHẨU?</Text>
                            </Pressable>
                        ) : (
                            <View style={styles.inlineLinkPlaceholder} />
                        )
                    }
                    inputAccessory={
                        <Pressable onPress={() => setSecureTextEntry((current) => !current)} hitSlop={8}>
                            {fieldTones.password ? (
                                <LockIcon color={palette.textMuted} />
                            ) : (
                                <Text style={styles.toggleText}>{secureTextEntry ? 'Hiện' : 'Ẩn'}</Text>
                            )}
                        </Pressable>
                    }
                />
            ) : null}

            {!isRegister && !isLogin && values.error && !fieldTones.email ? (
                <InlineError message={values.error} />
            ) : null}

            <GradientButton
                label={copy.cta}
                onPress={() => mutation.mutate()}
                loading={mutation.isPending}
                icon={isRegister || isForgotPassword ? <ArrowRightIcon color={palette.buttonText} /> : undefined}
            />

            {isLogin ? (
                <Text style={styles.bottomPrompt}>
                    <Text style={styles.bottomPromptMuted}>Chưa có tài khoản? </Text>
                    <Text style={styles.bottomPromptAccent} onPress={() => handleModeNavigation(copy.secondaryTarget)}>
                        {copy.secondaryLabel}
                    </Text>
                </Text>
            ) : null}

            {isRegister ? (
                <>
                    <Text style={styles.bottomPrompt}>
                        <Text style={styles.bottomPromptMuted}>Đã có tài khoản? </Text>
                        <Text style={styles.bottomPromptBlue} onPress={() => handleModeNavigation(copy.secondaryTarget)}>
                            {copy.secondaryLabel}
                        </Text>
                    </Text>
                    {copy.helper ? <Text style={styles.helperText}>{copy.helper}</Text> : null}
                </>
            ) : null}

            {isForgotPassword ? (
                <Pressable onPress={() => handleModeNavigation(copy.secondaryTarget)} style={styles.backRow}>
                    <ArrowLeftIcon color={palette.textMuted} />
                    <Text style={styles.backRowText}>{copy.secondaryLabel}</Text>
                </Pressable>
            ) : null}
        </>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <View style={[styles.glowTop, isRegister && styles.glowTopRegister, isForgotPassword && styles.glowTopForgot]} />
                <View
                    style={[styles.glowBottom, isLogin && styles.glowBottomLogin, isRegister && styles.glowBottomRegister]}
                />

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[
                        styles.content,
                        isLogin && styles.loginContent,
                        isRegister && styles.registerContent,
                        isForgotPassword && styles.forgotContent,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {isLogin ? (
                        <>
                            <View style={styles.topBar}>
                                <View style={styles.languageWrap}>
                                    <View style={styles.languageBadge}>
                                        <GlobeIcon color={palette.textMuted} />
                                    </View>
                                    <Text style={styles.languageText}>VN | EN</Text>
                                </View>
                                <LeafIcon color={palette.accent} />
                            </View>

                            <View style={styles.loginHeader}>
                                <Text style={styles.loginTitle}>
                                    <Text style={styles.brandGradientStart}>The Living</Text>
                                    {'\n'}
                                    <Text style={styles.brandGradientEnd}>Chronology</Text>
                                </Text>
                                <Text style={styles.loginSubtitle}>{copy.subtitle}</Text>
                            </View>
                        </>

                    ) : (
                        <View style={styles.authHeader}>
                            <View style={[styles.headerBadge, isForgotPassword && styles.headerBadgeLarge]}>
                                {isRegister ? <SparklesIcon color={palette.accent} /> : <ResetIcon color={palette.accent} />}
                            </View>
                            <Text style={styles.authTitle}>
                                {isRegister ? 'Bắt đầu\n' : 'Khôi phục\n'}
                                <Text style={isRegister ? styles.authTitleAccent : styles.authTitleBase}>
                                    {isRegister ? 'Hành trình' : 'mật khẩu'}
                                </Text>
                            </Text>
                            <Text style={[styles.authSubtitle, isForgotPassword && styles.authSubtitleLarge]}>
                                {copy.subtitle}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.formSection, isLogin && styles.formSectionLogin]}>{actionBlock}</View>

                    {isLogin ? <View style={styles.homeIndicator} /> : null}
                    {isForgotPassword ? (
                        <View style={styles.waveWrap}>
                            <ForgotPasswordWave />
                        </View>
                    ) : null}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

interface AuthFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    tone?: FieldTone;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    rightSlot?: React.ReactNode;
    inputAccessory?: React.ReactNode;
}

function AuthField({
    label,
    value,
    onChangeText,
    placeholder,
    tone = 'default',
    error,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    rightSlot,
    inputAccessory,
}: AuthFieldProps) {
    return (
        <View style={styles.fieldGroup}>
            <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>{label}</Text>
                {rightSlot}
            </View>
            <View style={[styles.inputShell, tone === 'error' && styles.inputShellError]}>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={palette.textSoft}
                    style={styles.input}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                />
                {inputAccessory ? <View style={styles.inputAccessory}>{inputAccessory}</View> : null}
            </View>
            {error ? <InlineError message={error} /> : null}
        </View>
    );
}

function InlineError({ message }: { message: string }) {
    return (
        <View style={styles.errorRow}>
            <ErrorIcon color={palette.danger} />
            <Text style={styles.errorText}>{message}</Text>
        </View>
    );
}

function GradientButton({
    label,
    onPress,
    loading,
    icon,
}: {
    label: string;
    onPress?: () => void;
    loading?: boolean;
    icon?: React.ReactNode;
}) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.gradientButton, pressed && styles.buttonPressed]}>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
                <Defs>
                    <LinearGradient id="auth-cta" x1="0%" y1="50%" x2="100%" y2="50%">
                        <Stop offset="0%" stopColor={palette.accent} />
                        <Stop offset="100%" stopColor={palette.accentSecondary} />
                    </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" rx="31" fill="url(#auth-cta)" />
            </Svg>
            <View style={styles.gradientButtonContent}>
                {loading ? (
                    <ActivityIndicator color={palette.buttonText} />
                ) : (
                    <>
                        <Text style={styles.gradientButtonText}>{label}</Text>
                        {icon ? <View style={styles.gradientButtonIcon}>{icon}</View> : null}
                    </>
                )}
            </View>
        </Pressable>
    );
}

function ForgotPasswordSuccess({
    result,
    onBack,
    onReset,
}: {
    result?: ForgotPasswordResponse;
    onBack: () => void;
    onReset: () => void;
}) {
    return (
        <View style={styles.successCard}>
            <View style={styles.successBadge}>
                <ResetIcon color={palette.accent} />
            </View>
            <Text style={styles.successTitle}>Mã xác thực đã được gửi</Text>
            <Text style={styles.successText}>
                {result?.message ?? 'Vui lòng kiểm tra email hoặc số điện thoại của bạn để tiếp tục khôi phục mật khẩu.'}
            </Text>
            {result?.email ? <Text style={styles.successTarget}>{result.email}</Text> : null}
            <GradientButton label="Quay lại Đăng nhập" onPress={onBack} />
            <Pressable onPress={onReset} style={styles.secondaryLinkButton}>
                <Text style={styles.secondaryLinkText}>Gửi lại mã</Text>
            </Pressable>
        </View>
    );
}

function GlobeIcon({ color }: { color: string }) {
    return (
        <Svg width={10} height={10} viewBox="0 0 16 16" fill="none">
            <Circle cx={8} cy={8} r={6.4} stroke={color} strokeWidth={1.2} />
            <Path d="M2.6 8h10.8" stroke={color} strokeWidth={1.1} strokeLinecap="round" />
            <Path
                d="M8 1.8c1.55 1.74 2.35 3.85 2.35 6.2 0 2.35-.8 4.46-2.35 6.2M8 1.8C6.45 3.54 5.65 5.65 5.65 8c0 2.35.8 4.46 2.35 6.2"
                stroke={color}
                strokeWidth={1.1}
                strokeLinecap="round"
            />
        </Svg>
    );
}

function LeafIcon({ color }: { color: string }) {
    return (
        <Svg width={16} height={20} viewBox="0 0 16 20" fill="none">
            <Path
                d="M8 1.5C10.72 4.2 14 7.46 14 10.8C14 14.23 11.31 17 8 17C4.69 17 2 14.23 2 10.8C2 7.46 5.28 4.2 8 1.5Z"
                stroke={color}
                strokeWidth={1.5}
            />
        </Svg>
    );
}

function SparklesIcon({ color }: { color: string }) {
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
                d="M12 3l1.46 4.54L18 9l-4.54 1.46L12 15l-1.46-4.54L6 9l4.54-1.46L12 3ZM18.5 14l.88 2.62L22 17.5l-2.62.88L18.5 21l-.88-2.62L15 17.5l2.62-.88L18.5 14ZM5.5 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"
                fill={color}
            />
        </Svg>
    );
}

function ResetIcon({ color }: { color: string }) {
    return (
        <Svg width={25} height={25} viewBox="0 0 24 24" fill="none">
            <Path
                d="M8 6H3v5M4.5 10.5A8 8 0 1 0 7 5.2"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Circle cx={12} cy={12} r={1.6} fill={color} />
        </Svg>
    );
}

function LockIcon({ color }: { color: string }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Rect x={5} y={11} width={14} height={10} rx={2} stroke={color} strokeWidth={1.8} />
            <Path d="M8 11V8a4 4 0 1 1 8 0v3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
    );
}

function ArrowRightIcon({ color }: { color: string }) {
    return (
        <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
            <Path d="M3 8h10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M9 4l4 4-4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function ArrowLeftIcon({ color }: { color: string }) {
    return (
        <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
            <Path d="M13 8H3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
            <Path d="M7 4L3 8l4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function ErrorIcon({ color }: { color: string }) {
    return (
        <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
            <Circle cx={8} cy={8} r={6} stroke={color} strokeWidth={1.2} />
            <Path d="M8 4.5v4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
            <Circle cx={8} cy={10.9} r={0.8} fill={color} />
        </Svg>
    );
}

function ForgotPasswordWave() {
    return (
        <Svg width={160} height={32} viewBox="0 0 160 32" fill="none">
            <Path
                d="M1 25.5c12 0 18-7 30-7s18 15 30 15 18-15 30-15 18 7 30 7"
                stroke="rgba(97,131,122,0.8)"
                strokeWidth={2}
                strokeLinecap="round"
            />
        </Svg>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: palette.background,
    },
    screen: {
        flex: 1,
        backgroundColor: palette.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 32,
        paddingTop: 32,
        paddingBottom: 32,
    },
    loginContent: {
        justifyContent: 'space-between',
    },
    registerContent: {
        minHeight: 838,
    },
    forgotContent: {
        justifyContent: 'center',
        minHeight: 884,
    },
    glowTop: {
        position: 'absolute',
        top: -88,
        left: 40,
        width: 360,
        height: 360,
        borderRadius: 999,
        backgroundColor: 'rgba(75,226,119,0.08)',
        shadowColor: '#4BE277',
        shadowOpacity: 0.3,
        shadowRadius: 90,
        shadowOffset: { width: 0, height: 0 },
    },
    glowTopRegister: {
        left: -96,
        top: -96,
        width: 384,
        height: 384,
    },
    glowTopForgot: {
        right: -48,
        left: undefined,
        top: 96,
        width: 420,
        height: 420,
    },
    glowBottom: {
        position: 'absolute',
        borderRadius: 999,
    },
    glowBottomLogin: {
        left: -20,
        right: 24,
        bottom: -80,
        height: 220,
        backgroundColor: 'rgba(173,198,255,0.08)',
        shadowColor: '#ADC6FF',
        shadowOpacity: 0.18,
        shadowRadius: 70,
        shadowOffset: { width: 0, height: 0 },
    },
    glowBottomRegister: {
        right: -96,
        bottom: 120,
        width: 320,
        height: 320,
        backgroundColor: 'rgba(5,102,217,0.08)',
        shadowColor: '#0566D9',
        shadowOpacity: 0.18,
        shadowRadius: 60,
        shadowOffset: { width: 0, height: 0 },
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    languageWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    languageBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#323632',
    },
    languageText: {
        color: palette.textMuted,
        fontSize: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    loginHeader: {
        width: '100%',
        alignItems: 'center',
        gap: 12,
        marginTop: 92,
    },
    loginTitle: {
        textAlign: 'center',
        fontSize: 36,
        lineHeight: 40,
        letterSpacing: -1.8,
        fontWeight: '800',
    },
    brandGradientStart: {
        color: '#4BE277',
    },
    brandGradientEnd: {
        color: '#46E0A4',
    },
    loginSubtitle: {
        width: 300,
        color: '#BCCBB9',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        letterSpacing: 0.35,
        opacity: 0.8,
    },
    authHeader: {
        width: '100%',
        gap: 16,
    },
    headerBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#323632',
        shadowColor: '#4AE277',
        shadowOpacity: 0.08,
        shadowRadius: 32,
        shadowOffset: { width: 0, height: 0 },
    },
    headerBadgeLarge: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: palette.surfaceStrong,
    },
    authTitle: {
        color: palette.text,
        fontSize: 40,
        lineHeight: 44,
        letterSpacing: -1,
        fontWeight: '800',
        paddingTop: 24,
    },
    authTitleBase: {
        color: palette.text,
    },
    authTitleAccent: {
        color: palette.accent,
    },
    authSubtitle: {
        width: 240,
        color: palette.textMuted,
        fontSize: 14,
        lineHeight: 20,
    },
    authSubtitleLarge: {
        width: 260,
        fontSize: 18,
        lineHeight: 29.25,
    },
    formSection: {
        marginTop: 48,
        gap: 24,
    },
    formSectionLogin: {
        gap: 40,
    },
    fieldGroup: {
        gap: 8,
        marginBottom: 12,
    },
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 18,
    },
    fieldLabel: {
        color: palette.textMuted,
        fontSize: 11,
        lineHeight: 16.5,
        letterSpacing: 1.1,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    inlineLink: {
        color: palette.accentBlue,
        fontSize: 10,
        lineHeight: 15,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    inlineLinkPlaceholder: {
        width: 111,
        height: 15,
    },
    inputShell: {
        minHeight: 62,
        borderRadius: 16,
        backgroundColor: palette.surface,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputShellError: {
        borderColor: palette.borderStrong,
    },
    input: {
        flex: 1,
        color: palette.text,
        fontSize: 16,
        paddingVertical: 20,
    },
    inputAccessory: {
        marginLeft: 12,
    },
    toggleText: {
        color: palette.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    errorText: {
        flex: 1,
        color: palette.danger,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
    },
    gradientButton: {
        marginTop: 12,
        height: 62,
        borderRadius: 999,
        overflow: 'hidden',
        shadowColor: palette.accent,
        shadowOpacity: 0.25,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 12 },
        elevation: 2,
    },
    buttonPressed: {
        opacity: 0.92,
    },
    gradientButtonContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    gradientButtonText: {
        color: palette.buttonText,
        fontSize: 18,
        lineHeight: 28,
        fontWeight: '700',
        letterSpacing: -0.45,
    },
    gradientButtonIcon: {
        marginTop: 1,
    },
    bottomPrompt: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    bottomPromptMuted: {
        color: '#BCCBB9',
    },
    bottomPromptAccent: {
        color: palette.accent,
        fontWeight: '600',
    },
    bottomPromptBlue: {
        color: palette.accentBlue,
        fontWeight: '600',
    },
    helperText: {
        marginTop: 110,
        color: 'rgba(134,149,133,0.4)',
        fontSize: 10,
        lineHeight: 16.25,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    backRow: {
        marginTop: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    backRowText: {
        color: palette.textMuted,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    successCard: {
        gap: 16,
        paddingTop: 12,
    },
    successBadge: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: palette.surfaceStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successTitle: {
        color: palette.text,
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '800',
    },
    successText: {
        color: palette.textMuted,
        fontSize: 16,
        lineHeight: 24,
    },
    successTarget: {
        color: palette.accentBlue,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
    secondaryLinkButton: {
        marginTop: 4,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    secondaryLinkText: {
        color: palette.textMuted,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
    homeIndicator: {
        alignSelf: 'center',
        marginTop: 92,
        width: 128,
        height: 6,
        borderRadius: 999,
        backgroundColor: '#323632',
        opacity: 0.5,
    },
    waveWrap: {
        alignItems: 'center',
        marginTop: 150,
        opacity: 0.3,
    },
});
