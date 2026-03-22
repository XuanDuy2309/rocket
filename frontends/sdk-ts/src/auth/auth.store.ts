import { create } from 'zustand';
import type {
    AuthFieldKey,
    AuthFormValuesByMode,
    AuthMode,
    AuthResponse,
    LoginFormState,
    RegisterFormState,
} from './auth.types';

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

interface AuthState extends AuthFormValuesByMode {
    isLoggedIn: boolean;
    session: AuthResponse | null;
    markAuthenticated: (session: AuthResponse) => void;
    logout: () => void;
    setLoggedIn: (isLoggedIn: boolean) => void;
    setField: (mode: AuthMode, field: AuthFieldKey, value: string) => void;
    setError: (mode: AuthMode, error: string | null) => void;
    clearError: (mode: AuthMode) => void;
    resetForm: (mode: AuthMode) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    session: null,
    login: initialLoginState,
    register: initialRegisterState,
    markAuthenticated: (session) =>
        set({
            isLoggedIn: true,
            session,
        }),
    logout: () =>
        set({
            isLoggedIn: false,
            session: null,
        }),
    setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
    setField: (mode, field, value) =>
        set((state) => ({
            [mode]: {
                ...state[mode],
                [field]: value,
            },
        })),
    setError: (mode, error) =>
        set((state) => ({
            [mode]: {
                ...state[mode],
                error,
            },
        })),
    clearError: (mode) =>
        set((state) => ({
            [mode]: {
                ...state[mode],
                error: null,
            },
        })),
    resetForm: (mode) =>
        set(() => ({
            [mode]: mode === 'register' ? initialRegisterState : initialLoginState,
        })),
}));
