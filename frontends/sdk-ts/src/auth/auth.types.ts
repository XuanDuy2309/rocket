export type AuthMode = 'login' | 'register' | 'forgotPassword';

// ── API Payloads (match backend field names exactly) ──────────────────────────

export interface LoginPayload {
    email_or_phone: string;
    password: string;
}

export interface RegisterPayload {
    user_name: string;
    email_or_phone: string;
    password: string;
}

export interface ForgotPasswordPayload {
    // email_or_phone kept as 'email' internally (UI field) since endpoint is not yet on backend
    email: string;
}

// ── API Responses (match backend swagger definitions) ────────────────────────

/** auth.PublicUser from swagger */
export interface PublicUser {
    id: string;
    user_name: string;
    email?: string;
    phone?: string;
}

/** auth.AuthResponse from swagger */
export interface AuthResponse {
    token: string;
    user: PublicUser;
}

export interface ForgotPasswordResponse {
    email: string;
    message: string;
}

// ── Form State (internal UI representation) ───────────────────────────────────

export interface LoginFormState {
    email: string;     // maps to email_or_phone on submit
    password: string;
    error: string | null;
}

export interface RegisterFormState {
    username: string;  // maps to user_name on submit
    email: string;     // maps to email_or_phone on submit
    password: string;
    error: string | null;
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
