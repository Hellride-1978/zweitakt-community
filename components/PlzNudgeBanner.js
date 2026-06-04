'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faXmark } from '@fortawesome/free-solid-svg-icons'

const STORAGE_KEY = 'zh-plz-nudge-v3-snoozed'
const SNOOZE_DAYS = 7

export default function PlzNudgeBanner() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [profileId, setProfileId] = useState(null)

  useEffect(() => {
    if (loading || !user) return
    const snoozed = localStorage.getItem(STORAGE_KEY)
    if (snoozed && Date.now() < Number(snoozed)) return
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
    localStorage.setItem(STORAGE_KEY, String(Date.now() + SNOOZE_DAYS * 86400_000))
    setShow(false)
  }

  if (!show) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(26,17,8,0.55)',
          zIndex: 1100,
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1101,
        width: 'calc(100% - 32px)',
        maxWidth: 460,
        background: 'var(--cream)',
        border: '2.5px solid var(--ink)',
        borderRadius: 24,
        boxShadow: '6px 6px 0 var(--ink)',
        padding: '36px 32px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 0,
      }}
        role="dialog"
        aria-modal="true"
        aria-label="PLZ hinterlegen"
      >
        <button
          onClick={dismiss}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-muted)', padding: 4,
            display: 'flex', alignItems: 'center',
          }}
          aria-label="Schließen"
        >
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 18 }} />
        </button>

        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'color-mix(in oklab, var(--accent) 15%, var(--cream))',
          border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <FontAwesomeIcon icon={faLocationDot} style={{ fontSize: 26, color: 'var(--accent-ink)' }} />
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--accent-ink)', marginBottom: 10 }}>
          Noch nicht eingetragen
        </div>

        <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(28px, 5vw, 38px)', lineHeight: 0.95, margin: '0 0 16px', color: 'var(--ink)' }}>
          Wo schraubst<br />du?
        </h2>

        <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.5, margin: '0 0 28px', maxWidth: 320 }}>
          Trag deine PLZ ein — dann erscheinst du auf der Schrauber-Karte und kannst Leute in deiner Nähe finden.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <Link
            href={`/profile/${profileId}?settings=1`}
            onClick={dismiss}
            className="zh-btn"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            PLZ jetzt eintragen →
          </Link>
          <button
            onClick={dismiss}
            style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '1.5px',
              textTransform: 'uppercase', color: 'var(--ink-muted)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
            }}
          >
            Später ({SNOOZE_DAYS} Tage)
          </button>
        </div>
      </div>
    </>
  )
}
