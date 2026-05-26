'use client'
import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMotorcycle, faChevronLeft, faChevronRight, faXmark } from '@fortawesome/free-solid-svg-icons'

const NAV_BTN = {
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 20,
  padding: '10px 18px',
  cursor: 'pointer',
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
      <button
        type="button"
        className="bike-hero-big"
        onClick={() => valid[active] && openLightbox(active)}
        style={{ cursor: valid[active] ? 'zoom-in' : 'default' }}
        aria-label={valid[active] ? `${make} ${model} vergrößern` : undefined}
        disabled={!valid[active]}
      >
        {valid[active]
          ? <img src={valid[active]} alt={`${make} ${model}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          : <FontAwesomeIcon icon={faMotorcycle} style={{ fontSize: 72, opacity: 0.3 }} aria-hidden="true" />
        }
      </button>

      <div className="bike-thumbs">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            className="t"
            onClick={() => valid[i] && setActive(i)}
            disabled={!valid[i]}
            aria-label={valid[i] ? `${make} ${model} – Bild ${i + 1}` : `Kein Bild ${i + 1}`}
            aria-pressed={active === i && !!valid[i]}
            style={{
              cursor: valid[i] ? 'pointer' : 'default',
              outline: active === i && valid[i] ? '2px solid var(--ink)' : 'none',
              outlineOffset: '-2px',
            }}
          >
            {valid[i]
              ? <img src={valid[i]} alt="" aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span aria-hidden="true" style={{ fontFamily: 'var(--display)', fontSize: 16, opacity: 0.2 }}>{`0${i + 1}`}</span>
            }
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Bildvorschau: ${make} ${model}`}
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {valid.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }} style={{ ...NAV_BTN, position: 'absolute', left: 20 }} aria-label="Vorheriges Bild">
              <FontAwesomeIcon icon={faChevronLeft} />
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
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          )}

          <button onClick={closeLightbox} style={{ ...NAV_BTN, position: 'absolute', top: 20, right: 20, padding: '8px 14px', fontSize: 16 }} aria-label="Schließen">
            <FontAwesomeIcon icon={faXmark} />
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
