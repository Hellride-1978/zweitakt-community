-- Online-Status: last_seen Timestamp für User-Präsenz

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now();

-- Index für schnelle "wer war kürzlich online?"-Queries
CREATE INDEX IF NOT EXISTS profiles_last_seen_idx ON profiles (last_seen DESC);
