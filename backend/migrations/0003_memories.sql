-- memories + photos (Screens 2/3/4), plus avatar_url for the home header.
-- See backend/docs/spec/02-screens-api.md §1.

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS memories (
  id             UUID PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT,
  taken_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cover_photo_id UUID,            -- soft ref to photos(id); FK omitted to avoid a cycle
  location       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
  id         UUID PRIMARY KEY,
  memory_id  UUID REFERENCES memories(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  s3_key     TEXT NOT NULL,
  width      INT,
  height     INT,
  status     TEXT NOT NULL DEFAULT 'ready',  -- 'pending' | 'ready'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Range scan for the month calendar; counts for stats.
CREATE INDEX IF NOT EXISTS idx_memories_user_taken ON memories (user_id, taken_at);
CREATE INDEX IF NOT EXISTS idx_photos_user ON photos (user_id);
CREATE INDEX IF NOT EXISTS idx_photos_memory ON photos (memory_id);
