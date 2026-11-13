-- Add payment & gift card columns to gifts
ALTER TABLE gifts
  ADD COLUMN IF NOT EXISTS notification_email TEXT,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS gift_card_code TEXT,
  ADD COLUMN IF NOT EXISTS gift_card_brand_id TEXT,
  ADD COLUMN IF NOT EXISTS gift_card_brand_name TEXT,
  ADD COLUMN IF NOT EXISTS gift_card_amount_cents INTEGER;

-- Add constraints
ALTER TABLE gifts
  ADD CONSTRAINT gifts_payment_status_check
    CHECK (payment_status IN ('free', 'pending', 'paid', 'failed'));

-- Drop old content_type constraint and recreate with gift_card
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_name = 'gifts' AND constraint_type = 'CHECK'
      AND constraint_name ILIKE '%content_type%'
  LOOP
    EXECUTE 'ALTER TABLE gifts DROP CONSTRAINT ' || r.constraint_name;
  END LOOP;
END $$;

ALTER TABLE gifts ADD CONSTRAINT gifts_content_type_check
  CHECK (content_type IN ('image', 'file', 'text', 'gift_card'));
