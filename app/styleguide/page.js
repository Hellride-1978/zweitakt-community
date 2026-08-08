'use client'

import { PALETTES } from '@/lib/palettes'
import DesktopLayout from '@/components/DesktopLayout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faMotorcycle, faLocationDot, faUsers, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 64 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--hairline)' }}>
      <h2 style={{ fontFamily: 'var(--display)', fontSize: 28, margin: 0 }}>{title}</h2>
    </div>
    {children}
  </section>
)

const Label = ({ children }) => (
  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
    {children}
  </div>
)

const Chip = ({ children }) => (
  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', background: 'var(--parchment)', border: '1px solid var(--hairline)', borderRadius: 6, padding: '3px 8px', color: 'var(--ink-soft)' }}>
    {children}
  </span>
)

const TECH = [
  {
    cat: 'Framework & Hosting',
    items: [
      { name: 'Next.js 16', desc: 'App Router, Server Components, dynamische Routen, generateMetadata', url: 'https://nextjs.org' },
      { name: 'Vercel', desc: 'Hosting, automatisches Deployment via GitHub Push, Edge Network', url: 'https://vercel.com' },
      { name: 'Tailwind CSS v4', desc: 'Utility-First-CSS als devDependency – wird via @import in globals.css eingebunden. Im Projekt hauptsächlich für Hilfsklassen wie flex, min-h-full etc. verwendet.', url: 'https://tailwindcss.com' },
    ],
  },
  {
    cat: 'Backend & Datenbank',
    items: [
      { name: 'Supabase', desc: 'PostgreSQL-Datenbank, Auth (E-Mail + Google OAuth), Row Level Security, Storage (Avatare & Fahrzeugfotos)', url: 'https://supabase.com' },
      { name: 'Supabase Storage', desc: 'Buckets: avatars (Profilbilder), vehicles (Fahrzeugfotos), garage (Schrauberhallen-Fotos), event-images (Termin-Titelbilder), forum-images (Bild-Anhänge in Forum-Posts und -Antworten), newsletter-images (Bilder in Newsletter-Mailings) – öffentliche Bild-URLs mit Cache-Busting', url: null },
    ],
  },
  {
    cat: 'E-Mail',
    items: [
      { name: 'Resend', desc: 'Transaktions-E-Mails an User: Registrierungsbestätigung (Supabase Auth) + Forum-Antwortbenachrichtigungen (an Thread-Autor und alle vorherigen Antwortenden, mit max. 200-Zeichen-Vorschau) — versendet von noreply@send.zweitakthoden.de', url: 'https://resend.com' },
      { name: 'Nodemailer / SMTP', desc: 'Interne Admin-Benachrichtigungen via SMTP: neues Mitglied, neuer Termin, neues Bike — versendet an info@zweitakthoden.de. User-Benachrichtigungen: Privat-Nachrichten an Empfänger, Newsletter an Abonnenten.', url: null },
      { name: 'Abmelde-Tokens', desc: 'Jeder Newsletter-Empfänger bekommt einen personalisierten Abmelde-Link. Der Token ist eine zufällige UUID, die beim Anlegen des Abonnements in der Spalte unsubscribe_token gespeichert wird — kein JWT, keine Signatur. Der Aufruf von /api/newsletter/unsubscribe?token=… setzt den Status auf „abgemeldet".', url: null },
    ],
  },
  {
    cat: 'Karten & Geocoding',
    items: [
      { name: 'OpenStreetMap / Nominatim', desc: 'Geocoding in beide Richtungen: PLZ/Ort → Koordinaten und Koordinaten → Adresse. Teils serverseitig über /api/geocode und lib/geocoding.js, teils direkt aus dem Browser (MembersGrid, GarageGrid, EventsList) — dabei geht die IP des Besuchers an die OSM Foundation.', url: 'https://openstreetmap.org' },
      { name: 'openPLZ API', desc: 'Löst eine eingetippte PLZ live in den Ortsnamen auf (debounced, 450 ms) — direkt aus dem Browser in ProfileSettings und /profile/edit. Unterstützt DE, AT und CH.', url: 'https://www.openplzapi.org' },
      { name: 'Leaflet / react-leaflet', desc: 'Interaktive Karten – MemberMapSplit auf der Startseite (Schrauber-Karte mit Umkreissuche) und EventMap auf Termindetailseiten. Marker-Icons kommen aus dem npm-Paket, nicht von einem CDN.', url: 'https://leafletjs.com' },
      { name: 'Kachel-Anbieter', desc: 'Zwei verschiedene: EventMap und MemberMap nutzen tile.openstreetmap.org, MemberMapSplit auf der Startseite dagegen CARTO (basemaps.cartocdn.com, Variante light_all). Termindetailseiten binden zusätzlich 9 statische OSM-Kacheln als img-Tags ein.', url: 'https://carto.com' },
    ],
  },
  {
    cat: 'Fonts & Icons',
    items: [
      { name: 'Google Fonts', desc: 'Boogaloo (Display), DM Sans (Text), DM Mono (Mono) — via next/font/google. Fonts werden beim Build heruntergeladen und self-hosted ausgeliefert — keine Runtime-Requests an Google-Server, kein Datenschutzproblem.', url: null },
      { name: 'Font Awesome 7', desc: 'Icons über @fortawesome/react-fontawesome — nur solid + brands', url: 'https://fontawesome.com' },
    ],
  },
  {
    cat: 'Stylesheets',
    items: [
      { name: 'globals.css', desc: 'Haupt-Stylesheet: Design Tokens (:root), alle zh-/zd-Klassen, Nav, Hero, Forum, Messages, Onboarding, Newsletter, Feedback-Widget, Desktop Shell. Importiert Tailwind CSS v4.', url: null },
      { name: 'forum.css', desc: 'Eigenständiges Stylesheet für das Forum (app/forum/forum.css, 517 Zeilen): Post-Karten, Antwort-Threads, Vote-Buttons, Bild-Anhänge, Tag-Pills, Lade-Skeletons. Wird direkt in app/forum/layout.js importiert.', url: null },
      { name: 'schrauberhalle.css', desc: 'Drittes Stylesheet (app/schrauberhalle/schrauberhalle.css, 48 Zeilen): enthält ausschließlich die .skill-badge-Klasse und ihre Zustände. Wird in app/schrauberhalle/GarageGrid.js importiert.', url: null },
    ],
  },
  {
    cat: 'Analytics',
    items: [
      { name: 'Vercel Analytics', desc: 'Cookieloser Pageview-Tracker von Vercel — keine IP-Speicherung, keine Nutzerprofile, DSGVO-konform. Ergänzt durch eigenes Tracking (page_views-Tabelle in Supabase) für Admin-Statistiken.', url: 'https://vercel.com/docs/analytics' },
      { name: 'Vercel Speed Insights', desc: 'Core Web Vitals Monitoring (LCP, FID, CLS) — cookielos, vollständig anonymisiert', url: 'https://vercel.com/docs/speed-insights' },
    ],
  },
  {
    cat: 'SEO',
    items: [
      { name: 'Sitemap.xml', desc: 'Dynamisch generiert via app/sitemap.js — enthält alle statischen Seiten + Events, Bikes und Profile aus Supabase. Erreichbar unter /sitemap.xml', url: null },
      { name: 'Schema.org JSON-LD', desc: 'Organization-Schema auf der Startseite, Event-Schema auf allen Termindetailseiten — macht Rich Snippets in Google möglich', url: 'https://schema.org' },
      { name: 'Google Search Console', desc: 'Verifiziert via HTML-Datei in /public. Sitemap dort eingetragen für schnellere Indexierung.', url: null },
      { name: 'Keyword-Optimierung', desc: 'Page-spezifische Metadata (title, description, keywords) — Ziel-Keywords: Moped Forum, Mofa Community, Simson Treffen, Zweitakt schrauben Deutschland', url: null },
    ],
  },
  {
    cat: 'Features & Extras',
    items: [
      { name: 'Color Theming', desc: '5 Farbpaletten (Blau, Rosa, Grün, Amber, Lila) — wählbar via ThemeToggle in der Nav, localStorage-persistent, Flash-frei durch inline <script> in <head> der layout.js (setzt CSS-Custom-Properties bevor React hydratisiert). Kein globales Dark/Light-Theme vorhanden — die Seite ist immer hell; „zd-card dark" ist eine komponentenlokale CSS-Variante (ink-Hintergrund) für einzelne Karten, kein seitenweiter Modus.', url: null },
      { name: 'Image Crop', desc: 'react-image-crop — Zuschneiden von Avataren (rund) und Fahrzeugfotos (4:3) direkt im Browser. Implementiert über components/CropModal.js (gemeinsames Modal für Profil- und Fahrzeug-Upload).', url: null },
      { name: 'Password Strength', desc: 'Live-Passwortprüfung mit 4 Regeln + Stärkebalken auf Registrierung und Passwort-Reset', url: null },
      { name: 'Account Deletion', desc: 'Zweistufige Bestätigung. /api/delete-account löscht via Service Role Key: Profil (daran hängen per ON DELETE CASCADE Fahrzeuge, Teilnahmen, Termine, Kommentare, Likes, Nachrichten, Forum-Beiträge und Schrauberhalle), sämtliche Storage-Ordner des Users in allen fünf Buckets sowie den Auth-User. Feedback-Einträge werden anonymisiert statt gelöscht. Erreichbar aus ProfileSettings und /profile/edit.', url: null },
      { name: 'Onboarding Flow', desc: 'Neue User werden nach Login/OAuth-Callback zu /profile/edit weitergeleitet wenn kein Name gesetzt ist', url: null },
      { name: 'OG Meta Tags & JSON-LD', desc: 'Dynamische OpenGraph-Tags + Schema.org JSON-LD für Start-, Termin- und Profilseiten via generateMetadata und inline script', url: null },
      { name: 'Like-System', desc: 'Likes auf Terminen, Profilen und Fahrzeugen — Supabase likes-Tabelle (target_type + target_id), optimistisches UI, Login-Prompt für Gäste', url: null },
      { name: 'Privat-Nachrichten', desc: 'Inbox mit thread-basierter Ansicht, Ungelesen-Badge in Desktop-Nav und Mobile-Burger-Menü, E-Mail-Benachrichtigung bei neuer Nachricht via SMTP', url: null },
      { name: 'Kontaktformular', desc: 'DSGVO-Checkbox, serverseitige Validierung, Speicherung in contact_messages-Tabelle (Supabase, RLS), nur auf Startseite', url: null },
      { name: 'Schrauberhalle', desc: 'Öffentliches Werkstattprofil: Beschreibung, bis zu 5 Fotos (Supabase Storage, Bucket: garage), Schrauber-Skills als Tags – erreichbar unter /schrauberhalle. Admin-Benachrichtigung bei neuer Halle per SMTP.', url: null },
      { name: 'Kommentar-System', desc: 'Kommentare auf Terminen und Fahrzeugen – Supabase comments-Tabelle (target_type + target_id), nur für eingeloggte Mitglieder. E-Mail-Benachrichtigung an Ersteller und Teilnehmer via SMTP.', url: null },
      { name: 'Präsenz / Online-Status', desc: 'PresenceUpdater aktualisiert last_seen alle 5 Minuten in profiles – zeigt Online-Indikator (grüner Punkt) auf Profilkacheln. Kein Echtzeit-Kanal, nur Timestamp-basiert.', url: null },
      { name: 'Newsletter', desc: 'Double-Opt-in Newsletter: Anmeldung via NewsletterForm (Footer) und NewsletterToggle (Profil-Settings), Bestätigungs-Mail + Willkommens-Mail via SMTP. Admin-Versand unter /admin/newsletter mit Live-Vorschau, Vorschau-Mail-Funktion und personalisiertem Abmelde-Link pro Empfänger. Abmeldung per Token-Link in jeder Mail oder über Account-Bereich.', url: null },
      { name: 'Admin-Statistiken', desc: 'Dashboard unter /admin/statistiken: Seitenaufrufe (heute, 7 Tage, 30 Tage), Balkendiagramm, Top-Seiten, Geräte-Aufschlüsselung, Herkunftsländer. Newsletter-KPIs (aktiv, abgemeldet, ausstehend). Community-Zahlen (Mitglieder, Forum, Feedbacks). Eigenes Tracking via page_views-Tabelle (Supabase) + PageTracker-Komponente (sendBeacon).', url: null },
      { name: 'Admin-Benachrichtigungen', desc: 'Automatische E-Mail an info@zweitakthoden.de bei: neuem Mitglied, neuem Termin, neuem Bike, neuer Nachricht, neuer Schrauberhalle – jeweils per SMTP-Route. User-Benachrichtigungen: Kommentar auf eigenem Termin/Bike, Termin-Beitritt, Termin-Aktualisierung für Teilnehmer.', url: null },
      { name: 'Feedback-Widget', desc: 'Floating-Button (unten rechts), speichert Feedback in feedbacks-Tabelle, Admin-Übersicht unter /admin/feedback', url: null },
      { name: 'Onboarding-Tour', desc: 'Schritt-für-Schritt Tour für neue User nach erster Anmeldung — localStorage-Trigger', url: null },
      { name: 'Cookie Consent', desc: 'Minimaler Banner (nur technisch notwendige Cookies + localStorage), einmalig per localStorage dismissed', url: null },
      { name: 'WCAG 2.1 AA', desc: 'Barrierefreiheit: Kontrastprüfung (4.5:1 normal, 3:1 groß), aria-Labels, Skip-Link, semantische Heading-Reihenfolge, aria-hidden für dekorative Elemente', url: null },
      { name: 'Forum — Die Anlaufstelle', desc: 'Q&A-Forum mit Posts, Antworten, optionalen Bild-Anhängen (Supabase Storage, Bucket: forum-images), Upvote/Downvote-System, Tag-Filterung (Marken-Dropdown + Themen-Pills), Server Actions mit Zod-Validierung, E-Mail-Benachrichtigung bei Antworten via Resend', url: null },
      { name: 'PLZ-Nudge-Banner', desc: 'Modal-Nudge (PlzNudgeBanner) für eingeloggte User ohne hinterlegte PLZ — erscheint seitenübergreifend, außer auf der Profilseite. Kann für 7 Tage gesnoozed werden (localStorage: zh-plz-nudge-v3-snoozed). Verschwindet dauerhaft sobald eine PLZ gespeichert ist.', url: null },
      { name: 'Avatar-Lightbox', desc: 'AvatarLightbox-Komponente: Klick auf ein Profilbild öffnet eine Vollbild-Overlay-Ansicht des Avatars. Nutzt die bestehende .zh-avatar-Klasse, kein eigenes Stylesheet. Kein Modal-Fokus-Trap — Klick auf Overlay schließt.', url: null },
      { name: 'Breadcrumb', desc: 'Breadcrumb-Navigationsleiste oben auf Desktop-Seiten (über DesktopLayout via crumb-Prop). Zeigt: Haus-Chip → Section-Chip → aktueller-Seiten-Chip. Nutzt inline Styles, keine eigene CSS-Klasse. Rendert nur wenn eine bekannte Section (events, vehicles, profiles, messages, schrauberhalle, forum) erkannt wird.', url: null },
      { name: 'Admin-Changelog', desc: 'Changelog-Übersicht aller Features und Fixes unter /admin/changelog — nur für Admin sichtbar. Einträge nach Datum oder Kategorie sortierbar, farblich nach Kategorie codiert (Farb-Legende ein-/ausblendbar). Enthält Todo-Liste für ausstehende SQL-Migrationen. Statische Datenliste direkt im JS, kein API-Aufruf.', url: null },
    ],
  },
]

