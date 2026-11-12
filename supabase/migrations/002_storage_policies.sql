-- Storage RLS policies for the private gift-content bucket
-- Authenticated users can upload files only to their own folder (userId/giftId/file)
CREATE POLICY "auth users upload own content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gift-content'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can delete their own files
CREATE POLICY "users delete own content"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gift-content'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
