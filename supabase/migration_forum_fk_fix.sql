-- Hotfix: FK von auth.users auf profiles umstellen
-- damit Supabase den Join profiles!user_id auflösen kann.
--
-- Ausführen wenn migration_forum.sql bereits gelaufen ist.

ALTER TABLE forum_posts
  DROP CONSTRAINT IF EXISTS forum_posts_user_id_fkey,
  ADD CONSTRAINT forum_posts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE forum_replies
  DROP CONSTRAINT IF EXISTS forum_replies_user_id_fkey,
  ADD CONSTRAINT forum_replies_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
