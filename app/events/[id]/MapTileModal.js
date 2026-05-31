'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'

const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false })

export default function MapTileModal({ lat, lng, locationName, address, tiles, fracX, fracY }) {
  const [open, setOpen] = useState(false)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Kartenansicht für ${locationName || 'Treffpunkt'} öffnen`}
        style={{
          display: 'block', width: '100%', textAlign: 'left',
          borderRadius: 16, overflow: 'hidden',
          border: '1.5px solid var(--ink)', boxShadow: '4px 4px 0 var(--ink)',
          background: 'var(--cream)', cursor: 'pointer',
          transition: 'transform 0.18s, box-shadow 0.18s',
          padding: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--ink)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 var(--ink)' }}
      >
        {/* Tile preview — 3×3 grid centered on pin */}
        <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#e8e4dc' }}>
          {/* Pin is at (fracX * 256 + 256, fracY * 256 + 256) within the 768×768 grid */}
          <div style={{
            position: 'absolute',
            left: `calc(50% - ${Math.round(fracX * 256 + 256)}px)`,
            top: `calc(50% - ${Math.round(fracY * 256 + 256)}px)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 256px)',
            width: 768,
            pointerEvents: 'none',
          }}>
            {tiles.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} width={256} height={256} alt="" draggable={false} style={{ display: 'block' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -100%)', zIndex: 2 }}>
            <div style={{
              width: 18, height: 18,
              borderRadius: '50% 50% 50% 0',
              background: 'var(--accent)',
              border: '2.5px solid #fff',
              transform: 'rotate(-45deg)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }} />
          </div>
          {/* Expand badge */}
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(255,255,255,0.93)', border: '1px solid var(--hairline)',
            borderRadius: 7, padding: '4px 10px',
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.6, textTransform: 'uppercase',
            color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            Karte öffnen <FontAwesomeIcon icon={faUpRightFromSquare} style={{ fontSize: 8 }} />
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '12px 16px 16px', borderTop: '1.5px solid var(--ink)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent-ink)', marginBottom: 5 }}>Treffpunkt</div>
          {locationName && (
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.05, color: 'var(--ink)', marginBottom: address ? 6 : 0 }}>
              {locationName}
            </div>
          )}
          {address && (
            <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
              {address}
            </div>
          )}
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          role="presentation"
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(26,17,8,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-modal-title"
            style={{
              background: 'var(--cream)', borderRadius: 18,
              border: '1.5px solid var(--ink)', boxShadow: '8px 8px 0 var(--ink)',
              overflow: 'hidden', width: '100%', maxWidth: 700,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1.5px solid var(--ink)', gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent-ink)', marginBottom: 4 }}>Treffpunkt</div>
                <div id="map-modal-title" style={{ fontFamily: 'var(--display)', fontSize: 24, lineHeight: 1, marginBottom: address ? 5 : 0 }}>{locationName || '—'}</div>
                {address && (
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{address}</div>
                )}
              </div>
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                aria-label="Karte schließen"
                style={{
                  flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
                  border: '1.5px solid var(--ink)', background: 'var(--cream)',
                  cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center',
                }}
              ><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            {/* Full interactive map */}
            <EventMap
              lat={lat} lng={lng} readOnly
              markerLabel={locationName || 'Treffpunkt'}
              style={{ height: '400px', width: '100%', borderRadius: 0, border: 'none' }}
            />
          </div>
        </div>
      )}
    </>
  )
}
