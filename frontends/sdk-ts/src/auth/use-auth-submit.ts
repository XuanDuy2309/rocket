import { useMutation } from '@tanstack/react-query';
import { forgotPassword, login, register, validateAuthPayload } from './auth.api';
import { useAuthStore } from './auth.store';
import type { AuthMode, AuthResponse, ForgotPasswordResponse } from './auth.types';

interface UseAuthSubmitOptions {
    onSuccess?: () => void;
}

export function useAuthSubmit(mode: AuthMode, options?: UseAuthSubmitOptions) {
    const values = useAuthStore((state) => state[mode]);
    const loginValues = useAuthStore((state) => state.login);
    const registerValues = useAuthStore((state) => state.register);
    const clearError = useAuthStore((state) => state.clearError);
    const setError = useAuthStore((state) => state.setError);
    const resetForm = useAuthStore((state) => state.resetForm);
    const markAuthenticated = useAuthStore((state) => state.markAuthenticated);

    return useMutation({
        mutationFn: async (): Promise<AuthResponse | ForgotPasswordResponse> => {
            const message = validateAuthPayload(mode, values);
            if (message) {
                throw new Error(message);
            }

            if (mode === 'register') {
                return register({
                    username: registerValues.username,
                    email: registerValues.email,
                    password: registerValues.password,
                });
            }

            if (mode === 'forgotPassword') {
                return forgotPassword({
                    email: values.email,
                });
            }

            return login({
                email: values.email,
                password: loginValues.password,
            });
        },
        onMutate: () => {
            clearError(mode);
        },
        onSuccess: (result) => {
            if (mode !== 'forgotPassword') {
                markAuthenticated(result as AuthResponse);
            }
            resetForm(mode);
            options?.onSuccess?.();
        },
        onError: (error) => {
            setError(mode, error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
        },
    });
}
