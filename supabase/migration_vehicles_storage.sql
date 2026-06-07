-- Storage-Bucket und Policies für Fahrzeug-Fotos
-- Im Supabase Dashboard ausführen: SQL Editor

-- 1. Bucket anlegen (falls noch nicht vorhanden)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vehicles', 'vehicles', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Bestehende Policies entfernen (idempotent)
DROP POLICY IF EXISTS "vehicles_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "vehicles_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "vehicles_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "vehicles_storage_delete" ON storage.objects;

-- 3. Öffentlich lesbar
CREATE POLICY "vehicles_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicles');

-- 4. Upload nur in eigenen Ordner (Pfadstruktur: {user_id}/{vehicleId}_{slot}.jpg)
CREATE POLICY "vehicles_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vehicles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Update nur im eigenen Ordner
CREATE POLICY "vehicles_storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vehicles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Löschen nur im eigenen Ordner
CREATE POLICY "vehicles_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'vehicles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
