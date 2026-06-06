'use client'

import { useState } from 'react'

export default function ShareButtons({ title }) {
  const [copiedKey, setCopiedKey] = useState(null)

  const copyLink = async (key) => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2200)
    } catch {}
  }

  const shareEmail = () => {
    const u = window.location.href
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Schau dir diese Ausfahrt an:\n' + u)}`
    setCopiedKey('mail')
    setTimeout(() => setCopiedKey(null), 2200)
  }

  const shareFacebook = () => {
    const u = encodeURIComponent(window.location.href)
    window.location.assign(`https://www.facebook.com/sharer/sharer.php?u=${u}`)
  }

  const base = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--display)', fontSize: 16, letterSpacing: '0.3px',
    padding: '10px 20px', borderRadius: 100, cursor: 'pointer',
    border: '2.5px solid var(--ink)', background: 'transparent', color: 'var(--ink)',
    boxShadow: '3px 3px 0 var(--ink)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s',
    whiteSpace: 'nowrap',
  }

  const lift    = e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 var(--accent)'; e.currentTarget.style.background = 'var(--accent)' }
  const unlift  = e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 var(--ink)'; e.currentTarget.style.background = 'transparent' }
  const liftFb  = e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #0d5bb5' }
  const unliftFb= e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 #0d5bb5' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        type="button"
        onClick={() => copyLink('link')}
        aria-label="Event-Link kopieren"
        style={{ ...base, width: '100%', background: copiedKey === 'link' ? 'var(--accent)' : 'transparent' }}
        onMouseEnter={lift} onMouseLeave={unlift}
      >
        {copiedKey === 'link' ? '✓ Kopiert!' : '⎘ Link kopieren'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          type="button"
          onClick={shareEmail}
          aria-label="Per E-Mail teilen"
          style={{ ...base, background: copiedKey === 'mail' ? 'var(--accent)' : 'transparent' }}
          onMouseEnter={lift} onMouseLeave={unlift}
        >
          {copiedKey === 'mail' ? '✓ Geöffnet' : 'E-Mail'}
        </button>
        <button
          type="button"
          onClick={shareFacebook}
          aria-label="Auf Facebook teilen"
          style={{ ...base, border: '2.5px solid #1877F2', background: '#1877F2', color: '#fff', boxShadow: '3px 3px 0 #0d5bb5' }}
          onMouseEnter={liftFb} onMouseLeave={unliftFb}
        >
          Facebook
        </button>
      </div>
    </div>
  )
}
