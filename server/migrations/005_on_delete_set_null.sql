-- Make created_by nullable and add ON DELETE SET NULL for bins, photos, and homes
ALTER TABLE bins DROP CONSTRAINT IF EXISTS bins_created_by_fkey;
ALTER TABLE bins ADD CONSTRAINT bins_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bins ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_created_by_fkey;
ALTER TABLE photos ADD CONSTRAINT photos_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE photos ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE homes DROP CONSTRAINT IF EXISTS homes_created_by_fkey;
ALTER TABLE homes ADD CONSTRAINT homes_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE homes ALTER COLUMN created_by DROP NOT NULL;
