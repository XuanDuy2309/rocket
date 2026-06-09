-- friendships + presence (Screen 1: My Pulse / Friends), plus users.handle
-- for search/suggestions. See backend/docs/spec/02-screens-api.md §1.3–1.4, §5.

ALTER TABLE users ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS friendships (
  id         UUID PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- requester
  friend_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- target
  status     TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'accepted' | 'blocked'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user   ON friendships (user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships (friend_id, status);

CREATE TABLE IF NOT EXISTS user_presence (
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  last_active_at TIMESTAMPTZ,
  status_text    TEXT
);

CREATE INDEX IF NOT EXISTS idx_presence_last_active ON user_presence (last_active_at);
