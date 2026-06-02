'use client'
import { useState } from 'react'

export default function AvatarLightbox({ src, alt, initial, isOnline = false }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className={`zh-avatar${isOnline ? '' : ' offline'}`}
        onClick={src ? () => setOpen(true) : undefined}
        style={{
          width: 100, height: 100, fontSize: 36,
          margin: '0 auto 14px',
          boxShadow: '4px 4px 0 var(--ink)',
          cursor: src ? 'zoom-in' : 'default',
        }}
      >
        {src
          ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          : initial
        }
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(26,17,8,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              borderRadius: 16,
              boxShadow: '6px 6px 0 var(--ink)',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </>
  )
}
