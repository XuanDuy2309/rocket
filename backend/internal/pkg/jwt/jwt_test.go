package jwt

import (
	"crypto/rand"
	"encoding/hex"
	"testing"
	"time"
)

func newTestSecret(t *testing.T) string {
	t.Helper()
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		t.Fatalf("rand: %v", err)
	}
	return hex.EncodeToString(b[:])
}

func TestNewTokenReturnsJTI(t *testing.T) {
	secret := newTestSecret(t)
	tok, jti, err := NewToken("user-1", secret, time.Hour)
	if err != nil {
		t.Fatalf("NewToken: %v", err)
	}
	if tok == "" || jti == "" {
		t.Fatalf("empty token or jti: tok=%q jti=%q", tok, jti)
	}
}

func TestNewTokenJTIUnique(t *testing.T) {
	secret := newTestSecret(t)
	_, j1, _ := NewToken("user-1", secret, time.Hour)
	_, j2, _ := NewToken("user-1", secret, time.Hour)
	if j1 == j2 {
		t.Fatalf("expected unique JTIs, got %q twice", j1)
	}
}

func TestParseRoundTrip(t *testing.T) {
	secret := newTestSecret(t)
	tok, jti, err := NewToken("user-42", secret, time.Hour)
	if err != nil {
		t.Fatalf("NewToken: %v", err)
	}
	claims, err := Parse(tok, secret)
	if err != nil {
		t.Fatalf("Parse: %v", err)
	}
	if claims.UserID != "user-42" {
		t.Errorf("UserID = %q, want %q", claims.UserID, "user-42")
	}
	if claims.ID != jti {
		t.Errorf("JTI = %q, want %q", claims.ID, jti)
	}
}

func TestParseRejectsWrongSecret(t *testing.T) {
	secret := newTestSecret(t)
	other := newTestSecret(t)
	tok, _, _ := NewToken("user-1", secret, time.Hour)
	if _, err := Parse(tok, other); err == nil {
		t.Fatal("Parse accepted token with wrong secret")
	}
}

func TestParseRejectsExpired(t *testing.T) {
	secret := newTestSecret(t)
	tok, _, err := NewToken("user-1", secret, -time.Second)
	if err != nil {
		t.Fatalf("NewToken: %v", err)
	}
	if _, err := Parse(tok, secret); err == nil {
		t.Fatal("Parse accepted expired token")
	}
}
