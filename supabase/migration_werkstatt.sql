-- Werkstatt-Feature: garage + garage_skills

-- lat/lng sind bereits durch migration_geodata.sql vorhanden.
-- Falls noch nicht: uncomment:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- ── garage (1:1 mit profiles) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS garage (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT,
  photo_1     TEXT,
  photo_2     TEXT,
  photo_3     TEXT,
  photo_4     TEXT,
  photo_5     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── garage_skills (Junction: User → Skill-Tag) ────────────────
CREATE TABLE IF NOT EXISTS garage_skills (
  id      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill   TEXT NOT NULL CHECK (skill IN (
    'Mechanik','Elektrik','Lackieren','Schweißen','Tuning',
    'Restauration','Teilebeschaffung','3D-Druck','Einsteiger einlernen'
  )),
  UNIQUE (user_id, skill)
);

CREATE INDEX IF NOT EXISTS garage_skills_user_idx ON garage_skills (user_id);
CREATE INDEX IF NOT EXISTS garage_skills_skill_idx ON garage_skills (skill);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE garage        ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_skills ENABLE ROW LEVEL SECURITY;

-- garage: eingeloggte User dürfen lesen
CREATE POLICY "garage_select" ON garage FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- garage: nur eigener Eintrag darf angelegt/bearbeitet/gelöscht werden
CREATE POLICY "garage_insert" ON garage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "garage_update" ON garage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "garage_delete" ON garage FOR DELETE
  USING (auth.uid() = user_id);

-- garage_skills: eingeloggte User dürfen lesen
CREATE POLICY "garage_skills_select" ON garage_skills FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "garage_skills_insert" ON garage_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "garage_skills_delete" ON garage_skills FOR DELETE
  USING (auth.uid() = user_id);
