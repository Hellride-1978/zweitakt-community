'use client'

import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'
import Image from 'next/image'

function buildIcon(active) {
  const fill = active ? '#e8523a' : '#1a1108'
  const dot = active ? '#fff' : '#e8523a'
  return L.divIcon({
    className: '',
    html: `<svg width="22" height="28" viewBox="0 0 22 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 0C4.925 0 0 4.925 0 11c0 7.29 11 17.5 11 17.5S22 18.29 22 11C22 4.925 17.075 0 11 0z" fill="${fill}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="11" cy="11" r="4" fill="${dot}"/>
    </svg>`,
    iconSize: [22, 28],
    iconAnchor: [11, 28],
    popupAnchor: [0, -30],
  })
}

function MapCapture({ mapRef, tab }) {
  const map = useMap()
  useEffect(() => { mapRef.current = map }, [map, mapRef])
  useEffect(() => {
    if (tab === 'karte') setTimeout(() => map.invalidateSize(), 50)
  }, [tab, map])
  return null
}

function isOnline(lastSeen) {
  if (!lastSeen) return false
  return Date.now() - new Date(lastSeen).getTime() < 10 * 60 * 1000
}

function MemberRow({ m, active, onSelect }) {
  const online = isOnline(m.last_seen)
  const bikes = m.vehicles ?? []
  const latestBike = bikes[0]
  const bikeLabel = latestBike
    ? `${latestBike.make} ${latestBike.model}${latestBike.year ? ` (${latestBike.year})` : ''}`
    : null

  return (
    <div
      className={`mms-row${active ? ' active' : ''}`}
      onClick={() => onSelect(m)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(m)}
    >
      <div className="mms-avatar-wrap">
        <div className="mms-avatar">
          {m.avatar_url
            ? <Image src={m.avatar_url} alt={m.name} width={48} height={48} style={{ objectFit: 'cover', borderRadius: '50%', width: '100%', height: '100%' }} />
            : (m.name || '?').charAt(0).toUpperCase()
          }
        </div>
        {online && <span className="mms-online-dot" title="Gerade online" />}
      </div>

      <div className="mms-info">
        <div className="mms-name">{m.name || 'Unbekannt'}</div>
        {m.location && <div className="mms-loc">{m.location}</div>}
        {bikeLabel && <div className="mms-bike">{bikeLabel}</div>}
      </div>

      <div className="mms-row-right">
        {bikes.length > 1 && (
          <span className="mms-bike-count" title={`${bikes.length} Bikes`}>{bikes.length}</span>
        )}
        <Link
          href={`/profile/${m.id}`}
          className="mms-profile-link"
          onClick={e => e.stopPropagation()}
          title="Profil ansehen"
        >
          →
        </Link>
      </div>
    </div>
  )
}

export default function MemberMapSplit({ members }) {
  const [mounted, setMounted] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [tab, setTab] = useState('liste')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const mapRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  const filtered = members
    .filter(m => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        (m.name || '').toLowerCase().includes(q) ||
        (m.location || '').toLowerCase().includes(q) ||
        (m.vehicles || []).some(v => `${v.make} ${v.model}`.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      if (sort === 'alpha') return (a.name || '').localeCompare(b.name || '', 'de')
      return new Date(b.created_at) - new Date(a.created_at)
    })

  const validMembers = members.filter(m => {
    const lat = parseFloat(m.lat)
    const lng = parseFloat(m.lng)
    return isFinite(lat) && isFinite(lng)
  })

  const handleSelect = (m) => {
    const lat = parseFloat(m.lat)
    const lng = parseFloat(m.lng)
    setActiveId(m.id)
    if (isFinite(lat) && isFinite(lng)) {
      setTab('karte')
      setTimeout(() => {
        mapRef.current?.flyTo([lat, lng], 13, { duration: 0.9 })
      }, 80)
    }
  }

  const onlineCount = members.filter(m => isOnline(m.last_seen)).length

  return (
    <div className="mms-root">

      <div className="mms-tabs">
        <button className={`mms-tab${tab === 'liste' ? ' active' : ''}`} onClick={() => setTab('liste')}>
          Liste ({members.length})
        </button>
        <button className={`mms-tab${tab === 'karte' ? ' active' : ''}`} onClick={() => setTab('karte')}>
          Karte
        </button>
      </div>

      <div className={`mms-split mms-active-${tab}`}>

        <div className="mms-list">
          <div className="mms-list-head">
            <div className="mms-list-stats">
              <span className="mms-stat">
                <span className="mms-stat-n">{members.length}</span>
                <span className="mms-stat-k">auf der Karte</span>
              </span>
              {onlineCount > 0 && (
                <span className="mms-stat mms-stat--online">
                  <span className="mms-online-dot mms-online-dot--sm" />
                  <span className="mms-stat-k">{onlineCount} online</span>
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                className="mms-search"
                type="search"
                placeholder="Name, Ort oder Bike…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setSort(s => s === 'alpha' ? 'newest' : 'alpha')}
                title={sort === 'alpha' ? 'Sortierung: Alphabetisch' : 'Sortierung: Neueste zuerst'}
                style={{
                  flexShrink: 0, padding: '0 10px', height: 36, borderRadius: 8,
                  border: '1.5px solid var(--hairline)', background: 'var(--cream)',
                  cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10,
                  letterSpacing: '1px', color: 'var(--ink-muted)', whiteSpace: 'nowrap',
                }}
              >
                {sort === 'alpha' ? 'A–Z' : 'Neu'}
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mms-empty">Keine Treffer für „{search}"</div>
          ) : (
            filtered.map(m => (
              <MemberRow
                key={m.id}
                m={m}
                active={activeId === m.id}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>

        <div className="mms-map">
          {!mounted ? (
            <div className="mms-loading">Karte lädt…</div>
          ) : (
            <MapContainer
              center={[51.165691, 10.451526]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              zoomControl
              attributionControl
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              />
              <MapCapture mapRef={mapRef} tab={tab} />
              {validMembers.map(m => (
                <Marker
                  key={m.id}
                  position={[parseFloat(m.lat), parseFloat(m.lng)]}
                  icon={buildIcon(activeId === m.id)}
                  eventHandlers={{ click: () => setActiveId(m.id) }}
                >
                  <Popup>
                    <Link
                      href={`/profile/${m.id}`}
                      style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', textDecoration: 'none' }}
                    >
                      {m.name || 'Unbekannt'}
                    </Link>
                    {m.location && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>
                        {m.location}
                      </div>
                    )}
                    {m.vehicles?.[0] && (
                      <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                        {m.vehicles[0].make} {m.vehicles[0].model}
                        {m.vehicles[0].year ? ` (${m.vehicles[0].year})` : ''}
                      </div>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

      </div>
    </div>
  )
}
