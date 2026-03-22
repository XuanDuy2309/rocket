export type AuthMode = 'login' | 'register';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload extends LoginPayload {
    username: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

export interface LoginFormState {
    email: string;
    password: string;
    error: string | null;
}

export interface RegisterFormState extends LoginFormState {
    username: string;
}

export interface AuthFormValuesByMode {
    login: LoginFormState;
    register: RegisterFormState;
}

export type AuthFieldKey = 'username' | 'email' | 'password';
