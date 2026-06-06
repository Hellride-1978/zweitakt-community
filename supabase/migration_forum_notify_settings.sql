-- Notification-Einstellung für Forum-Antworten
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notify_forum_replies boolean NOT NULL DEFAULT true;

-- RLS: User darf eigenes notify_forum_replies lesen und schreiben
-- (Lesen ist bereits durch bestehende SELECT Policy abgedeckt)
-- Update Policy für eigene Zeile hinzufügen falls noch nicht vorhanden:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
