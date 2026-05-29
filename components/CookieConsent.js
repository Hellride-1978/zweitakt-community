'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('zh-cookie-consent')) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('zh-cookie-consent', 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'var(--ink)', color: 'var(--cream)',
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      borderTop: '2px solid var(--accent)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
    }}>
      <p style={{ flex: 1, minWidth: 220, margin: 0, fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.8)' }}>
        Wir verwenden notwendige Cookies für den Login und den Betrieb der Seite. Keine Tracking- oder Werbe-Cookies.{' '}
        <Link href="/datenschutz" style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Datenschutz
        </Link>
      </p>
      <button
        onClick={accept}
        className="zd-btn accent"
        style={{ flexShrink: 0, fontSize: 14, padding: '10px 22px' }}
      >
        Verstanden
      </button>
    </div>
  )
}
