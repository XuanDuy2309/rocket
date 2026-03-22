import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';

export async function openAppSettings() {
  try {
    await Linking.openSettings();
  } catch {
    Alert.alert('Lỗi', 'Không thể mở phần cài đặt của thiết bị.');
  }
}

export function showNoCameraPermissionAlert() {
  Alert.alert(
    'Không có quyền camera',
    'Bạn chưa cấp quyền truy cập camera. Vui lòng mở Cài đặt để cấp quyền.',
    [
      {text: 'Huỷ', style: 'cancel'},
      {
        text: 'Mở cài đặt',
        onPress: () => {
          openAppSettings();
        },
      },
    ],
  );
}

export function showNoCameraDeviceAlert() {
  Alert.alert(
    'Không có camera',
    'Thiết bị này không có camera hoặc camera không khả dụng.',
  );
}

export async function ensureCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Quyền sử dụng Camera',
      message: 'Ứng dụng cần quyền camera để chụp ảnh',
      buttonPositive: 'Cho phép',
      buttonNegative: 'Huỷ',
    },
  );

  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    showNoCameraPermissionAlert();
    return false;
  }

  return true;
}

export function handleCameraPickerError(errorCode?: string, errorMessage?: string) {
  if (errorCode === 'camera_unavailable') {
    showNoCameraDeviceAlert();
    return;
  }

  if (errorCode === 'permission' || errorCode === 'others') {
    showNoCameraPermissionAlert();
    return;
  }

  Alert.alert('Lỗi', errorMessage || 'Không thể sử dụng camera');
}
