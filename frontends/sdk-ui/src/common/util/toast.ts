import Toast from 'react-native-toast-message';

export function showSuccessToast(message: string) {
  Toast.show({
    type: 'success',
    text1: 'Thành công',
    text2: message,
    position: 'top',
    visibilityTime: 2000,
  });
}

export function showErrorToast(message: string) {
  Toast.show({
    type: 'error',
    text1: 'Có lỗi xảy ra',
    text2: message,
    position: 'top',
    visibilityTime: 2500,
  });
}
