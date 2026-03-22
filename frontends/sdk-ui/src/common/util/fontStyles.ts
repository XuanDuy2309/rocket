import { TextStyle } from 'react-native';
import { colors, textSize } from '../../theme/colors';

type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

const weights: Record<string, FontWeight> = {
  regular: '400',
  medium: '500',
  semibold: '500',
  bold: '500',
};

const sizes = {
  sm: textSize.sub,      // 12
  default: textSize.body, // 14
  large: 16,
  title: textSize.title, // 18
  h1: textSize.h1,       // 22
};

type SizeKey = keyof typeof sizes;
type WeightKey = keyof typeof weights;
type ColorKey = keyof typeof colors;

type FontStyleGroup = Record<SizeKey, Record<WeightKey, TextStyle>>;

const createFontStyles = () => {
  const result: Record<string, FontStyleGroup> = {};

  Object.keys(colors).forEach((colorKey) => {
    const colorValue = colors[colorKey as ColorKey];
    const colorStyles: any = {};

    Object.keys(sizes).forEach((sizeKey) => {
      const sizeValue = sizes[sizeKey as SizeKey];
      const sizeStyles: any = {};

      Object.keys(weights).forEach((weightKey) => {
        const weightValue = weights[weightKey as WeightKey];
        sizeStyles[weightKey] = {
          fontSize: sizeValue,
          color: colorValue,
          fontWeight: weightValue,
        };
      });

      colorStyles[sizeKey] = sizeStyles;
    });

    result[colorKey] = colorStyles;
  });

  return result as Record<ColorKey, FontStyleGroup>;
};

export const fontStyles = createFontStyles();
