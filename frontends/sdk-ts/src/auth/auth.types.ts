export type AuthMode = 'login' | 'register' | 'forgotPassword';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload extends LoginPayload {
    username: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

export interface ForgotPasswordResponse {
    email: string;
    message: string;
}

export interface LoginFormState {
    email: string;
    password: string;
    error: string | null;
}

export interface RegisterFormState extends LoginFormState {
    username: string;
}

export interface ForgotPasswordFormState {
    email: string;
    error: string | null;
}

export interface AuthFormValuesByMode {
    login: LoginFormState;
    register: RegisterFormState;
    forgotPassword: ForgotPasswordFormState;
}

export type AuthFieldKey = 'username' | 'email' | 'password';
