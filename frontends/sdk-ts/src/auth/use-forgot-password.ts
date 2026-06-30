import { useMutation } from '@tanstack/react-query';
import {
    getApiErrorMessage,
    resetForgotPassword,
    resendForgotPasswordOtp,
    sendForgotPasswordOtp,
    validateEmailOrPhone,
    validateNewPassword,
    validateOtp,
    verifyForgotPasswordOtp,
} from './forgot-password.api';
import { useForgotPasswordStore } from './forgot-password.store';

interface StepOptions {
    onSuccess?: () => void;
}

export function useSendForgotPasswordOtp(options?: StepOptions) {
    const emailOrPhone = useForgotPasswordStore((s) => s.emailOrPhone);
    const setError = useForgotPasswordStore((s) => s.setError);

    return useMutation({
        mutationFn: async () => {
            const message = validateEmailOrPhone(emailOrPhone);
            if (message) {
                throw new Error(message);
            }
            return sendForgotPasswordOtp({ email_or_phone: emailOrPhone.trim() });
        },
        onMutate: () => setError(null),
        onSuccess: () => options?.onSuccess?.(),
        onError: (error) => setError(getApiErrorMessage(error)),
    });
}

export function useVerifyForgotPasswordOtp(emailOrPhone: string, options?: StepOptions) {
    const otp = useForgotPasswordStore((s) => s.otp);
    const setError = useForgotPasswordStore((s) => s.setError);

    return useMutation({
        mutationFn: async () => {
            const message = validateOtp(otp);
            if (message) {
                throw new Error(message);
            }
            return verifyForgotPasswordOtp({
                email_or_phone: emailOrPhone,
                otp: otp.trim(),
            });
        },
        onMutate: () => setError(null),
        onSuccess: () => options?.onSuccess?.(),
        onError: (error) => setError(getApiErrorMessage(error)),
    });
}

export function useResendForgotPasswordOtp(emailOrPhone: string) {
    const setError = useForgotPasswordStore((s) => s.setError);

    return useMutation({
        mutationFn: () => resendForgotPasswordOtp({ email_or_phone: emailOrPhone }),
        onMutate: () => setError(null),
        onError: (error) => setError(getApiErrorMessage(error)),
    });
}

export function useResetForgotPassword(emailOrPhone: string, otp: string, options?: StepOptions) {
    const newPassword = useForgotPasswordStore((s) => s.newPassword);
    const confirmPassword = useForgotPasswordStore((s) => s.confirmPassword);
    const setError = useForgotPasswordStore((s) => s.setError);

    return useMutation({
        mutationFn: async () => {
            const message = validateNewPassword(newPassword, confirmPassword);
            if (message) {
                throw new Error(message);
            }
            return resetForgotPassword({
                email_or_phone: emailOrPhone,
                otp,
                new_password: newPassword,
            });
        },
        onMutate: () => setError(null),
        onSuccess: () => options?.onSuccess?.(),
        onError: (error) => setError(getApiErrorMessage(error)),
    });
}
