import React from 'react';
import {
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SparkleIcon } from '../components/sparkle-icon';
import { appAssets } from '../theme/app-assets';
import { colors } from '../theme/colors';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// October 2024 starts on Tuesday (offset 2). Days with photo thumbnails.
const PHOTO_DAYS: Record<number, string> = {
    1: appAssets.memoryCalendar[0],
    3: appAssets.memoryCalendar[1],
    6: appAssets.memoryCalendar[2],
    7: appAssets.memoryCalendar[3],
    10: appAssets.memoryCalendar[4],
    13: appAssets.memoryCalendar[5],
    17: appAssets.memoryCalendar[6],
};

const TODAY = 17;
const MONTH_OFFSET = 2; // Tue
const DAYS_IN_MONTH = 31;

export function MemoryScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const cells: (number | null)[] = [];
    for (let i = 0; i < MONTH_OFFSET; i++) cells.push(null);
    for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
                <Image source={{ uri: appAssets.memoryUser }} style={styles.topAvatar} />
                <Text style={styles.topLabel}>Memories</Text>
                <Pressable onPress={onOpenSettings} style={styles.settingsBtn}>
                    <Text style={styles.settingsIcon}>⚙</Text>
                </Pressable>
            </View>

            <Text style={styles.title}>
                Memory{'\n'}Journal
            </Text>
            <Text style={styles.subtitle}>Revisiting your golden moments, day by day.</Text>

            <View style={styles.monthRow}>
                <View style={styles.monthLeft}>
                    <Text style={styles.monthText}>October 2024</Text>
                    <Text style={styles.monthChevron}>⌄</Text>
                </View>
                <View style={styles.monthNav}>
                    <Pressable style={styles.monthNavBtn}>
                        <Text style={styles.monthNavIcon}>‹</Text>
                    </Pressable>
                    <Pressable style={styles.monthNavBtn}>
                        <Text style={styles.monthNavIcon}>›</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.calendarCard}>
                <View style={styles.weekRow}>
                    {WEEKDAYS.map((day) => (
                        <Text key={day} style={styles.weekday}>
                            {day}
                        </Text>
                    ))}
                </View>
                <View style={styles.grid}>
                    {cells.map((day, index) => {
                        if (!day) {
                            return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
                        }
                        const photo = PHOTO_DAYS[day];
                        const isToday = day === TODAY;
                        return (
                            <View key={day} style={[styles.dayCell, isToday && styles.dayCellToday]}>
                                {photo ? (
                                    <Image source={{ uri: photo }} style={styles.dayPhoto} />
                                ) : (
                                    <Text style={styles.dayNumber}>{String(day).padStart(2, '0')}</Text>
                                )}
                                {isToday ? <Text style={styles.todayLabel}>Today</Text> : null}
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>OCT MEMORIES</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>248</Text>
                    <Text style={styles.statLabel}>TOTAL KEEPSAKES</Text>
                </View>
            </View>

            <View style={styles.flashbackCard}>
                <View style={styles.flashbackHeader}>
                    <View style={styles.flashbackIconWrap}>
                        <SparkleIcon size={18} color={colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.flashbackTitle}>Flashback</Text>
                        <Text style={styles.flashbackSub}>1 year ago today</Text>
                    </View>
                </View>
                <ImageBackground
                    source={{ uri: appAssets.memoryFlashback }}
                    style={styles.flashbackImage}
                    imageStyle={{ borderRadius: 20 }}
                >
                    <Text style={styles.flashbackCaption}>"The city felt so alive that night."</Text>
                </ImageBackground>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 140, gap: 24 },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topAvatar: { width: 40, height: 40, borderRadius: 20 },
    topLabel: { color: colors.primary, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
    settingsBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    settingsIcon: { color: '#869585', fontSize: 20 },
    title: {
        color: '#F2F4F2',
        fontSize: 48,
        lineHeight: 48,
        fontWeight: '800',
        letterSpacing: -1.2,
    },
    subtitle: { color: '#A8B2AA', fontSize: 16, lineHeight: 24 },
    monthRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
    },
    monthLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    monthText: { color: '#F2F4F2', fontSize: 24, fontWeight: '700' },
    monthChevron: { color: colors.primary, fontSize: 14 },
    monthNav: { flexDirection: 'row', gap: 10 },
    monthNavBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1C241E',
        borderWidth: 1,
        borderColor: 'rgba(63, 73, 65, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthNavIcon: { color: '#A8B2AA', fontSize: 18, fontWeight: '700' },
    calendarCard: {
        backgroundColor: '#141A16',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(63, 73, 65, 0.1)',
        padding: 25,
        gap: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
    weekday: {
        flex: 1,
        textAlign: 'center',
        color: 'rgba(168, 178, 170, 0.5)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    dayCellEmpty: { width: '13%', aspectRatio: 1 },
    dayCell: {
        width: '13%',
        aspectRatio: 1,
        borderRadius: 999,
        backgroundColor: '#1C241E',
        borderWidth: 1,
        borderColor: 'rgba(63, 73, 65, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    dayCellToday: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    dayPhoto: { width: '100%', height: '100%', borderRadius: 999 },
    dayNumber: { color: 'rgba(168, 178, 170, 0.4)', fontSize: 10, fontWeight: '700' },
    todayLabel: {
        position: 'absolute',
        bottom: -14,
        fontSize: 8,
        color: colors.primary,
        fontWeight: '700',
    },
    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: {
        flex: 1,
        backgroundColor: '#141A16',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(63, 73, 65, 0.1)',
        padding: 20,
        alignItems: 'center',
    },
    statValue: { color: colors.primary, fontSize: 36, fontWeight: '800' },
    statLabel: { color: '#F2F4F2', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 4 },
    flashbackCard: {
        backgroundColor: '#141A16',
        borderRadius: 28,
        padding: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(63, 73, 65, 0.1)',
    },
    flashbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    flashbackIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    flashbackTitle: { color: '#F2F4F2', fontSize: 18, fontWeight: '700' },
    flashbackSub: { color: '#A8B2AA', fontSize: 13 },
    flashbackImage: {
        height: 180,
        justifyContent: 'flex-end',
        padding: 16,
    },
    flashbackCaption: {
        color: '#F2F4F2',
        fontSize: 15,
        fontStyle: 'italic',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});
