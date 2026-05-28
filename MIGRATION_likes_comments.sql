-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('event', 'vehicle')),
  target_id   UUID NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS likes_target_idx ON likes(target_type, target_id);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Kommentare
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('event', 'vehicle')),
  target_id   UUID NOT NULL,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_target_idx ON comments(target_type, target_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Löschen: eigener Kommentar ODER Ersteller des Events/Bikes
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (
  auth.uid() = user_id
  OR (target_type = 'event'   AND EXISTS (SELECT 1 FROM rides    WHERE id = target_id AND creator_id = auth.uid()))
  OR (target_type = 'vehicle' AND EXISTS (SELECT 1 FROM vehicles WHERE id = target_id AND user_id    = auth.uid()))
);
