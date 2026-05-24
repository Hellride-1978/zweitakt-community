-- ============================================================
--  Zweitakthoden Community – DB Migration
--  Im Supabase SQL Editor ausführen (einmalig)
-- ============================================================

-- ── Phase 1: Profil erweitern ─────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username  text;

-- ── Phase 2: Fahrzeuge erweitern ─────────────────────────
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS title          text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS displacement_cc integer;

-- Mehrere Bilder pro Fahrzeug
CREATE TABLE IF NOT EXISTS vehicle_images (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid REFERENCES vehicles ON DELETE CASCADE NOT NULL,
  image_url  text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fahrzeugbilder öffentlich lesbar"
  ON vehicle_images FOR SELECT USING (true);

CREATE POLICY "Eigene Fahrzeugbilder anlegen"
  ON vehicle_images FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_id AND v.user_id = auth.uid())
  );

CREATE POLICY "Eigene Fahrzeugbilder löschen"
  ON vehicle_images FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_id AND v.user_id = auth.uid())
  );

-- ── Phase 3: Clubs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  description text,
  logo_url    text,
  location    text,
  is_public   boolean DEFAULT true,
  created_by  uuid REFERENCES profiles ON DELETE SET NULL,
  created_at  timestamp with time zone DEFAULT now()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clubs sind öffentlich lesbar"
  ON clubs FOR SELECT USING (true);

CREATE POLICY "Clubs anlegen (angemeldete Nutzer)"
  ON clubs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Clubs bearbeiten (nur Ersteller)"
  ON clubs FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Clubs löschen (nur Ersteller)"
  ON clubs FOR DELETE TO authenticated
  USING (auth.uid() = created_by);


CREATE TABLE IF NOT EXISTS club_members (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id   uuid REFERENCES clubs ON DELETE CASCADE NOT NULL,
  user_id   uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  role      text DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE (club_id, user_id)
);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club-Mitgliedschaften öffentlich lesbar"
  ON club_members FOR SELECT USING (true);

CREATE POLICY "Club beitreten"
  ON club_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Club verlassen"
  ON club_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Mitglieder-Rolle ändern (nur Club-Admin)"
  ON club_members FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = club_members.club_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
  );

-- ── Phase 4: Events (rides-Tabelle erweitern) ─────────────
ALTER TABLE rides ADD COLUMN IF NOT EXISTS location_lat double precision;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS location_lng double precision;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS club_id     uuid REFERENCES clubs ON DELETE SET NULL;

-- Fehlende RLS-Policies für rides (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Ausfahrten anlegen" ON rides;
CREATE POLICY "Ausfahrten anlegen"
  ON rides FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Eigene Ausfahrten bearbeiten" ON rides;
CREATE POLICY "Eigene Ausfahrten bearbeiten"
  ON rides FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Eigene Ausfahrten löschen" ON rides;
CREATE POLICY "Eigene Ausfahrten löschen"
  ON rides FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);

-- Fehlende RLS-Policies für ride_participants
DROP POLICY IF EXISTS "Anmelden zu Ausfahrten" ON ride_participants;
CREATE POLICY "Anmelden zu Ausfahrten"
  ON ride_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Abmelden von Ausfahrten" ON ride_participants;
CREATE POLICY "Abmelden von Ausfahrten"
  ON ride_participants FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── Phase 5: Community-Feed ───────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content    text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts öffentlich lesbar"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Posts anlegen"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Eigene Posts löschen"
  ON posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- comments: post_id hinzufügen (ride_id bleibt erhalten)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS post_id uuid REFERENCES posts ON DELETE CASCADE;
ALTER TABLE comments ALTER COLUMN ride_id DROP NOT NULL;

DROP POLICY IF EXISTS "Kommentare anlegen" ON comments;
CREATE POLICY "Kommentare anlegen"
  ON comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Eigene Kommentare löschen" ON comments;
CREATE POLICY "Eigene Kommentare löschen"
  ON comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── Club-Bilder ───────────────────────────────────────────
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS image_url   text;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS image_url_2 text;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS image_url_3 text;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS image_url_4 text;

-- Storage-Bucket für Club-Bilder (einmalig in Supabase anlegen)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('clubs', 'clubs', true)
-- ON CONFLICT (id) DO NOTHING;
-- CREATE POLICY "Club-Bilder öffentlich" ON storage.objects FOR SELECT USING (bucket_id = 'clubs');
-- CREATE POLICY "Club-Bilder hochladen" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'clubs');
-- CREATE POLICY "Club-Bilder löschen" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'clubs');
