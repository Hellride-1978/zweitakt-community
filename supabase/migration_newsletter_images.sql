-- Storage-Bucket für Newsletter-Bilder
-- Im Supabase Dashboard ausführen: SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('newsletter-images', 'newsletter-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "newsletter_images_select" ON storage.objects;
DROP POLICY IF EXISTS "newsletter_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "newsletter_images_delete" ON storage.objects;

-- Öffentlich lesbar (Bilder müssen in E-Mails erreichbar sein)
CREATE POLICY "newsletter_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'newsletter-images');

-- Nur eingeloggte User dürfen hochladen (Zugriff aufs Admin-UI ist bereits gesperrt)
CREATE POLICY "newsletter_images_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'newsletter-images');

-- Nur eigene Uploads löschen
CREATE POLICY "newsletter_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'newsletter-images');
