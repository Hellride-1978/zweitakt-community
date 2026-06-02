'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faXmark } from '@fortawesome/free-solid-svg-icons'

const STORAGE_KEY = 'zh-plz-nudge-v2-dismissed'

export default function PlzNudgeBanner() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [profileId, setProfileId] = useState(null)

  useEffect(() => {
    if (loading || !user) return
    // Schon weggeklickt?
    if (localStorage.getItem(STORAGE_KEY)) return
    // Nicht auf der Einstellungsseite anzeigen (wäre redundant)
    if (pathname?.includes('/profile/')) return

    supabase
      .from('profiles')
      .select('id, plz')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data && !data.plz) {
          setProfileId(data.id)
          setShow(true)
        }
      })
  }, [user, loading, pathname])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, width: 'calc(100% - 32px)', maxWidth: 540,
      background: 'var(--cream)',
      border: '1.5px solid var(--ink)',
      borderRadius: 16,
      boxShadow: '4px 4px 0 var(--ink)',
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'color-mix(in oklab, var(--accent) 18%, var(--cream))',
        border: '1.5px solid var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 15, color: 'var(--accent-ink)' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
          PLZ hinterlegen
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-muted)', marginTop: 2, lineHeight: 1.4 }}>
          Damit andere Schrauber dich in der Umkreissuche finden.
        </div>
      </div>

      <Link
        href={`/profile/${profileId}?settings=1`}
        onClick={dismiss}
        className="zd-btn accent"
        style={{ fontSize: 12, padding: '8px 14px', flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        Jetzt eintragen
      </Link>

      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink-muted)', padding: 4, flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}
        aria-label="Schließen"
      >
        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 16 }} />
      </button>
    </div>
  )
}
