import React from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { appAssets } from '../theme/app-assets';
import { colors } from '../theme/colors';

interface ProfileScreenProps {
    onLogout?: () => void;
}

const PREFERENCES = [
    { id: 'widget', label: 'Widget Settings', icon: '▦' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
];

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
    return (
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View>
                    <Image source={{ uri: appAssets.profileAvatar }} style={styles.avatar} />
                    <View style={styles.editBadge}>
                        <Text style={styles.editIcon}>✎</Text>
                    </View>
                </View>
                <Text style={styles.name}>Alex Rivera</Text>
                <Text style={styles.handle}>@arivera_moments</Text>
                <Pressable style={styles.shareButton}>
                    <Text style={styles.shareIcon}>▣</Text>
                    <Text style={styles.shareText}>Share Profile</Text>
                </Pressable>
            </View>

            <Text style={styles.groupLabel}>Preferences</Text>
            <View style={styles.groupCard}>
                {PREFERENCES.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <Pressable style={styles.row}>
                            <View style={styles.rowLeft}>
                                <View style={styles.rowIconWrap}>
                                    <Text style={styles.rowIcon}>{item.icon}</Text>
                                </View>
                                <Text style={styles.rowLabel}>{item.label}</Text>
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </Pressable>
                        {index < PREFERENCES.length - 1 ? <View style={styles.divider} /> : null}
                    </React.Fragment>
                ))}
            </View>

            <Text style={styles.groupLabel}>Account</Text>
            <View style={styles.groupCard}>
                <Pressable style={styles.row} onPress={onLogout}>
                    <View style={styles.rowLeft}>
                        <View style={styles.rowIconWrap}>
                            <Text style={styles.rowIcon}>↪</Text>
                        </View>
                        <Text style={styles.rowLabel}>Log Out</Text>
                    </View>
                </Pressable>
            </View>

            <Pressable style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete Account</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, gap: 24 },
    header: { alignItems: 'center', gap: 16 },
    avatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 2,
        borderColor: '#4BE277',
    },
    editBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.background,
    },
    editIcon: { color: '#002109', fontSize: 14 },
    name: { color: '#E0E3DE', fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
    handle: { color: '#869585', fontSize: 14, letterSpacing: 0.35 },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: colors.primary,
    },
    shareIcon: { color: '#002109', fontSize: 15 },
    shareText: { color: '#002109', fontSize: 14, fontWeight: '600' },
    groupLabel: {
        color: 'rgba(134, 149, 133, 0.6)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
        paddingHorizontal: 8,
    },
    groupCard: {
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 4,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    rowIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#323632',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowIcon: { fontSize: 16 },
    rowLabel: { color: '#E0E3DE', fontSize: 16, fontWeight: '500' },
    chevron: { color: '#869585', fontSize: 20 },
    divider: {
        height: 1,
        backgroundColor: 'rgba(61, 74, 61, 0.1)',
        marginHorizontal: 16,
    },
    deleteBtn: { alignItems: 'center', paddingVertical: 8 },
    deleteText: { color: '#FFB4AB', fontSize: 14, fontWeight: '500' },
});
