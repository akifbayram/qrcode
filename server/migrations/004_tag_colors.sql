CREATE TABLE IF NOT EXISTS tag_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(home_id, tag)
);

ALTER TABLE tag_colors REPLICA IDENTITY FULL;
