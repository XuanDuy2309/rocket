import { create } from 'zustand';
import { logout as apiLogout } from './auth.api';
import type {
    AuthFieldKey,
    AuthFormValuesByMode,
    AuthMode,
    AuthResponse,
    ForgotPasswordFormState,
    LoginFormState,
    RegisterFormState,
} from './auth.types';
import { getItem, removeItem, setItem } from '../lib/storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const initialLoginState: LoginFormState = {
    email: '',
    password: '',
    error: null,
};

const initialRegisterState: RegisterFormState = {
    username: '',
    email: '',
    password: '',
    error: null,
};

const initialForgotPasswordState: ForgotPasswordFormState = {
    email: '',
    error: null,
};

interface AuthState extends AuthFormValuesByMode {
    isLoggedIn: boolean;
    session: AuthResponse | null;

    /** Call on app start to restore session from MMKV */
    loadSession: () => void;
    /** Mark user as authenticated and persist to MMKV */
    markAuthenticated: (session: AuthResponse) => void;
    /** Call API logout, clear store and MMKV */
    logout: () => Promise<void>;

    setLoggedIn: (isLoggedIn: boolean) => void;
    setField: (mode: AuthMode, field: AuthFieldKey, value: string) => void;
    setError: (mode: AuthMode, error: string | null) => void;
    clearError: (mode: AuthMode) => void;
    resetForm: (mode: AuthMode) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isLoggedIn: false,
    session: null,
    login: initialLoginState,
    register: initialRegisterState,
    forgotPassword: initialForgotPasswordState,

    loadSession: () => {
        const token = getItem<string>(TOKEN_KEY);
        const user = getItem<AuthResponse['user']>(USER_KEY);
        if (token && user) {
            set({ isLoggedIn: true, session: { token, user } });
        }
    },

    markAuthenticated: (session) => {
        setItem(TOKEN_KEY, session.token);
        setItem(USER_KEY, session.user);
        set({ isLoggedIn: true, session });
    },

    logout: async () => {
        // Best-effort: revoke token on server, then clear local state regardless
        try {
            await apiLogout();
        } catch {
            // ignore — token may already be expired or server unreachable
        }
        removeItem(TOKEN_KEY);
        removeItem(USER_KEY);
        set({ isLoggedIn: false, session: null });
    },

    setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),

    setField: (mode, field, value) =>
        set((state) => ({
            [mode]: { ...state[mode], [field]: value },
        })),

    setError: (mode, error) =>
        set((state) => ({
            [mode]: { ...state[mode], error },
        })),

    clearError: (mode) =>
        set((state) => ({
            [mode]: { ...state[mode], error: null },
        })),

    resetForm: (mode) =>
        set(() => ({
            [mode]:
                mode === 'register'
                    ? initialRegisterState
                    : mode === 'forgotPassword'
                      ? initialForgotPasswordState
                      : initialLoginState,
        })),
}));
