ALTER TABLE gifts
  ADD COLUMN IF NOT EXISTS amazon_product_url text,
  ADD COLUMN IF NOT EXISTS amazon_product_title text,
  ADD COLUMN IF NOT EXISTS amazon_product_image text,
  ADD COLUMN IF NOT EXISTS amazon_prize_amount_cents int;

ALTER TABLE gifts DROP CONSTRAINT IF EXISTS gifts_content_type_check;
ALTER TABLE gifts ADD CONSTRAINT gifts_content_type_check
  CHECK (content_type IN ('image', 'file', 'text', 'gift_card', 'amazon_prize'));

CREATE TABLE IF NOT EXISTS prize_claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id uuid REFERENCES gifts(id) ON DELETE CASCADE NOT NULL,
  recipient_name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  country text NOT NULL DEFAULT 'US',
  created_at timestamptz DEFAULT now() NOT NULL
);
