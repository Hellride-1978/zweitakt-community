-- Nachrichten-System
-- In Supabase SQL Editor ausführen

CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT false,
  parent_id    UUID REFERENCES messages(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_recipient_idx ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx    ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_parent_idx    ON messages(parent_id);
CREATE INDEX IF NOT EXISTS messages_created_idx   ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Absender oder Empfänger darf lesen
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Nur eigene Nachrichten senden
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Nur Empfänger darf read-Status setzen
CREATE POLICY "messages_update" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Nur Empfänger darf löschen
CREATE POLICY "messages_delete" ON messages
  FOR DELETE USING (auth.uid() = recipient_id);
