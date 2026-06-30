import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export function GridNavIcon({ size = 21, color = '#A8B2AA' }: { size?: number; color?: string }) {
    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
                <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
                <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
                <Rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
            </Svg>
        </View>
    );
}

export function ChatNavIcon({ size = 20, color = '#A8B2AA' }: { size?: number; color?: string }) {
    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M21 11.5C21 16.75 16.75 21 11.5 21C10.1 21 8.75 20.7 7.55 20.2L3 21L3.8 16.65C3.25 15.4 3 14 3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 21 7.25 21 11.5Z"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </Svg>
        </View>
    );
}

export function CameraNavIcon({ size = 22, color = '#002109' }: { size?: number; color?: string }) {
    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M4 8H7L9 5H15L17 8H20C21.1 8 22 8.9 22 10V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V10C2 8.9 2.9 8 4 8Z"
                    stroke={color}
                    strokeWidth="2"
                />
                <Circle cx="12" cy="14" r="3" stroke={color} strokeWidth="2" />
            </Svg>
        </View>
    );
}

export function MemoryNavIcon({ size = 24, color = '#A8B2AA' }: { size?: number; color?: string }) {
    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
                <Path d="M12 7V12L15 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
            </Svg>
        </View>
    );
}
