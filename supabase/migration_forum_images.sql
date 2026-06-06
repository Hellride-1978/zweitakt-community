-- Bild-URLs für Forum Posts und Replies
ALTER TABLE forum_posts    ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE forum_replies  ADD COLUMN IF NOT EXISTS image_url text;

-- Storage Bucket für Forum-Bilder
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum-images',
  'forum-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Öffentlich lesbar
CREATE POLICY "Forum images public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'forum-images');

-- RLS: Eingeloggte User dürfen hochladen
CREATE POLICY "Forum images authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'forum-images' AND auth.role() = 'authenticated');

-- RLS: Eigene Bilder löschen
CREATE POLICY "Forum images owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);
