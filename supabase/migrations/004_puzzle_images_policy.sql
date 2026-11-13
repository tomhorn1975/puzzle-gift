-- Storage RLS policies for the public puzzle-images bucket (slide/jigsaw uploads)
CREATE POLICY "auth users upload puzzle images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'puzzle-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "auth users delete own puzzle images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'puzzle-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
