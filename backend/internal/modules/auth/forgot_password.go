package auth

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"log"
	"time"

	"rocket-backend/internal/pkg/password"
)

const (
	otpKeyPrefix      = "auth:forgot:otp:"
	otpCooldownPrefix = "auth:forgot:cooldown:"
	otpLength         = 6
	otpTTL            = 10 * time.Minute
	otpResendCooldown = 60 * time.Second
)

var (
	ErrInvalidOTP      = errors.New("auth: invalid otp")
	ErrOTPExpired      = errors.New("auth: otp expired")
	ErrResendCooldown  = errors.New("auth: resend cooldown active")
	ErrAccountNotFound = errors.New("auth: account not found")
)

func otpStorageKey(email, phone string) string {
	if email != "" {
		return otpKeyPrefix + email
	}
	return otpKeyPrefix + phone
}

func otpCooldownKey(email, phone string) string {
	if email != "" {
		return otpCooldownPrefix + email
	}
	return otpCooldownPrefix + phone
}

func generateOTP() (string, error) {
	const digits = "0123456789"
	b := make([]byte, otpLength)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	out := make([]byte, otpLength)
	for i := range b {
		out[i] = digits[int(b[i])%10]
	}
	return string(out), nil
}

// SendForgotPasswordOTP generates and stores a 6-digit OTP for the given
// identifier. Returns ErrInvalidIdentifier when the input is malformed,
// ErrResendCooldown when resend is attempted too soon, and always succeeds
// with a generic message when the account does not exist (no enumeration).
func (s *Service) SendForgotPasswordOTP(ctx context.Context, req ForgotPasswordSendOTPRequest) error {
	kind, email, phone := classifyIdentifier(req.EmailOrPhone)
	if kind == IdentifierInvalid {
		return ErrInvalidIdentifier
	}
	if err := s.checkOTPCooldown(ctx, email, phone); err != nil {
		return err
	}
	user, err := s.repo.FindByEmailOrPhone(ctx, email, phone)
	if errors.Is(err, ErrNotFound) {
		// Avoid account enumeration — pretend success.
		return nil
	}
	if err != nil {
		return err
	}
	_ = user // user must exist to send OTP

	otp, err := generateOTP()
	if err != nil {
		return err
	}
	key := otpStorageKey(email, phone)
	pipe := s.redis.Pipeline()
	pipe.Set(ctx, key, otp, otpTTL)
	pipe.Set(ctx, otpCooldownKey(email, phone), "1", otpResendCooldown)
	if _, err := pipe.Exec(ctx); err != nil {
		return err
	}
	if s.devMode {
		log.Printf("[auth] forgot-password OTP for %s: %s", req.EmailOrPhone, otp)
	}
	return nil
}

// ResendForgotPasswordOTP is an alias for SendForgotPasswordOTP — the same
// cooldown and storage rules apply (auth.flow.yaml `resend_otp`).
func (s *Service) ResendForgotPasswordOTP(ctx context.Context, req ForgotPasswordSendOTPRequest) error {
	return s.SendForgotPasswordOTP(ctx, req)
}

// VerifyForgotPasswordOTP checks the OTP against Redis without consuming it
// so the reset step can re-verify the same code.
func (s *Service) VerifyForgotPasswordOTP(ctx context.Context, req ForgotPasswordVerifyOTPRequest) error {
	kind, email, phone := classifyIdentifier(req.EmailOrPhone)
	if kind == IdentifierInvalid {
		return ErrInvalidIdentifier
	}
	stored, err := s.redis.Get(ctx, otpStorageKey(email, phone)).Result()
	if err != nil {
		return ErrOTPExpired
	}
	if stored != req.OTP {
		return ErrInvalidOTP
	}
	return nil
}

// ResetForgotPassword verifies the OTP, updates the password hash, and
// deletes the OTP key.
func (s *Service) ResetForgotPassword(ctx context.Context, req ForgotPasswordResetRequest) error {
	kind, email, phone := classifyIdentifier(req.EmailOrPhone)
	if kind == IdentifierInvalid {
		return ErrInvalidIdentifier
	}
	key := otpStorageKey(email, phone)
	stored, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		return ErrOTPExpired
	}
	if stored != req.OTP {
		return ErrInvalidOTP
	}
	hash, err := password.Hash(req.NewPassword)
	if err != nil {
		return err
	}
	if err := s.repo.UpdatePasswordHash(ctx, email, phone, hash); err != nil {
		if errors.Is(err, ErrNotFound) {
			return ErrAccountNotFound
		}
		return err
	}
	if err := s.redis.Del(ctx, key).Err(); err != nil {
		return fmt.Errorf("auth: clear otp after reset: %w", err)
	}
	return nil
}

func (s *Service) checkOTPCooldown(ctx context.Context, email, phone string) error {
	n, err := s.redis.Exists(ctx, otpCooldownKey(email, phone)).Result()
	if err != nil {
		return err
	}
	if n > 0 {
		return ErrResendCooldown
	}
	return nil
}
