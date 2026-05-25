'use client'
import { useState, useEffect, useCallback } from 'react'

const NAV_BTN = {
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 20,
  padding: '10px 18px',
  cursor: 'pointer',
  fontFamily: 'var(--mono)',
  lineHeight: 1,
}

export default function VehicleGallery({ images, make, model }) {
  const valid = images.filter(Boolean)
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)

  const openLightbox = (i) => { setLbIndex(i); setLightbox(true) }
  const closeLightbox = () => setLightbox(false)
  const prev = useCallback(() => setLbIndex(i => (i - 1 + valid.length) % valid.length), [valid.length])
  const next = useCallback(() => setLbIndex(i => (i + 1) % valid.length), [valid.length])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  return (
    <>
      <div
        className="bike-hero-big"
        onClick={() => valid[active] && openLightbox(active)}
        style={{ cursor: valid[active] ? 'zoom-in' : 'default' }}
      >
        {valid[active]
          ? <img src={valid[active]} alt={`${make} ${model}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <span style={{ fontFamily: 'var(--display)', fontSize: 72, opacity: 0.3 }}>🏍️</span>
        }
      </div>

      <div className="bike-thumbs">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="t"
            onClick={() => valid[i] && setActive(i)}
            style={{
              cursor: valid[i] ? 'pointer' : 'default',
              outline: active === i && valid[i] ? '2px solid var(--accent)' : 'none',
              outlineOffset: '-2px',
            }}
          >
            {valid[i]
              ? <img src={valid[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontFamily: 'var(--display)', fontSize: 16, opacity: 0.2 }}>{`0${i + 1}`}</span>
            }
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {valid.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }} style={{ ...NAV_BTN, position: 'absolute', left: 20 }} aria-label="Vorheriges Bild">
              ←
            </button>
          )}

          <img
            src={valid[lbIndex]}
            alt={`${make} ${model}`}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 10, boxShadow: '0 8px 48px rgba(0,0,0,0.6)' }}
          />

          {valid.length > 1 && (
            <button onClick={e => { e.stopPropagation(); next() }} style={{ ...NAV_BTN, position: 'absolute', right: 20 }} aria-label="Nächstes Bild">
              →
            </button>
          )}

          <button onClick={closeLightbox} style={{ ...NAV_BTN, position: 'absolute', top: 20, right: 20, padding: '8px 14px', fontSize: 16 }} aria-label="Schließen">
            ✕
          </button>

          {valid.length > 1 && (
            <div style={{ position: 'absolute', bottom: 20, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              {lbIndex + 1} / {valid.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
