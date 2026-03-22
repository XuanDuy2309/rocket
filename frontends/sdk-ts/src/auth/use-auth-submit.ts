import { useMutation } from '@tanstack/react-query';
import { login, register, validateAuthPayload } from './auth.api';
import { useAuthStore } from './auth.store';
import type { AuthMode } from './auth.types';

interface UseAuthSubmitOptions {
    onSuccess?: () => void;
}

export function useAuthSubmit(mode: AuthMode, options?: UseAuthSubmitOptions) {
    const values = useAuthStore((state) => state[mode]);
    const registerValues = useAuthStore((state) => state.register);
    const clearError = useAuthStore((state) => state.clearError);
    const setError = useAuthStore((state) => state.setError);
    const resetForm = useAuthStore((state) => state.resetForm);
    const markAuthenticated = useAuthStore((state) => state.markAuthenticated);

    return useMutation({
        mutationFn: async () => {
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

            return login({
                email: values.email,
                password: values.password,
            });
        },
        onMutate: () => {
            clearError(mode);
        },
        onSuccess: (session) => {
            markAuthenticated(session);
            resetForm(mode);
            options?.onSuccess?.();
        },
        onError: (error) => {
            setError(mode, error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
        },
    });
}
