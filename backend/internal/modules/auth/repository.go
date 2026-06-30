package auth

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrNotFound = errors.New("auth: user not found")
	ErrConflict = errors.New("auth: identifier already in use")
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

const selectUserCols = `id, email, phone, user_name, password_hash, created_at`

// FindByEmailOrPhone looks up a user by either email or phone. Pass the
// classifyIdentifier output: exactly one of email/phone must be non-empty.
func (r *Repository) FindByEmailOrPhone(ctx context.Context, email, phone string) (*User, error) {
	var (
		row pgx.Row
		u   User
	)
	switch {
	case email != "":
		row = r.pool.QueryRow(ctx,
			`SELECT `+selectUserCols+` FROM users WHERE email = $1`, email)
	case phone != "":
		row = r.pool.QueryRow(ctx,
			`SELECT `+selectUserCols+` FROM users WHERE phone = $1`, phone)
	default:
		return nil, ErrNotFound
	}
	err := row.Scan(&u.ID, &u.Email, &u.Phone, &u.UserName, &u.PasswordHash, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// Create inserts a new user row. email and phone follow the same
// "exactly one non-empty" convention as FindByEmailOrPhone. Returns
// ErrConflict on unique-violation (email or phone already taken).
func (r *Repository) Create(ctx context.Context, userName, email, phone, passwordHash string) (*User, error) {
	id, err := newUUIDv4()
	if err != nil {
		return nil, err
	}
	var (
		emailArg any = nil
		phoneArg any = nil
	)
	if email != "" {
		emailArg = email
	}
	if phone != "" {
		phoneArg = phone
	}

	var u User
	err = r.pool.QueryRow(ctx,
		`INSERT INTO users (id, email, phone, user_name, password_hash)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING `+selectUserCols,
		id, emailArg, phoneArg, userName, passwordHash,
	).Scan(&u.ID, &u.Email, &u.Phone, &u.UserName, &u.PasswordHash, &u.CreatedAt)

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return nil, ErrConflict
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// UpdatePasswordHash sets a new bcrypt hash for the user identified by
// email or phone (exactly one non-empty, same convention as lookup).
func (r *Repository) UpdatePasswordHash(ctx context.Context, email, phone, passwordHash string) error {
	var (
		tag pgconn.CommandTag
		err error
	)
	switch {
	case email != "":
		tag, err = r.pool.Exec(ctx,
			`UPDATE users SET password_hash = $1 WHERE email = $2`, passwordHash, email)
	case phone != "":
		tag, err = r.pool.Exec(ctx,
			`UPDATE users SET password_hash = $1 WHERE phone = $2`, passwordHash, phone)
	default:
		return ErrNotFound
	}
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// newUUIDv4 generates an RFC 4122 v4 UUID string without pulling in an
// external dependency. The `users.id` column is `UUID`, and Postgres
// accepts the canonical hex-with-hyphens form.
func newUUIDv4() (string, error) {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	b[6] = (b[6] & 0x0f) | 0x40 // version 4
	b[8] = (b[8] & 0x3f) | 0x80 // RFC 4122 variant
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16]), nil
}
