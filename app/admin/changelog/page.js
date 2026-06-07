'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/useAuth'

const ADMIN_EMAIL = 'martin@delavega.de'

const FEATURES = [
  {
    date: '2026-06-07',
    category: 'Admin-Statistiken',
    items: [
      'Neue Seite /admin/statistiken mit KPI-Karten, Balkendiagrammen, Top-Seiten, Geräte- und Länder-Aufschlüsselung',
      'Eigenes Page-Tracking: page_views-Tabelle in Supabase (path, device, country, viewed_at)',
      'PageTracker-Komponente im Layout: feuert bei jedem Seitenwechsel per navigator.sendBeacon',
      'Device-Erkennung aus User-Agent (mobile / tablet / desktop)',
      'Herkunftsland aus x-vercel-ip-country Header (kein IP-Speichern)',
      'KPIs: Aufrufe heute, diese Woche, letzte 30 Tage',
      'Newsletter-KPIs: Abonnenten, Abmeldungen, Abmelderate, Ausstehend',
      'Community-KPIs: Mitglieder, Forum-Threads, Forum-Antworten, Feedbacks',
      'API-Route /api/admin/stats mit Bearer-Token-Auth (admin.auth.getUser)',
      'API-Route /api/track (fire-and-forget, ignoriert /api /admin /_next)',
    ],
    sql: 'migration_page_views.sql + migration_page_views_device.sql',
  },
  {
    date: '2026-06-07',
    category: 'Newsletter – Admin-Versand',
    items: [
      'Admin-Seite /admin/newsletter: Betreff, Headline, Fließtext, optionaler CTA-Button',
      'Live-Vorschau der E-Mail direkt neben dem Editor',
      'Vorschau-Mail-Funktion: sendet an Admin-Adresse vor echtem Versand',
      'Personalisierter Abmelde-Token pro Empfänger im Mail-Footer',
      'Abonnenten-Zähler live während Erstellung',
    ],
  },
  {
    date: '2026-06-06',
    category: 'Forum – Bild-Upload',
    items: [
      'Bilder können beim Erstellen von Posts und Antworten hochgeladen werden',
      'ForumImageUpload-Komponente: sofortiger Upload beim Datei-Auswählen, Vorschau mit Entfernen-Button',
      'Storage Bucket "forum-images" (public, 5MB, jpg/png/webp)',
      'image_url Spalte in forum_posts + forum_replies',
      'Bild-Vorschau in PostCard-Liste (180px crop) und Vollbild im Thread',
    ],
    sql: 'migration_forum_images.sql',
  },
  {
    date: '2026-06-06',
    category: 'Newsletter – Double Opt-in',
    items: [
      'POST /api/newsletter/subscribe: E-Mail-Validierung, Duplikat-Handling (pending/confirmed/unsubscribed)',
      'GET /api/newsletter/confirm: Token-Bestätigung, Willkommensmail, Redirect',
      'GET /api/newsletter/unsubscribe: Token-basierte Abmeldung aus Mail-Footer',
      'POST /api/newsletter/unsubscribe-user: Abmeldung aus Account-Bereich',
      'Seiten /newsletter/bestaetigt und /newsletter/abgemeldet',
      'NewsletterForm im Footer (nur für eingeloggte User)',
      'NewsletterToggle im Profil → Tab "Benachrichtigungen"',
      'Mailversand via SMTP (nodemailer) statt Resend',
    ],
    sql: 'migration_newsletter.sql',
  },
  {
    date: '2026-06-06',
    category: 'Forum – Benachrichtigungen',
    items: [
      'notify_forum_replies Boolean in profiles (DEFAULT true)',
      'Tab "Benachrichtigungen" in ProfileSettings mit Toggle-Switch',
      'Notify-Route: prüft Setting, lädt Replier-Name, schickt Textvorschau mit',
      'Betreff jetzt personalisiert: "Name hat geantwortet: Titel"',
      'Abmelde-Link im Mail-Footer',
    ],
    sql: 'migration_forum_notify_settings.sql',
  },
  {
    date: '2026-06-06',
    category: 'Forum – Öffentlich sichtbar',
    items: [
      'Forum-Link in Nav für nicht eingeloggte User (Desktop + Mobile)',
      'Posts lesbar ohne Login (RLS war bereits korrekt)',
      'Neue-Frage-Button + Antwort-Formular nur für eingeloggte User',
      '"Einloggen um zu antworten"-CTA für Gäste',
    ],
  },
  {
    date: '2026-06-06',
    category: 'Schrauber-Karte – Ausbau',
    items: [
      'Listenzeilen: Bike-Info (neuestes Fahrzeug), Online-Indikator, Bike-Count-Badge',
      'Suchfeld: filtert nach Name, Ort oder Bike-Modell',
      'List-Header: Anzahl auf der Karte + Online-Count',
      'Profil-Link sichtbar bei Hover und activem Eintrag',
      'Popup zeigt jetzt auch erstes Fahrzeug des Members',
      'Query lädt last_seen + vehicles für alle Map-Members',
      'Kartenansicht auf /profiles eingebunden (Toggle Übersicht / Karte)',
    ],
  },
  {
    date: '2026-06-06',
    category: 'WCAG 2.1 AA – Fixes',
    items: [
      '--accent-text: #1a6080 (6.94:1 auf Weiß) als neue Textfarbe für Hellblau auf hellem Hintergrund',
      'Alle font-size unter 11px → 11px (8px, 8.5px, 9px, 9.5px, 10px, 10.5px)',
      '16× color: var(--accent) als Textfarbe → var(--accent-text)',
      'rgba(255,255,255,0.4) → 0.5 und 0.45 → 0.6 für Text auf dunklem Hintergrund',
      'Nav z-index 50 → 1000 (über Leaflet-Karte)',
      'Leaflet-Controls z-index → 500 (unter Nav)',
    ],
  },
  {
    date: '2026-06-06',
    category: 'Homepage – Redesign',
    items: [
      'Credo-Karten → kompakter dunkler Strip (3 Spalten, responsive)',
      '"Eure Bikes" Button statt "Termine & Ausfahrten" im Hero',
      'Karten-Sektion vor Events-Sektion',
      '"neu in der crew"-Sektion ausgeblendet (Code erhalten)',
      'Hero-Text aktualisiert',
      'Abstand zwischen Hero und Bikes-Grid reduziert',
    ],
  },
  {
    date: '2026-06-06',
    category: 'Footer – Ausbau',
    items: [
      'Breite auf max-width: 1280px gebracht (wie Nav)',
      'Bikes + Forum als neue Links in Community-Spalte',
      'Newsletter-Formular unter Logo (nur für eingeloggte User)',
    ],
  },
  {
    date: '2026-06-06',
    category: 'Forum – Marken & Fixes',
    items: [
      'Piaggio zur Marken-Liste hinzugefügt',
      'Formular-Felder bleiben bei Fehler erhalten (controlled inputs + onReset)',
      'FormError-Komponente: auto-scroll zum Fehler, Shake-Animation, fieldId-Support',
      'Forum-Icon im mobilen Menü: fas comment',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Schrauberhalle – Skills',
    items: [
      'Drei neue Spaß-Skills: Kaffeetrinker, Pausenmeister, Grill-Experte',
      'DB-Migration: CHECK-Constraint auf garage_skills erweitert → im Supabase SQL Editor ausführen',
    ],
    sql: 'migration_garage_skills_add.sql',
  },
  {
    date: '2026-06-02',
    category: 'Schrauberhalle – Detailseite',
    items: [
      'Neue Seite /schrauberhalle/[id] mit Foto-Galerie (Lightbox), Skills, Beschreibung, Besitzer-Card',
      'GarageGrid-Karten verlinken auf Detailseite',
      'Profil-Karte: "Schrauberhalle ansehen →" + "Bearbeiten →"',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Schrauberhalle – Umkreissuche',
    items: [
      'PLZ oder Ort eingeben → Nominatim-Geocoding (600ms Debounce)',
      'Radius-Selector: 10 / 25 / 50 / 100 / 200 km',
      'Ergebnisse nach Entfernung sortiert, Schrauberhallen ohne Koordinaten ans Ende',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Schrauberhalle – RLS-Fixes',
    items: [
      'garage + garage_skills SELECT-Policy auf USING (true) → Server-Client kann lesen',
      'Storage-Bucket "garage" + Policies für Upload/Delete → im Supabase SQL Editor ausführen',
      'migration_garage_storage.sql + migration_garage_rls_fix.sql',
    ],
    sql: 'migration_garage_rls_fix.sql + migration_garage_storage.sql',
  },
  {
    date: '2026-06-02',
    category: 'Schrauberhalle – Löschen',
    items: [
      'Delete-Button mit Bestätigungsdialog in GarageEdit',
      'Löscht Fotos aus Storage, Skills und DB-Eintrag',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Schrauberhalle – Sichtbarkeit',
    items: [
      'Im Nav auch ohne Login sichtbar (Desktop + Mobile)',
      'Ort/Entfernung nur für eingeloggte User sichtbar',
      'Cache-Fix: router.refresh() + force-dynamic auf Profilseite',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Umbenennung',
    items: [
      'Garage → Schrauberhalle überall (URL /schrauberhalle, Nav, Footer, Buttons, Texte)',
      'Werkstatt → Garage (vorheriger Schritt)',
      'lib/garage.js, components/GarageEdit, GarageView, ProfileGarageSection bleiben intern so',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Homepage',
    items: [
      'Bikes / Crew / Termine: einzelne Zeile, overflow hidden, Gradient-Fade rechts',
      'Mobile: 1 Karte pro Preview-Sektion, kein Gradient auf Mobile',
      'Desktop: so viele Karten wie reinpassen (Bikes 200px, Members 270px)',
      'Online-Status-Fix: last_seen jetzt geladen, 10-Minuten-Logik',
      'Hero-Texte überarbeitet',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Schrauber-Übersicht',
    items: [
      'Grid: 4 Spalten Desktop, 3 bei ≤960px, 2 bei ≤700px, 1 bei ≤500px',
      'Stadt nur für eingeloggte User sichtbar',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Mobile / iPhone Fix',
    items: [
      'Dev-Server: next dev -H 0.0.0.0 in package.json → React hydratisiert korrekt auf iPhone',
      'Burger-Menü funktioniert auf iOS',
      'Mobile-Menü: inset: var(--nav-h) statt hardcoded 57px',
    ],
  },
  {
    date: '2026-05-31',
    category: 'Online-Status',
    items: [
      'last_seen Heartbeat via PresenceUpdater',
      'Online-Dot auf Avataren (grün < 10 Min, grau = offline)',
      'PLZ-Nudge-Banner: neuer Storage-Key',
    ],
  },
  {
    date: '2026-05-30',
    category: 'Umkreissuche (Schrauber)',
    items: [
      'Geocoding auf Nominatim umgestellt',
      'PostGIS-Migration: lat/lng in profiles, find_users_nearby RPC',
      'Radius-Selector im Schrauber-Grid',
    ],
  },
]

const LAST_UPDATED = '2026-06-07'

const TODO = [
  { text: 'migration_forum_images.sql im Supabase SQL Editor ausführen', done: true },
  { text: 'migration_newsletter.sql im Supabase SQL Editor ausführen', done: true },
  { text: 'migration_forum_notify_settings.sql im Supabase SQL Editor ausführen', done: true },
  { text: 'migration_garage_skills_add.sql im Supabase SQL Editor ausführen', done: true },
  { text: 'migration_garage_rls_fix.sql im Supabase SQL Editor ausführen', done: true },
  { text: 'migration_garage_storage.sql im Supabase SQL Editor ausführen', done: true },
  { text: 'migration_page_views.sql im Supabase SQL Editor ausführen', done: true },
  { text: 'migration_page_views_device.sql im Supabase SQL Editor ausführen', done: true },
]

const LEGEND = [
  { bg: '#dbeafe', ink: '#1d4ed8', label: 'Feature / Neu' },
  { bg: '#dcfce7', ink: '#15803d', label: 'Ausbau / Verbesserung' },
  { bg: '#fef9c3', ink: '#a16207', label: 'Einstellungen / Config' },
  { bg: '#fee2e2', ink: '#b91c1c', label: 'Fix / Sicherheit' },
  { bg: '#f3e8ff', ink: '#7c3aed', label: 'Design / UI' },
  { bg: '#fce7f3', ink: '#be185d', label: 'Struktur / Umbau' },
  { bg: '#e0f2fe', ink: '#0369a1', label: 'Sichtbarkeit / Zugang' },
  { bg: '#f0fdf4', ink: '#166534', label: 'Karte / Geodaten' },
  { bg: '#fff7ed', ink: '#c2410c', label: 'Kleinfix / Inhalt' },
]

const CAT_COLORS = {
  'Admin-Statistiken':               { bg: '#dbeafe', ink: '#1d4ed8' },
  'Newsletter – Admin-Versand':      { bg: '#dcfce7', ink: '#15803d' },
  'Forum – Bild-Upload':             { bg: '#dbeafe', ink: '#1d4ed8' },
  'Newsletter – Double Opt-in':      { bg: '#dcfce7', ink: '#15803d' },
  'Forum – Benachrichtigungen':      { bg: '#fef9c3', ink: '#a16207' },
  'Forum – Öffentlich sichtbar':     { bg: '#e0f2fe', ink: '#0369a1' },
  'Schrauber-Karte – Ausbau':        { bg: '#f0fdf4', ink: '#166534' },
  'WCAG 2.1 AA – Fixes':             { bg: '#fee2e2', ink: '#b91c1c' },
  'Homepage – Redesign':             { bg: '#f3e8ff', ink: '#7c3aed' },
  'Footer – Ausbau':                 { bg: '#fce7f3', ink: '#be185d' },
  'Forum – Marken & Fixes':          { bg: '#fff7ed', ink: '#c2410c' },
  'Schrauberhalle – Skills':        { bg: '#fef9c3', ink: '#a16207' },
  'Schrauberhalle – Detailseite':   { bg: '#dcfce7', ink: '#15803d' },
  'Schrauberhalle – Umkreissuche':  { bg: '#dbeafe', ink: '#1d4ed8' },
  'Schrauberhalle – RLS-Fixes':     { bg: '#fee2e2', ink: '#b91c1c' },
  'Schrauberhalle – Löschen':       { bg: '#fce7f3', ink: '#be185d' },
  'Schrauberhalle – Sichtbarkeit':  { bg: '#e0f2fe', ink: '#0369a1' },
  'Umbenennung':                    { bg: '#f3e8ff', ink: '#7c3aed' },
  'Homepage':                       { bg: '#dbeafe', ink: '#1d4ed8' },
  'Schrauber-Übersicht':            { bg: '#fef9c3', ink: '#a16207' },
  'Mobile / iPhone Fix':            { bg: '#fee2e2', ink: '#b91c1c' },
  'Online-Status':                  { bg: '#fce7f3', ink: '#be185d' },
  'Umkreissuche (Schrauber)':       { bg: '#f0fdf4', ink: '#166534' },
}

const SORT_OPTIONS = [
  { key: 'newest', label: 'Neueste zuerst' },
  { key: 'oldest', label: 'Älteste zuerst' },
  { key: 'category', label: 'Kategorie A–Z' },
]

export default function AdminChangelog() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sort, setSort] = useState('newest')
  const [showLegend, setShowLegend] = useState(false)

  const sorted = useMemo(() => {
    const list = [...FEATURES]
    if (sort === 'newest')   list.sort((a, b) => new Date(b.date) - new Date(a.date))
    if (sort === 'oldest')   list.sort((a, b) => new Date(a.date) - new Date(b.date))
    if (sort === 'category') list.sort((a, b) => a.category.localeCompare(b.category, 'de'))
    return list
  }, [sort])

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) router.replace('/')
  }, [user, loading, router])

  if (loading || !user || user.email !== ADMIN_EMAIL) return null

  const openTodos = TODO.filter(t => !t.done)

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 80px' }}>

      {/* ── Header ── */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
        Admin
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, lineHeight: 1, margin: 0 }}>Changelog</h1>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)', letterSpacing: '1px' }}>
          Zuletzt aktualisiert: {new Date(LAST_UPDATED).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
      </div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)', marginBottom: 28, letterSpacing: '1px' }}>
        Neueste Features & Änderungen — nur für dich sichtbar
      </p>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Sortierung</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="zh-input"
            style={{ padding: '6px 12px', fontSize: 12, fontFamily: 'var(--mono)', height: 'auto', width: 'auto', cursor: 'pointer' }}
          >
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <button
          onClick={() => setShowLegend(v => !v)}
          style={{
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: 100, border: '1.5px solid var(--hairline)',
            background: showLegend ? 'var(--ink)' : 'var(--cream)', color: showLegend ? 'var(--cream)' : 'var(--ink)',
            cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
          }}
        >
          {showLegend ? '× Legende' : '? Legende'}
        </button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)', marginLeft: 'auto' }}>
          {FEATURES.length} Einträge
        </span>
      </div>

      {/* ── Legende ── */}
      {showLegend && (
        <div style={{ marginBottom: 24, padding: '16px 20px', borderRadius: 14, border: '1.5px solid var(--hairline)', background: 'var(--cream-2)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 12 }}>
            Farb-Legende
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LEGEND.map((l, i) => (
              <span key={i} style={{
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.2px',
                padding: '4px 12px', borderRadius: 100, background: l.bg, color: l.ink, fontWeight: 600,
              }}>
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Offene TODOs ── */}
      {openTodos.length > 0 && (
        <div style={{ marginBottom: 24, padding: '16px 20px', borderRadius: 14, background: '#fff7ed', border: '1.5px solid #fed7aa' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#c2410c', marginBottom: 10 }}>
            ⚠ Noch ausstehend
          </div>
          {openTodos.map((t, i) => (
            <div key={i} style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#9a3412', marginBottom: 4, display: 'flex', gap: 8 }}>
              <span>→</span><span>{t.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Feature-Liste ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((group, i) => {
          const col = CAT_COLORS[group.category] || { bg: 'var(--accent-3)', ink: 'var(--accent-ink)' }
          return (
            <div key={i} style={{ border: '1.5px solid var(--hairline)', borderRadius: 14, padding: '16px 18px', background: 'var(--cream)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 100, background: col.bg, color: col.ink, fontWeight: 600,
                }}>
                  {group.category}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)', letterSpacing: '1px' }}>
                  {new Date(group.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
                {group.sql && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1px', color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: 6 }}>
                    SQL: {group.sql}
                  </span>
                )}
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {group.items.map((item, j) => (
                  <li key={j} style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
