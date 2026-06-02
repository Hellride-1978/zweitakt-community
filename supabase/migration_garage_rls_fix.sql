-- Fix: garage + garage_skills öffentlich lesbar machen
-- Server-seitige Supabase-Clients haben keinen Auth-Context,
-- daher schlägt auth.uid() IS NOT NULL als SELECT-Policy fehl.

DROP POLICY IF EXISTS "garage_select"        ON garage;
DROP POLICY IF EXISTS "garage_skills_select" ON garage_skills;

-- Jeder darf lesen (Garage-Profile sind öffentliche Community-Daten)
CREATE POLICY "garage_select"        ON garage        FOR SELECT USING (true);
CREATE POLICY "garage_skills_select" ON garage_skills FOR SELECT USING (true);
