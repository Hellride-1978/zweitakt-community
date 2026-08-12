-- ============================================================
--  RLS-FIX – 2026-08-12
--  Supabase Security Advisor: "rls_disabled_in_public"
--  ("Table publicly accessible", Meldung vom 09.08.2026)
--
--  Im Supabase SQL Editor ausführen.
--  Alle Blöcke sind idempotent – mehrfaches Ausführen ist gefahrlos.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 0. DIAGNOSE – zuerst ausführen und Ergebnis prüfen
--
--    Zeigt alle Tabellen im Schema "public" (= von PostgREST
--    nach außen exponiert), bei denen RLS deaktiviert ist.
--    Erwartet: nur "spatial_ref_sys" (von der PostGIS-Extension).
--    Steht dort eine eigene Tabelle → siehe Abschnitt 3.
-- ─────────────────────────────────────────────────────────────
SELECT
  c.relname                AS tabelle,
  c.relrowsecurity         AS rls_aktiv,
  (SELECT count(*) FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS anzahl_policies,
  has_table_privilege('anon',          'public.' || quote_ident(c.relname), 'SELECT') AS anon_darf_lesen,
  has_table_privilege('authenticated', 'public.' || quote_ident(c.relname), 'SELECT') AS auth_darf_lesen
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')          -- normale + partitionierte Tabellen
  AND c.relrowsecurity = false
ORDER BY c.relname;


-- ─────────────────────────────────────────────────────────────
-- 1. URSACHE: public.spatial_ref_sys (PostGIS)
--
--    migration_geodata.sql führt "CREATE EXTENSION postgis" ohne
--    SCHEMA-Angabe aus → die Extension landet in "public" und legt
--    dort die Tabelle spatial_ref_sys an (~8.500 Koordinatensysteme).
--    Sie gehört supabase_admin, deshalb lässt sich RLS darauf nicht
--    aktivieren ("must be owner of table spatial_ref_sys").
--
--    Reales Risiko: gering – die Tabelle enthält nur öffentliche
--    EPSG-Referenzdaten, keine Nutzerdaten. Schreibrechte hat anon
--    ohnehin nie gehabt. Trotzdem hat sie in der öffentlichen API
--    nichts verloren.
--
--    FIX: Leserecht für die API-Rollen entziehen.
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  REVOKE ALL ON TABLE public.spatial_ref_sys FROM anon;
  REVOKE ALL ON TABLE public.spatial_ref_sys FROM authenticated;
  RAISE NOTICE 'spatial_ref_sys: Zugriff für anon/authenticated entzogen.';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'spatial_ref_sys existiert nicht – nichts zu tun.';
  WHEN undefined_object THEN
    RAISE NOTICE 'Rolle anon/authenticated nicht vorhanden – nichts zu tun.';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Kein Recht zum REVOKE auf spatial_ref_sys – bitte Abschnitt 2 verwenden.';
END $$;

-- Kontrolle: beide Spalten müssen jetzt "false" sein.
SELECT
  has_table_privilege('anon',          'public.spatial_ref_sys', 'SELECT') AS anon_darf_lesen,
  has_table_privilege('authenticated', 'public.spatial_ref_sys', 'SELECT') AS auth_darf_lesen;


-- ─────────────────────────────────────────────────────────────
-- 2. OPTIONAL – Warnung dauerhaft zum Verschwinden bringen
--
--    Der Linter prüft nur "RLS aus + Schema exponiert", nicht die
--    Grants. Nach Abschnitt 1 ist der Zugriff dicht, die Meldung
--    kann aber bestehen bleiben. Zwei Wege:
--
--    (a) Im Dashboard unter Advisors → Security die Meldung für
--        spatial_ref_sys als "ignore" markieren. Empfohlen, weil
--        risikolos.
--
--    (b) PostGIS ins Schema "extensions" umziehen (nicht über die
--        API exponiert). Das ist ein Eingriff in laufende Objekte:
--        Die Umkreissuche (find_users_nearby, PostGIS-Index auf
--        profiles) hängt an der Extension und muss danach neu
--        angelegt werden. Nur mit vorherigem DB-Backup und
--        ausserhalb der Stosszeiten ausführen.
--
--    Block (b) ist bewusst auskommentiert:
--
--    DROP INDEX IF EXISTS public.profiles_geo_idx;
--    DROP FUNCTION IF EXISTS public.find_users_nearby(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);
--    DROP EXTENSION postgis;
--    CREATE EXTENSION postgis SCHEMA extensions;
--    -- danach migration_geodata.sql erneut ausführen, dabei:
--    --   * "CREATE EXTENSION ..." Zeile weglassen
--    --   * in find_users_nearby "SET search_path = public, extensions" ergänzen
--    --     (sonst werden ST_MakePoint/ST_DWithin nicht mehr gefunden)
-- ─────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────
-- 3. SICHERHEITSNETZ für eigene Tabellen
--
--    profiles, vehicles, rides und ride_participants wurden nie per
--    Migration angelegt, sondern per Hand nach SUPABASE_SETUP.md.
--    Falls dort RLS auf einer Umgebung fehlt, wäre das die deutlich
--    ernstere Lücke. Die folgenden Blöcke legen fehlende Policies an
--    (bestehende bleiben unangetastet) und aktivieren danach RLS.
--
--    Reihenfolge ist wichtig: erst Policies, dann RLS – sonst
--    sperrt man die App für die Dauer des Skripts aus.
-- ─────────────────────────────────────────────────────────────

-- Hilfsfunktion: existiert für Tabelle/Command bereits eine Policy?
-- (temporär, lebt nur in dieser Session – Abschnitt 3 deshalb am
--  Stück ausführen, nicht blockweise einzeln)
CREATE OR REPLACE FUNCTION pg_temp.hat_policy(p_table text, p_cmd text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = p_table
      AND cmd IN (p_cmd, 'ALL')
  );
$$;

-- ── profiles ────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT pg_temp.hat_policy('profiles', 'SELECT') THEN
    CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT pg_temp.hat_policy('profiles', 'INSERT') THEN
    CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT pg_temp.hat_policy('profiles', 'UPDATE') THEN
    CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
      USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
END $$;

-- ── vehicles ────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT pg_temp.hat_policy('vehicles', 'SELECT') THEN
    CREATE POLICY "vehicles_select" ON vehicles FOR SELECT USING (true);
  END IF;
  IF NOT pg_temp.hat_policy('vehicles', 'INSERT') THEN
    CREATE POLICY "vehicles_insert" ON vehicles FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT pg_temp.hat_policy('vehicles', 'UPDATE') THEN
    CREATE POLICY "vehicles_update" ON vehicles FOR UPDATE TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT pg_temp.hat_policy('vehicles', 'DELETE') THEN
    CREATE POLICY "vehicles_delete" ON vehicles FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
END $$;

-- ── rides ───────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT pg_temp.hat_policy('rides', 'SELECT') THEN
    CREATE POLICY "rides_select" ON rides FOR SELECT USING (true);
  END IF;
  IF NOT pg_temp.hat_policy('rides', 'INSERT') THEN
    CREATE POLICY "rides_insert" ON rides FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = creator_id);
  END IF;
  IF NOT pg_temp.hat_policy('rides', 'UPDATE') THEN
    CREATE POLICY "rides_update" ON rides FOR UPDATE TO authenticated
      USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
  END IF;
  IF NOT pg_temp.hat_policy('rides', 'DELETE') THEN
    CREATE POLICY "rides_delete" ON rides FOR DELETE TO authenticated
      USING (auth.uid() = creator_id);
  END IF;
  ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
END $$;

-- ── ride_participants ───────────────────────────────────────
DO $$
BEGIN
  IF NOT pg_temp.hat_policy('ride_participants', 'SELECT') THEN
    CREATE POLICY "ride_participants_select" ON ride_participants FOR SELECT USING (true);
  END IF;
  IF NOT pg_temp.hat_policy('ride_participants', 'INSERT') THEN
    CREATE POLICY "ride_participants_insert" ON ride_participants FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT pg_temp.hat_policy('ride_participants', 'DELETE') THEN
    CREATE POLICY "ride_participants_delete" ON ride_participants FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  ALTER TABLE ride_participants ENABLE ROW LEVEL SECURITY;
END $$;


-- ─────────────────────────────────────────────────────────────
-- 4. ABSCHLUSSKONTROLLE
--    Die Diagnose aus Abschnitt 0 erneut ausführen.
--    Erwartetes Ergebnis: entweder keine Zeile mehr, oder nur
--    spatial_ref_sys mit anon_darf_lesen = false.
-- ─────────────────────────────────────────────────────────────
