# Supabase Datenbank-Setup für Zweitakt Community

## 📋 Schritt 1: Datenbank-Tabellen erstellen

Gehe zu Supabase → Dein Projekt → SQL Editor und kopiere diese Befehle rein:

### 1. Profile-Tabelle

```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  name text,
  description text,
  user_type text, -- 'person' oder 'club'
  avatar_url text,
  created_at timestamp with time zone default now(),
  primary key (id)
);

-- Sicherheit aktivieren
alter table profiles enable row level security;

-- Jeder darf Profile sehen (öffentliches Community-Profil)
create policy "Benutzer können Profile sehen"
on profiles for select
using ( true );

-- Nur sein eigenes Profil darf man bearbeiten
create policy "Benutzer können ihr eigenes Profil ändern"
on profiles for update
using ( auth.uid() = id );

-- Erlaube angemeldeten Benutzern, ihr eigenes Profil anzulegen
-- (wichtig: mit RLS muss eine INSERT-Policy existieren)
create policy "Benutzer können eigenes Profil anlegen"
on profiles for insert
with check (auth.uid() = id);
```

### 2. Fahrzeuge-Tabelle

```sql
create table vehicles (
  id uuid primary key,
  user_id uuid references profiles on delete cascade not null,
  make text not null,
  model text not null,
  year integer,
  description text,
  image_url text,
  created_at timestamp with time zone default now()
);

alter table vehicles enable row level security;

create policy "Fahrzeuge sind öffentlich lesbar"
on vehicles for select using ( true );

create policy "Eigene Fahrzeuge anlegen"
on vehicles for insert to authenticated
with check ( auth.uid() = user_id );

create policy "Eigene Fahrzeuge bearbeiten"
on vehicles for update to authenticated
using ( auth.uid() = user_id );

create policy "Eigene Fahrzeuge löschen"
on vehicles for delete to authenticated
using ( auth.uid() = user_id );
```

### 3. Ausfahrten-Tabelle

```sql
create table rides (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references profiles on delete cascade,
  title text,
  description text,
  location text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  max_participants integer,
  created_at timestamp with time zone default now()
);

alter table rides enable row level security;

create policy "Benutzer können Ausfahrten sehen"
on rides for select
using ( true );
```

### 4. Ausfahrts-Teilnehmer-Tabelle

```sql
create table ride_participants (
  id uuid default gen_random_uuid() primary key,
  ride_id uuid references rides on delete cascade,
  user_id uuid references profiles on delete cascade,
  joined_at timestamp with time zone default now()
);

alter table ride_participants enable row level security;

create policy "Benutzer können Teilnehmer sehen"
on ride_participants for select
using ( true );
```

### 5. Kommentare-Tabelle

```sql
create table comments (
  id uuid default gen_random_uuid() primary key,
  ride_id uuid references rides on delete cascade,
  user_id uuid references profiles on delete cascade,
  content text,
  created_at timestamp with time zone default now()
);

alter table comments enable row level security;

create policy "Benutzer können Kommentare sehen"
on comments for select
using ( true );
```

## 🔐 Storage für Bilder aktivieren
Gehe zu Supabase → **Storage** und lege Buckets an, in denen später die Bilder gespeichert werden.

Empfehlung:
- `avatars` – Profilbilder
- `vehicles` – Fahrzeugbilder
- `rides` – ggf. Bilder für Ausfahrten

Einstellungen:
- **Public**: Für einfache Anwendungen reicht ein öffentlicher Bucket, dann sind Dateien per URL erreichbar.
- **Private**: Wenn du Zugriff einschränken willst, lasse Buckets privat und erzeuge signierte URLs beim Zugriff.

UI-Schritte (einfach):
1. Öffne dein Projekt in Supabase → **Storage**
2. Klick auf **New bucket**
3. Vergib den Namen (z.B. `avatars`) und wähle `Public` (oder `Private`)
4. Wiederhole für `vehicles` und `rides`

### Storage RLS-Policies (Pflicht!)

Supabase blockiert alle Uploads ohne explizite Policies. Führe das im **SQL Editor** aus:

```sql
-- avatars Bucket
create policy "Avatars hochladen erlaubt"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars');

create policy "Avatars aktualisieren erlaubt"
on storage.objects for update to authenticated
using (bucket_id = 'avatars');

create policy "Avatare sind öffentlich lesbar"
on storage.objects for select
using (bucket_id = 'avatars');

-- vehicles Bucket
create policy "Fahrzeugbilder hochladen erlaubt"
on storage.objects for insert to authenticated
with check (bucket_id = 'vehicles');

create policy "Fahrzeugbilder aktualisieren erlaubt"
on storage.objects for update to authenticated
using (bucket_id = 'vehicles');

create policy "Fahrzeugbilder löschen erlaubt"
on storage.objects for delete to authenticated
using (bucket_id = 'vehicles');

create policy "Fahrzeugbilder sind öffentlich lesbar"
on storage.objects for select
using (bucket_id = 'vehicles');
```

Test: Lade per UI eine Bilddatei in einen Bucket hoch und klicke die Datei an → kopiere die `Public URL` und füge sie testweise in das Feld `avatar_url` einer `profiles`-Zeile ein (Table Editor) — die Seite sollte das Bild dann anzeigen.

Beispiel: Bild per `@supabase/supabase-js` hochladen

```js
// lib/supabase.js bereits vorhanden
import { supabase } from '@/lib/supabase'

async function uploadAvatar(userId, file) {
  const fileExt = file.name.split('.').pop()
  const filePath = `avatars/${userId}.${fileExt}`

  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl || data.public_url
}
```

Hinweis: Wenn du Buckets privat setzt, verwende `createSignedUrl()` für temporär zugängliche Links.

---

## ✅ Fertig!

Deine Datenbank und Storage sind jetzt einsatzbereit. Die Tabellen sind durch Row Level Security (RLS) geschützt; die Buckets halten die Bilddateien und du speicherst in der Datenbank nur die zugehörigen URLs.
