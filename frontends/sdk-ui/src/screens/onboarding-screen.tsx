import React from 'react';
import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Row, Stack } from '../components/common';

interface OnboardingScreenProps {
    onSignUp?: () => void;
    onLogin?: () => void;
}

const palette = {
    background: '#101411',
    panel: '#111612',
    panelBorder: 'rgba(134,149,133,0.18)',
    text: '#E0E3DE',
    textMuted: '#869585',
    accent: '#4BE277',
    accentSecondary: '#46E0A4',
    overlay: 'rgba(11, 15, 12, 0.6)',
    liveDot: '#9FA69C',
};

const onboardingImages = {
    primary:
        'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80',
    secondary:
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
};

export const OnboardingScreen = ({ onLogin, onSignUp }: OnboardingScreenProps) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.background}>
                <Stack style={styles.glowLeft} />
                <Stack style={styles.glowRight} />

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <Row style={styles.header}>
                        <Text style={styles.brand}>The Living Chronology</Text>
                        <Row style={styles.liveWrap}>
                            <GlobeIcon />
                            <Text style={styles.liveText}>LIVE NOW</Text>
                        </Row>
                    </Row>

                    <View style={styles.heroSection}>
                        <View style={styles.heroCardBack}>
                            <Image source={{ uri: onboardingImages.primary }} style={styles.heroImage} resizeMode="cover" />
                        </View>
                        <View style={styles.heroCardFront}>
                            <Image source={{ uri: onboardingImages.secondary }} style={styles.heroImage} resizeMode="cover" />
                            <View style={styles.heroOverlayBadge}>
                                <Image source={{ uri: onboardingImages.avatar }} style={styles.avatar} resizeMode="cover" />
                                <Text numberOfLines={1} style={styles.heroOverlayText}>
                                    @linh_anh chia sẻ 2 phút trước
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.copySection}>
                        <Text style={styles.title}>
                            Ghi lại mọi khoảnh khắc,{'\n'}
                            <Text style={styles.titleAccent}>kết nối mọi trái tim</Text>
                        </Text>
                        <Text style={styles.subtitle}>
                            Trải nghiệm dòng thời gian sống động, nơi mỗi kỷ niệm được trân trọng và lan tỏa.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <GradientButton label="Đăng ký" onPress={onSignUp} />
                        <OutlineButton label="Đăng nhập" onPress={onLogin} />
                        <Text style={styles.footerNote}>THAM GIA CÙNG HƠN 2 TRIỆU NGƯỜI DÙNG</Text>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

function GradientButton({ label, onPress }: { label: string; onPress?: () => void }) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.buttonBase, pressed && styles.buttonPressed]}>
            <View style={styles.gradientFill}>
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Defs>
                        <LinearGradient id="onboarding-cta" x1="0%" y1="50%" x2="100%" y2="50%">
                            <Stop offset="0%" stopColor={palette.accent} />
                            <Stop offset="100%" stopColor={palette.accentSecondary} />
                        </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" rx="31" fill="url(#onboarding-cta)" />
                </Svg>
            </View>
            <Text style={styles.primaryButtonText}>{label}</Text>
        </Pressable>
    );
}

function OutlineButton({ label, onPress }: { label: string; onPress?: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.buttonBase, styles.outlineButton, pressed && styles.outlineButtonPressed]}
        >
            <Text style={styles.outlineButtonText}>{label}</Text>
        </Pressable>
    );
}

function GlobeIcon() {
    return (
        <Svg width={13} height={13} viewBox="0 0 16 16" fill="none">
            <Circle cx={8} cy={8} r={6.5} stroke={palette.liveDot} strokeWidth={1.2} />
            <PathGlobe />
        </Svg>
    );
}

