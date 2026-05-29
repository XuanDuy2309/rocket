package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"rocket-backend/internal/pkg/jwt"
	"rocket-backend/internal/pkg/password"
)

// Sentinels surfaced to the handler layer (which maps them to HTTP codes).
var (
	ErrInvalidCredentials = errors.New("auth: invalid credentials")
	ErrAlreadyExists      = errors.New("auth: account already exists")
)

// RevokedKeyPrefix is the Redis key namespace for the JWT deny-list.
// Spec §5: `auth:revoked:<jti>`.
const RevokedKeyPrefix = "auth:revoked:"

// Service orchestrates auth use cases. All dependencies are injected so
// the package stays testable without DB/Redis.
type Service struct {
	repo     *Repository
	redis    *redis.Client
	secret   string
	tokenTTL time.Duration
}

func NewService(repo *Repository, rdb *redis.Client, secret string, tokenTTL time.Duration) *Service {
	return &Service{repo: repo, redis: rdb, secret: secret, tokenTTL: tokenTTL}
}

// Login validates credentials and returns a fresh token + public user.
// Returns ErrInvalidCredentials for any miss (wrong identifier, wrong
// password, malformed input) so the handler can emit a single generic
// 401 — spec §7.
func (s *Service) Login(ctx context.Context, req LoginRequest) (string, *User, error) {
	kind, email, phone := classifyIdentifier(req.EmailOrPhone)
	if kind == IdentifierInvalid {
		return "", nil, ErrInvalidCredentials
	}
	user, err := s.repo.FindByEmailOrPhone(ctx, email, phone)
	if errors.Is(err, ErrNotFound) {
		return "", nil, ErrInvalidCredentials
	}
	if err != nil {
		return "", nil, err
	}
	if err := password.Verify(user.PasswordHash, req.Password); err != nil {
		if errors.Is(err, password.ErrMismatch) {
			return "", nil, ErrInvalidCredentials
		}
		return "", nil, err
	}
	tok, _, err := jwt.NewToken(user.ID, s.secret, s.tokenTTL)
	if err != nil {
		return "", nil, err
	}
	return tok, user, nil
}

// Signup creates a new user and returns a token. Returns ErrAlreadyExists
// when the email/phone collides with an existing row.
func (s *Service) Signup(ctx context.Context, req SignupRequest) (string, *User, error) {
	kind, email, phone := classifyIdentifier(req.EmailOrPhone)
	if kind == IdentifierInvalid {
		return "", nil, ErrInvalidIdentifier
	}
	hash, err := password.Hash(req.Password)
	if err != nil {
		return "", nil, err
	}
	user, err := s.repo.Create(ctx, req.UserName, email, phone, hash)
	if errors.Is(err, ErrConflict) {
		return "", nil, ErrAlreadyExists
	}
	if err != nil {
		return "", nil, err
	}
	tok, _, err := jwt.NewToken(user.ID, s.secret, s.tokenTTL)
	if err != nil {
		return "", nil, err
	}
	return tok, user, nil
}

// Logout adds the token's JTI to the Redis deny-list with TTL equal to
// the token's remaining lifetime. Spec §5.
func (s *Service) Logout(ctx context.Context, jti string, expiresAt time.Time) error {
	if jti == "" {
		return fmt.Errorf("auth: logout requires jti")
	}
	ttl := time.Until(expiresAt)
	if ttl <= 0 {
		// Token already expired; nothing to revoke.
		return nil
	}
	return s.redis.Set(ctx, RevokedKeyPrefix+jti, "1", ttl).Err()
}

// IsRevoked is consulted by the auth middleware on every authenticated
// request. Fail-open on Redis errors (spec §5) — the caller logs.
func (s *Service) IsRevoked(ctx context.Context, jti string) (bool, error) {
	n, err := s.redis.Exists(ctx, RevokedKeyPrefix+jti).Result()
	if err != nil {
		return false, err
	}
	return n > 0, nil
}

// ToPublic strips internal-only fields before serialization.
func ToPublic(u *User) PublicUser {
	return PublicUser{
		ID:       u.ID,
		UserName: u.UserName,
		Email:    u.Email,
		Phone:    u.Phone,
	}
}
