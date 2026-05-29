package password

import (
	"strings"
	"testing"
)

func TestHashAndVerifyRoundTrip(t *testing.T) {
	hash, err := Hash("secret123")
	if err != nil {
		t.Fatalf("Hash returned error: %v", err)
	}
	if hash == "" {
		t.Fatal("Hash returned empty string")
	}
	if strings.Contains(hash, "secret123") {
		t.Fatal("hash leaks plaintext")
	}
	if err := Verify(hash, "secret123"); err != nil {
		t.Fatalf("Verify rejected correct password: %v", err)
	}
}

func TestVerifyRejectsWrongPassword(t *testing.T) {
	hash, err := Hash("secret123")
	if err != nil {
		t.Fatalf("Hash returned error: %v", err)
	}
	if err := Verify(hash, "wrong-password"); err == nil {
		t.Fatal("Verify accepted wrong password")
	}
}

func TestHashRejectsEmpty(t *testing.T) {
	if _, err := Hash(""); err == nil {
		t.Fatal("Hash accepted empty password")
	}
}

func TestHashProducesDifferentSalt(t *testing.T) {
	h1, _ := Hash("secret123")
	h2, _ := Hash("secret123")
	if h1 == h2 {
		t.Fatal("identical hashes from two Hash calls (salt missing)")
	}
}
