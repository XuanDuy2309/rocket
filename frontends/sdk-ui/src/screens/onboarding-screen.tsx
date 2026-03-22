import React from 'react';
import { View, SafeAreaView, StyleSheet, Text as RNText, Dimensions } from 'react-native';
import { Button, PolaroidCard, SparkleIcon, CameraIcon, ArrowRightIcon } from '../components';

export const OnboardingScreen = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.sparkleBackground}>
                        <SparkleIcon size={32} />
                    </View>
                </View>

                {/* Hero Card Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroCard}>
                        {/* Polaroid Stack */}
                        <View style={styles.polaroidStack}>
                            <PolaroidCard
                                source={{ uri: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=300&auto=format&fit=crop' }}
                                style={styles.polaroidLeft}
                                rotation={-6}
                            />
                            <PolaroidCard
                                source={{ uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop' }}
                                style={styles.polaroidCenter}
                                rotation={0}
                            />
                            <PolaroidCard
                                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop' }}
                                style={styles.polaroidRight}
                                rotation={6}
                            />

                            {/* Camera Capsule Overlay */}
                            <View style={styles.cameraCapsule}>
                                <View style={styles.cameraIconContainer}>
                                    <CameraIcon size={20} color="black" />
                                </View>
                                <View style={styles.capsuleLines}>
                                    <View style={styles.capsuleLineLong} />
                                    <View style={styles.capsuleLineShort} />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Text Content Section */}
                <View style={styles.textContent}>
                    <RNText style={styles.title}>
                        <RNText style={styles.whiteText}>Locket is for your{"\n"}</RNText>
                        best friends.
                    </RNText>
                    <RNText style={styles.subtitle}>
                        See their photos right on your home screen.
                    </RNText>
                </View>

                {/* Footer Section: Pagination & Button */}
                <View style={styles.footer}>
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        <View style={styles.activeDot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>

                    {/* Get Started Button */}
                    <Button
                        label="Get Started"
                        variant="primary"
                        style={styles.fullWidth}
                        icon={<ArrowRightIcon size={20} color="black" />}
                    />
                </View>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginTop: 16,
    },
    sparkleBackground: {
        backgroundColor: '#1A1A10',
        padding: 16,
        borderRadius: 999,
    },
    heroSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroCard: {
        width: '100%',
        aspectRatio: 4 / 5,
        backgroundColor: '#3D2F28',
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    polaroidStack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    polaroidLeft: {
        position: 'absolute',
        width: 160,
        left: -24,
        zIndex: 1,
    },
    polaroidCenter: {
        position: 'absolute',
        width: 192,
        zIndex: 2,
    },
    polaroidRight: {
        position: 'absolute',
        width: 160,
        right: -24,
        zIndex: 1,
    },
    cameraCapsule: {
        position: 'absolute',
        bottom: 32,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 3,
    },
    cameraIconContainer: {
        backgroundColor: '#FFFC00',
        padding: 10,
        borderRadius: 16,
        marginRight: 12,
    },
    capsuleLines: {
        marginRight: 16,
    },
    capsuleLineLong: {
        width: 96,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 4,
        marginBottom: 6,
    },
    capsuleLineShort: {
        width: 64,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
    },
    textContent: {
        alignItems: 'center',
    },
    title: {
        color: '#FFFC00',
        fontSize: 40,
        fontWeight: '900', // Black
        textAlign: 'center',
        lineHeight: 48,
    },
    whiteText: {
        color: '#fff',
    },
    subtitle: {
        color: '#A3A3A3',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 16,
        paddingHorizontal: 32,
        lineHeight: 24,
    },
    footer: {
        alignItems: 'center',
        width: '100%',
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    activeDot: {
        width: 32,
        height: 12,
        backgroundColor: '#FFFC00',
        borderRadius: 6,
        marginRight: 8,
    },
    dot: {
        width: 12,
        height: 12,
        backgroundColor: '#262626',
        borderRadius: 6,
        marginRight: 8,
    },
    fullWidth: {
        width: '100%',
    },
});