function PathGlobe() {
    return (
        <>
            <Path d="M2.6 8h10.8" stroke={palette.liveDot} strokeWidth={1.1} strokeLinecap="round" />
            <Path
                d="M8 1.8c1.5 1.7 2.3 3.9 2.3 6.2 0 2.3-.8 4.5-2.3 6.2M8 1.8C6.5 3.5 5.7 5.7 5.7 8c0 2.3.8 4.5 2.3 6.2"
                stroke={palette.liveDot}
                strokeWidth={1.1}
                strokeLinecap="round"
            />
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: palette.background,
    },
    background: {
        flex: 1,
        backgroundColor: palette.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 32,
    },
    glowLeft: {
        position: 'absolute',
        left: -72,
        top: 220,
        width: 329,
        height: 329,
        borderRadius: 999,
        backgroundColor: 'rgba(75,226,119,0.08)',
        shadowColor: '#4BE277',
        shadowOpacity: 0.35,
        shadowRadius: 90,
        shadowOffset: { width: 0, height: 0 },
    },
    glowRight: {
        position: 'absolute',
        right: -75,
        top: 340,
        width: 320,
        height: 320,
        borderRadius: 999,
        backgroundColor: 'rgba(173,198,255,0.08)',
        shadowColor: '#ADC6FF',
        shadowOpacity: 0.2,
        shadowRadius: 80,
        shadowOffset: { width: 0, height: 0 },
    },
    header: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    brand: {
        color: palette.accent,
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.45,
    },
    liveWrap: {
        alignItems: 'center',
        gap: 4,
    },
    liveText: {
        color: palette.textMuted,
        fontSize: 10,
        lineHeight: 15,
        letterSpacing: 1,
    },
    heroSection: {
        marginTop: 48,
        height: 410,
        position: 'relative',
        justifyContent: 'center',
    },
    heroCardBack: {
        position: 'absolute',
        top: 6,
        left: 12,
        right: 0,
        bottom: 6,
        borderRadius: 32,
        overflow: 'hidden',
        transform: [{ rotate: '2deg' }],
        backgroundColor: palette.panel,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 18 },
    },
    heroCardFront: {
        flex: 1,
        borderRadius: 32,
        overflow: 'hidden',
        transform: [{ rotate: '-1deg' }],
        backgroundColor: palette.panel,
        shadowColor: '#000',
        shadowOpacity: 0.28,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 18 },
    },
    heroImage: {
        width: '100%',
        height: '100%',
        opacity: 0.95,
    },
    heroOverlayBadge: {
        position: 'absolute',
        left: 22,
        right: 118,
        bottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: palette.overlay,
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(75,226,119,0.2)',
    },
    heroOverlayText: {
        flex: 1,
        color: palette.text,
        fontSize: 10,
        lineHeight: 15,
    },
    copySection: {
        marginTop: 36,
        gap: 16,
    },
    title: {
        color: palette.text,
        fontSize: 24,
        lineHeight: 39.6,
        fontWeight: '800',
        letterSpacing: -0.9,
    },
    titleAccent: {
        color: palette.accent,
    },
    subtitle: {
        maxWidth: 325,
        color: palette.textMuted,
        fontSize: 16,
        lineHeight: 26,
    },
    actions: {
        marginTop: 32,
        gap: 12,
    },
    buttonBase: {
        height: 62,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    buttonPressed: {
        opacity: 0.92,
    },
    gradientFill: {
        ...StyleSheet.absoluteFillObject,
    },
    primaryButtonText: {
        color: '#002109',
        fontSize: 18,
        lineHeight: 28,
        fontWeight: '700',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: palette.panelBorder,
        backgroundColor: 'transparent',
    },
    outlineButtonPressed: {
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    outlineButtonText: {
        color: palette.text,
        fontSize: 18,
        lineHeight: 28,
        fontWeight: '700',
    },
    footerNote: {
        marginTop: 8,
        alignSelf: 'center',
        color: palette.textMuted,
        fontSize: 10,
        lineHeight: 15,
        letterSpacing: 1,
    },
});
