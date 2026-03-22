
import React from "react";
import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

export const ColorsBase = {
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  primary: {
    50: "#E6F7FF",
    100: "#BAE7FF",
    200: "#91D5FF",
    300: "#69C0FF",
    400: "#40A9FF",
    500: "#1890FF",
    600: "#096DD9",
    700: "#0050B3",
    800: "#003A8C",
    900: "#002766",
  }
};

type Direction = "row" | "column";
type RoundedSize = number | "sm" | "md" | "lg" | "xl" | "full";

const roundedMap: Record<string, number> = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export type StackProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;

  // Layout
  flexDirection?: Direction; // row | column
  justifyContent?: ViewStyle["justifyContent"];
  alignItems?: ViewStyle["alignItems"];
  flex?: number;
  flexWrap?: ViewStyle["flexWrap"];
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: DimensionValue;

  // Size
  width?: DimensionValue;
  height?: DimensionValue;
  minWidth?: DimensionValue;
  maxWidth?: DimensionValue;
  minHeight?: DimensionValue;
  maxHeight?: DimensionValue;

  // Background
  backgroundColor?: string;

  // Spacing
  p?: number; // padding
  px?: number; // padding left+right
  py?: number; // padding top+bottom
  pt?: number; // paddingTop
  pb?: number; // paddingBottom
  pl?: number; // paddingLeft
  pr?: number; // paddingRight
  m?: number; // margin
  mx?: number;
  my?: number;
  mt?: number;
  mb?: number;
  ml?: number;
  mr?: number;

  // Gap between children
  space?: number; // map sang gap (RN 0.76+) hoặc polyfill

  // Border
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  rounded?: RoundedSize;
  borderTopWidth?: number;
  borderTopColor?: string;
  borderBottomWidth?: number;
  borderBottomColor?: string;
  borderStyle?: ViewStyle["borderStyle"];

  // Opacity
  opacity?: number;

  // Shadow (cơ bản)
  shadowColor?: string;
  shadowOpacity?: number;
  shadowOffset?: { width: number; height: number };
  shadowRadius?: number;
  elevation?: number; // Android shadow

  position?: ViewStyle["position"];
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  shadow?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // map đơn giản

  overflow?: ViewStyle["overflow"];

  divideX?: { color?: string; width?: number };
  zIndex?: number;
};

export const Stack: React.FC<StackProps> = ({
  children,
  style,
  flexDirection = "column",
  justifyContent,
  alignItems,
  flex,
  flexWrap,
  flexGrow,
  flexShrink,
  flexBasis,
  width,
  height,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  backgroundColor,
  p,
  px,
  py,
  pt,
  pb,
  pl,
  pr,
  m,
  mx,
  my,
  mt,
  mb,
  ml,
  mr,
  space,
  borderWidth,
  borderColor,
  borderRadius,
  borderTopWidth,
  borderBottomWidth,
  borderBottomColor,
  borderTopColor,
  borderStyle,
  rounded,
  opacity,
  shadowColor,
  shadowOpacity,
  shadowOffset,
  shadowRadius,
  elevation,
  position,
  top,
  bottom,
  left,
  right,
  shadow,
  overflow,
  divideX,
  zIndex,
}) => {
  const shadowStyle: ViewStyle | undefined =
    shadow && shadow > 0
      ? {
        shadowColor: "#000",
        shadowOpacity: 0.1 + shadow * 0.05,
        shadowOffset: { width: 0, height: shadow },
        shadowRadius: shadow * 2,
        elevation: shadow,
      }
      : undefined;

  const styles: ViewStyle = {
    flexDirection,
    justifyContent,
    alignItems,
    flex,
    flexWrap,
    flexGrow,
    flexShrink,
    flexBasis,
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    backgroundColor,
    padding: p,
    paddingHorizontal: px,
    paddingVertical: py,
    paddingTop: pt,
    paddingBottom: pb,
    paddingLeft: pl,
    paddingRight: pr,
    margin: m,
    marginHorizontal: mx,
    marginVertical: my,
    marginTop: mt,
    marginBottom: mb,
    marginLeft: ml,
    marginRight: mr,
    borderWidth,
    borderColor,
    borderRadius:
      typeof rounded === "number"
        ? rounded
        : rounded
          ? roundedMap[rounded]
          : borderRadius,
    borderStyle,
    borderTopWidth,
    borderBottomWidth,
    borderBottomColor,
    borderTopColor,
    opacity,
    gap: space, // RN >= 0.71 supports gap
    shadowColor,
    shadowOpacity,
    shadowOffset,
    shadowRadius,
    elevation,

    position,
    top,
    bottom,
    left,
    right,
    overflow,
    zIndex,
    ...(shadowStyle || {}),
  };

  const renderChildren = () => {
    const items = React.Children.toArray(children);
    if (!divideX || items.length <= 1) return items;

    const { color = ColorsBase.gray[100], width = StyleSheet.hairlineWidth } =
      divideX;

    return items.map((child, index) => (
      <React.Fragment key={index}>
        {index > 0 && (
          <View
            style={{
              width,
              backgroundColor: color,
              height: "100%",
            }}
          />
        )}
        {child}
      </React.Fragment>
    ));
  };

  return <View style={[styles, style]}>{renderChildren()}</View>;
};

export const Row: React.FC<StackProps> = (props) => {
  return <Stack {...props} flexDirection="row" />;
};
