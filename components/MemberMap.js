'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

const GERMANY_CENTER = [51.165691, 10.451526]
const GERMANY_ZOOM = 6

export default function MemberMap({ members }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{
        height: 420,
        borderRadius: 18,
        border: '2px solid var(--ink)',
        background: 'var(--parchment)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-muted)' }}>Karte lädt…</span>
      </div>
    )
  }

  return (
    <MapContainer
      center={GERMANY_CENTER}
      zoom={GERMANY_ZOOM}
      style={{ height: 420, width: '100%', borderRadius: 18, border: '2px solid var(--ink)' }}
      zoomControl={true}
      attributionControl={true}
      dragging={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      keyboard={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {members.map((m) => (
        <CircleMarker
          key={m.id}
          center={[m.lat, m.lng]}
          radius={7}
          title={m.name ? `Standort von ${m.name}` : 'Schrauber-Standort'}
          pathOptions={{
            color: '#1a1108',
            fillColor: '#e8523a',
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>
            <Link
              href={`/profile/${m.id}`}
              style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13, color: 'var(--ink)', textDecoration: 'none' }}
            >
              {m.name || 'Unbekannt'}
            </Link>
            {m.location && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)', marginTop: 3 }}>
                {m.location}
              </div>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
