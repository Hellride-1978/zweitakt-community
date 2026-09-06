-- ═══════════════════════════════════════════════════════════════════════════
--  VORSCHLAG — NICHT AUSGEFÜHRT
--  Aufräum-Migration zum Rückbau der abgeschalteten Community-Features.
--
--  Diese Datei wurde NICHT in der Datenbank ausgeführt. Sie ist zum manuellen
--  Review gedacht. Vor dem Ausführen bitte Punkt für Punkt durchgehen und
--  einzeln freigeben — die Blöcke sind absichtlich getrennt und einzeln
--  lauffähig.
--
--  ACHTUNG: DROP TABLE ist NICHT umkehrbar. Vorher ein Backup ziehen:
--    Supabase Dashboard → Database → Backups, oder
--    pg_dump "$DATABASE_URL" > backup_vor_cleanup.sql
--
--  Reihenfolge ist wichtig: erst Code-Schritte (unten), dann Blöcke 1–8.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
--  VORAB ZU PRÜFEN (im SQL-Editor ausführen, Ergebnis anschauen)
-- ───────────────────────────────────────────────────────────────────────────

-- (a) Wie viele Daten hängen überhaupt dran? Wenn hier überall 0 steht,
--     ist der Rückbau risikoarm.
--
-- select 'forum_posts'   t, count(*) from forum_posts
-- union all select 'forum_replies',   count(*) from forum_replies
-- union all select 'forum_votes',     count(*) from forum_votes
-- union all select 'forum_post_tags', count(*) from forum_post_tags
-- union all select 'messages',        count(*) from messages
-- union all select 'likes',           count(*) from likes
-- union all select 'comments',        count(*) from comments
-- union all select 'clubs',           count(*) from clubs
-- union all select 'club_members',    count(*) from club_members
-- union all select 'posts',           count(*) from posts;

-- (b) Welches comments-Schema liegt real vor? Die Migrations-Dateien im Repo
--     widersprechen sich: MIGRATION.sql beschreibt ride_id/post_id,
--     MIGRATION_likes_comments.sql beschreibt target_type/target_id.
--     Das MUSS vor Block 3 geklärt sein.
--
-- select column_name, data_type, is_nullable
--   from information_schema.columns
--  where table_name = 'comments' order by ordinal_position;

-- (c) Wird update_updated_at_column() noch von anderen Triggern gebraucht?
--     Wenn hier außer den Forum-Triggern noch etwas auftaucht:
--     Funktion NICHT löschen (Block 8).
--
-- select event_object_table, trigger_name
--   from information_schema.triggers
--  where action_statement ilike '%update_updated_at_column%';

-- (d) Existiert der clubs-Bucket wirklich? (Im Repo nur auskommentiert.)
--
-- select id, name, public from storage.buckets;


-- ───────────────────────────────────────────────────────────────────────────
--  CODE-SCHRITTE VOR DIESER MIGRATION (sonst brechen Seiten!)
-- ───────────────────────────────────────────────────────────────────────────
--
--  1. app/api/admin/stats/route.js — die beiden forum_posts/forum_replies
--     Queries und die Felder community.forumPosts / community.forumReplies
--     ganz entfernen. Sonst wirft /admin/statistiken nach Block 1 einen Fehler.
--  2. app/admin/statistiken/page.js — die auskommentierten Forum-KPI-Kacheln
--     löschen.
--  3. app/datenschutz/page.js — Absätze zu Forum, Kommentaren, Likes,
--     Privat-Nachrichten, Online-Status und den kompletten Resend-Abschnitt
--     entfernen. Das ist eine rechtlich relevante Seite, bitte sorgfältig.
--  4. Erst danach: Ordner app/forum, app/messages, components/forum,
--     components/{Comments,LikeButton,MessagesBadge,PresenceUpdater,
--     OnboardingTour,NewsletterForm,NewsletterToggle}.js löschen,
--     dazu die zugehörigen API-Routen und lib/features.js.
--  5. Abhängigkeiten, die dann ungenutzt sind: `resend` (nur Forum),
--     `zod` (nur Forum-Actions) — vorher mit
--     `grep -rn "from 'resend'\|from 'zod'" app lib components` gegenprüfen.
--  6. CSS-Blöcke in app/globals.css: `.zh-club-*`, `.zh-clubs-*`, `.zh-tour-*`,
--     Forum-Klassen, `.mms-online-dot`, `.msg-badge`, `.zh-avatar.offline`.
--     Ebenso die zugehörigen Einträge in app/styleguide/page.js.


-- ═══════════════════════════════════════════════════════════════════════════
--  BLOCK 1 — Forum
-- ═══════════════════════════════════════════════════════════════════════════

