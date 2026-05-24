'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function GeoLocator({ hasPin }) {
  const map = useMap()
  useEffect(() => {
    if (hasPin) return
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.flyTo([coords.latitude, coords.longitude], 13, { duration: 1.2 })
      },
      () => {},
      { timeout: 6000 }
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function MapSearchBox({ onResult }) {
  const map = useMap()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const debounce = useRef(null)
  const wrapRef = useRef(null)

  const stopProp = (e) => e.stopPropagation()

  const fetchSuggestions = async (q) => {
    if (q.length < 3) { setResults([]); setOpen(false); return }
    setBusy(true)
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.slice(0, 5))
      setOpen(data.length > 0)
    } catch {
      setResults([])
    } finally {
      setBusy(false)
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => fetchSuggestions(val), 350)
  }

  const handleSelect = (r) => {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)
    map.flyTo([lat, lng], 16, { duration: 1.1 })
    onResult?.(lat, lng)
    setQuery(r.display_name.split(',').slice(0, 2).join(','))
    setResults([])
    setOpen(false)
  }

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{ position: 'absolute', top: 10, left: 10, right: 46, zIndex: 1000 }}
      onMouseDown={stopProp}
      onClick={stopProp}
      onDoubleClick={stopProp}
      onWheel={stopProp}
    >
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Adresse oder Ort suchen…"
          style={{
            flex: 1, padding: '8px 12px',
            border: '1.5px solid var(--ink)', borderRadius: 8,
            fontFamily: 'var(--sans)', fontSize: 13,
            background: 'rgba(255,255,255,0.97)',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
          }}
        />
        {busy && (
          <div style={{
            position: 'absolute', right: 56, top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)',
          }}>…</div>
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{
          marginTop: 4,
          background: '#fff',
          border: '1.5px solid var(--ink)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 6px 24px rgba(0,0,0,0.16)',
        }}>
          {results.map((r, i) => {
            const parts = r.display_name.split(',')
            const main = parts[0]
            const sub = parts.slice(1, 3).join(',').trim()
            return (
              <div
                key={i}
                onMouseDown={() => handleSelect(r)}
                style={{
                  padding: '9px 13px',
                  borderBottom: i < results.length - 1 ? '1px solid var(--hairline)' : 'none',
                  cursor: 'pointer',
                  background: '#fff',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--parchment, #f5f0e8)'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{main}</div>
                {sub && <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-muted)', marginTop: 1 }}>{sub}</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function EventMap({ lat, lng, onMapClick, markerLabel, readOnly = false, style: styleProp, zoomControl = true, attributionControl = true, interactive = true }) {
  const center = lat && lng ? [lat, lng] : [51.165691, 10.451526]
  const zoom = lat && lng ? 14 : 6
  const defaultStyle = { height: '320px', width: '100%', borderRadius: '14px', border: '2px solid var(--ink)' }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={styleProp ?? defaultStyle}
      zoomControl={zoomControl}
      attributionControl={attributionControl}
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      keyboard={interactive}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {!readOnly && <GeoLocator hasPin={!!(lat && lng)} />}
      {!readOnly && <ClickHandler onMapClick={onMapClick} />}
      {!readOnly && <MapSearchBox onResult={onMapClick} />}
      {lat && lng && (
        <Marker position={[lat, lng]}>
          {markerLabel && <Popup>{markerLabel}</Popup>}
        </Marker>
      )}
    </MapContainer>
  )
}
