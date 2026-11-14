ALTER TABLE gifts
  ADD COLUMN IF NOT EXISTS unlock_type text NOT NULL DEFAULT 'puzzle',
  ADD COLUMN IF NOT EXISTS tasks jsonb,
  ADD COLUMN IF NOT EXISTS tasks_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS tasks_approved_at timestamptz;

ALTER TABLE gifts ALTER COLUMN puzzle_type DROP NOT NULL;
ALTER TABLE gifts ALTER COLUMN puzzle_config DROP NOT NULL;

DO $$ BEGIN
  ALTER TABLE gifts ADD CONSTRAINT gifts_unlock_type_check
    CHECK (unlock_type IN ('puzzle', 'task_list'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
