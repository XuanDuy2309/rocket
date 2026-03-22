import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const SparkleIcon = ({ size = 24, color = "#FFFC00" }: { size?: number; color?: string }) => {
    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                    fill={color}
                />
            </Svg>
        </View>
    );
};
