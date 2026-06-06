# Aufgaben aus Code-Review vom 06.06.2026

Alle Änderungen basieren auf einem Abgleich zwischen dem aktuellen Code und den Seiten
`app/styleguide/page.js` sowie `app/datenschutz/page.js`.
**Kein neuer Code, keine neuen Features** — nur Dokumentation/Text aktualisieren.

---

## 1. Datenschutzerklärung aktualisieren (`app/datenschutz/page.js`)

### 1a. Abschnitt 2 „Welche Daten wir speichern" erweitern 🔴

Füge folgende Punkte zur bestehenden `<ul>` hinzu:

- Postleitzahl (PLZ) und geografische Koordinaten (Breitengrad/Längengrad) — freiwillig,
  für die Anzeige auf der Schrauber-Karte
- Kommentare auf Terminen und Fahrzeugen (Text, Zeitstempel, Zuordnung zum Profil)
- Privat-Nachrichten (Inhalt, Zeitstempel, Sender/Empfänger — nur für die beteiligten
  Nutzer sichtbar)
- Likes auf Terminen, Profilen und Fahrzeugen (Zuordnung zum Profil und zum Zielobjekt)
- Letzter Aktivitätszeitpunkt (`last_seen`) — wird alle 5 Minuten automatisch aktualisiert
  solange du eingeloggt bist, für den Online-Status auf Profilkacheln

Ergänze außerdem folgenden Absatz nach der `<ul>`:

> Wenn du das Kontaktformular verwendest, werden Name, E-Mail-Adresse und Nachricht
> dauerhaft in unserer Datenbank gespeichert. Wenn du eine Schrauberhalle anlegst,
> werden Beschreibung, bis zu fünf Fotos und deine Schrauber-Skills gespeichert und
> sind für alle Mitglieder öffentlich sichtbar.

### 1b. Abschnitt 3 „Zweck der Verarbeitung" — Satz ergänzen 🔴

Nach dem bestehenden Satz ergänzen:

> Deine E-Mail-Adresse wird außerdem verwendet, um dich über Community-Aktivitäten
> zu benachrichtigen, an denen du beteiligt bist: neue Kommentare auf deinen Terminen
> oder Fahrzeugen, Änderungen an Terminen für die du angemeldet bist, sowie neue
> Teilnehmer an deinen Terminen.

### 1c. Neuer Unterabschnitt in Abschnitt 4 „Eingesetzte Dienste": OpenStreetMap erweitern 🟡

Den bestehenden OpenStreetMap/Nominatim-Absatz anpassen. Aktuell steht dort nur
„Koordinaten von Treffpunkten". Richtigstellen auf:

> Zur Anzeige von Kartenausschnitten bei Terminen und zur Umwandlung von Ort- und
> PLZ-Eingaben in geografische Koordinaten (für Profilseiten und die Schrauber-Karte)
> nutzen wir OpenStreetMap und den Nominatim-Dienst der OpenStreetMap Foundation.
> Dabei werden Ortsnamen oder Postleitzahlen an Nominatim übermittelt; es werden
> keine personenbezogenen Daten wie Name oder E-Mail-Adresse weitergegeben.

### 1d. Neuer Unterabschnitt in Abschnitt 4: Schrauberhalle / Supabase Storage 🟡

Nach dem bestehenden Supabase-Absatz einen neuen `<h3>` einfügen:

**Supabase Storage**
> Für Profilbilder (Bucket: `avatars`), Fahrzeugfotos (Bucket: `vehicles`),
> Schrauberhallen-Fotos (Bucket: `garage`) und Termin-Titelbilder
> (Bucket: `event-images`) nutzen wir Supabase Storage. Alle Fotos sind öffentlich
> über eine URL abrufbar. Du kannst deine Fotos jederzeit in den Einstellungen löschen.

### 1e. Abschnitt 5 „Cookies und lokale Speicherung" — Präzisierung 🟢

Den bestehenden Absatz um einen Satz ergänzen:

> Im lokalen Speicher (localStorage) werden außerdem deine Farbpaletten- und
> Theme-Einstellung, der Status des Cookie-Banners, der Fortschritt der Onboarding-Tour
> sowie Snooze-Einstellungen für Hinweis-Banner gespeichert. Diese Daten verlassen
> deinen Browser nicht.

---

## 2. Styleguide aktualisieren (`app/styleguide/page.js`)

### 2a. Tech Stack — Supabase Storage Buckets korrigieren 🔴

In der `TECH`-Konstante, Eintrag `name: 'Supabase Storage'`, das `desc`-Feld ändern von:

```
Buckets: avatars, vehicles — öffentliche Bild-URLs mit Cache-Busting
```

zu:

```
Buckets: avatars (Profilbilder), vehicles (Fahrzeugfotos), garage (Schrauberhallen-Fotos),
event-images (Termin-Titelbilder) — öffentliche Bild-URLs mit Cache-Busting
```

### 2b. Tech Stack — Leaflet ergänzen 🟡

In der Kategorie `'Karten & Geocoding'` einen neuen Eintrag hinzufügen:

```js
{
  name: 'Leaflet / react-leaflet',
  desc: 'Interaktive Karten — MemberMapSplit auf der Startseite (Schrauber-Karte mit Umkreissuche) und EventMap auf Termindetailseiten. Tiles via OpenStreetMap.',
  url: 'https://leafletjs.com',
},
```

