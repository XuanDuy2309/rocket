package jwt

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string `json:"user_id"`
	jwtlib.RegisteredClaims
}

var ErrInvalidToken = errors.New("jwt: invalid token")

// NewToken issues an HS256 JWT for userID and returns the signed token
// together with its JTI (a fresh 16-byte hex id). Callers store the JTI
// (e.g. in a Redis deny-list) to support logout/revocation. See
// backend/docs/spec/00-project-spec.md §5.
func NewToken(userID, secret string, ttl time.Duration) (string, string, error) {
	jti, err := newJTI()
	if err != nil {
		return "", "", err
	}
	now := time.Now()
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwtlib.RegisteredClaims{
			ID:        jti,
			IssuedAt:  jwtlib.NewNumericDate(now),
			ExpiresAt: jwtlib.NewNumericDate(now.Add(ttl)),
		},
	}
	tok, err := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, claims).SignedString([]byte(secret))
	if err != nil {
		return "", "", err
	}
	return tok, jti, nil
}

// Parse validates the signature and expiry, then returns the claims.
// Returns ErrInvalidToken if the token is malformed, signed with another
// algorithm/secret, or expired.
func Parse(raw, secret string) (*Claims, error) {
	tok, err := jwtlib.ParseWithClaims(raw, &Claims{}, func(t *jwtlib.Token) (any, error) {
		if _, ok := t.Method.(*jwtlib.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(secret), nil
	})
	if err != nil || !tok.Valid {
		return nil, ErrInvalidToken
	}
	claims, ok := tok.Claims.(*Claims)
	if !ok {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

func newJTI() (string, error) {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	return hex.EncodeToString(b[:]), nil
}
