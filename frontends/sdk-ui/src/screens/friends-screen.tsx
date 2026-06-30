import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { appAssets } from '../theme/app-assets';
import { colors } from '../theme/colors';

const SUGGESTIONS = [
    { id: '1', name: 'Julian V.', subtitle: '12 mutual friends', avatar: appAssets.friends.julian },
    { id: '2', name: 'Sasha R.', subtitle: 'Followed by friends', avatar: appAssets.friends.sasha },
    { id: '3', name: 'Marcus Lee', subtitle: 'In your contacts', avatar: appAssets.friends.marcus },
];

const PULSE = [
    { id: '1', name: 'Elena Gil', status: 'Active now', online: true, avatar: appAssets.friends.elena },
    { id: '2', name: 'Maya Brooks', status: '2h ago', online: false, avatar: appAssets.friends.maya },
    { id: '3', name: 'Chloe Sterling', status: 'Sharing a moment...', online: true, avatar: appAssets.friends.chloe },
];

export function FriendsScreen() {
    return (
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.searchWrap}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                    placeholder="Find friends..."
                    placeholderTextColor="rgba(193, 201, 190, 0.5)"
                    style={styles.searchInput}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Suggested Friends</Text>
                <Pressable>
                    <Text style={styles.seeAll}>See all</Text>
                </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
                {SUGGESTIONS.map((item) => (
                    <View key={item.id} style={styles.suggestCard}>
                        <Image source={{ uri: item.avatar }} style={styles.suggestAvatar} />
                        <Text style={styles.suggestName}>{item.name}</Text>
                        <Text style={styles.suggestSub}>{item.subtitle}</Text>
                        <Pressable style={styles.addButton}>
                            <Text style={styles.addText}>Add</Text>
                        </Pressable>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.ctaCard}>
                <Text style={styles.ctaTitle}>Sync Your World</Text>
                <Text style={styles.ctaBody}>
                    Invite friends to unlock shared{'\n'}moments and live pulses.
                </Text>
                <Pressable style={styles.ctaButton}>
                    <Text style={styles.ctaButtonIcon}>＋</Text>
                    <Text style={styles.ctaButtonText}>Invite Friends</Text>
                </Pressable>
            </View>

            <View style={styles.pulseHeader}>
                <Text style={styles.sectionTitle}>My Pulse</Text>
                <View style={styles.onlineBadge}>
                    <Text style={styles.onlineText}>24 ONLINE</Text>
                </View>
            </View>

            {PULSE.map((friend) => (
                <View key={friend.id} style={styles.pulseRow}>
                    <View style={styles.pulseLeft}>
                        <View>
                            <Image source={{ uri: friend.avatar }} style={styles.pulseAvatar} />
                            {friend.online ? <View style={styles.onlineDot} /> : null}
                        </View>
                        <View>
                            <Text style={[styles.pulseName, !friend.online && styles.offlineName]}>{friend.name}</Text>
                            <Text style={[styles.pulseStatus, friend.online && styles.pulseStatusActive]}>
                                {friend.status}
                            </Text>
                        </View>
                    </View>
                    <Pressable style={styles.chatBubble}>
                        <Text style={styles.chatBubbleIcon}>💬</Text>
                    </Pressable>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: { padding: 24, paddingBottom: 140, gap: 20 },
    searchWrap: {
        backgroundColor: '#1A1E19',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(65, 73, 64, 0.3)',
        paddingVertical: 18,
        paddingLeft: 57,
        paddingRight: 25,
    },
    searchIcon: {
        position: 'absolute',
        left: 23,
        top: 18,
        color: '#869585',
        fontSize: 18,
    },
    searchInput: { color: '#E2E3DD', fontSize: 16 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        color: '#E2E3DD',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    seeAll: { color: colors.primary, fontSize: 14, fontWeight: '700' },
    suggestRow: { gap: 16, paddingRight: 8 },
    suggestCard: {
        width: 176,
        backgroundColor: '#1A1E19',
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(65, 73, 64, 0.2)',
        padding: 25,
        alignItems: 'center',
    },
    suggestAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    suggestName: { color: '#E2E3DD', fontSize: 16, fontWeight: '700' },
    suggestSub: { color: '#C1C9BE', fontSize: 11, marginTop: 4, marginBottom: 16, textAlign: 'center' },
    addButton: {
        width: '100%',
        backgroundColor: colors.primary,
        borderRadius: 999,
        paddingVertical: 10,
        alignItems: 'center',
    },
    addText: { color: '#003916', fontWeight: '700', fontSize: 14 },
    ctaCard: {
        backgroundColor: colors.primary,
        borderRadius: 40,
        padding: 32,
        paddingTop: 40,
        overflow: 'hidden',
        gap: 12,
    },
    ctaTitle: { color: '#003916', fontSize: 24, fontWeight: '800' },
    ctaBody: { color: 'rgba(0, 57, 22, 0.9)', fontSize: 14, lineHeight: 20, maxWidth: 220 },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        alignSelf: 'flex-start',
        backgroundColor: '#060A07',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 999,
        marginTop: 4,
    },
    ctaButtonIcon: { color: colors.primary, fontSize: 16 },
    ctaButtonText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
    pulseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
    onlineBadge: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    onlineText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
    pulseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1A1E19',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(65, 73, 64, 0.1)',
        padding: 21,
    },
    pulseLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    pulseAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(34, 197, 94, 0.2)' },
    onlineDot: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.primary,
        borderWidth: 4,
        borderColor: '#1A1E19',
    },
    pulseName: { color: '#E2E3DD', fontSize: 16, fontWeight: '700' },
    offlineName: { opacity: 0.7 },
    pulseStatus: { color: '#C1C9BE', fontSize: 11, fontWeight: '600', letterSpacing: 0.55, textTransform: 'uppercase', marginTop: 2 },
    pulseStatusActive: { color: colors.primary },
    chatBubble: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
    chatBubbleIcon: { fontSize: 18, opacity: 0.7 },
});
