import React from 'react';
import { SafeAreaView, StyleSheet, Text as RNText, Image, ScrollView, Text } from 'react-native';
import { Button } from '../components';
import { Row, Stack } from '../components/common';
import { colors } from '../theme/colors';

interface OnboardingScreenProps {
    onSignUp?: () => void;
    onLogin?: () => void;
}

export const OnboardingScreen = ({ onSignUp, onLogin }: OnboardingScreenProps) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <Stack style={styles.container}>
                    <Stack style={styles.topGlow} />
                    <Stack style={styles.bottomGlow} />

                    <Row style={styles.header}>
                        <Text style={styles.brand}>The Living Chronology</Text>

                        <Row style={styles.liveNow}>
                            <Stack style={styles.liveIcon}>
                                <Stack style={styles.liveIconCore} />
                            </Stack>
                            <Text style={styles.liveNowText}>LIVE NOW</Text>
                        </Row>
                    </Row>

                    <Stack style={styles.heroSection}>
                        <Stack style={styles.heroFrame}>
                            <Stack style={styles.heroBackdropCard} />

                            <Stack style={styles.heroCard}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=300&auto=format&fit=crop' }}
                                    style={styles.peekImage}
                                    resizeMode="cover"
                                />

                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop' }}
                                    style={styles.mainImage}
                                    resizeMode="cover"
                                />

                                <Row style={styles.captionPill}>
                                    <Stack style={styles.avatarWrap}>
                                        <Image
                                            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }}
                                            style={styles.avatar}
                                            resizeMode="cover"
                                        />
                                    </Stack>
                                    <RNText style={styles.captionText}>@linh_anh chia sẻ 2 phút trước</RNText>
                                </Row>
                            </Stack>
                        </Stack>
                    </Stack>

                    <Stack style={styles.textContent}>
                        <RNText style={styles.title}>
                            Ghi lại mọi khoảnh khắc,{"\n"}
                            <RNText style={styles.accentText}>kết nối mọi trái tim</RNText>
                        </RNText>
                        <RNText style={styles.subtitle}>
                            Trải nghiệm dòng thời gian sống động, nơi mỗi kỷ niệm được trân trọng và lan tỏa.
                        </RNText>
                    </Stack>

                    <Stack style={styles.footer}>
                        <Button
                            label="Đăng ký"
                            variant="primary"
                            style={styles.primaryButton}
                            onPress={onSignUp}
                        />
                        <Button
                            label="Đăng nhập"
                            variant="outline"
                            style={styles.secondaryButton}
                            onPress={onLogin}
                        />
                        <RNText style={styles.footerNote}>THAM GIA CÙNG HƠN 2 TRIỆU NGƯỜI DÙNG</RNText>
                    </Stack>
                </Stack>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        minHeight: '100%',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        position: 'relative',
        overflow: 'hidden',
    },
    topGlow: {
        position: 'absolute',
        top: -80,
        right: -40,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(34, 197, 94, 0.18)',
    },
    bottomGlow: {
        position: 'absolute',
        bottom: 180,
        left: -60,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(59, 130, 246, 0.16)',
    },
    header: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    brand: {
        color: colors.accent,
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.8,
    },
    liveNow: {
        alignItems: 'center',
    },
    liveIcon: {
        width: 18,
        height: 18,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    liveIconCore: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.textSecondary,
    },
    liveNowText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.8,
    },
    heroSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    heroFrame: {
        width: '100%',
        aspectRatio: 0.88,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroBackdropCard: {
        position: 'absolute',
        top: 6,
        right: 8,
        width: '90%',
        height: '92%',
        backgroundColor: '#E7E1D7',
        borderRadius: 34,
    },
    heroCard: {
        width: '94%',
        height: '96%',
        backgroundColor: colors.card,
        borderRadius: 34,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.28,
        shadowRadius: 28,
        elevation: 16,
    },
    peekImage: {
        position: 'absolute',
        right: -38,
        top: 18,
        width: 138,
        height: '92%',
        borderRadius: 28,
        opacity: 0.88,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    captionPill: {
        position: 'absolute',
        left: 20,
        bottom: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(11, 15, 12, 0.72)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 14,
        maxWidth: '76%',
    },
    avatarWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: colors.card,
        marginRight: 8,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    captionText: {
        color: '#F3F4F6',
        fontSize: 12,
        fontWeight: '600',
    },
    textContent: {
        marginTop: 28,
        paddingHorizontal: 8,
    },
    title: {
        color: colors.text,
        fontSize: 42,
        fontWeight: '900',
        lineHeight: 46,
        letterSpacing: -1.4,
    },
    accentText: {
        color: colors.accent,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 16,
        marginTop: 18,
        lineHeight: 22,
        maxWidth: '92%',
    },
    footer: {
        marginTop: 28,
        width: '100%',
        paddingBottom: 12,
    },
    primaryButton: {
        width: '100%',
        height: 62,
        borderRadius: 31,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 8,
    },
    secondaryButton: {
        width: '100%',
        height: 62,
        borderRadius: 31,
        marginTop: 18,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(10, 16, 12, 0.55)',
    },
    footerNote: {
        marginTop: 34,
        textAlign: 'center',
        color: 'rgba(249, 250, 251, 0.58)',
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 1.8,
    },
});
