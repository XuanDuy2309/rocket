package auth

import "testing"

func TestClassifyIdentifier(t *testing.T) {
	cases := []struct {
		name      string
		in        string
		wantKind  IdentifierKind
		wantEmail string
		wantPhone string
	}{
		{"email lowercase", "alice@example.com", IdentifierEmail, "alice@example.com", ""},
		{"email uppercase normalized", "Alice@Example.COM", IdentifierEmail, "alice@example.com", ""},
		{"email trimmed", "  bob@example.com  ", IdentifierEmail, "bob@example.com", ""},
		{"email no dot in domain", "x@localhost", IdentifierInvalid, "", ""},
		{"email two ats", "a@b@c.com", IdentifierInvalid, "", ""},
		{"phone plain", "0123456789", IdentifierPhone, "", "0123456789"},
		{"phone with plus", "+84901234567", IdentifierPhone, "", "+84901234567"},
		{"phone too short", "1234567", IdentifierInvalid, "", ""},
		{"phone too long", "1234567890123456", IdentifierInvalid, "", ""},
		{"phone with letters", "0123abcd45", IdentifierInvalid, "", ""},
		{"empty", "   ", IdentifierInvalid, "", ""},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			kind, email, phone := classifyIdentifier(tc.in)
			if kind != tc.wantKind || email != tc.wantEmail || phone != tc.wantPhone {
				t.Errorf("classifyIdentifier(%q) = (%v, %q, %q), want (%v, %q, %q)",
					tc.in, kind, email, phone, tc.wantKind, tc.wantEmail, tc.wantPhone)
			}
		})
	}
}