const LAST_UPDATED = '08.08.2026'

const BASE_COLORS = [
  { name: '--ink',               desc: 'Text (dunkel)' },
  { name: '--ink-soft',          desc: 'Text (weich)' },
  { name: '--ink-muted',         desc: 'Text (gedimmt)' },
  { name: '--cream',             desc: 'Hintergrund' },
  { name: '--parchment',         desc: 'Karten-BG' },
  { name: '--hairline',          desc: 'Trennlinien' },
  { name: '--cream-2',           desc: 'Leicht gedimmter Hintergrund (Karten, Inputs)' },
  { name: '--ink-faint',         desc: 'Hauchdünne Trennlinie / Hover-Fläche' },
  { name: '--accent',             desc: 'Primäre Akzentfarbe (palette-variabel) — Button-BG, Highlights, aktive Zustände' },
  { name: '--accent-2',           desc: 'Zweite Akzentstufe (palette-variabel) — hellere Variante, z.&nbsp;B. Hero-Schriftzug Zeile 2' },
  { name: '--accent-3',           desc: 'Dritte Akzentstufe (palette-variabel) — sehr hell, z.&nbsp;B. Hero-Schriftzug Zeile 1' },
  { name: '--accent-ink',         desc: 'Dunkle Akzentfarbe (palette-variabel) — Links, Icons, Nav-Logo-Span' },
  { name: '--accent-text',        desc: 'Akzentfarbe für Fließtext-Links — statisch, wird beim Palettenwechsel NICHT aktualisiert (immer #1a6080)' },
  { name: '--accent-accessible', desc: 'Kontraststarke Akzentfarbe für Links auf hellem Grund (WCAG AA) — palette-variabel, wird mit dem Farbschema gesetzt' },
  { name: '--accent-hot',        desc: 'Aktiv- / Hover-Farbe in der Navigation' },
  { name: '--accent-hot-2',      desc: 'Hellere Variante von --accent-hot' },
  { name: '--accent-hot-3',      desc: 'Sehr helle Variante von --accent-hot' },
  { name: '--shadow',            desc: 'Box-Shadow-Farbe' },
  { name: '--background',        desc: 'Alias für --cream — Tailwind-Theme-Bridge (@theme inline)' },
  { name: '--foreground',        desc: 'Alias für --ink — Tailwind-Theme-Bridge (@theme inline)' },
]