### 2c. Tech Stack — Tailwind CSS ergänzen 🟡

In der Kategorie `'Framework & Hosting'` einen neuen Eintrag hinzufügen:

```js
{
  name: 'Tailwind CSS v4',
  desc: 'Utility-First-CSS als devDependency — wird via @import in globals.css eingebunden. Im Projekt hauptsächlich für Hilfklassen wie flex, min-h-full etc. verwendet.',
  url: 'https://tailwindcss.com',
},
```

### 2d. Features — Schrauberhalle ergänzen 🟡

In der Kategorie `'Features & Extras'` einen neuen Eintrag hinzufügen:

```js
{
  name: 'Schrauberhalle',
  desc: 'Öffentliches Werkstattprofil: Beschreibung, bis zu 5 Fotos (Supabase Storage, Bucket: garage), Schrauber-Skills als Tags — erreichbar unter /schrauberhalle. Admin-Benachrichtigung bei neuer Halle per SMTP.',
  url: null,
},
```

### 2e. Features — Kommentar-System ergänzen 🟡

```js
{
  name: 'Kommentar-System',
  desc: 'Kommentare auf Terminen und Fahrzeugen — Supabase comments-Tabelle (target_type + target_id), nur für eingeloggte Mitglieder. E-Mail-Benachrichtigung an Ersteller und Teilnehmer via SMTP.',
  url: null,
},
```

### 2f. Features — Präsenz-Tracking ergänzen 🟢

```js
{
  name: 'Präsenz / Online-Status',
  desc: 'PresenceUpdater aktualisiert last_seen alle 5 Minuten in profiles — zeigt Online-Indikator (grüner Punkt) auf Profilkacheln. Kein Echtzeit-Kanal, nur Timestamp-basiert.',
  url: null,
},
```

### 2g. Features — Admin-Benachrichtigungen vervollständigen 🟢

Den bestehenden Eintrag `name: 'Admin-Benachrichtigungen'` ersetzen durch:

```js
{
  name: 'Admin-Benachrichtigungen',
  desc: 'Automatische E-Mail an info@zweitakthoden.de bei: neuem Mitglied, neuem Termin, neuem Bike, neuer Nachricht, neuer Schrauberhalle — jeweils per SMTP-Route. User-Benachrichtigungen: Kommentar auf eigenem Termin/Bike, Termin-Beitritt, Termin-Aktualisierung für Teilnehmer.',
  url: null,
},
```

### 2h. CSS-Klassen Übersicht — fehlende Klassen ergänzen 🟢

In der CSS-Klassen-Tabelle (dem großen `.map()`-Array) folgende Einträge hinzufügen:

```js
['zh-card-sm',          'Kleinere Karten-Variante (border-radius 14px, kompakteres Padding)'],
['zh-badge',            'Mono-Badge (unterscheidet sich von zh-pill: kein border-radius 999px)'],
['zh-filter-btn',       'Filter-Toggle-Button (Pill-Form, aktiver Zustand via .active)'],
['zh-radio-group',      'Wrapper für Radio-Button-Gruppe (horizontal flex)'],
['zh-radio-label',      'Styled Radio-Option (checked-State via :has())'],
['zh-page-title',       'Großer Seitentitel mit display-Font und text-stroke'],
['zh-page-lead',        'Beschreibungstext unter Seitentitel (max 48ch)'],
['zh-profile-avatar',   'Profilbild-Container rund, 120px — mit -lg Variante für 180px'],
['zh-profile-card',     'Profilkachel in der Mitglieder-Liste'],
['zh-vehicle-card',     'Fahrzeug-Kachel mit Hover-Effekt'],
['zh-vehicle-photo',    'Foto-Container 4:3 mit Hatch-Placeholder'],
['zh-btn-accent',       'Dritter Button-Typ: Accent-Farbe mit hellem Box-Shadow'],
['zh-hero-split',       'Hero-Variante mit Text links, Karte rechts (ab 1024px zweispaltig)'],
['zh-ticker',           'Scrollender Marquee-Streifen (dark bg, pausiert on hover)'],
['zh-teaser',           'Dreispaltiges Feature-Teaser-Grid'],
['zh-teaser-item',      'Einzelne Teaser-Zeile mit Icon, Text und Pfeil'],
['zh-clubs-grid',       'Vierspaltiges Grid für Club-Kacheln'],
['zh-club-card',        'Einzelne Club-Kachel mit Bild, Stamp und Body'],
['zh-roller-btn',       'Farbwechsel-Button (animiert durch alle 5 Paletten)'],
['skip-link',           'WCAG-Skiplink „Zum Hauptinhalt springen" (nur sichtbar bei Fokus)'],
```

---

## Hinweise zur Umsetzung

- Kein neuer Code, keine neuen Routen — nur Textinhalte in den beiden Seiten anpassen.
- Die Reihenfolge der Datenschutz-Abschnitte (1–7) beibehalten.
- Vor dem Commit: Datenschutzerklärung einmal vollständig im Browser lesen, ob alle
  Abschnitte noch kohärent klingen.
- Kein Commit ohne vorherige Kontrolle durch Martin.
