-- Storage-Bucket und Policies für Schrauberhallen-Fotos
-- Im Supabase Dashboard ausführen: SQL Editor

-- 1. Bucket anlegen (falls noch nicht vorhanden)
INSERT INTO storage.buckets (id, name, public)
VALUES ('garage', 'garage', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Bestehende Policies entfernen (idempotent)
DROP POLICY IF EXISTS "garage_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "garage_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "garage_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "garage_storage_delete" ON storage.objects;

-- 3. Jeder darf Fotos sehen (public bucket)
CREATE POLICY "garage_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'garage');

-- 4. Eingeloggte User dürfen nur in ihren eigenen Ordner hochladen
--    Pfadstruktur: {user_id}/{slot}.jpg
CREATE POLICY "garage_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'garage'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Update (upsert) im eigenen Ordner
CREATE POLICY "garage_storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'garage'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Löschen im eigenen Ordner
CREATE POLICY "garage_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'garage'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
