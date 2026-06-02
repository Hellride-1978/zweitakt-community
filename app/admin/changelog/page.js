'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'

const ADMIN_EMAIL = 'martin@delavega.de'

const FEATURES = [
  {
    date: '2026-06-02',
    category: 'Umbenennung',
    items: [
      'Garage → Schrauberhalle (URL: /schrauberhalle, Nav, Footer, alle Texte)',
      'Werkstatt → Garage (vorheriger Schritt)',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Homepage',
    items: [
      'Bikes- und Crew-Preview: einzelne Zeile mit overflow-hidden + Gradient-Fade rechts',
      'Mobile: 1 Karte sichtbar bei Bikes, Termine und Crew',
      'Desktop: so viele Karten wie reinpassen (Bikes 200px, Members 270px)',
      'Online-Status fix: last_seen wird jetzt geladen, 10-Minuten-Logik',
      'Neue Hero-Texte',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Schrauberhalle',
    items: [
      'Neuer Seitentitel: "Die Schrauberhalle: Teilen, Helfen, Weiterkommen."',
      'Beschreibungstext unter dem Titel',
    ],
  },
  {
    date: '2026-06-02',
    category: 'Schrauber-Übersicht',
    items: [
      'Grid: 4 Spalten auf Desktop, 3 bei ≤960px, 2 bei ≤700px, 1 bei ≤500px',
    ],
  },
  {
    date: '2026-06-01',
    category: 'Mobile / iPhone Fix',
    items: [
      'Dev-Server: next dev -H 0.0.0.0 — React hydratisiert jetzt korrekt auf iPhone',
      'Burger-Menü funktioniert auf iOS',
      'Mobile-Menü inset: var(--nav-h) statt hardcoded 57px',
    ],
  },
  {
    date: '2026-06-01',
    category: 'Navigation',
    items: [
      'Schrauberhalle im Desktop-Nav und Mobile-Menü',
      'Aktiv-Status für /schrauberhalle korrekt',
    ],
  },
  {
    date: '2026-05-31',
    category: 'Online-Status',
    items: [
      'last_seen Heartbeat via PresenceUpdater',
      'Online-Dot auf Avataren (grün = aktiv < 10 Min, grau = offline)',
      'PLZ-Nudge-Banner: neuer Storage-Key, für alle User zurückgesetzt',
    ],
  },
  {
    date: '2026-05-30',
    category: 'Umkreissuche',
    items: [
      'Geocoding auf Nominatim umgestellt',
      'PostGIS-Migraton: lat/lng in profiles, find_users_nearby RPC',
      'Radius-Selector im Schrauber-Grid',
    ],
  },
]

const CAT_COLORS = {
  'Umbenennung': { bg: '#f3e8ff', ink: '#7c3aed' },
  'Homepage':    { bg: '#dbeafe', ink: '#1d4ed8' },
  'Schrauberhalle': { bg: '#dcfce7', ink: '#15803d' },
  'Schrauber-Übersicht': { bg: '#fef9c3', ink: '#a16207' },
  'Mobile / iPhone Fix': { bg: '#fee2e2', ink: '#b91c1c' },
  'Navigation':  { bg: '#e0f2fe', ink: '#0369a1' },
  'Online-Status': { bg: '#fce7f3', ink: '#be185d' },
  'Umkreissuche': { bg: '#f0fdf4', ink: '#166534' },
}

export default function AdminChangelog() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading || !user || user.email !== ADMIN_EMAIL) return null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
        Admin
      </div>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 40, marginBottom: 8, lineHeight: 1 }}>
        Changelog
      </h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)', marginBottom: 40, letterSpacing: '1px' }}>
        Neueste Features &amp; Änderungen — nur für dich sichtbar
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FEATURES.map((group, i) => {
          const col = CAT_COLORS[group.category] || { bg: 'var(--accent-3)', ink: 'var(--accent-ink)' }
          return (
            <div key={i} style={{ border: '1.5px solid var(--hairline)', borderRadius: 14, padding: '18px 20px', background: 'var(--cream)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 100,
                  background: col.bg, color: col.ink, fontWeight: 600,
                }}>
                  {group.category}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '1px' }}>
                  {new Date(group.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </span>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.items.map((item, j) => (
                  <li key={j} style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
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