-- Trigger zuerst (hängen an den Tabellen, gehen mit DROP TABLE ohnehin mit —
-- hier explizit, damit die Reihenfolge nachvollziehbar bleibt).
drop trigger if exists forum_posts_updated_at   on forum_posts;
drop trigger if exists forum_replies_updated_at on forum_replies;

-- Reihenfolge nach FK-Abhängigkeit. CASCADE räumt die zugehörigen
-- RLS-Policies und Indizes mit ab.
drop table if exists forum_post_tags cascade;
drop table if exists forum_votes     cascade;
drop table if exists forum_replies   cascade;
drop table if exists forum_posts     cascade;
drop table if exists forum_tags      cascade;

-- Notification-Einstellung im Profil
alter table profiles drop column if exists notify_forum_replies;


-- ═══════════════════════════════════════════════════════════════════════════
--  BLOCK 2 — Private Nachrichten
-- ═══════════════════════════════════════════════════════════════════════════

-- Achtung: NICHT contact_messages (Kontaktformular) — die bleibt!
drop table if exists messages cascade;


-- ═══════════════════════════════════════════════════════════════════════════
--  BLOCK 3 — Likes und Kommentare
-- ═══════════════════════════════════════════════════════════════════════════

drop table if exists likes    cascade;
drop table if exists comments cascade;


-- ═══════════════════════════════════════════════════════════════════════════
--  BLOCK 4 — Online-Status
-- ═══════════════════════════════════════════════════════════════════════════

drop index if exists profiles_last_seen_idx;
alter table profiles drop column if exists last_seen;


-- ═══════════════════════════════════════════════════════════════════════════
--  BLOCK 5 — Clubs (bereits im Code zurückgebaut, nur DB-Altlast)
-- ═══════════════════════════════════════════════════════════════════════════

-- WICHTIG: Diese Spalte zuerst, sonst blockiert der FK den DROP.
-- Sie gehört zum Event-Feature und wird dort nirgends gelesen.
alter table rides drop column if exists club_id;

drop table if exists club_members cascade;
drop table if exists clubs        cascade;


-- ═══════════════════════════════════════════════════════════════════════════
--  BLOCK 6 — Toter Community-Feed
-- ═══════════════════════════════════════════════════════════════════════════

-- Tabelle aus MIGRATION.sql, auf die kein Code zugreift.
-- Vorher Zeilenzahl prüfen (Abfrage (a) oben).
drop table if exists posts cascade;


-- ═══════════════════════════════════════════════════════════════════════════
--  BLOCK 7 — Storage-Buckets
-- ═══════════════════════════════════════════════════════════════════════════

-- Bucket-Inhalte müssen VOR dem Löschen des Buckets weg, sonst schlägt der
-- DELETE fehl. Am einfachsten im Dashboard: Storage → Bucket → alles markieren
-- → löschen. Alternativ per SQL:
--
-- delete from storage.objects where bucket_id = 'forum-images';
-- delete from storage.objects where bucket_id = 'clubs';

-- Storage-Policies für forum-images (Namen aus migration_forum_images.sql)
drop policy if exists "Forum images public read"           on storage.objects;
drop policy if exists "Forum images authenticated upload"  on storage.objects;
drop policy if exists "Forum images owner delete"          on storage.objects;

-- Policies für den clubs-Bucket: Namen unbekannt (im Repo nur auskommentiert,
-- laut migration_security_fixes_20260610.sql direkt im Dashboard angelegt).
-- Vorher auflisten:
--   select policyname from pg_policies
--    where tablename = 'objects' and schemaname = 'storage';

delete from storage.buckets where id = 'forum-images';
-- delete from storage.buckets where id = 'clubs';   -- erst nach Prüfung (d)

-- NICHT löschen: avatars, vehicles, garage, event-images, newsletter-images


-- ═══════════════════════════════════════════════════════════════════════════
--  BLOCK 8 — Geteilte Trigger-Funktion (NUR nach Prüfung (c))
-- ═══════════════════════════════════════════════════════════════════════════

-- Wenn Abfrage (c) außer den Forum-Triggern nichts mehr liefert:
-- drop function if exists update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════════════════
--  AUSDRÜCKLICH NICHT TEIL DIESER MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════
--
--  • newsletter_subscribers + Bucket newsletter-images
--    → bleiben. Double-Opt-in-Nachweis (§ 7 Abs. 2 Nr. 3 UWG). Der Newsletter
--      ist im Code abgeschaltet, die Abmelde-Routen laufen weiter.
--  • rides, ride_participants, event-images       → Event-Feature
--  • profiles, vehicles, garage, garage_skills    → Auth/Garage
--  • contact_messages, feedbacks, page_views      → Kontakt, Feedback, Tracking
--  • auth.users                                   → niemals hier anfassen
