import type { AuthMode, AuthResponse, LoginPayload, RegisterPayload } from './auth.types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function validateAuthPayload(
    mode: AuthMode,
    values: { username?: string; email: string; password: string }
) {
    if (mode === 'register' && !values.username?.trim()) {
        return 'Tên người dùng là bắt buộc';
    }

    if (!values.email.trim() || !values.email.includes('@')) {
        return 'Email không hợp lệ';
    }

    if (values.password.trim().length < 8) {
        return 'Mật khẩu cần ít nhất 8 ký tự';
    }

    return null;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
    await wait(900);

    if (payload.password !== 'Chronology@123') {
        throw new Error('Mật khẩu không chính xác');
    }

    return {
        token: 'demo-login-token',
        user: {
            id: 'user-login-demo',
            username: 'chronology_user',
            email: payload.email,
        },
    };
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
    await wait(1100);

    if (!payload.email.includes('@')) {
        throw new Error('Email không hợp lệ');
    }

    return {
        token: 'demo-register-token',
        user: {
            id: 'user-register-demo',
            username: payload.username,
            email: payload.email,
        },
    };
}
