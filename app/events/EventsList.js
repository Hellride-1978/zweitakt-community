'use client'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'


function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDay(dateStr) {
  return new Date(dateStr).toLocaleDateString('de-DE', { weekday: 'short' }).toUpperCase()
}
function formatTime(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (d.getHours() === 0 && d.getMinutes() === 0) return null
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export default function EventsList({ events, filter }) {
  const [sortMode, setSortMode] = useState('date')
  const [userLat, setUserLat] = useState(null)
  const [userLon, setUserLon] = useState(null)
  const [plz, setPlz] = useState('')
  const [locStatus, setLocStatus] = useState('idle') // idle | loading | ready | error
  const [radius, setRadius] = useState(null) // null = kein Filter, Zahl = km
  const [pinAddresses, setPinAddresses] = useState({}) // eventId → address string

  useEffect(() => {
    const toFetch = events.filter(e => e.location_lat && e.location_lng)
    if (toFetch.length === 0) return
    // Nominatim allows 1 req/s — stagger calls
    toFetch.forEach((ev, i) => {
      setTimeout(async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${ev.location_lat}&lon=${ev.location_lng}&format=json&zoom=17`,
            { headers: { 'Accept-Language': 'de' } }
          )
          const data = await res.json()
          if (data?.display_name) {
            // Keep only street + city — skip long country/state suffix
            const parts = data.display_name.split(',').slice(0, 3).map(s => s.trim())
            setPinAddresses(prev => ({ ...prev, [ev.id]: parts.join(', ') }))
          }
        } catch { /* silently ignore */ }
      }, i * 1100)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyCoords = useCallback((lat, lon) => {
    setUserLat(lat)
    setUserLon(lon)
    setSortMode('distance')
    setLocStatus('ready')
  }, [])

  const useGeolocation = useCallback(() => {
    if (!navigator.geolocation) { setLocStatus('error'); return }
    setLocStatus('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        applyCoords(latitude, longitude)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'de' } }
          )
          const data = await res.json()
          const code = data?.address?.postcode
          if (code) setPlz(code.replace(/\D/g, '').slice(0, 5))
        } catch { /* ignore */ }
      },
      () => setLocStatus('error')
    )
  }, [applyCoords])

  const lookupPlz = useCallback(async (e) => {
    e.preventDefault()
    const code = plz.trim()
    if (!code) return
    setLocStatus('loading')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(code)}&country=DE&format=json&limit=1`,
        { headers: { 'Accept-Language': 'de' } }
      )
      const data = await res.json()
      if (data[0]) {
        applyCoords(parseFloat(data[0].lat), parseFloat(data[0].lon))
      } else {
        setLocStatus('error')
      }
    } catch {
      setLocStatus('error')
    }
  }, [plz, applyCoords])

  const sortedEvents = sortMode === 'distance' && userLat != null
    ? [...events].sort((a, b) => {
        const da = (a.location_lat && a.location_lng) ? haversine(userLat, userLon, a.location_lat, a.location_lng) : Infinity
        const db = (b.location_lat && b.location_lng) ? haversine(userLat, userLon, b.location_lat, b.location_lng) : Infinity
        return da - db
      })
    : events

  const filteredEvents = (radius != null && userLat != null)
    ? sortedEvents.filter(ev =>
        ev.location_lat && ev.location_lng &&
        haversine(userLat, userLon, ev.location_lat, ev.location_lng) <= radius
      )
    : sortedEvents

  return (
    <>
      {/* ── Sort controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 2 }}>
        <div className="tab-pills" role="group" aria-label="Sortierung">
          <button
            className={`tab-pill${sortMode === 'date' ? ' on' : ''}`}
            onClick={() => setSortMode('date')}
            aria-pressed={sortMode === 'date'}
          >
            Datum
          </button>
          <button
            className={`tab-pill${sortMode === 'distance' ? ' on' : ''}`}
            onClick={() => userLat != null && setSortMode('distance')}
            aria-pressed={sortMode === 'distance'}
            aria-disabled={userLat == null}
            style={{ opacity: userLat == null ? 0.4 : 1, cursor: userLat == null ? 'default' : 'pointer' }}
            title={userLat == null ? 'Zuerst PLZ eingeben oder Standort freigeben' : undefined}
          >
            Entfernung
          </button>
        </div>

        <form onSubmit={lookupPlz} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <label htmlFor="plz-input" className="zh-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>PLZ</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="plz-input"
              className="zh-input"
              style={{ width: 88, padding: '7px 30px 7px 10px', fontSize: 13 }}
              placeholder="12345"
              aria-label="Postleitzahl für Entfernungssuche"
              value={plz}
              onChange={e => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
            />
            <button
              type="button"
              onClick={useGeolocation}
              disabled={locStatus === 'loading'}
              title="Aktuellen Standort verwenden"
              style={{ position: 'absolute', right: 7, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: locStatus === 'ready' ? 'var(--accent)' : 'var(--ink-muted)', opacity: locStatus === 'loading' ? 0.4 : 1 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
              </svg>
            </button>
          </div>
          <select
            value={radius ?? ''}
            onChange={e => setRadius(e.target.value ? Number(e.target.value) : null)}
            className="zh-input"
            style={{ width: 'auto', padding: '7px 10px', fontSize: 13 }}
            aria-label="Umkreis"
          >
            <option value="">Alle km</option>
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select>
          <button type="submit" className="zd-btn-sm" disabled={locStatus === 'loading'}>
            {locStatus === 'loading' ? '…' : 'Los'}
          </button>
        </form>

        {locStatus === 'error' && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.4, color: '#c55a3c', textTransform: 'uppercase' }}>
            Nicht gefunden
          </span>
        )}

        <Link href="/events/new" className="zd-btn accent" style={{ marginLeft: 'auto', fontSize: 15, padding: '9px 18px', textDecoration: 'none', flexShrink: 0 }}>
          + Termin
        </Link>
      </div>

      {/* ── Event list ── */}
      {!events || events.length === 0 ? (
        <div className="zd-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📍</div>
          <p style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink-muted)' }}>
            {filter === 'upcoming' ? 'Keine Termine in der Zukunft.' : 'Noch keine Termine.'}
          </p>
          <Link href="/events/new" className="zd-btn accent" style={{ display: 'inline-flex', marginTop: 20 }}>
            Ersten Termin erstellen →
          </Link>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="zd-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📍</div>
          <p style={{ fontFamily: 'var(--display)', fontSize: 24, color: 'var(--ink-muted)' }}>
            Keine Termine im gewählten Umkreis.
          </p>
          <button onClick={() => setRadius(null)} className="zd-btn accent" style={{ display: 'inline-flex', marginTop: 20 }}>
            Filter aufheben
          </button>
        </div>
      ) : (
        filteredEvents.map((event) => {
          const participantCount = event.ride_participants?.[0]?.count ?? 0
          const date = new Date(event.start_date)
          const time = formatTime(event.start_date)
          const distKm =
            sortMode === 'distance' && userLat != null && event.location_lat && event.location_lng
              ? Math.round(haversine(userLat, userLon, event.location_lat, event.location_lng))
              : null
          return (
            <Link key={event.id} href={`/events/${event.id}`} className="zd-ride" style={{ textDecoration: 'none' }}>
              <div className="when-block">
                <div className="day">{formatDay(event.start_date)}</div>
                <div className="num">{date.getDate()}</div>
                <div className="mon">{date.toLocaleDateString('de-DE', { month: 'short' })}</div>
                {time && <div className="tm">{time}</div>}
              </div>
              <div className="body">
                <div className="title">{event.title}</div>
                <div className="meta">
                  <span>👥 {participantCount}{event.max_participants ? ` / ${event.max_participants}` : ''}</span>
                  {distKm != null && <><span className="sep" /><span>~{distKm} km</span></>}
                </div>
                {(event.location || event.location_lat) && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-muted)', flexShrink: 0, marginTop: 2 }}>
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {event.location && (
                        <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-soft)' }}>{event.location}</span>
                      )}
                      {pinAddresses[event.id] && (
                        <button
                          type="button"
                          onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`https://www.openstreetmap.org/?mlat=${event.location_lat}&mlon=${event.location_lng}&zoom=15`, '_blank', 'noopener,noreferrer') }}
                          style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--ink-muted)', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 2, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                        >
                          {pinAddresses[event.id]}
                        </button>
                      )}
                      {event.location_lat && !pinAddresses[event.id] && (
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--ink-muted)' }}>
                          {event.location_lat.toFixed(4)}, {event.location_lng.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {event.description && (
                  <div className="desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                  </div>
                )}
              </div>
              <div className="cta-col">
                <span className="zd-mono accent">→</span>
              </div>
            </Link>
          )
        })
      )}
    </>
  )
}
