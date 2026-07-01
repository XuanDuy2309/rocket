import { apiClient, getApiErrorMessage } from '../lib/api-client';
import type {
    ForgotPasswordResetPayload,
    ForgotPasswordSendPayload,
    ForgotPasswordVerifyPayload,
    MessageResponse,
} from './forgot-password.types';

export async function sendForgotPasswordOtp(payload: ForgotPasswordSendPayload): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>('/auth/forgot-password/send-otp', payload);
    return data;
}

export async function resendForgotPasswordOtp(payload: ForgotPasswordSendPayload): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>('/auth/forgot-password/resend-otp', payload);
    return data;
}

export async function verifyForgotPasswordOtp(payload: ForgotPasswordVerifyPayload): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>('/auth/forgot-password/verify-otp', payload);
    return data;
}

export async function resetForgotPassword(payload: ForgotPasswordResetPayload): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>('/auth/forgot-password/reset', payload);
    return data;
}

export function validateEmailOrPhone(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'Email hoặc số điện thoại là bắt buộc';
    }
    if (trimmed.includes('@')) {
        return trimmed.includes('.') ? null : 'Email không hợp lệ';
    }
    const digits = trimmed.replace(/^\+/, '');
    if (digits.length < 8 || digits.length > 15 || !/^\d+$/.test(digits)) {
        return 'Số điện thoại không hợp lệ';
    }
    return null;
}

export function validateOtp(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return 'OTP là bắt buộc';
    }
    if (trimmed.length !== 6 || !/^\d+$/.test(trimmed)) {
        return 'OTP phải có 6 ký tự';
    }
    return null;
}

export function validateNewPassword(newPassword: string, confirmPassword: string): string | null {
    if (!newPassword.trim()) {
        return 'Mật khẩu mới là bắt buộc';
    }
    if (newPassword.trim().length < 6) {
        return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!confirmPassword.trim()) {
        return 'Xác nhận mật khẩu là bắt buộc';
    }
    if (newPassword !== confirmPassword) {
        return 'Mật khẩu xác nhận không khớp';
    }
    return null;
}

export { getApiErrorMessage };
