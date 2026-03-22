import React from 'react';
import { View, Image, ImageSourcePropType, StyleSheet, ViewStyle } from 'react-native';

interface PolaroidCardProps {
    source: ImageSourcePropType;
    style?: ViewStyle;
    rotation?: number; // e.g. 6, -6
}

export const PolaroidCard = ({ source, style, rotation = 0 }: PolaroidCardProps) => {
    return (
        <View
            style={[
                styles.container,
                { transform: [{ rotate: `${rotation}deg` }] },
                style
            ]}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={source}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 8,
        paddingBottom: 24,
        borderRadius: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    imageContainer: {
        backgroundColor: '#E5E5E5',
        aspectRatio: 1,
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