export default function StyleguidePage() {
  return (
    <DesktopLayout crumb="Style Guide">
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 0 80px' }}>

        {/* Titel */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            Design System
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1, marginBottom: 16 }}>
            Style Guide.
          </h1>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--ink-soft)', maxWidth: 560, lineHeight: 1.6 }}>
            Farben, Typografie, Komponenten und der vollständige Tech-Stack von Zweitakthoden.
          </p>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 16 }}>
            Zuletzt aktualisiert: {LAST_UPDATED}
          </div>
        </div>

        {/* ── TECH STACK ── */}
        <Section title="Tech Stack">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {TECH.map((group) => (
              <div key={group.cat}>
                <Label>{group.cat}</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {group.items.map((item) => (
                    <div key={item.name} className="zd-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--display)', fontSize: 18 }}>{item.name}</span>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--accent)', borderBottom: '1px solid var(--accent)' }}>
                              Docs ↗
                            </a>
                          )}
                        </div>
                        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── FARBPALETTEN ── */}
        <Section title="Farbpaletten">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {Object.entries(PALETTES).map(([key, p]) => (
              <div key={key}>
                <Label>{p.label} {key === 'blue' ? '— Standard' : ''}</Label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'accent', value: p.accent },
                    { label: 'accent-2', value: p.accent2 },
                    { label: 'accent-3', value: p.accent3 },
                    { label: 'accent-ink', value: p.accentInk },
                    { label: 'accent-accessible', value: p.accentAccessible },
                  ].map((c) => (
                    <div key={c.label} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 100 }}>
                      <div style={{ width: '100%', height: 48, borderRadius: 10, background: c.value, border: '1.5px solid var(--hairline)' }} />
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                        --{c.label}
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-soft)' }}>{c.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── BASIS-FARBEN ── */}
        <Section title="Basis-Farben">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BASE_COLORS.map((c) => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
                <div style={{ width: '100%', height: 48, borderRadius: 10, border: '1.5px solid var(--hairline)', background: `var(${c.name}), linear-gradient(45deg, #ccc 25%, transparent 25%) 0 0 / 10px 10px, linear-gradient(-45deg, #ccc 25%, transparent 25%) 0 5px / 10px 10px, linear-gradient(45deg, transparent 75%, #ccc 75%) 5px -5px / 10px 10px, linear-gradient(-45deg, transparent 75%, #ccc 75%) -5px 0 / 10px 10px, white` }} />
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                  {c.name}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-soft)' }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── TYPOGRAFIE ── */}
        <Section title="Typografie">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            <div>
              <Label>Display — Boogaloo (var(--display))</Label>
              <div className="zd-card" style={{ padding: '24px 28px' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 52, lineHeight: 1, color: 'var(--ink)', marginBottom: 8 }}>
                  Zweitakthoden
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 32, color: 'var(--accent)' }}>Garage statt Gallery.</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 20, color: 'var(--ink-muted)', marginTop: 4 }}>Pageheader · Karten-Titel · Nav-Logo</div>
              </div>
            </div>

            <div>
              <Label>Sans — DM Sans (var(--sans))</Label>
              <div className="zd-card" style={{ padding: '24px 28px' }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Weil viele Zweitakt-Fans alleine vor sich hin schrauben.</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 6 }}>
                  Fließtext, Beschreibungen, Formularfelder. Gewichte: 300 · 400 · 500 · 600.
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-muted)' }}>Klein — Meta, Hilfetext, Labels</div>
              </div>
            </div>

            <div>
              <Label>Mono — DM Mono (var(--mono))</Label>
              <div className="zd-card" style={{ padding: '24px 28px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
                  Ausfahrten · Schrauber · 404
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                  Section-Marks · Labels · Badges · Status-Chips
                </div>
              </div>
            </div>

          </div>
        </Section>

        {/* ── BUTTONS ── */}
        <Section title="Buttons">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <Label>zh-btn — Primär (schwarz)</Label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="zh-btn">Dabei sein <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} /></button>
                <button className="zh-btn" disabled style={{ opacity: 0.5 }}>Disabled</button>
              </div>
            </div>
            <div>
              <Label>zh-btn zh-btn-outline — Sekundär</Label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="zh-btn zh-btn-outline">Abbrechen</button>
                <button className="zh-btn zh-btn-outline">Bearbeiten <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} /></button>
              </div>
            </div>
            <div>
              <Label>zh-btn-accent — Accent-Farbe mit hellem Box-Shadow</Label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="zh-btn-accent">Jetzt mitmachen <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} /></button>
                <button className="zh-btn-accent" disabled style={{ opacity: 0.5 }}>Disabled</button>
              </div>
            </div>
            <div>
              <Label>zd-btn accent — Dark cards</Label>
              <div style={{ background: 'var(--ink)', padding: '20px 24px', borderRadius: 14, display: 'inline-flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#" className="zd-btn accent" style={{ display: 'inline-flex' }}>Termin erstellen →</a>
              </div>
            </div>
          </div>
        </Section>

        {/* ── KARTEN ── */}
        <Section title="Karten">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <Label>zh-card — Standard</Label>
              <div className="zh-card">
                <div style={{ fontFamily: 'var(--display)', fontSize: 20, marginBottom: 8 }}>Simson S51</div>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
                  Baujahr 1985 · 50 cc · Restomod
                </p>
              </div>
            </div>
            <div>
              <Label>zd-card — Leicht erhöht</Label>
              <div className="zd-card">
                <div className="zd-mono accent" style={{ marginBottom: 8 }}>Schrauber</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 20 }}>Max Müller</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginTop: 6 }}>
                  Berlin · dabei seit März 2026
                </div>
              </div>
            </div>
            <div>
              <Label>zd-card dark — Invertiert</Label>
              <div className="zd-card dark">
                <div className="zd-mono" style={{ color: 'var(--accent-3)', marginBottom: 6 }}>Neu dabei?</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.0, letterSpacing: 0.3 }}>
                  erstell deinen<br />eigenen termin.
                </div>
                <a href="#" className="zd-btn accent" style={{ marginTop: 12, padding: '8px 14px', fontSize: 15, display: 'inline-flex' }}>
                  Los geht's →
                </a>
              </div>
            </div>
          </div>
        </Section>

        {/* ── FORMULAR ── */}
        <Section title="Formular-Elemente">
          <div className="zh-card" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="zh-label">Name</label>
                <input className="zh-input" placeholder="z.B. Max Müller" readOnly />
              </div>
              <div>
                <label className="zh-label">Beschreibung</label>
                <textarea className="zh-input" rows={3} placeholder="Erzähl etwas…" readOnly style={{ resize: 'none' }} />
              </div>
              <div>
                <label className="zh-label">Fehler-Zustand</label>
                <div className="zh-error" role="alert">Diese E-Mail-Adresse ist bereits registriert.</div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── PILLS & BADGES ── */}
        <Section title="Pills & Badges">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="zh-pill" style={{ background: 'var(--accent)', color: 'var(--ink)', border: '1px solid var(--ink)' }}>BJ 1985</span>
            <span className="zh-pill" style={{ background: 'var(--ink)', color: 'var(--cream)' }}>50 cc</span>
            <span className="zh-pill" style={{ background: 'color-mix(in oklab, #22c55e 14%, var(--cream))', color: '#16a34a', border: '1px solid #22c55e' }}>✓ Dabei</span>
            <span className="zh-pill" style={{ background: 'color-mix(in oklab, #ef4444 10%, var(--cream))', color: '#ef4444', border: '1px solid #ef4444' }}>Ausgebucht</span>
            <Chip>TXT-Record</Chip>
            <Chip>verified</Chip>
          </div>
        </Section>

        {/* ── SPACING & RADIUS ── */}
        <Section title="Spacing & Radius">
          <div className="zd-card" style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 2 }}>
            {[
              ['--gutter',  'Seitlicher Innenabstand der Seiten'],
              ['--nav-h',   'Höhe der Navigation (für top-offset)'],
              ['--hairline','Rahmenfarbe feine Trennlinien'],
            ].map(([token, desc]) => (
              <div key={token} style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--hairline)', padding: '10px 0' }}>
                <code style={{ color: 'var(--accent)', minWidth: 160 }}>{token}</code>
                <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--sans)', fontSize: 13 }}>{desc}</span>
              </div>
            ))}
            {[
              ['Radius klein',  '8–10px',  'Chips, Badges, kleine Buttons'],
              ['Radius mittel', '12–14px', 'Karten, Inputs, Buttons'],
              ['Radius groß',   '18–24px', 'Hero-Cards, Modals'],
            ].map(([label, val, desc]) => (
              <div key={label} style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--hairline)', padding: '10px 0' }}>
                <code style={{ color: 'var(--accent)', minWidth: 160 }}>{label}</code>
                <span style={{ fontWeight: 600, minWidth: 80 }}>{val}</span>
                <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--sans)', fontSize: 13 }}>{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CSS KLASSEN ── */}
        <Section title="CSS-Klassen Übersicht">
          <div className="zd-card">
            {[
              ['zh-page',         'Seiten-Wrapper mit top-padding für Nav'],
              ['zh-page-inner',   'Zentrierter Content-Bereich, max 1100px'],
              ['zh-page-inner-sm','Schmaler Content-Bereich, max 560px'],
              ['zh-card',         'Standard-Karte: weiß, Border, Radius 18px'],
              ['zd-card',         'Leicht erhöhte Karte mit Box-Shadow'],
              ['zd-card dark',    'Invertierte Karte (ink-Hintergrund)'],
              ['zh-btn',          'Primär-Button (schwarz)'],
              ['zh-btn-outline',  'Sekundär-Button (transparent, Border)'],
              ['zd-btn accent',   'Accent-Button für dark cards'],
              ['zh-input',        'Text-Input / Textarea'],
              ['zh-label',        'Form-Label (mono, uppercase)'],
              ['zh-error',        'Fehler-Box (rot)'],
              ['zh-pill',         'Kleines Badge / Tag (border-radius: 999px)'],
              ['zh-chip',         'Chip-Badge: ähnlich wie zh-pill, aber eckiger (border-radius: 6px) — Variante .accent für farbigen Hintergrund'],
              ['zh-avatar',       'Runder Avatar-Container'],
              ['zh-nav',          'Fixierte Navigation (position: fixed, z-index 1000, backdrop-blur)'],
              ['zh-nav-inner',    'Zentrierter Nav-Container (max 1280px, flex, justify-content: space-between)'],
              ['zh-nav-logo',     'Nav-Logo (Boogaloo, text-stroke, accent-Span für farbigen Teil)'],
              ['zh-nav-links',    'Zentrierte Link-Liste (Desktop, absolute positioniert)'],
              ['zh-nav-dropdown-wrap', 'Wrapper für Community-Dropdown (position: relative)'],
              ['zh-nav-dropdown-trigger', 'Button zum Öffnen des Dropdowns (Mono, + .open state)'],
              ['zh-nav-chevron',  'Pfeil-Icon im Dropdown-Trigger (rotiert bei .open)'],
              ['zh-nav-dropdown', 'Dropdown-Panel (opacity-Transition, + .open state)'],
              ['zh-nav-right',    'Rechte Seite der Nav (Icons + CTA, margin-left: auto)'],
              ['zh-nav-icon-link','Icon-Button in Nav-Right (Nachrichten-Badge etc., 36×36px rund)'],
              ['zh-nav-cta',     'CTA-Pill rechts in Nav (schwarz, Mono-Text, Hover → accent)'],
              ['zh-nav-cta-dot', 'Blinkender grüner Punkt im Nav-CTA (animation zh-blink)'],
              ['zh-footer',              'Footer-Bereich (dark BG, volle Breite)'],
              ['zh-footer-inner',        'Zentrierter Footer-Content-Wrapper (max 1280px, Padding via --gutter)'],
              ['zh-footer-top',          'Oberer Footer-Bereich: Brand-Spalte + Link-Spalten (flex, gap, responsive)'],
              ['zh-footer-brand',        'Linke Footer-Spalte: Logo + Newsletter-Form'],
              ['zh-footer-logo',         'Footer-Logo (Boogaloo, weiß, farbiger Span via .zh-footer-logo span)'],
              ['zh-footer-cols',         'Wrapper für die drei Link-Spalten rechts (flex, gap)'],
              ['zh-footer-col',          'Einzelne Link-Spalte (Community / Kontakt / Rechtliches)'],
              ['zh-footer-col-label',    'Spalten-Überschrift (Mono, uppercase, muted)'],
              ['zh-footer-links',        'Link-Liste der Spalte (list-style: none, flex-column, gap)'],
              ['zh-footer-bottom',       'Unterer Footer-Streifen: Copyright + Credit (flex, space-between)'],
              ['zh-footer-copy',         'Copyright- und Credit-Text im Footer-Bottom (Mono, klein)'],
              ['zh-footer-credit',       'Link auf delavega-design.de im Footer-Bottom (Hover → accent-text)'],
              ['zd-mono',         'Mono-Typografie-Helfer'],
              ['zd-h1 / zd-h2',   'Display-Überschriften mit em-Italic'],
              ['zh-section-mark', 'Abschnitts-Markierung (Pill + Text)'],
              ['zh-members-grid', '4-Spalten Member-Karten-Grid'],
              ['zh-member-card',  'Einzelne Member-Kachel'],
              ['zh-bubble-stack',   'Hero-Schriftzug (animiert, 3 Zeilen)'],
              ['zh-hero-stats',     'Stats-Leiste im Hero (klickbare Links)'],
              ['zh-hero-actions',   'Wrapper für CTA-Buttons im Hero (flex, opacity-Einstiegsanimation)'],
              ['zh-stat / zh-stat-link', 'Einzelne Stat-Zahl + Label, als Link'],
              ['zd-ride',           'Event-Zeile mit Datum-Block'],
              ['zd-bike',           'Fahrzeug-Kachel in Garage-Grid'],
              ['msg-badge',         'Ungelesen-Zahl-Badge (rot, rund)'],
              ['zh-contact-form',   'Kontaktformular-Wrapper (max 680px, zentriert)'],
              ['forum-page',        'Forum-Seiten-Wrapper (cream BG, Padding)'],
              ['forum-card',        'Forum-Beitragskarte (Border, Hover-Shadow)'],
              ['forum-submit-btn',  'Forum-CTA-Button (Boogaloo, accent BG, Shadow-Lift)'],
              ['forum-tag-btn',     'Forum-Themen-Pill (Border, Shadow-Lift, active = accent)'],
              ['forum-vote-btn',    'Forum-Vote-Button (👍/👎, Lift-Hover, active states)'],
              ['forum-action-btn',  'Forum-Aktion-Button (Bearbeiten / Löschen)'],
              ['skill-badge',       'Schrauberhalle Skill-Pill (Border, Shadow-Lift, active = accent)'],
              ['zh-hero',           'Hero-Sektion auf der Startseite'],
              ['zh-hero-tagline',   'Hero-Fließtext mit max-width und line-height'],
              ['zh-preview',        'Abschnitts-Wrapper für Bikes/Events/Members-Previews'],
              ['zh-preview-head',   'Preview-Kopf mit h2 und "Alle →" Link'],
              ['zh-bikes-grid',     'Responsives Bike-Kachel-Grid (Startseite)'],
              ['zh-bike-card',      'Einzelne Bike-Kachel mit Bild, Body und Footer'],
              ['zh-credo',          'Dreispaltige Credo-Sektion'],
              ['zh-credo-card',     'Einzelne Credo-Kachel mit num, h3 und kicker'],
              ['zh-credo-accordion','Akkordeon-Variante der Credo-Sektion (stacked, border-separated)'],
              ['zh-credo-acc-item', 'Einzelner Akkordeon-Eintrag (+ .open für geöffneten Zustand)'],
              ['zh-credo-acc-trigger','Klickbarer Button-Header des Akkordeon-Eintrags'],
              ['acc-num',           'Eyebrow-Label im Akkordeon-Trigger (Mono, uppercase, muted)'],
              ['acc-title',         'Display-Titel im Akkordeon-Trigger (h3, Boogaloo)'],
              ['zh-credo-acc-icon', 'Plus/Minus-Icon im Trigger (rotiert 45° bei .open)'],
              ['zh-credo-acc-body', 'Collapsible Content-Bereich (max-height Transition)'],
              ['zh-credo-acc-inner','Inner Padding des ausgeklappten Inhalts (linksbündig mit Titel)'],
              ['events-card-grid',  'Responsives Event-Karten-Grid (auto-fill, 280px Spalten; auf Mobile 2-spaltig)'],
              ['ec / ec-head / ec-body', 'Event-Card und ihre Bereiche (ec-head: Datum-Block dunkel; ec-body: Content-Bereich)'],
              ['zh-attendees',      'Teilnehmer-Avatar-Stack: überlagernde Avatare (margin-left: -8px) + Zähler-Chip'],
              ['zh-post-card',      'Forum-Post-Kachel in der Übersicht (Border, Hover-Shadow — separate Klasse neben forum-card)'],
              ['zh-club-list-card', 'ALTLAST — Club-Kachel in der Listen-Ansicht (kompakter als zh-club-card). Siehe zh-clubs-grid'],
              ['detail-grid',       'Zweispaltiges Layout für Event-/Fahrzeugdetailseiten'],
              ['zh-mobile-menu',    'Mobile Navigationsoverlay'],
              ['zh-burger',         'Burger-Button mit Icon-Wrap und Label'],
              ['zh-card-sm',        'Kleinere Karten-Variante (border-radius 14px, kompakteres Padding)'],
              ['zh-badge',          'Mono-Badge (unterscheidet sich von zh-pill: kein border-radius 999px)'],
              ['zh-filter-btn',     'Filter-Toggle-Button (Pill-Form, aktiver Zustand via .active)'],
              ['zh-radio-group',    'Wrapper für Radio-Button-Gruppe (horizontal flex)'],
              ['zh-radio-label',    'Styled Radio-Option (checked-State via :has())'],
              ['zh-page-title',     'Großer Seitentitel mit display-Font und text-stroke'],
              ['zh-page-lead',      'Beschreibungstext unter Seitentitel (max 48ch)'],
              ['zh-profile-avatar', 'Profilbild-Container rund, 120px – mit -lg Variante für 180px'],
              ['zh-profile-card',   'Profilkachel in der Mitglieder-Liste'],
              ['zh-vehicle-card',   'Fahrzeug-Kachel mit Hover-Effekt'],
              ['zh-vehicle-photo',  'Foto-Container 4:3 mit Hatch-Placeholder'],
              ['zh-btn-accent',     'Dritter Button-Typ: Accent-Farbe mit hellem Box-Shadow'],
              ['zh-hero-split',     'Hero-Variante mit Text links, Karte rechts (ab 1024px zweispaltig)'],
              ['zh-hero-text',      'Linke Text-Spalte in zh-hero-split (45% Breite, flex-column, align-items: flex-start)'],
              ['zh-hero-map-col',   'Rechte Karten-Spalte in zh-hero-split (flex: 1 1 0, min-width: 0, align-self: center)'],
              ['zh-ticker',         'Scrollender Marquee-Streifen (dark bg, pausiert on hover)'],
              ['zh-ticker-inner',   'Innerer Marquee-Container in zh-ticker (display: inline-flex, animation zh-ticker 36s linear)'],
              ['zh-ticker-item',    'Einzelnes Ticker-Element (Boogaloo, 22px, letter-spacing 2px; + .hot-Variante für weiße Farbe)'],
              ['zh-teaser',         'Dreispaltiges Feature-Teaser-Grid'],
              ['zh-teaser-item',    'Einzelne Teaser-Zeile mit Icon, Text und Pfeil'],
              ['zh-clubs-grid',     'ALTLAST — Vierspaltiges Grid für Club-Kacheln. Das Club-Feature ist zurückgebaut: keine /clubs-Route, kein JS nutzt die Klasse. Tabellen clubs + club_members und der clubs-Bucket existieren aber noch (MIGRATION.sql)'],
              ['zh-club-card',      'ALTLAST — Einzelne Club-Kachel mit Bild, Stamp und Body. Siehe zh-clubs-grid'],
              ['zh-roller-btn',     'Farbwechsel-Button (animiert durch alle 5 Paletten)'],
              ['skip-link',         'WCAG-Skiplink „Zum Hauptinhalt springen" (nur sichtbar bei Fokus)'],
              ['feed-col',              'Flex-Spalten-Wrapper für Feed-Seiten (Forum, Datenschutz etc.)'],
              ['feed-head',             'Kopfzeile einer Feed-Seite mit Titel und optionalen Filtern'],
              ['feed-grid',             '2-spaltiges Feed-Layout mit Rail (1fr + 320px)'],
              ['feed-rail',             'Rechte Rail-Spalte in Feed-Layouts'],
              ['create-grid',           'Erstell-Formular-Layout: Formular links + Vorschau rechts (2-spaltig)'],
              ['create-form',           'Linke Formular-Spalte im create-grid'],
              ['create-preview',        'Rechte Vorschau-Spalte im create-grid'],
              ['form-row-2',            '2-spaltiges Grid für Formularzeilen (z.B. Ort + Datum)'],
              ['garage-grid',           '2-spaltiges Grid für Schrauberhallen-Fotoupload (2×1fr)'],
              ['bike-detail-grid',      'Zweispaltiges Layout auf Fahrzeugdetailseiten'],
              ['bike-hero-big',         'Großes Hauptfoto auf Fahrzeugdetailseiten'],
              ['bike-thumbs',           'Thumbnail-Reihe auf Fahrzeugdetailseiten (4-spaltig, auf Mobile 3- bzw. 2-spaltig)'],
              ['zh-manifest',           'Manifest-Sektion auf der Startseite (großes Zitat/Statement)'],
              ['zh-manifest-headline',  'Großer Display-Schriftzug im Manifest (clamp 40–92px, Italic via em)'],
              ['zh-manifest-lead',      'Fließtext-Absatz unter dem Manifest-Headline (clamp 18–24px, max 52ch)'],
              ['zh-closing',            'Abschluss-CTA-Sektion (dark, mit Radial-Gradient)'],
              ['credo-strip',           'Dreispaltige Info-Leiste (dark bg) auf der Startseite'],
              ['mms-split',             'MemberMapSplit: zweispaltiges Grid (Liste + Karte)'],
              ['mms-list',              'MemberMapSplit: scrollbare Mitglieder-Liste links'],
              ['mms-row',               'MemberMapSplit: einzelne Mitglieder-Zeile (klickbar)'],
              ['mms-search',            'MemberMapSplit: Suchfeld über der Liste'],
              ['mms-online-dot',        'Grüner Online-Indikator-Punkt auf Mitglieder-Avataren'],
              ['input-error-highlight', 'Rot-Outline auf Input-Feldern bei Validierungsfehler'],
              // Desktop App Shell — components/DesktopLayout.js (Wrapper), components/DesktopSidebar.js (Sidebar-Spalte), components/DesktopTopRow.js (Breadcrumb + Aktionsleiste)
              ['zh-desktop-shell',    'Desktop-App-Grid (Sidebar 232px + Content 1fr) — verwendet in DesktopLayout'],
              ['zd-side',             'Sidebar der Desktop-App: Brand, Nav-Gruppen, sticky links — gerendert via DesktopSidebar.js'],
              ['zd-nav',              'Sidebar-Navigationslinks (flex, vertical, mit Gruppen-Labels)'],
              ['zd-breadcrumb-bar',   'Breadcrumb-Leiste oben im Desktop-Content-Bereich'],
              ['zd-inner',            'Content-Wrapper innerhalb der Desktop-Shell (Padding, max-width)'],
              // Messages (Inbox)
              ['msg-list',            'Nachrichten-Inbox: Liste aller Konversations-Zeilen'],
              ['msg-row',             'Einzelne Konversations-Zeile (klickbar, Hover-Highlight)'],
              ['msg-row unread',      'Ungelesene Konversations-Zeile (farbig hinterlegt)'],
              ['msg-main',            'Haupt-Inhalt einer Nachrichtenzeile (Avatar + Content)'],
              ['msg-content',         'Text-Bereich in Nachrichtenzeile (Absender, Betreff, Vorschau)'],
              ['msg-sender',          'Absender-Name in Nachrichtenzeile'],
              ['msg-subject',         'Betreff in Nachrichtenzeile'],
              ['msg-preview',         'Vorschautext der letzten Nachricht in der Zeile'],
              ['msg-dot',             'Ungelesen-Indikatorpunkt (blau, rund)'],
              ['msg-bubble',          'Nachrichten-Blase im Thread (+ Modifier .own für eigene)'],
              ['msg-bubble-header',   'Kopf einer Nachrichtenblase (Absender + Zeitstempel)'],
              ['msg-bubble-body',     'Text-Inhalt einer Nachrichtenblase'],
              // Onboarding Tour
              ['zh-tour-overlay',     'Vollbild-Overlay für den modalen Onboarding-Einstieg'],
              ['zh-tour-modal',       'Zentriertes Intro-Modal der Onboarding-Tour'],
              ['zh-tour-backdrop',    'Halbdurchsichtiger Hintergrund für Tooltip-Schritte'],
              ['zh-tour-tooltip',     'Tooltip-Schritt der Tour (positioniert neben Highlight-Element)'],
              ['zh-tour-highlight',   'Hervorgehobenes Element während eines Tour-Schritts'],
              ['zh-tour-arrow',       'Pfeil vom Tooltip zum hervorgehobenen Element'],
              ['zh-tour-counter',     'Schritt-Anzeige im Tooltip (z.B. „2 / 5")'],
              // Newsletter Admin
              ['newsletter-layout',   'Zweispaltiges Layout im Admin-Newslettereditor (Editor + Vorschau)'],
              ['newsletter-preview-col', 'Vorschau-Spalte im Newsletter-Admin (live E-Mail-Rendering)'],
              ['newsletter-cta-row',  'CTA-Button-Reihe im Newsletter-Admin (Vorschau senden, Versenden)'],
              // Feedback Widget
              ['zh-feedback-btn',     'Floating-Feedback-Button (unten rechts, immer sichtbar)'],
              ['zh-feedback-overlay', 'Vollbild-Overlay hinter dem Feedback-Modal'],
              ['zh-feedback-modal',   'Feedback-Formular-Modal (Typ-Auswahl, Texteingabe)'],
              ['zh-feedback-type',    'Feedback-Typ-Button (Lob / Bug / Idee, + .active Zustand)'],
              ['zh-feedback-textarea','Textarea im Feedback-Modal'],
              ['zh-feedback-success', 'Erfolgs-State nach Feedback-Absenden'],
              ['zh-feedback-header',  'Kopfzeile des Feedback-Modals (Titel + Schließen)'],
              ['zh-feedback-close',   'Schließen-Button im Feedback-Modal'],
              ['zh-feedback-types',   'Wrapper für die drei Typ-Buttons (Lob / Bug / Idee)'],
              ['zh-feedback-label',   'Label über Typ-Auswahl und Textfeld'],
              ['zh-feedback-input',   'Optionales E-Mail-Feld im Feedback-Modal'],
              ['zh-feedback-chars',   'Zeichenzähler unter der Textarea'],
              ['zh-feedback-error',   'Fehlermeldung im Feedback-Modal'],
              ['zh-feedback-url-check','Hinweiszeile, welche Seiten-URL mitgesendet wird'],
              // Forum — Innenleben (app/forum/forum.css)
              ['forum-header',        'Kopfbereich der Forum-Übersicht'],
              ['forum-title',         'Seitentitel im Forum-Header'],
              ['forum-back-link',     'Zurück-Link auf Detail- und Formularseiten'],
              ['forum-badge',         'Zähler-Badge im Forum-Header'],
              ['forum-tag-bar',       'Leiste mit Marken-Dropdown und Themen-Pills'],
              ['forum-empty',         'Leerzustand, wenn keine Beiträge zum Filter passen'],
              ['forum-error',         'Fehlerbox in Forum-Formularen'],
              ['forum-input',         'Einzeiliges Eingabefeld (Titel)'],
              ['forum-textarea',      'Mehrzeiliges Eingabefeld (Beitrag, Antwort)'],
              ['forum-label',         'Label über Forum-Formularfeldern'],
              ['forum-select',        'Marken-Dropdown in der Tag-Leiste (+ .active)'],
              ['forum-select-full',   'Dropdown über volle Breite im Beitragsformular'],
              ['forum-avatar',        'Avatar in Autorenzeile und Antwortkarte'],
              ['forum-author-row',    'Autorenzeile: Avatar + Name + Datum'],
              ['forum-author-name',   'Autorenname in der Autorenzeile'],
              ['forum-author-date',   'Zeitstempel in der Autorenzeile'],
              ['forum-card-title',    'Titel in der Beitragskachel der Übersicht'],
              ['forum-card-image',    'Bild-Anhang-Vorschau in der Beitragskachel'],
              ['forum-card-meta',     'Metazeile der Beitragskachel (Autor, Datum, Antworten)'],
              ['forum-card-tags',     'Tag-Pills in der Beitragskachel'],
              ['forum-post-body',     'Fließtext des Beitrags auf der Detailseite'],
              ['forum-post-image',    'Bild-Anhang in voller Größe auf der Detailseite'],
              ['forum-reply-card',    'Karte einer einzelnen Antwort'],
              ['forum-reply-body',    'Text einer Antwort'],
              ['forum-reply-form',    'Antwortformular unter dem Thread'],
              ['forum-vote',          'Wrapper für Vote-Buttons und Zähler'],
              ['forum-vote-count',    'Zahl zwischen Up- und Downvote-Button'],
              ['forum-action-btn--delete', 'Rote Variante von forum-action-btn (Löschen)'],
              // MemberMapSplit — Innenleben
              ['mms-root',            'Äußerer Wrapper der Schrauber-Karte'],
              ['mms-map',             'Karten-Container rechts (Leaflet)'],
              ['mms-tabs',            'Umschalter Karte/Liste auf schmalen Viewports'],
              ['mms-tab',             'Einzelner Umschalt-Button (+ .active)'],
              ['mms-active-karte',    'Zustand: Kartenansicht aktiv (mobil)'],
              ['mms-active-liste',    'Zustand: Listenansicht aktiv (mobil)'],
              ['mms-list-head',       'Kopfbereich über der Mitgliederliste'],
              ['mms-list-stats',      'Statistikzeile im Listenkopf'],
              ['mms-stat',            'Einzelne Statistik (Zahl + Kürzel)'],
              ['mms-stat-n',          'Zahl innerhalb einer Statistik'],
              ['mms-stat-k',          'Kürzel/Label innerhalb einer Statistik'],
              ['mms-stat--online',    'Statistik-Variante mit Online-Punkt'],
              ['mms-avatar',          'Avatar in der Mitgliederzeile'],
              ['mms-avatar-wrap',     'Positionierungs-Wrapper für Avatar + Online-Punkt'],
              ['mms-online-dot--sm',  'Kleinere Variante des Online-Punkts'],
              ['mms-name',            'Mitgliedsname in der Zeile'],
              ['mms-loc',             'Ortsangabe in der Zeile'],
              ['mms-bike',            'Fahrzeugangabe in der Zeile'],
              ['mms-bike-count',      'Anzahl-Badge der Fahrzeuge'],
              ['mms-row-right',       'Rechter Bereich der Mitgliederzeile'],
              ['mms-profile-link',    'Link von der Zeile auf das Profil'],
              ['mms-info',            'Hinweistext unter der Liste'],
              ['mms-empty',           'Leerzustand, wenn kein Mitglied im Umkreis liegt'],
              ['mms-loading',         'Ladezustand der Liste'],
              // Event-Card — Innenleben
              ['ec-day',              'Wochentag im dunklen Datumsblock'],
              ['ec-mon',              'Monatskürzel im Datumsblock'],
              ['ec-num',              'Tageszahl im Datumsblock'],
              ['ec-time',             'Uhrzeit im Datumsblock'],
              ['ec-title',            'Titel im Content-Bereich der Event-Card'],
              ['ec-desc',             'Kurzbeschreibung in der Event-Card'],
              ['ec-loc',              'Ortsangabe in der Event-Card'],
              ['ec-meta',             'Metazeile der Event-Card (Teilnehmer etc.)'],
              // Alternative Event-Kachel (neben .ec)
              ['zh-event-card',       'Zweite Event-Kachel-Variante mit seitlichem Datumsblock'],
              ['zh-event-date',       'Datumsblock in zh-event-card (mit .day und .month)'],
              ['zh-event-body',       'Content-Bereich in zh-event-card'],
              // Bike-Kachel — Innenleben
              ['zh-bike-img',         'Bildbereich der Bike-Kachel (4:3)'],
              ['zh-bike-img-placeholder', 'Hatch-Platzhalter, wenn kein Foto vorhanden ist'],
              ['zh-bike-body',        'Content-Bereich der Bike-Kachel'],
              ['zh-bike-title',       'Titelzeile der Bike-Kachel'],
              ['zh-bike-name',        'Fahrzeugname in der Kachel'],
              ['zh-bike-owner',       'Besitzerangabe in der Kachel'],
              ['zh-bike-meta',        'Metazeile (Baujahr, Hubraum)'],
              ['zh-bike-footer',      'Fußzeile der Bike-Kachel'],
              ['zh-bike-dot',         'Trennpunkt in der Metazeile'],
              ['bike-detail-pill',    'Eigenschafts-Pill auf Fahrzeugdetailseiten'],
              // Member-Kachel — Innenleben
              ['zh-member-top',       'Oberer Bereich der Member-Kachel (Avatar + Name)'],
              ['zh-member-name',      'Name in der Member-Kachel'],
              ['zh-member-project',   'Projekt-/Fahrzeugzeile in der Member-Kachel'],
              ['zh-member-stats',     'Statistikzeile der Member-Kachel'],
              // Teaser & Stats — Innenleben
              ['zh-teaser-num',       'Nummer im Teaser-Item'],
              ['zh-teaser-icon',      'Icon im Teaser-Item'],
              ['zh-teaser-text',      'Textblock im Teaser-Item'],
              ['zh-teaser-arrow',     'Pfeil rechts im Teaser-Item'],
              ['zh-stat-num',         'Zahl in der Hero-Statistik'],
              ['zh-stat-label',       'Label unter der Hero-Statistik'],
              // Credo — Innenleben
              ['credo-col',           'Spalte in der dunklen Credo-Leiste'],
              ['credo-body',          'Textblock in der Credo-Spalte'],
              ['credo-eye',           'Eyebrow-Label über dem Credo-Text'],
              ['credo-btn',           'Button in der Credo-Leiste'],
              ['credo-divider',       'Trennlinie zwischen Credo-Spalten'],
              ['credo-hl',            'Hervorhebung innerhalb des Credo-Texts'],
              ['credo-strip-wrap',    'Äußerer Wrapper der Credo-Leiste'],
              // Sektions-Wrapper Startseite
              ['zh-members',          'Wrapper der Mitglieder-Sektion'],
              ['zh-members-mark',     'Abschnitts-Markierung der Mitglieder-Sektion'],
              ['zh-bikes-preview',    'Wrapper der Bike-Vorschau-Sektion'],
              ['zh-preview-row',      'Zeilen-Layout innerhalb einer Preview-Sektion'],
              ['zh-clubs-mark',       'ALTLAST — Abschnitts-Markierung der Club-Sektion'],
              ['zh-closing-wrap',     'Innerer Wrapper der Abschluss-CTA-Sektion'],
              ['zh-contact',          'Wrapper der Kontakt-Sektion auf der Startseite'],
              ['zh-contact-row',      'Zweispaltige Formularzeile im Kontaktformular'],
              // Desktop-Shell — weitere Bestandteile
              ['zd-main',             'Haupt-Spalte rechts neben der Sidebar'],
              ['zd-top',              'Obere Leiste der Desktop-Shell (Breadcrumb, Suche, Icons)'],
              ['zd-content',          'Scrollbarer Inhaltsbereich unterhalb von zd-top'],
              // Weitere Helfer
              ['zd-list',             'Vertikale Listen-Struktur in Desktop-Karten'],
              ['zd-mem',              'Mitglieder-Zeile in Desktop-Listen'],
              ['zd-mark',             'Kleine Abschnitts-Markierung (Desktop-Varianten)'],
              ['zd-h3',               'Dritte Display-Überschriftenebene'],
              ['zd-btn-sm',           'Kompakte Variante von zd-btn'],
              ['zh-profile-avatar-lg','180px-Variante von zh-profile-avatar'],
              ['zh-nav-icon',         'Icon innerhalb von zh-nav-icon-link'],
              ['tab-pills',           'Wrapper der Tab-Umschalter (z.B. Profil-Einstellungen)'],
              ['tab-pill',            'Einzelner Tab-Button (+ .on für aktiven Zustand)'],
              ['zh-input-highlight',  'Accent-Outline als freundlicher Hinweis auf ein leeres Feld (nicht rot — dafür input-error-highlight)'],
              // Onboarding-Tour — Innenleben
              ['zh-tour-modal-icon',  'Icon im Intro-Modal'],
              ['zh-tour-modal-mark',  'Eyebrow-Label im Intro-Modal'],
              ['zh-tour-modal-title', 'Titel im Intro-Modal'],
              ['zh-tour-modal-text',  'Fließtext im Intro-Modal'],
              ['zh-tour-modal-actions','Button-Reihe im Intro-Modal'],
              ['zh-tour-tooltip-title','Titel im Tooltip-Schritt'],
              ['zh-tour-tooltip-text','Fließtext im Tooltip-Schritt'],
              ['zh-tour-tooltip-actions','Button-Reihe im Tooltip-Schritt'],
              ['zh-tour-step-meta',   'Schritt-Metazeile im Tooltip'],
              ['zh-tour-skip-btn',    'Überspringen-Button im Intro-Modal'],
              ['zh-tour-skip-link',   'Überspringen-Link im Tooltip'],
              // Nachrichten — weitere Bestandteile
              ['msg-actions',         'Aktionsleiste im Nachrichten-Thread'],
              ['msg-date',            'Datumsangabe in der Konversationszeile'],
              ['msg-meta',            'Metazeile im Nachrichten-Thread'],
              ['msg-nav-text',        'Beschriftung im Nachrichten-Navigationslink'],
              // Detailseiten — weitere Bestandteile
              ['detail-hero',         'Hero-Bereich auf Detailseiten (über detail-grid)'],
              ['detail-rail',         'Schmale Seitenspalte im detail-grid'],
              ['detail-stats',        'Kennzahlen-Block in der Detail-Seitenspalte'],
              // Club-Kachel — Innenleben (ALTLAST, siehe zh-clubs-grid)
              ['zh-club-img',         'ALTLAST — Bildbereich der Club-Kachel'],
              ['zh-club-img-stripes', 'ALTLAST — Streifen-Overlay über dem Club-Bild'],
              ['zh-club-body',        'ALTLAST — Content-Bereich der Club-Kachel'],
              ['zh-club-badge',       'ALTLAST — Badge in der Club-Kachel'],
              ['zh-club-stamp',       'ALTLAST — Rotierter Stempel über dem Club-Bild'],
              ['zh-club-plate',       'ALTLAST — Nummernschild-Element der Club-Kachel'],
              // Toter CSS-Code — definiert, aber von keinem JS verwendet
              ['zd-bc-item',          'TOT — Breadcrumb-Element. Breadcrumb.js nutzt ausschließlich Inline-Styles'],
              ['zd-bc-sep',           'TOT — Breadcrumb-Trenner. Siehe zd-bc-item'],
              ['zd-bc-back',          'TOT — Breadcrumb-Zurück-Link. Siehe zd-bc-item'],
              ['zd-bc-trail',         'TOT — Breadcrumb-Pfad-Wrapper. Siehe zd-bc-item'],
            ].map(([cls, desc]) => (
              <div key={cls} style={{ display: 'flex', gap: 20, borderBottom: '1px solid var(--hairline)', padding: '10px 0', flexWrap: 'wrap' }}>
                <code style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.5px', minWidth: 180 }}>.{cls}</code>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </DesktopLayout>
  )
}
