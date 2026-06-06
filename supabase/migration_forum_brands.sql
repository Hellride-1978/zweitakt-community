-- Kategorie-Spalte für Tags
ALTER TABLE forum_tags ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'topic';

-- Bestehende Tags als Marke markieren falls vorhanden
UPDATE forum_tags SET category = 'brand' WHERE name IN ('Simson', 'MZ', 'Schwalbe');

-- Alle Marken einfügen (existierende updaten)
INSERT INTO forum_tags (name, category) VALUES
  ('Aprilia',     'brand'),
  ('Batavus',     'brand'),
  ('Beta',        'brand'),
  ('CZ',          'brand'),
  ('Derbi',       'brand'),
  ('DKW',         'brand'),
  ('Garelli',     'brand'),
  ('Gilera',      'brand'),
  ('Göricke',     'brand'),
  ('Hercules',    'brand'),
  ('Honda',       'brand'),
  ('Italjet',     'brand'),
  ('Jawa',        'brand'),
  ('Kreidler',    'brand'),
  ('Maico',       'brand'),
  ('Malaguti',    'brand'),
  ('MBK',         'brand'),
  ('Motobécane',  'brand'),
  ('MZ',          'brand'),
  ('NSU',         'brand'),
  ('Peugeot',     'brand'),
  ('Piaggio',     'brand'),
  ('Puch',        'brand'),
  ('Rixe',        'brand'),
  ('Rieju',       'brand'),
  ('Simson',      'brand'),
  ('Solex',       'brand'),
  ('Sparta',      'brand'),
  ('Suzuki',      'brand'),
  ('Tomos',       'brand'),
  ('Victoria',    'brand'),
  ('Yamaha',      'brand'),
  ('Zündapp',     'brand')
ON CONFLICT (name) DO UPDATE SET category = 'brand';
