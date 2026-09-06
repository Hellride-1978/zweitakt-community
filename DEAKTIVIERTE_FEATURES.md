# Deaktivierte Features (Stand 2026-09)

## Warum

zweitakthoden.de wird von einer Community-Plattform zu einem schlanken,
regionalen Treffen-/Event-Kalender umgebaut (später auch für Oldtimer und
Motorrad allgemein). Die Seite hat ~170 Views / 30 Tage, überwiegend eigene
Admin-Besuche, und keine aktive Nutzerschaft. Das Pflegebudget liegt bei
2–5 Stunden im Monat. Alle Features, die laufende Moderation, Mail-Zustellung
oder DSGVO-Pflege verursachen, sind deshalb abgeschaltet.

## Wie

Zentrale Schalter: **`lib/features.js`**. Jedes Feature lässt sich durch
Umstellen des Flags auf `true` wieder aktivieren.

**Es wurde kein Code gelöscht.** Auch die Supabase-Tabellen, RLS-Policies und
Storage-Buckets sind unverändert vorhanden — die Daten sind also noch da. Der
Vorschlag zum tatsächlichen Löschen liegt als **`supabase/PROPOSED_migration_cleanup.sql`**
bereit und ist **nicht ausgeführt**.

Stellen, an denen ein Feature nur aus der UI ausgehängt wurde (ohne Flag-Abfrage),
sind im Code mit `[DEAKTIVIERT 2026-09: <feature>]` kommentiert. Suche danach:

```
grep -rn "DEAKTIVIERT 2026-09" app components lib
```

---

## Was ist abgeschaltet

| Feature | Flag | Route liefert | Code |
|---|---|---|---|
| Forum (Q&A, Votes, Tags, Bilder, Resend-Mails) | `forum` | `/forum/**` → **410 Gone** (`proxy.js`) | `app/forum/`, `components/forum/`, `app/api/forum/notify/` |
| Private Nachrichten | `messages` | `/messages/**` → 404 | `app/messages/`, `components/MessagesBadge.js`, `app/api/messages/send/` |
| Like-System | `likes` | — (nur UI) | `components/LikeButton.js` |
| Kommentare (Termine, Fahrzeuge) | `comments` | `/api/notify-comment` → 404 | `components/Comments.js` |
| Online-Status / Presence | `presence` | — (nur UI) | `components/PresenceUpdater.js` |
| Onboarding-Tour | `onboarding` | — (nur UI) | `components/OnboardingTour.js` |
| Newsletter (Anmeldung + Versand) | `newsletter` | `/admin/newsletter`, `/api/newsletter/subscribe`, `/api/admin/send-newsletter` → 404 | `components/NewsletterForm.js`, `components/NewsletterToggle.js`, `app/admin/newsletter/` |

### Warum das Forum 410 statt 404 liefert

`/forum` war öffentlich lesbar und ist bei Google indexiert. Ein 404 heißt für
Suchmaschinen „vielleicht später wieder da" — solche URLs bleiben monatelang im
Index. `410 Gone` heißt „dauerhaft entfernt" und führt deutlich schneller zur
De-Indexierung. Umgesetzt in **`proxy.js`** im Projekt-Root (in Next 16 der
Nachfolger von `middleware.js`, die alte Konvention ist deprecated). Die Antwort
ist eine eigenständige HTML-Seite mit Link auf `/events`, theme-aware und ohne
Abhängigkeit zum App-Router.

Der Layout-Guard in `app/forum/layout.js` bleibt als zweite Absicherung
bestehen. Steht `FEATURES.forum` wieder auf `true`, greift die 410-Antwort nicht
mehr — `proxy.js` liest dasselbe Flag.

`/messages` und `/admin/*` brauchen das nicht: sie lagen hinter dem Login und
standen nie im Index. Dort bleibt es beim 404.

### Bewusste Ausnahmen beim Newsletter

Diese Teile **bleiben aktiv**, weil in bereits versendeten Mails Links darauf
stehen, die nicht ins Leere laufen dürfen:

- `/api/newsletter/unsubscribe` + `/newsletter/abgemeldet` — Abmeldelinks aus
  versendeten Newslettern (§ 7 UWG, Art. 21 DSGVO)
- `/api/newsletter/unsubscribe-user` + der Newsletter-Block im Profil unter
  Einstellungen → Benachrichtigungen — der einzige UI-Weg zur Abmeldung.
  Der „Anmelden"-Button dort ist ausgehängt, „Abmelden" bleibt.
- `/api/newsletter/confirm` + `/newsletter/bestaetigt` — bereits versendete
  Double-Opt-in-Links. Ohne sie blieben betroffene Einträge dauerhaft auf
  `pending`. Neuanmeldungen sind trotzdem unmöglich, weil `subscribe` 404 liefert.

Auch die Tabelle `newsletter_subscribers` bleibt erhalten — sie ist der
Double-Opt-in-Nachweis.

---

## Nicht angefasst (soll so bleiben)

- Event-/Treffen-Feature (`/events`) inkl. Teilnahme und Termin-Mails
- Karte (Leaflet / Nominatim), `MemberMap*`, `EventMap`
- Admin-Statistiken (`/admin/statistiken`)
- Cookie-Consent, WCAG-Vorgaben, Farbpaletten
- Auth/Login, Profile, Bikes, Schrauberhalle
- Kontaktformular (`contact_messages`) — nicht mit den Privat-Nachrichten verwechseln
- Feedback-Widget, Changelog, Styleguide, Poster-Generator

