-- Neue Skills zur garage_skills-Tabelle hinzufügen
-- Das bestehende CHECK-Constraint muss ersetzt werden

ALTER TABLE garage_skills
  DROP CONSTRAINT IF EXISTS garage_skills_skill_check;

ALTER TABLE garage_skills
  ADD CONSTRAINT garage_skills_skill_check
  CHECK (skill IN (
    'Mechanik','Elektrik','Lackieren','Schweißen','Tuning',
    'Restauration','Teilebeschaffung','3D-Druck','Einsteiger einlernen',
    'Kaffeetrinker','Pausenmeister','Grill-Experte'
  ));
