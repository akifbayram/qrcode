CREATE TABLE IF NOT EXISTS pinned_bins (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bin_id     TEXT NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, bin_id)
);
CREATE INDEX IF NOT EXISTS idx_pinned_bins_user ON pinned_bins(user_id, position);
