'use client'

import { useEffect, useState } from 'react'

function formatNow() {
  const d = new Date()
  const days = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA']
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${days[d.getDay()]} · ${d.getDate()}. ${months[d.getMonth()]} · ${h}:${m}`
}

export default function DesktopTopRow({ crumb }) {
  const [now, setNow] = useState('')

  useEffect(() => {
    setNow(formatNow())
    const t = setInterval(() => setNow(formatNow()), 60000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="zd-top">
      <div className="breadcrumb">
        <span>Zweitakthoden</span>
        {crumb && (
          <>
            <span className="sep"/>
            <em>{crumb}</em>
          </>
        )}
      </div>
      <div className="search" role="search" aria-label="Suchen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }} aria-hidden="true">
          <circle cx="11" cy="11" r="6"/>
          <path d="M16 16l4 4"/>
        </svg>
        <span>Suchen — Touren, Leute, Bikes…</span>
        <span className="kbd" aria-label="Tastenkürzel Command K">⌘ K</span>
      </div>
      <div className="toptools">
        <button className="iconbtn" aria-label="Benachrichtigungen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }} aria-hidden="true">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </button>
        {now && <span className="when">{now}</span>}
      </div>
    </div>
  )
}
