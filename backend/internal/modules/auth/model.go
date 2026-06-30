package auth

import (
	"errors"
	"strings"
	"time"
)

// User is the domain model persisted in `users` (see migration 0002_auth.sql).
type User struct {
	ID           string
	Email        *string
	Phone        *string
	UserName     *string
	PasswordHash string
	CreatedAt    time.Time
}

// LoginRequest matches the frontend payload from auth.flow.yaml `login`.
type LoginRequest struct {
	EmailOrPhone string `json:"email_or_phone" binding:"required"`
	Password     string `json:"password" binding:"required,min=6"`
}

// SignupRequest matches the frontend payload from auth.flow.yaml `signup`.
type SignupRequest struct {
	UserName     string `json:"user_name" binding:"required,min=1,max=64"`
	EmailOrPhone string `json:"email_or_phone" binding:"required"`
	Password     string `json:"password" binding:"required,min=6"`
}

// AuthResponse is the success shape returned by /login and /signup.
type AuthResponse struct {
	Token string     `json:"token"`
	User  PublicUser `json:"user"`
}

// ForgotPasswordSendOTPRequest matches auth.flow.yaml `forgot_password`.
type ForgotPasswordSendOTPRequest struct {
	EmailOrPhone string `json:"email_or_phone" binding:"required"`
}

// ForgotPasswordVerifyOTPRequest matches auth.flow.yaml `verify_otp`.
type ForgotPasswordVerifyOTPRequest struct {
	EmailOrPhone string `json:"email_or_phone" binding:"required"`
	OTP          string `json:"otp" binding:"required,len=6"`
}

// ForgotPasswordResetRequest matches auth.flow.yaml `reset_password`.
type ForgotPasswordResetRequest struct {
	EmailOrPhone string `json:"email_or_phone" binding:"required"`
	OTP          string `json:"otp" binding:"required,len=6"`
	NewPassword  string `json:"new_password" binding:"required,min=6"`
}

// MessageResponse is a generic success payload for OTP flows.
type MessageResponse struct {
	Message string `json:"message"`
}

// PublicUser is the user shape safe to serialize back to clients
// (no password hash, no internal-only fields).
type PublicUser struct {
	ID       string  `json:"id"`
	UserName *string `json:"user_name,omitempty"`
	Email    *string `json:"email,omitempty"`
	Phone    *string `json:"phone,omitempty"`
}

// IdentifierKind tells the repository which column to query on.
type IdentifierKind int

const (
	IdentifierInvalid IdentifierKind = iota
	IdentifierEmail
	IdentifierPhone
)

// ErrInvalidIdentifier is returned when the input is neither a plausible
// email nor a plausible phone number.
var ErrInvalidIdentifier = errors.New("auth: invalid email or phone")

// classifyIdentifier inspects a raw `email_or_phone` field and returns
// either a normalized email (lowercased, trimmed) or a normalized phone
// (digits + optional leading '+', length 8-15) per spec §2.
//
// One of the two return strings is non-empty when kind != IdentifierInvalid.
func classifyIdentifier(raw string) (kind IdentifierKind, email, phone string) {
	s := strings.TrimSpace(raw)
	if s == "" {
		return IdentifierInvalid, "", ""
	}
	if strings.Contains(s, "@") {
		// Minimal email shape check: exactly one '@', non-empty local + domain
		// with a dot in domain. Full RFC validation happens at the validator
		// layer; here we just disambiguate from phone.
		at := strings.IndexByte(s, '@')
		if at <= 0 || at != strings.LastIndexByte(s, '@') {
			return IdentifierInvalid, "", ""
		}
		domain := s[at+1:]
		if !strings.Contains(domain, ".") || strings.HasPrefix(domain, ".") || strings.HasSuffix(domain, ".") {
			return IdentifierInvalid, "", ""
		}
		return IdentifierEmail, strings.ToLower(s), ""
	}
	// Phone: optional leading '+', rest digits, 8-15 chars total of digits.
	rest := s
	if strings.HasPrefix(rest, "+") {
		rest = rest[1:]
	}
	if len(rest) < 8 || len(rest) > 15 {
		return IdentifierInvalid, "", ""
	}
	for _, r := range rest {
		if r < '0' || r > '9' {
			return IdentifierInvalid, "", ""
		}
	}
	normalized := rest
	if strings.HasPrefix(s, "+") {
		normalized = "+" + rest
	}
	return IdentifierPhone, "", normalized
}
