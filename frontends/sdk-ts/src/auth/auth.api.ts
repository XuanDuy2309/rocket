import type {
    AuthMode,
    AuthResponse,
    ForgotPasswordPayload,
    ForgotPasswordResponse,
    LoginPayload,
    RegisterPayload,
} from './auth.types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isValidEmailOrPhone(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return false;
    }

    if (trimmedValue.includes('@')) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
    }

    const digits = trimmedValue.replace(/\D/g, '');
    return digits.length >= 8;
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

    if (mode === 'register' && values.password.trim().length < 6) {
        return 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (mode === 'login' && values.password.trim().length < 6) {
        return 'Mật khẩu cần ít nhất 6 ký tự';
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

    if (!isValidEmailOrPhone(payload.email)) {
        throw new Error('Email hoặc số điện thoại không hợp lệ');
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

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    await wait(900);

    if (!isValidEmailOrPhone(payload.email)) {
        throw new Error('Email hoặc số điện thoại không hợp lệ');
    }

    return {
        email: payload.email,
        message: 'Mã xác thực đã được gửi. Vui lòng kiểm tra email hoặc số điện thoại của bạn.',
    };
}
