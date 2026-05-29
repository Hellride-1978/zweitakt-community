-- Add image_url column to rides table
ALTER TABLE rides ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create event-images storage bucket (run this in Supabase Dashboard → Storage → New bucket)
-- Name: event-images
-- Public: true
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
