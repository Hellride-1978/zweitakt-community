-- Profil-Tabelle um Vor-/Nachname erweitern
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT;

-- Einstellungs-Tabelle
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Benachrichtigungen
  notify_replies    BOOLEAN NOT NULL DEFAULT true,
  notify_messages   BOOLEAN NOT NULL DEFAULT true,
  notify_mentions   BOOLEAN NOT NULL DEFAULT true,
  notify_newsletter BOOLEAN NOT NULL DEFAULT false,
  push_browser      BOOLEAN NOT NULL DEFAULT false,
  push_sounds       BOOLEAN NOT NULL DEFAULT true,
  email_digest      TEXT NOT NULL DEFAULT 'daily'
    CHECK (email_digest IN ('instant','daily','weekly','never')),

  -- Datenschutz
  profile_visibility TEXT NOT NULL DEFAULT 'members'
    CHECK (profile_visibility IN ('all','members','none')),
  who_can_message    TEXT NOT NULL DEFAULT 'members'
    CHECK (who_can_message IN ('all','members','none')),
  show_online_status BOOLEAN NOT NULL DEFAULT true,
  show_activity      BOOLEAN NOT NULL DEFAULT true,
  show_in_search     BOOLEAN NOT NULL DEFAULT true,
  share_usage_stats  BOOLEAN NOT NULL DEFAULT false,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_select" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
