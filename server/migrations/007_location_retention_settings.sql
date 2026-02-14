ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS activity_retention_days INTEGER NOT NULL DEFAULT 90,
  ADD COLUMN IF NOT EXISTS trash_retention_days INTEGER NOT NULL DEFAULT 30;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_activity_retention') THEN
    ALTER TABLE locations ADD CONSTRAINT chk_activity_retention CHECK (activity_retention_days BETWEEN 7 AND 365);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_trash_retention') THEN
    ALTER TABLE locations ADD CONSTRAINT chk_trash_retention CHECK (trash_retention_days BETWEEN 7 AND 365);
  END IF;
END
$$;
