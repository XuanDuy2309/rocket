import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { appAssets } from '../theme/app-assets';
import { colors } from '../theme/colors';

interface CameraHomeScreenProps {
    onSwipeUp?: () => void;
    onOpenProfile?: () => void;
    onOpenSettings?: () => void;
}

export function CameraHomeScreen({ onSwipeUp, onOpenProfile, onOpenSettings }: CameraHomeScreenProps) {
    const [mode, setMode] = React.useState<'photo' | 'video'>('photo');

    const pan = Gesture.Pan().onEnd((event) => {
        if (event.translationY < -60 && onSwipeUp) {
            runOnJS(onSwipeUp)();
        }
    });

    return (
        <GestureDetector gesture={pan}>
            <View style={styles.root}>
                <ImageBackground source={{ uri: appAssets.cameraBg }} style={styles.background} resizeMode="cover">
                    <View style={styles.frameOval} pointerEvents="none" />
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />

                    <View style={styles.topBar}>
                        <Pressable onPress={onOpenProfile} style={styles.avatarWrap}>
                            <ImageBackground
                                source={{ uri: appAssets.cameraAvatar }}
                                style={styles.avatar}
                                imageStyle={styles.avatarImage}
                            />
                        </Pressable>
                        <View style={styles.notch} />
                        <Pressable onPress={onOpenSettings} style={styles.iconButton}>
                            <Text style={styles.settingsIcon}>⚙</Text>
                        </Pressable>
                    </View>

                    <View style={styles.previewWrap}>
                        <View style={styles.previewCard}>
                            <ImageBackground
                                source={{ uri: appAssets.cameraPreview }}
                                style={styles.previewImage}
                                imageStyle={{ borderRadius: 22 }}
                            />
                        </View>
                    </View>

                    <View style={styles.bottomControls}>
                        <View style={styles.controlsRow}>
                            <Pressable style={styles.iconButtonLg}>
                                <Text style={styles.controlIcon}>⚡</Text>
                            </Pressable>

                            <View style={styles.modeSwitch}>
                                <Pressable onPress={() => setMode('photo')}>
                                    <Text style={[styles.modeText, mode === 'photo' && styles.modeActive]}>PHOTO</Text>
                                </Pressable>
                                <Pressable onPress={() => setMode('video')}>
                                    <Text style={[styles.modeText, mode === 'video' && styles.modeActive]}>VIDEO</Text>
                                </Pressable>
                            </View>

                            <Pressable style={styles.iconButtonLg}>
                                <Text style={styles.controlIcon}>⟳</Text>
                            </Pressable>
                        </View>

                        <Pressable style={styles.shutterOuter}>
                            <View style={styles.shutterInner} />
                        </Pressable>

                        <Text style={styles.swipeHint}>Vuốt lên để xem Feed ↑</Text>
                    </View>
                </ImageBackground>
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    background: { flex: 1 },
    frameOval: {
        position: 'absolute',
        top: 48,
        left: 24,
        right: 24,
        bottom: 200,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    corner: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderColor: 'rgba(34, 197, 94, 0.6)',
    },
    cornerTL: { top: 48, left: 24, borderTopWidth: 2, borderLeftWidth: 2 },
    cornerTR: { top: 48, right: 24, borderTopWidth: 2, borderRightWidth: 2 },
    cornerBL: { bottom: 200, left: 24, borderBottomWidth: 2, borderLeftWidth: 2 },
    cornerBR: { bottom: 200, right: 24, borderBottomWidth: 2, borderRightWidth: 2 },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    avatarWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(34, 197, 94, 0.4)',
        overflow: 'hidden',
    },
    avatar: { flex: 1 },
    avatarImage: { borderRadius: 18 },
    notch: {
        width: 96,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#000',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(11, 15, 12, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIcon: { color: '#F2F4F2', fontSize: 18 },
    previewWrap: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 29,
    },
    previewCard: {
        width: 80,
        height: 80,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(34, 197, 94, 0.3)',
        overflow: 'hidden',
        transform: [{ rotate: '-4deg' }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    previewImage: { flex: 1 },
    bottomControls: {
        paddingHorizontal: 24,
        paddingBottom: 48,
        gap: 32,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    iconButtonLg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(11, 15, 12, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlIcon: { color: '#F2F4F2', fontSize: 20 },
    modeSwitch: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 17,
        paddingVertical: 9,
        borderRadius: 999,
        backgroundColor: 'rgba(11, 15, 12, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    modeText: {
        color: 'rgba(242, 242, 242, 0.4)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        paddingHorizontal: 8,
    },
    modeActive: { color: colors.primary },
    shutterOuter: {
        alignSelf: 'center',
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 4,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    shutterInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
    },
    swipeHint: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.45)',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
