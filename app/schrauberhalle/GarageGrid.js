'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { SKILLS, skillBadgeStyle } from '@/lib/garage'
import './schrauberhalle.css'
import { haversineKm } from '@/lib/geo-search'
import { useAuth } from '@/lib/useAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faMagnifyingGlass, faXmark, faWrench } from '@fortawesome/free-solid-svg-icons'

const RADIUS_OPTIONS = [0, 10, 25, 50, 100, 200]

export default function GarageGrid({ garages }) {
  const { user, loading } = useAuth()
  const [search, setSearch] = useState('')
  const [activeSkills, setActiveSkills] = useState([])

  // Standort-Suche
  const [locationInput, setLocationInput] = useState('')
  const [refCoords, setRefCoords] = useState(null)
  const [radius, setRadius] = useState(0)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const debounceRef = useRef(null)

  const userHasGarage = !!(user && garages.some(g => g.user_id === user.id))

  // PLZ/Ort geocoden (debounced)
  useEffect(() => {
    if (!locationInput.trim()) { setRefCoords(null); setGeoError(null); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setGeoLoading(true); setGeoError(null)
      try {
        const q = encodeURIComponent(locationInput.trim())
        const isPlz = /^\d{4,5}$/.test(locationInput.trim())
        const url = isPlz
          ? `https://nominatim.openstreetmap.org/search?postalcode=${q}&country=DE&format=json&limit=1`
          : `https://nominatim.openstreetmap.org/search?q=${q}&countrycodes=de,at,ch&format=json&limit=1`
        const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'zweitakthoden/1.0' } })
        const data = await res.json()
        if (Array.isArray(data) && data[0]?.lat) {
          setRefCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name?.split(',')[0] })
          if (radius === 0) setRadius(50)
        } else {
          setRefCoords(null)
          setGeoError('Ort nicht gefunden.')
        }
      } catch {
        setGeoError('Fehler beim Suchen.')
      } finally {
        setGeoLoading(false)
      }
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [locationInput])

  const toggleSkill = skill =>
    setActiveSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])

  const visible = useMemo(() => {
    let list = garages.map(g => ({
      ...g,
      distance_km: (refCoords && g.profiles?.lat && g.profiles?.lng)
        ? Math.round(haversineKm(refCoords.lat, refCoords.lng, g.profiles.lat, g.profiles.lng) * 10) / 10
        : null,
    }))

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(g =>
        g.profiles?.name?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
      )
    }

    if (activeSkills.length > 0)
      list = list.filter(g => activeSkills.every(s => g.skills.includes(s)))

    if (radius > 0 && refCoords) {
      const inRadius = list.filter(g => g.distance_km !== null && g.distance_km <= radius)
      const noCoords = list.filter(g => g.distance_km === null)
      list = [...inRadius, ...noCoords]
    }

    if (refCoords) {
      list.sort((a, b) => {
        if (a.distance_km === null && b.distance_km === null) return 0
        if (a.distance_km === null) return 1
        if (b.distance_km === null) return -1
        return a.distance_km - b.distance_km
      })
    }

    return list
  }, [garages, search, activeSkills, radius, refCoords])

  if (garages.length === 0 && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', border: '2px dashed var(--hairline)', borderRadius: 18 }}>
        <FontAwesomeIcon icon={faWrench} style={{ fontSize: 36, opacity: 0.2, color: 'var(--ink-muted)', display: 'block', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink-muted)', marginBottom: 20 }}>
          Noch keine Schrauberhallen eingetragen.
        </p>
        {user ? (
          <Link href="/schrauberhalle/new" className="zh-btn" style={{ display: 'inline-flex', gap: 8 }}>
            <FontAwesomeIcon icon={faWrench} style={{ fontSize: 13 }} /> Schrauberhalle anlegen
          </Link>
        ) : (
          <Link href="/auth/register" className="zh-btn" style={{ display: 'inline-flex', gap: 8 }}>
            Dabei sein →
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      {!loading && user && !userHasGarage && (
        <Link
          href="/schrauberhalle/new"
          style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
            padding: '14px 18px', borderRadius: 14,
            background: 'color-mix(in oklab, var(--accent) 12%, var(--cream))',
            border: '1.5px solid var(--accent)', textDecoration: 'none',
          }}
        >
          <FontAwesomeIcon icon={faWrench} style={{ fontSize: 18, color: 'var(--accent-ink)', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 700, color: 'var(--accent-ink)' }}>
              Schrauberhalle anlegen
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>
              Zeig der Community was du kannst — trag deine Schrauberhalle ein.
            </div>
          </div>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent-ink)' }}>→</span>
        </Link>
      )}

      {/* ── Filter-Controls ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>

        {/* Freitextsuche */}
        <div style={{ position: 'relative', maxWidth: 420 }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--ink-muted)', pointerEvents: 'none' }} />
          <input
            className="zh-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name oder Beschreibung suchen…"
            style={{ paddingLeft: 38 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 14 }}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        {/* Umkreissuche */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <FontAwesomeIcon icon={faLocationDot} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: refCoords ? 'var(--accent-ink)' : 'var(--ink-muted)', pointerEvents: 'none' }} />
            <input
              className="zh-input"
              value={locationInput}
              onChange={e => setLocationInput(e.target.value)}
              placeholder="PLZ oder Ort eingeben…"
              style={{ paddingLeft: 34, width: 220 }}
            />
            {locationInput && (
              <button
                onClick={() => { setLocationInput(''); setRefCoords(null); setRadius(0); setGeoError(null) }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 14 }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          {refCoords && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Umkreis</span>
              <select
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="zh-input"
                style={{ padding: '7px 12px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '1.5px', height: 'auto', width: 'auto', cursor: 'pointer' }}
              >
                {RADIUS_OPTIONS.map(r => (
                  <option key={r} value={r}>{r === 0 ? 'Alle' : `${r} km`}</option>
                ))}
              </select>
            </div>
          )}

          {geoLoading && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)' }}>Suche…</span>}
          {geoError  && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#c00' }}>{geoError}</span>}
          {refCoords && !geoLoading && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.2px', color: 'var(--accent-ink)' }}>
              ◎ {refCoords.label}
            </span>
          )}
        </div>

        {/* Skill-Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginRight: 4 }}>Skills</span>
          {SKILLS.map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`skill-badge${activeSkills.includes(skill) ? ' active' : ''}`}
            >
              {skill}
            </button>
          ))}
          {activeSkills.length > 0 && (
            <button onClick={() => setActiveSkills([])} className="skill-badge reset">
              Alle zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* ── Ergebniszeile ── */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 20 }}>
        {visible.length} {visible.length === 1 ? 'Schrauberhalle' : 'Schrauberhallen'}
        {refCoords && radius > 0 && ` · im Umkreis von ${radius} km`}
      </div>

      {/* ── Grid ── */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '2px dashed var(--hairline)', borderRadius: 18 }}>
          <p style={{ fontFamily: 'var(--display)', fontSize: 22, color: 'var(--ink-muted)' }}>Keine Treffer.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {visible.map(g => {
            const prof = g.profiles
            const firstPhoto = [g.photo_1, g.photo_2, g.photo_3, g.photo_4, g.photo_5].find(Boolean)
            const initial = (prof?.name || '?').charAt(0).toUpperCase()
            return (
              <Link key={g.id} href={`/schrauberhalle/${g.id}`} className="zh-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 14, padding: 0, overflow: 'hidden' }}>
                {firstPhoto ? (
                  <div style={{ width: '100%', height: 160, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={firstPhoto} alt={prof?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 100, background: 'var(--accent-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--display)', fontSize: 40, color: 'var(--accent-ink)', opacity: 0.4 }}>G</span>
                  </div>
                )}

                <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="zh-avatar offline" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
                      {prof?.avatar_url
                        ? <img src={prof.avatar_url} alt={prof.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : initial
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, lineHeight: 1.1 }}>{prof?.name || 'Unbekannt'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {user && prof?.location && (
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                            {prof.location}
                          </span>
                        )}
                        {g.distance_km !== null && (
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '1.2px', color: 'var(--accent-ink)' }}>
                            {user && prof?.location ? '· ' : ''}{g.distance_km} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {g.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {g.skills.map(skill => (
                        <span key={skill} style={{ ...skillBadgeStyle(true), cursor: 'default', fontSize: 9, padding: '3px 8px' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {g.description && (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {g.description}
                    </p>
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