---

## Bereits vorher zurückgebaut (Altlast)

**Clubs** existieren im Code nicht mehr: keine `/clubs`-Route, keine Komponente,
kein Query. Übrig sind nur CSS-Klassen (`app/globals.css`, im Styleguide bereits
als „ALTLAST" markiert) und die DB-Objekte `clubs`, `club_members`,
`rides.club_id` und der Bucket `clubs`.

Ebenfalls tot: die Tabelle `posts` („Community-Feed", `MIGRATION.sql`) — kein
Code greift darauf zu.

---

## Was beim Reaktivieren zu beachten ist

1. Flag in `lib/features.js` auf `true` setzen.
2. Die auskommentierten Imports und JSX-Blöcke wieder einhängen — sie sind alle
   mit `[DEAKTIVIERT 2026-09: <feature>]` markiert.
3. Bei `newsletter` und `forum` zusätzlich: die entsprechenden Nav-Einträge in
   `components/Nav.js` und die Footer-Links in `app/layout.js`.
4. Bei `forum`: die KPI-Kacheln in `app/admin/statistiken/page.js`.
5. Bei `forum`: den Toggle „Antworten auf meine Beiträge" in
   `components/ProfileSettings.js` (`TabNotifications`) samt `handleSave`
   und `SaveRow` — der Tab selbst ist noch da.
6. Bei `newsletter`: `handleSubscribe` und die Buttons „Anmelden" /
   „Erneut senden" in `components/NewsletterToggle.js`.
7. Bei `likes`: in `app/vehicles/VehiclesGrid.js` liegen Mount-Effect und
   `toggleLike` nur noch in der Git-History dieser Datei.

---

## Offene Punkte / noch zu entscheiden

- **Kalender ohne Login** ist das erklärte Ziel. Was daran hängt, steht unten
  unter „Weg zum loginlosen Kalender".
- **Datenschutzerklärung** (`app/datenschutz/page.js`) beschreibt weiterhin
  Forum, Kommentare, Likes, Privat-Nachrichten, Online-Status und Newsletter.
  Solange die Daten in der DB liegen, ist das nicht falsch. Nach der Löschung
  (Phase 3) muss die Seite überarbeitet werden — insbesondere der Resend-Abschnitt
  entfällt dann komplett.
- **`app/admin/changelog/page.js`** ist eine reine Historie und wurde bewusst
  nicht angefasst.
- **Startseiten-Texte** (`app/page.js`, Zeilen 13, 16, 121, 144) und die
  `keywords` im Root-Layout bewerben weiterhin das Forum („Moped-Forum",
  „im Forum diskutieren"). Das ist bewusst nicht angefasst worden — die
  Positionierung ändert sich mit dem Umbau zum Event-Kalender ohnehin und ist
  eine inhaltliche Entscheidung, keine technische.
- **Der Status-Punkt am Avatar** (`.zh-avatar::after`) ist per `content: none`
  abgeschaltet. Er hätte sonst dauerhaft grau („offline") an jedem Avatar
  gestanden.
- **Bug am Rande:** `components/LikeButton.js` schreibt `target_type = 'garage'`,
  der DB-CHECK in `MIGRATION_likes_comments.sql` erlaubt aber nur `'event'` und
  `'vehicle'`. Entweder wurde der Constraint später im Dashboard geändert oder
  Likes in der Schrauberhalle sind still fehlgeschlagen. Irrelevant, solange das
  Feature aus ist — vor einer Reaktivierung aber zu klären.

---

## Weg zum loginlosen Kalender (Skizze, nicht umgesetzt)

Ziel: Termine werden nur noch vom Betreiber gepflegt, Besucher lesen nur.
Was dafür anzufassen wäre:

1. **Event-Erstellung** (`/events/new`, `/events/[id]/edit`) hängt an
   `auth.uid()` — sowohl im UI-Guard als auch in den RLS-Policies von `rides`.
   Ohne Login bräuchte es entweder einen Admin-Login (bleibt) oder Pflege
   direkt im Supabase-Dashboard.
2. **`ride_participants`** (Teilnahme-Funktion) fällt ohne Login komplett weg.
   Betrifft: `EventActions`, Teilnehmerliste auf der Detailseite,
   `/api/notify-event-join`, `/api/notify-event-update`.
3. **`rides.creator_id`** (FK auf `profiles`) müsste nullable werden oder auf
   einen festen Betreiber-Account zeigen.
4. **Bild-Upload für Termine** (Bucket `event-images`) hat eine RLS-Policy auf
   `auth.uid()` im Ordnernamen — bräuchte eine Admin-only-Policy.
5. **`/profiles`, `/vehicles`, `/schrauberhalle`, `/profile/[id]`** wären ohne
   Login sinnlos und müssten mit abgeschaltet werden.
6. **Empfehlung:** Login für genau einen Admin-Account behalten, alles andere
   auf Lesen umstellen. Das ist deutlich weniger Arbeit als Auth komplett zu
   entfernen, und die Event-Pflege bleibt im Browser möglich.
