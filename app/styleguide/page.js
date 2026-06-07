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
      { name: 'Supabase Storage', desc: 'Buckets: avatars (Profilbilder), vehicles (Fahrzeugfotos), garage (Schrauberhallen-Fotos), event-images (Termin-Titelbilder) – öffentliche Bild-URLs mit Cache-Busting', url: null },
    ],
  },
  {
    cat: 'E-Mail',
    items: [
      { name: 'Resend', desc: 'Transaktions-E-Mails an User: Registrierungsbestätigung (Supabase Auth) + Forum-Antwortbenachrichtigungen — versendet von noreply@send.zweitakthoden.de', url: 'https://resend.com' },
      { name: 'Nodemailer / SMTP', desc: 'Interne Admin-Benachrichtigungen via SMTP: neues Mitglied, neuer Termin, neues Bike — versendet an info@zweitakthoden.de', url: null },
    ],
  },
  {
    cat: 'Karten & Geocoding',
    items: [
      { name: 'OpenStreetMap / Nominatim', desc: 'Reverse-Geocoding: Koordinaten → Adresse. Karten-Tiles für Termindetailseite', url: 'https://openstreetmap.org' },
      { name: 'Leaflet / react-leaflet', desc: 'Interaktive Karten – MemberMapSplit auf der Startseite (Schrauber-Karte mit Umkreissuche) und EventMap auf Termindetailseiten. Tiles via OpenStreetMap.', url: 'https://leafletjs.com' },
    ],
  },
  {
    cat: 'Fonts & Icons',
    items: [
      { name: 'Google Fonts', desc: 'Boogaloo (Display), DM Sans (Text), DM Mono (Mono) — via next/font', url: null },
      { name: 'Font Awesome 6', desc: 'Icons über @fortawesome/react-fontawesome — nur solid + brands', url: 'https://fontawesome.com' },
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
      { name: 'Dark Mode', desc: 'Helles/Dunkles Theme via ThemeToggle — systembasierter Default, localStorage-persistent, Flash-frei via ThemeProvider', url: null },
      { name: 'Color Theming', desc: '5 Farbpaletten (Blau, Rosa, Grün, Amber, Lila) — localStorage-persistent, Flash-frei via inline <script> in <head>', url: null },
      { name: 'Image Crop', desc: 'react-image-crop — Zuschneiden von Avataren (rund) und Fahrzeugfotos (4:3) direkt im Browser', url: null },
      { name: 'Password Strength', desc: 'Live-Passwortprüfung mit 4 Regeln + Stärkebalken auf Registrierung und Passwort-Reset', url: null },
      { name: 'Account Deletion', desc: 'Zweistufige Bestätigung, löscht Profile + Fahrzeuge + Teilnahmen + Storage + Auth-User via Service Role Key', url: null },
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
      { name: 'Forum — Die Anlaufstelle', desc: 'Q&A-Forum mit Posts, Antworten, Upvote/Downvote-System, Tag-Filterung (Marken-Dropdown + Themen-Pills), Server Actions mit Zod-Validierung, E-Mail-Benachrichtigung bei Antworten via SMTP', url: null },
    ],
  },
]

const LAST_UPDATED = '07.06.2026'

const BASE_COLORS = [
  { name: '--ink',       desc: 'Text (dunkel)' },
  { name: '--ink-soft',  desc: 'Text (weich)' },
  { name: '--ink-muted', desc: 'Text (gedimmt)' },
  { name: '--cream',     desc: 'Hintergrund' },
  { name: '--parchment', desc: 'Karten-BG' },
  { name: '--hairline',  desc: 'Trennlinien' },
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
                <div style={{ width: '100%', height: 48, borderRadius: 10, background: `var(${c.name})`, border: '1.5px solid var(--hairline)' }} />
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
              ['zh-page-inner',   'Zentrierter Content-Bereich, max 1000px'],
              ['zh-page-inner-sm','Schmaler Content-Bereich, max 560px'],
              ['zh-card',         'Standard-Karte: weiß, Border, Radius 14px'],
              ['zd-card',         'Leicht erhöhte Karte mit Box-Shadow'],
              ['zd-card dark',    'Invertierte Karte (ink-Hintergrund)'],
              ['zh-btn',          'Primär-Button (schwarz)'],
              ['zh-btn-outline',  'Sekundär-Button (transparent, Border)'],
              ['zd-btn accent',   'Accent-Button für dark cards'],
              ['zh-input',        'Text-Input / Textarea'],
              ['zh-label',        'Form-Label (mono, uppercase)'],
              ['zh-error',        'Fehler-Box (rot)'],
              ['zh-pill',         'Kleines Badge / Tag'],
              ['zh-avatar',       'Runder Avatar-Container'],
              ['zh-nav',          'Fixierte Navigation'],
              ['zh-footer',       'Footer-Bereich'],
              ['zd-mono',         'Mono-Typografie-Helfer'],
              ['zd-h1 / zd-h2',   'Display-Überschriften mit em-Italic'],
              ['zh-section-mark', 'Abschnitts-Markierung (Pill + Text)'],
              ['zh-members-grid', '4-Spalten Member-Karten-Grid'],
              ['zh-member-card',  'Einzelne Member-Kachel'],
              ['zh-bubble-stack',   'Hero-Schriftzug (animiert, 3 Zeilen)'],
              ['zh-hero-stats',     'Stats-Leiste im Hero (klickbare Links)'],
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
              ['events-card-grid',  'Responsives Event-Karten-Grid'],
              ['ec / ec-head / ec-body', 'Event-Card und ihre Bereiche (Datum-Block + Content)'],
              ['detail-grid',       'Zweispaltiges Layout für Event-/Fahrzeugdetailseiten'],
              ['msg-bubble',        'Nachrichten-Blase im Thread (+ Modifier .own)'],
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
              ['zh-ticker',         'Scrollender Marquee-Streifen (dark bg, pausiert on hover)'],
              ['zh-teaser',         'Dreispaltiges Feature-Teaser-Grid'],
              ['zh-teaser-item',    'Einzelne Teaser-Zeile mit Icon, Text und Pfeil'],
              ['zh-clubs-grid',     'Vierspaltiges Grid für Club-Kacheln'],
              ['zh-club-card',      'Einzelne Club-Kachel mit Bild, Stamp und Body'],
              ['zh-roller-btn',     'Farbwechsel-Button (animiert durch alle 5 Paletten)'],
              ['skip-link',         'WCAG-Skiplink „Zum Hauptinhalt springen" (nur sichtbar bei Fokus)'],
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
