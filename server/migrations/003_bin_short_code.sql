-- Add short_code column for human-readable bin lookup
ALTER TABLE bins ADD COLUMN IF NOT EXISTS short_code VARCHAR(6);

-- Populate existing bins with unique short codes
DO $$
DECLARE
  bin_row RECORD;
  new_code VARCHAR(6);
  charset VARCHAR(31) := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  i INT;
  attempts INT;
BEGIN
  FOR bin_row IN SELECT id FROM bins WHERE short_code IS NULL LOOP
    attempts := 0;
    LOOP
      new_code := '';
      FOR i IN 1..6 LOOP
        new_code := new_code || substr(charset, floor(random() * 31 + 1)::int, 1);
      END LOOP;
      BEGIN
        UPDATE bins SET short_code = new_code WHERE id = bin_row.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        attempts := attempts + 1;
        IF attempts > 100 THEN
          RAISE EXCEPTION 'Could not generate unique short_code after 100 attempts';
        END IF;
      END;
    END LOOP;
  END LOOP;
END $$;

-- Now add constraints
ALTER TABLE bins ALTER COLUMN short_code SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bins_short_code_key'
  ) THEN
    ALTER TABLE bins ADD CONSTRAINT bins_short_code_key UNIQUE (short_code);
  END IF;
END $$;
