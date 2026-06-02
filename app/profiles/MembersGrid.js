'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'

function formatTimeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const days = Math.round((todayStart - dateStart) / 86400000)
  if (days === 0) return 'Heute'
  if (days === 1) return 'Gestern'
  if (days < 30) return `${days} Tage`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 Mon.'
  if (months < 12) return `${months} Mon.`
  return `${Math.floor(months / 12)} J.`
}

/** Haversine-Formel – Entfernung in km */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const SORT_OPTIONS = [
  { key: 'newest',   label: 'Neueste' },
  { key: 'oldest',   label: 'Älteste' },
  { key: 'name',     label: 'Name A–Z' },
  { key: 'distance', label: 'Nächste zuerst' },
]

const RADIUS_OPTIONS = [
  { key: 0,   label: 'Alle' },
  { key: 25,  label: '25 km' },
  { key: 50,  label: '50 km' },
  { key: 100, label: '100 km' },
  { key: 200, label: '200 km' },
]

export default function MembersGrid({ members }) {
  const { user } = useAuth()
  const [sort,   setSort]   = useState('newest')
  const [radius, setRadius] = useState(0)
  // Eigenes Profil direkt von Supabase — unabhängig vom Server-Fetch
  const [myProfile, setMyProfile] = useState(null)
  const resolvingRef = useRef(false)

  // Eigenes Profil mit plz/lat/lng laden
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('profiles')
      .select('id, plz, lat, lng')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setMyProfile(data) })
  }, [user?.id])

  // Koordinaten: aus DB oder on-demand via OpenPLZ aufgelöst
  const [resolvedCoords, setResolvedCoords] = useState(null)

  useEffect(() => {
    if (!myProfile?.plz || myProfile?.lat || resolvedCoords || resolvingRef.current) return
    resolvingRef.current = true
    fetch(`https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(myProfile.plz)}&country=DE&format=json&limit=1`, {
      headers: { Accept: 'application/json', 'User-Agent': 'zweitakthoden/1.0' },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data[0]?.lat) {
          setResolvedCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
        }
      })
      .catch(() => {})
      .finally(() => { resolvingRef.current = false })
  }, [myProfile, resolvedCoords])

  const refLat = myProfile?.lat ?? resolvedCoords?.lat ?? null
  const refLng = myProfile?.lng ?? resolvedCoords?.lng ?? null
  const radiusEnabled = !!(user && myProfile?.plz)

  // Wenn Radius aktiviert wird: automatisch auf "Nächste zuerst" wechseln
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius)
    if (newRadius > 0 && sort !== 'distance') setSort('distance')
  }

  const visible = useMemo(() => {
    let list = [...members]

    // Entfernung für alle Member berechnen (null wenn keine Koordinaten)

    if (refLat && refLng) {
      list = list.map(m => ({
        ...m,
        distance_km: (m.lat && m.lng)
          ? Math.round(haversineKm(refLat, refLng, m.lat, m.lng) * 10) / 10
          : null,
      }))
    } else {
      list = list.map(m => ({ ...m, distance_km: null }))
    }

    // Radius-Filter: User ohne Koordinaten ans Ende, nicht ausblenden
    if (radius > 0 && refLat && refLng) {
      const inRadius  = list.filter(m => m.distance_km !== null && m.distance_km <= radius)
      const noCoords  = list.filter(m => m.distance_km === null)
      list = [...inRadius, ...noCoords]
    }

    // Sortierung
    if (sort === 'newest')   list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sort === 'oldest')   list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    if (sort === 'name')     list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'de'))
    if (sort === 'distance') {
      list.sort((a, b) => {
        if (a.distance_km === null && b.distance_km === null) return 0
        if (a.distance_km === null) return 1
        if (b.distance_km === null) return -1
        return a.distance_km - b.distance_km
      })
    }

    return list
  }, [members, sort, radius, refLat, refLng])

  const hasCoords = !!(refLat && refLng)
  const radiusDisabled = !radiusEnabled

  return (
    <>
      {/* ── Controls ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {/* Sortierung */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Sortierung</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="zh-input"
              style={{ padding: '7px 14px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '1.5px', textTransform: 'uppercase', height: 'auto', width: 'auto', cursor: 'pointer' }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>

          <span style={{ width: 1, height: 20, background: 'var(--hairline)', margin: '0 2px', flexShrink: 0 }} />

          {/* Radius-Filter — bleibt als Einheit zusammen beim Umbruch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Umkreis</span>
            <select
              value={radius}
              onChange={e => handleRadiusChange(Number(e.target.value))}
              disabled={radiusDisabled}
              className="zh-input"
              style={{
                padding: '7px 14px', fontSize: 11, fontFamily: 'var(--mono)',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                height: 'auto', width: 'auto',
                cursor: radiusDisabled ? 'not-allowed' : 'pointer',
                opacity: radiusDisabled ? 0.4 : 1,
              }}
            >
              {RADIUS_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hinweis wenn Umkreis nicht nutzbar */}
        {radiusDisabled && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.4px', color: 'var(--ink-muted)' }}>
            <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 10 }} />
            {!user
              ? <span>Anmelden um Umkreissuche zu nutzen</span>
              : <span>PLZ im <a href={`/profile/${user.id}?settings=1`} style={{ color: 'var(--accent-ink)', textDecoration: 'underline' }}>Profil eintragen</a> um Umkreissuche zu aktivieren</span>
            }
          </div>
        )}
        {/* Hinweis aktiver Radius */}
        {!radiusDisabled && radius > 0 && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.4px', color: 'var(--accent-ink)' }}>
            <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 10 }} />
            <span>Umkreis {radius} km ab deiner PLZ ({myProfile?.plz})</span>
          </div>
        )}
      </div>

      {/* ── Ergebniszeile ── */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 20 }}>
        {visible.length} {visible.length === 1 ? 'Schrauber' : 'Schrauber'}
        {radius > 0 && hasCoords && (
          <span style={{ marginLeft: 10, color: 'var(--accent-ink)' }}>· {radius} km Umkreis</span>
        )}
      </div>

      {/* ── Grid ── */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--hairline)', borderRadius: 18 }}>
          <p style={{ fontFamily: 'var(--display)', fontSize: 22, color: 'var(--ink-muted)' }}>Keine Treffer.</p>
        </div>
      ) : (
        <div className="zh-members-grid">
          {visible.map(m => {
            const initial = (m.name || '?').charAt(0).toUpperCase()
            const since = formatTimeAgo(m.created_at)
            const latestVehicle = m.vehicles?.[0]
            const distLabel = m.distance_km !== null && m.distance_km !== undefined
              ? `${m.distance_km} km`
              : (hasCoords ? '?' : null)
            const isOnline = m.last_seen && (Date.now() - new Date(m.last_seen).getTime()) < 10 * 60 * 1000

            return (
              <Link key={m.id} href={`/profile/${m.id}`} className="zh-member-card" style={{ textDecoration: 'none' }}>
                <div className="zh-member-top">
                  <div className={`zh-avatar${isOnline ? '' : ' offline'}`}>
                    {m.avatar_url
                      ? <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : initial
                    }
                  </div>
                  <div className="zh-member-name">
                    <h4>{m.name || 'Unbekannt'}</h4>
                    {user && <div className="loc">{m.location || 'Irgendwo im Nirgendwo'}</div>}
                  </div>
                </div>

                {latestVehicle && (
                  <div className="zh-member-project">
                    <div className="label">Fährt</div>
                    <div className="bike">
                      {latestVehicle.title
                        ? `${latestVehicle.make} ${latestVehicle.model} — ${latestVehicle.title}`
                        : `${latestVehicle.make} ${latestVehicle.model}${latestVehicle.year ? ` (${latestVehicle.year})` : ''}`
                      }
                    </div>
                  </div>
                )}

                <div className="zh-member-stats">
                  <div className="item">
                    <div className="n">{m.vehicles?.length ?? 0}</div>
                    <div className="k">Bikes</div>
                  </div>
                  <div className="item">
                    <div className="n">{since}</div>
                    <div className="k">dabei</div>
                  </div>
                  {distLabel && (
                    <div className="item">
                      <div className="n" style={{ color: distLabel === '?' ? 'var(--ink-muted)' : 'var(--accent-ink)' }}>
                        {distLabel}
                      </div>
                      <div className="k">entfernt</div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
