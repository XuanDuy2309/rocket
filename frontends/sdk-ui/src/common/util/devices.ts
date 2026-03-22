import {
  Dimensions,
  Platform,
  PlatformIOSStatic,
  StatusBar,
} from "react-native";
import DeviceInfo, { isTablet } from "react-native-device-info";

const { width, height } = Dimensions.get("window");
export function isIphoneX() {
  const dimen = Dimensions.get("window");
  return (
    Platform.OS === "ios" &&
    !Platform.isPad &&
    (dimen.height === 780 ||
      dimen.width === 780 ||
      dimen.height === 812 ||
      dimen.width === 812 ||
      dimen.height === 844 ||
      dimen.width === 844 ||
      dimen.height === 896 ||
      dimen.width === 896 ||
      dimen.height === 926 ||
      dimen.width === 926)
  );
}

export function ifIphoneX(iphoneXStyle, regularStyle) {
  if (isIphoneX()) {
    return iphoneXStyle;
  }
  return regularStyle;
}

export function getStatusBarHeight() {
  if (DeviceInfo.hasDynamicIsland()) {
    return Platform.select({
      ios: 40,
      android: StatusBar.currentHeight,
      default: 0,
    });
  } else
    return Platform.select({
      ios: ifIphoneX(30, 20),
      android: StatusBar.currentHeight,
      default: 0,
    });
}

export function getBottomSpace() {
  return isIphoneX() ? 34 : 0;
}

export const isIpad = () => {
  return Platform.OS === "ios" && Platform.isPad;
};
export const isIos = Platform.OS === "ios";

/**
 * Returns true of the screen is in landscape mode
 */
export const isLandscape = () => {
  const dim = Dimensions.get("screen");
  return dim.width >= dim.height;
};
export const platformIOS = Platform as PlatformIOSStatic;
export const isIpadOrTablet = platformIOS.isPad || isTablet();
export const DV_WIDTH = width;
export const DV_HEIGHT = height;

export const HEADER_HEIGHT = (() => {
  if (isIpadOrTablet) return 70; // iPad / tablet
  if (isIos) {
    return 52;
  }
  // Android
  return 56;
})();

export const getInsetsTopDevice = () => {
  try {
    const hasDynamicIsland = DeviceInfo.hasDynamicIsland();
    const hasNotch = DeviceInfo.hasNotch();

    if (hasNotch && !hasDynamicIsland) {
      // iPhone có tai thỏ
      return Platform.select({
        ios: 32,
        android: StatusBar.currentHeight,
        default: 0,
      });
    }

    if (hasDynamicIsland || hasNotch) {
      // iPhone có tai thỏ hoặc có dynamic island
      return Platform.select({
        ios: 50,
        android: StatusBar.currentHeight,
        default: 0,
      });
    }

    return Platform.select({
      ios: 20,
      android: StatusBar.currentHeight,
      default: 0,
    });
  } catch (e) {
    return 0;
  }
};

export const PADDING_TOP_HEADER = getInsetsTopDevice();
