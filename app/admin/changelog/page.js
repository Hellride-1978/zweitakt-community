'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'

const ADMIN_EMAIL = 'martin@delavega.de'

const FEATURES = [
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

const TODO = [
  { text: 'migration_garage_skills_add.sql im Supabase SQL Editor ausführen', done: false },
  { text: 'migration_garage_rls_fix.sql im Supabase SQL Editor ausführen', done: true },
  { text: 'migration_garage_storage.sql im Supabase SQL Editor ausführen', done: false },
]

const CAT_COLORS = {
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

export default function AdminChangelog() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) router.replace('/')
  }, [user, loading, router])

  if (loading || !user || user.email !== ADMIN_EMAIL) return null

  const openTodos = TODO.filter(t => !t.done)

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
        Admin
      </div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, marginBottom: 8, lineHeight: 1 }}>Changelog</h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)', marginBottom: 32, letterSpacing: '1px' }}>
        Neueste Features & Änderungen — nur für dich sichtbar
      </p>

      {/* ── Offene TODOs ── */}
      {openTodos.length > 0 && (
        <div style={{ marginBottom: 32, padding: '16px 20px', borderRadius: 14, background: '#fff7ed', border: '1.5px solid #fed7aa' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#c2410c', marginBottom: 10 }}>
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
        {FEATURES.map((group, i) => {
          const col = CAT_COLORS[group.category] || { bg: 'var(--accent-3)', ink: 'var(--accent-ink)' }
          return (
            <div key={i} style={{ border: '1.5px solid var(--hairline)', borderRadius: 14, padding: '16px 18px', background: 'var(--cream)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 100, background: col.bg, color: col.ink, fontWeight: 600,
                }}>
                  {group.category}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '1px' }}>
                  {new Date(group.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </span>
                {group.sql && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1px', color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: 6 }}>
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
