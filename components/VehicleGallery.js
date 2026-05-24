'use client'
import { useState } from 'react'

export default function VehicleGallery({ images, make, model }) {
  const valid = images.filter(Boolean)
  const [active, setActive] = useState(0)

  return (
    <>
      <div className="bike-hero-big">
        {valid[active]
          ? <img src={valid[active]} alt={`${make} ${model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              ? <img src={valid[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'var(--display)', fontSize: 16, opacity: 0.2 }}>{`0${i + 1}`}</span>
            }
          </div>
        ))}
      </div>
    </>
  )
}
