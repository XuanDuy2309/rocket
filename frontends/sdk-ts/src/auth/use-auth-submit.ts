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
                // Map UI field names → backend field names
                return register({
                    user_name: registerValues.username,
                    email_or_phone: registerValues.email,
                    password: registerValues.password,
                });
            }

            if (mode === 'forgotPassword') {
                return forgotPassword({ email: values.email });
            }

            // login: map email → email_or_phone
            return login({
                email_or_phone: loginValues.email,
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
        onError: (error: unknown) => {
            // Extract message from axios error response or standard Error
            let message = 'Đã có lỗi xảy ra';
            if (error && typeof error === 'object') {
                const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
                message = axiosErr.response?.data?.message ?? axiosErr.message ?? message;
            }
            setError(mode, message);
        },
    });
}
