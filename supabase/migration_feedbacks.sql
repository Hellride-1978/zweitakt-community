-- Feedback-Tabelle
CREATE TABLE feedbacks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text        NOT NULL CHECK (type IN ('lob', 'bug', 'idee')),
  message     text        NOT NULL CHECK (char_length(message) BETWEEN 10 AND 1000),
  url         text,
  email       text,
  user_id     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Jeder kann Feedback einreichen (auch unangemeldet)
CREATE POLICY "feedbacks_insert_any"
  ON feedbacks FOR INSERT
  WITH CHECK (true);

-- Eingeloggte User sehen nur ihre eigenen Einträge
-- (Admin liest alles über Service Role Key im API-Route)
CREATE POLICY "feedbacks_select_own"
  ON feedbacks FOR SELECT
  USING (auth.uid() = user_id);
