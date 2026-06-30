import { create } from 'zustand';
import type { ForgotPasswordFormState } from './forgot-password.types';

const initialState: ForgotPasswordFormState = {
    emailOrPhone: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
    error: null,
};

interface ForgotPasswordStore extends ForgotPasswordFormState {
    setField: (field: keyof ForgotPasswordFormState, value: string | null) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordStore>((set) => ({
    ...initialState,
    setField: (field, value) =>
        set((state) => ({
            ...state,
            [field]: value,
        })),
    setError: (error) => set({ error }),
    reset: () => set(initialState),
}));
