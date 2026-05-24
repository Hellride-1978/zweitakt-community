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

  const btn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '9px 10px', borderRadius: 10, cursor: 'pointer',
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase',
    border: '1.5px solid var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden',
    textDecoration: 'none', background: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      <button type="button" onClick={() => copyLink('link')} aria-label="Event-Link in Zwischenablage kopieren" style={{ ...btn, width: '100%', background: copiedKey === 'link' ? 'var(--accent)' : 'var(--cream)', color: copiedKey === 'link' ? '#fff' : 'var(--ink)' }}>
        {copiedKey === 'link' ? '✓ Kopiert!' : '⎘ Link kopieren'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

        <button type="button" onClick={shareEmail} aria-label="Event per E-Mail teilen" style={{ ...btn, background: copiedKey === 'mail' ? 'var(--accent)' : 'var(--cream)', color: copiedKey === 'mail' ? '#fff' : 'var(--ink)' }}>
          {copiedKey === 'mail' ? '✓ Geöffnet' : 'E-Mail'}
        </button>

        <button type="button" onClick={shareFacebook} aria-label="Event auf Facebook teilen" style={{ ...btn, background: '#1877F2', color: '#fff', border: '1.5px solid #1877F2' }}>
          Facebook
        </button>

        <button type="button" onClick={() => copyLink('ig')} aria-label="Link für Instagram kopieren" style={{ ...btn, background: copiedKey === 'ig' ? '#C13584' : 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: '#fff', border: '1.5px solid transparent' }}>
          {copiedKey === 'ig' ? '✓ Kopiert!' : 'Instagram'}
        </button>

        <button type="button" onClick={() => copyLink('tt')} aria-label="Link für TikTok kopieren" style={{ ...btn, background: copiedKey === 'tt' ? '#333' : '#010101', color: '#fff', border: '1.5px solid #333' }}>
          {copiedKey === 'tt' ? '✓ Kopiert!' : 'TikTok'}
        </button>

      </div>
    </div>
  )
}
