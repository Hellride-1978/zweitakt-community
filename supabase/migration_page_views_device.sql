ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS device  text CHECK (device IN ('mobile', 'tablet', 'desktop')),
  ADD COLUMN IF NOT EXISTS country text;
