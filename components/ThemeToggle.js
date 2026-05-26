'use client'

import { useTheme } from './ThemeProvider'
import { PALETTES } from '@/lib/palettes'

export default function ThemeToggle() {
  const { palette, setPalette } = useTheme()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: 'var(--parchment)',
      borderRadius: 999,
      padding: '4px 8px',
      border: '1.5px solid var(--hairline)',
    }}>
      {Object.entries(PALETTES).map(([key, p]) => (
        <button
          key={key}
          onClick={() => setPalette(key)}
          aria-label={p.label}
          title={p.label}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: p.swatch,
            border: palette === key ? '2px solid var(--ink)' : '2px solid transparent',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            transition: 'transform 0.18s, border-color 0.18s',
            transform: palette === key ? 'scale(1.25)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}
