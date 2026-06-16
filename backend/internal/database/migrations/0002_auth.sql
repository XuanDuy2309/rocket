-- auth: add credentials + identity fields to users
-- spec: backend/docs/spec/00-project-spec.md §3
--
-- Adds phone, user_name, password_hash to users.
-- Loosens email NOT NULL so accounts can sign up with phone-only.
-- Enforces "at least one of email/phone" via CHECK constraint.

ALTER TABLE users
  ALTER COLUMN email DROP NOT NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone         TEXT,
  ADD COLUMN IF NOT EXISTS user_name     TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_phone_key ON users (phone)
  WHERE phone IS NOT NULL;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_identity_present;

ALTER TABLE users
  ADD CONSTRAINT users_identity_present
  CHECK (email IS NOT NULL OR phone IS NOT NULL);
