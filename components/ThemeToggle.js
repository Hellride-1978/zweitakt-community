'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: 'var(--parchment)',
      borderRadius: 999,
      padding: '4px 6px',
      border: '1.5px solid var(--hairline)',
    }}>
      <button
        onClick={() => toggle('blue')}
        aria-label="Blaues Theme"
        title="Blau"
        style={{
          width: 18, height: 18,
          borderRadius: '50%',
          background: 'rgb(155, 195, 214)',
          border: theme === 'blue' ? '2px solid var(--ink)' : '2px solid transparent',
          cursor: 'pointer',
          padding: 0,
          transition: 'border-color 0.18s, transform 0.18s',
          transform: theme === 'blue' ? 'scale(1.2)' : 'scale(1)',
        }}
      />
      <button
        onClick={() => toggle('pink')}
        aria-label="Rosanes Theme"
        title="Rosa"
        style={{
          width: 18, height: 18,
          borderRadius: '50%',
          background: '#FF5C8F',
          border: theme === 'pink' ? '2px solid var(--ink)' : '2px solid transparent',
          cursor: 'pointer',
          padding: 0,
          transition: 'border-color 0.18s, transform 0.18s',
          transform: theme === 'pink' ? 'scale(1.2)' : 'scale(1)',
        }}
      />
    </div>
  )
}
