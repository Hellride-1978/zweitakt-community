CREATE TABLE IF NOT EXISTS page_views (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path       text NOT NULL,
  viewed_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Jeder darf Seitenaufrufe eintragen (anonym + eingeloggt)
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- Kein öffentliches Lesen — nur service_role
