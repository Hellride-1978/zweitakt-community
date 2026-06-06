-- Newsletter Double Opt-in Tabelle
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email               text UNIQUE NOT NULL,
  user_id             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirmation_token  uuid DEFAULT gen_random_uuid(),
  unsubscribe_token   uuid DEFAULT gen_random_uuid(),
  confirmed_at        timestamptz,
  unsubscribed_at     timestamptz,
  opt_in_ip           text,
  opt_in_at           timestamptz DEFAULT now(),
  created_at          timestamptz DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Eingeloggte User dürfen nur ihre eigene Zeile lesen
CREATE POLICY "Users read own subscription"
  ON newsletter_subscribers FOR SELECT
  USING (auth.uid() = user_id);

-- Insert ist öffentlich (anonyme Anmeldung möglich)
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Update nur via Service Role (Token-Bestätigung, Unsubscribe)
-- → keine UPDATE Policy für normale User → läuft alles über service_role
