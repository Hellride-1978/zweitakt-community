-- ============================================================
-- SECURITY FIXES – 2026-06-10
-- Supabase Security Advisor: RLS / Functions / Storage
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. RLS feedbacks – WITH CHECK (true) durch echte Bedingung ersetzen
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "feedbacks_insert_anon_auth" ON feedbacks;
DROP POLICY IF EXISTS "feedbacks_insert_any"        ON feedbacks;
DROP POLICY IF EXISTS "feedbacks_insert"            ON feedbacks;

CREATE OR REPLACE POLICY "feedbacks_insert"
  ON feedbacks FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    type IN ('lob', 'bug', 'idee')
    AND char_length(message) BETWEEN 10 AND 1000
  );


-- ─────────────────────────────────────────────────────────────
-- 2. RLS page_views – WITH CHECK (true) durch echte Bedingung ersetzen
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "page_views_insert_anon_auth" ON page_views;
DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;

CREATE OR REPLACE POLICY "page_views_insert"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    path IS NOT NULL
    AND char_length(path) > 0
  );


-- ─────────────────────────────────────────────────────────────
-- 3. Function Search Path – verhindert search_path-Injection
-- ─────────────────────────────────────────────────────────────
ALTER FUNCTION public.find_users_nearby(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION)
  SET search_path = public;

ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public;

ALTER FUNCTION public.email_exists(text)
  SET search_path = public;

ALTER FUNCTION public.handle_new_user()
  SET search_path = public;


-- ─────────────────────────────────────────────────────────────
-- 4. SECURITY DEFINER – Execute-Berechtigungen einschränken
-- ─────────────────────────────────────────────────────────────

-- email_exists: anon bleibt erlaubt (Registrierungsformular prüft vor Login)
REVOKE EXECUTE ON FUNCTION public.email_exists(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.email_exists(text) TO anon;
GRANT  EXECUTE ON FUNCTION public.email_exists(text) TO authenticated;

-- find_users_nearby: nur eingeloggte User dürfen Umkreissuche aufrufen
REVOKE EXECUTE ON FUNCTION public.find_users_nearby(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.find_users_nearby(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) FROM anon;
GRANT  EXECUTE ON FUNCTION public.find_users_nearby(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

-- handle_new_user: Trigger-Funktion, kein direkter Aufruf erlaubt
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;


-- ─────────────────────────────────────────────────────────────
-- 5. Storage – Bucket Listing einschränken
--
-- Strategie:
--   • garage + vehicles: SELECT auf eigenen Ordner beschränkt
--     (User braucht Listing für eigene Fotos)
--   • forum-images, event-images, newsletter-images:
--     SELECT Policy entfernt – Bilder werden nur via direkter
--     public URL angezeigt, kein API-Listing nötig.
--     Download via /storage/v1/object/public/... bleibt unberührt.
--
--   • avatars + clubs: Policy-Namen unbekannt (direkt im Dashboard
--     angelegt) → MANUELL im Dashboard entfernen:
--     Storage → Bucket → Policies → SELECT Policy löschen
-- ─────────────────────────────────────────────────────────────

-- garage: breite Policy durch Owner-only ersetzen
DROP POLICY IF EXISTS "garage_storage_select" ON storage.objects;
CREATE OR REPLACE POLICY "garage_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'garage'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- vehicles: breite Policy durch Owner-only ersetzen
DROP POLICY IF EXISTS "vehicles_storage_select" ON storage.objects;
CREATE OR REPLACE POLICY "vehicles_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'vehicles'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- forum-images: SELECT Policy entfernen
DROP POLICY IF EXISTS "Forum images public read" ON storage.objects;

-- event-images: SELECT Policy entfernen
DROP POLICY IF EXISTS "event_images_select" ON storage.objects;

-- newsletter-images: SELECT Policy entfernen
DROP POLICY IF EXISTS "newsletter_images_select" ON storage.objects;

-- avatars: "Avatare sind öffentlich lesbar" (SELECT, public) → manuell im Dashboard gelöscht
-- clubs: hatte keine SELECT Policy → kein Fix nötig
