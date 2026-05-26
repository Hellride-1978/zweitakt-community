'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from './ThemeProvider'
import { PALETTES } from '@/lib/palettes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaintRoller } from '@fortawesome/free-solid-svg-icons'

export default function ThemeToggle() {
  const { palette, setPalette } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Farbe wählen"
        title="Farbe wählen"
        className="zh-roller-btn"
        style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: open ? 'var(--parchment)' : 'none',
          border: '1.5px solid ' + (open ? 'var(--hairline)' : 'transparent'),
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15,
          transition: 'background 0.18s, border-color 0.18s',
        }}
      >
        <FontAwesomeIcon icon={faPaintRoller} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          left: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--cream)',
          borderRadius: 999,
          padding: '8px 12px',
          border: '1.5px solid var(--hairline)',
          boxShadow: '4px 4px 0 var(--ink)',
          zIndex: 100,
          whiteSpace: 'nowrap',
        }}>
          {Object.entries(PALETTES).map(([key, p]) => (
            <button
              key={key}
              onClick={() => { setPalette(key); setOpen(false) }}
              aria-label={p.label}
              title={p.label}
              style={{
                width: 20, height: 20,
                borderRadius: '50%',
                background: p.swatch,
                border: palette === key ? '2.5px solid var(--ink)' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
                transition: 'transform 0.18s, border-color 0.18s',
                transform: palette === key ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
