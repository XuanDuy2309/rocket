export interface ForgotPasswordSendPayload {
    email_or_phone: string;
}

export interface ForgotPasswordVerifyPayload extends ForgotPasswordSendPayload {
    otp: string;
}

export interface ForgotPasswordResetPayload extends ForgotPasswordVerifyPayload {
    new_password: string;
}

export interface MessageResponse {
    message: string;
}

export interface ForgotPasswordFormState {
    emailOrPhone: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
    error: string | null;
}
