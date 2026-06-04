'use client'

import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

function buildIcon(active) {
  const fill = active ? '#e8523a' : '#1a1108'
  const dot = active ? '#fff' : '#e8523a'
  return L.divIcon({
    className: '',
    html: `<svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0C4.477 0 0 4.477 0 10c0 6.627 10 16 10 16s10-9.373 10-16C20 4.477 15.523 0 10 0z" fill="${fill}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="3.5" fill="${dot}"/>
    </svg>`,
    iconSize: [20, 26],
    iconAnchor: [10, 26],
    popupAnchor: [0, -28],
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

export default function MemberMapSplit({ members }) {
  const [mounted, setMounted] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [tab, setTab] = useState('liste')
  const mapRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  const sortedMembers = [...members].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'de')
  )

  const validMembers = members.filter(m => {
    const lat = parseFloat(m.lat)
    const lng = parseFloat(m.lng)
    return isFinite(lat) && isFinite(lng)
  })

  const handleSelect = (m) => {
    const lat = parseFloat(m.lat)
    const lng = parseFloat(m.lng)
    setActiveId(m.id)
    setTab('karte')
    if (isFinite(lat) && isFinite(lng)) {
      setTimeout(() => {
        mapRef.current?.flyTo([lat, lng], 13, { duration: 0.9 })
      }, 80)
    }
  }

  return (
    <div className="mms-root">
      <div className="mms-tabs">
        <button
          className={`mms-tab${tab === 'liste' ? ' active' : ''}`}
          onClick={() => setTab('liste')}
        >
          Liste
        </button>
        <button
          className={`mms-tab${tab === 'karte' ? ' active' : ''}`}
          onClick={() => setTab('karte')}
        >
          Karte
        </button>
      </div>

      <div className={`mms-split mms-active-${tab}`}>

        {/* List — zeigt alle members, klick fliegt nur wenn Koordinaten vorhanden */}
        <div className="mms-list">
          {sortedMembers.map((m) => (
            <div
              key={m.id}
              className={`mms-row${activeId === m.id ? ' active' : ''}`}
              onClick={() => handleSelect(m)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleSelect(m)}
            >
              <div className="mms-avatar">
                {m.avatar_url
                  ? <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : (m.name || '?').charAt(0).toUpperCase()
                }
              </div>
              <div className="mms-info">
                <div className="mms-name">{m.name || 'Unbekannt'}</div>
                {m.location && <div className="mms-loc">{m.location}</div>}
              </div>
              <Link
                href={`/profile/${m.id}`}
                className={`mms-profile-link${activeId === m.id ? ' visible' : ''}`}
                onClick={e => e.stopPropagation()}
              >
                →
              </Link>
            </div>
          ))}
        </div>

        {/* Map */}
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
              {validMembers.map((m) => (
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
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', marginTop: 2 }}>
                        {m.location}
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
