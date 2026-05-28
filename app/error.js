'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="zh-page">
      <div className="zh-page-inner-sm" style={{ textAlign: 'center', paddingTop: 64 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 16 }}>
          Fehler
        </div>
        <h1 className="zh-page-title">Etwas ist schiefgelaufen.</h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink-soft)', marginTop: 12, lineHeight: 1.6 }}>
          Die Seite konnte nicht geladen werden.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
          <button onClick={reset} className="zh-btn">
            Nochmal versuchen →
          </button>
          <Link href="/" className="zh-btn" style={{ background: 'transparent', color: 'var(--ink)', border: '1.5px solid var(--ink)' }}>
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  )
}
