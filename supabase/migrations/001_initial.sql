-- Gifts table
CREATE TABLE IF NOT EXISTS gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  personal_message TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'file', 'text')),
  file_path TEXT,
  text_content TEXT,
  puzzle_type TEXT NOT NULL CHECK (puzzle_type IN ('multiple_choice', 'math')),
  puzzle_config JSONB NOT NULL,
  max_attempts INTEGER DEFAULT 5,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Gift access records (each successful solve)
CREATE TABLE IF NOT EXISTS gift_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE NOT NULL,
  solved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address TEXT
);

-- RLS
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_access ENABLE ROW LEVEL SECURITY;

-- Senders manage their own gifts
CREATE POLICY "Users manage own gifts"
  ON gifts FOR ALL
  USING (auth.uid() = sender_id);

-- Anyone can read active gifts (needed to display the puzzle)
CREATE POLICY "Anyone reads active gifts"
  ON gifts FOR SELECT
  USING (is_active = TRUE);

-- Anyone can record a successful solve
CREATE POLICY "Anyone records gift access"
  ON gift_access FOR INSERT
  WITH CHECK (TRUE);

-- Only gift owners can see who solved their gifts
CREATE POLICY "Gift owners read access logs"
  ON gift_access FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gifts
      WHERE gifts.id = gift_access.gift_id
        AND gifts.sender_id = auth.uid()
    )
  );

-- Storage: private bucket for gift content
-- Run these in Supabase Dashboard > Storage after creating the 'gift-content' bucket (private)
--
-- CREATE POLICY "Authenticated users upload own content"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'gift-content' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- CREATE POLICY "Users manage own content"
--   ON storage.objects FOR DELETE TO authenticated
--   USING (bucket_id = 'gift-content' AND (storage.foldername(name))[1] = auth.uid()::text);
