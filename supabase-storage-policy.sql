-- Allow anyone to upload, view and delete images in tiffin-images bucket
CREATE POLICY "Public upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tiffin-images');

CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'tiffin-images');

CREATE POLICY "Public delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'tiffin-images');

CREATE POLICY "Public update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'tiffin-images');
