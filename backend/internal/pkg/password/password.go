package password

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

// Cost is the bcrypt cost factor used for hashing. Spec §7: cost 12.
const Cost = 12

var (
	ErrEmptyPassword = errors.New("password: empty password")
	ErrMismatch      = errors.New("password: hash mismatch")
)

// Hash returns the bcrypt hash of the given plaintext password.
// Empty passwords are rejected; this is a defense-in-depth check on top of
// request validation (spec §2 requires min length 6).
func Hash(plain string) (string, error) {
	if plain == "" {
		return "", ErrEmptyPassword
	}
	h, err := bcrypt.GenerateFromPassword([]byte(plain), Cost)
	if err != nil {
		return "", err
	}
	return string(h), nil
}

// Verify reports nil when the plaintext matches the stored hash, and
// ErrMismatch otherwise. Other bcrypt errors (malformed hash, etc.) are
// returned as-is so callers can log them without leaking timing info.
func Verify(hash, plain string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
	if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
		return ErrMismatch
	}
	return err
}
