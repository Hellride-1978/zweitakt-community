-- ============================================================
-- SECURITY FIX – 2026-07-21
-- Supabase Security Advisor: "Table publicly accessible" (rls_disabled_in_public)
-- ============================================================
--
-- wm_users, wm_tips und wm_matches_cache (WM-Tippspiel) hatten keine
-- Row-Level-Security aktiv. Damit waren sie über die Supabase-REST-API
-- mit dem öffentlichen anon-Key für jeden lesbar, schreibbar und
-- löschbar — bei wm_users inklusive email, username und password_hash.
--
-- Der App-Code (lib/wm-db.ts) greift ausschließlich server-seitig über
-- den Service-Role-Key zu, der RLS ohnehin umgeht. Es werden daher
-- bewusst KEINE Policies angelegt: RLS aktivieren genügt, um jeglichen
-- Zugriff über anon/authenticated zu sperren, ohne die App zu brechen.

ALTER TABLE wm_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE wm_tips          ENABLE ROW LEVEL SECURITY;
ALTER TABLE wm_matches_cache ENABLE ROW LEVEL SECURITY;
