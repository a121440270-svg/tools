CREATE TABLE IF NOT EXISTS share_note (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'text',
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  timeout_seconds INTEGER NOT NULL DEFAULT 259200,
  auto_extend INTEGER NOT NULL DEFAULT 1,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_access_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_share_note_expires_at ON share_note(expires_at);
