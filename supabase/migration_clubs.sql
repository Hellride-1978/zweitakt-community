-- Klub-Seiten: clubs + club_memberships

CREATE TABLE IF NOT EXISTS clubs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  logo_url     TEXT,
  location     TEXT,
  founded_year INTEGER,
  links        JSONB DEFAULT '{}',
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS club_memberships (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id    UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email      TEXT,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (club_id, user_id)
);

CREATE INDEX IF NOT EXISTS club_memberships_club_id_idx ON club_memberships(club_id);
CREATE INDEX IF NOT EXISTS club_memberships_user_id_idx ON club_memberships(user_id);
CREATE INDEX IF NOT EXISTS club_memberships_email_idx   ON club_memberships(email);

ALTER TABLE clubs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;

-- ── clubs ────────────────────────────────────────────────────────

CREATE POLICY "clubs_select" ON clubs FOR SELECT USING (true);

CREATE POLICY "clubs_insert" ON clubs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "clubs_update" ON clubs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = clubs.id
        AND cm.user_id = auth.uid()
        AND cm.role    = 'admin'
        AND cm.status  = 'active'
    )
  );

CREATE POLICY "clubs_delete" ON clubs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = clubs.id
        AND cm.user_id = auth.uid()
        AND cm.role    = 'admin'
        AND cm.status  = 'active'
    )
  );

-- ── club_memberships ─────────────────────────────────────────────

CREATE POLICY "memberships_select" ON club_memberships FOR SELECT USING (true);

-- Admins dürfen aktiv oder pending hinzufügen;
-- aktive Members dürfen nur pending-Vorschläge machen.
CREATE POLICY "memberships_insert" ON club_memberships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = club_memberships.club_id
        AND cm.user_id = auth.uid()
        AND cm.role    = 'admin'
        AND cm.status  = 'active'
    )
    OR (
      status = 'pending'
      AND EXISTS (
        SELECT 1 FROM club_memberships cm
        WHERE cm.club_id = club_memberships.club_id
          AND cm.user_id = auth.uid()
          AND cm.status  = 'active'
      )
    )
  );

-- Admins können Members verwalten.
-- Andere Admins zurückstufen/entfernen darf nur der Klub-Ersteller.
CREATE POLICY "memberships_update" ON club_memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = club_memberships.club_id
        AND cm.user_id = auth.uid()
        AND cm.role    = 'admin'
        AND cm.status  = 'active'
    )
    AND (
      club_memberships.role != 'admin'
      OR club_memberships.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM clubs c
        WHERE c.id         = club_memberships.club_id
          AND c.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "memberships_delete" ON club_memberships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM club_memberships cm
      WHERE cm.club_id = club_memberships.club_id
        AND cm.user_id = auth.uid()
        AND cm.role    = 'admin'
        AND cm.status  = 'active'
    )
    AND (
      club_memberships.role != 'admin'
      OR club_memberships.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM clubs c
        WHERE c.id         = club_memberships.club_id
          AND c.created_by = auth.uid()
      )
    )
  );
