import React from 'react';
import {
    Image,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { PolaroidCard } from '../components/polaroid-card';
import { appAssets } from '../theme/app-assets';
import { colors } from '../theme/colors';

interface FeedScreenProps {
    onInviteFriends?: () => void;
}

export function FeedScreen({ onInviteFriends }: FeedScreenProps) {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Pressable style={styles.inviteButton} onPress={onInviteFriends}>
                    <Text style={styles.inviteText}>Invite Friends</Text>
                    <Text style={styles.inviteChevron}>⌄</Text>
                </Pressable>

                <View style={styles.cardWrap}>
                    <PolaroidCard
                        source={{ uri: appAssets.feedPhoto }}
                        rotation={-2}
                        style={styles.polaroid}
                    />
                    <Text style={styles.caption}>Memory at work</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    inviteButton: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#002109',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 999,
        marginBottom: 40,
    },
    inviteText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '800',
    },
    inviteChevron: {
        color: colors.primary,
        fontSize: 14,
        marginTop: 2,
    },
    cardWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 120,
    },
    polaroid: {
        width: 280,
    },
    caption: {
        marginTop: 16,
        color: '#E2E3DD',
        fontSize: 18,
        fontFamily: 'serif',
        fontStyle: 'italic',
    },
});
