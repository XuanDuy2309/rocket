import { apiClient } from '../lib/api-client';
import type {
    AuthMode,
    AuthResponse,
    ForgotPasswordPayload,
    ForgotPasswordResponse,
    LoginPayload,
    RegisterPayload,
} from './auth.types';

// ── Validation ────────────────────────────────────────────────────────────────

function isValidEmailOrPhone(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;

    if (trimmed.includes('@')) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    }

    return trimmed.replace(/\D/g, '').length >= 8;
}

export function validateAuthPayload(
    mode: AuthMode,
    values: { username?: string; email: string; password?: string }
) {
    if (mode === 'register' && !values.username?.trim()) {
        return 'Tên người dùng là bắt buộc';
    }

    if (!values.email.trim()) {
        return 'Email hoặc số điện thoại là bắt buộc';
    }

    if (!isValidEmailOrPhone(values.email)) {
        return 'Email hoặc số điện thoại không hợp lệ';
    }

    if (mode === 'forgotPassword') {
        return null;
    }

    if (!values.password?.trim()) {
        return 'Mật khẩu là bắt buộc';
    }

    if ((mode === 'register' || mode === 'login') && values.password.trim().length < 6) {
        return 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    return null;
}

// ── API Calls ─────────────────────────────────────────────────────────────────

/** POST /api/v1/auth/login */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', payload);
    return data;
}

/** POST /api/v1/auth/signup */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/signup', payload);
    return data;
}

/** POST /api/v1/auth/logout — requires Bearer token (sent automatically by interceptor) */
export async function logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout');
}

/** Not yet implemented on backend — returns a mock success message */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!isValidEmailOrPhone(payload.email)) {
        throw new Error('Email hoặc số điện thoại không hợp lệ');
    }

    return {
        email: payload.email,
        message: 'Mã xác thực đã được gửi. Vui lòng kiểm tra email hoặc số điện thoại của bạn.',
    };
}
