'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'

const TOUR_KEY = 'zh-tour-v1'

const STEPS = [
  {
    id: 'tour-profil',
    title: 'Dein Profil',
    text: 'Leg kurz fest, wer du bist. Marke und Hubraum sind zweitrangig.',
  },
  {
    id: 'tour-bikes',
    title: 'Deine Kisten',
    text: 'Trag deine Kisten ein – damit andere sehen, was du fährst.',
  },
  {
    id: 'tour-termine',
    title: 'Termine & Ausfahrten',
    text: 'Schau welche Runden geplant sind und mach einfach mit.',
  },
]

function getTooltipPos(id) {
  const el = document.getElementById(id)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const centerX = r.left + r.width / 2
  const vw = window.innerWidth
  // Clamp so tooltip (max 300px wide) stays within viewport
  const clamped = Math.min(Math.max(centerX, 160), vw - 160)
  return {
    top: r.bottom + 14,
    left: clamped,
    arrowOffset: centerX - clamped, // how far the arrow needs to shift
  }
}

function setHighlight(id, on) {
  const el = id ? document.getElementById(id) : null
  if (el) el.classList.toggle('zh-tour-highlight', on)
}

export default function OnboardingTour() {
  const { user, loading } = useAuth()
  const [phase, setPhase] = useState('idle') // idle | welcome | touring | done
  const [step, setStep]   = useState(0)
  const [pos,  setPos]    = useState(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  useEffect(() => {
    if (loading || !user) return
    if (!localStorage.getItem(TOUR_KEY)) setPhase('welcome')
  }, [user, loading])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') skip() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const startTour = useCallback(() => {
    if (isMobile) { setPhase('done'); return }
    setStep(0)
    setHighlight(STEPS[0].id, true)
    setPos(getTooltipPos(STEPS[0].id))
    setPhase('touring')
  }, [isMobile])

  const next = useCallback(() => {
    setHighlight(STEPS[step].id, false)
    if (step < STEPS.length - 1) {
      const n = step + 1
      setStep(n)
      setHighlight(STEPS[n].id, true)
      setPos(getTooltipPos(STEPS[n].id))
    } else {
      setPhase('done')
    }
  }, [step])

  const skip = useCallback(() => {
    if (phase === 'touring') setHighlight(STEPS[step].id, false)
    localStorage.setItem(TOUR_KEY, '1')
    setPhase('idle')
  }, [phase, step])

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_KEY, '1')
    setPhase('idle')
  }, [])

  if (phase === 'idle' || !user) return null

  /* ── Welcome ── */
  if (phase === 'welcome') return (
    <div className="zh-tour-overlay" role="dialog" aria-modal="true" aria-label="Willkommen">
      <div className="zh-tour-modal">
        <span className="zh-tour-modal-mark">Neu dabei</span>
        <h2 className="zh-tour-modal-title">Willkommen<br />in der Crew.</h2>
        <p className="zh-tour-modal-text">
          Kurze Tour? Zeigt dir in drei Schritten wo Profil, Bikes und Termine zu finden sind.
        </p>
        <div className="zh-tour-modal-actions">
          <button onClick={startTour} className="zh-btn">Tour starten →</button>
          <button onClick={skip} className="zh-btn zh-btn-outline">Überspringen</button>
        </div>
      </div>
    </div>
  )

  /* ── Tooltip steps ── */
  if (phase === 'touring' && pos) {
    const cur = STEPS[step]
    return (
      <>
        <div className="zh-tour-backdrop" onClick={skip} aria-hidden="true" />
        <div
          className="zh-tour-tooltip"
          style={{ top: pos.top, left: pos.left }}
          role="tooltip"
        >
          <div
            className="zh-tour-arrow"
            style={{ left: `calc(50% + ${pos.arrowOffset}px)` }}
          />
          <div className="zh-tour-step-meta">
            <span className="zh-tour-counter">{step + 1} / {STEPS.length}</span>
            <button onClick={skip} className="zh-tour-skip-btn" aria-label="Tour überspringen">×</button>
          </div>
          <div className="zh-tour-tooltip-title">{cur.title}</div>
          <p className="zh-tour-tooltip-text">{cur.text}</p>
          <div className="zh-tour-tooltip-actions">
            <button onClick={next} className="zh-btn" style={{ fontSize: 13, padding: '9px 18px' }}>
              {step < STEPS.length - 1 ? 'Weiter →' : 'Fertig →'}
            </button>
          </div>
        </div>
      </>
    )
  }

  /* ── Done ── */
  if (phase === 'done') return (
    <div className="zh-tour-overlay" role="dialog" aria-modal="true" aria-label="Tour abgeschlossen">
      <div className="zh-tour-modal">
        <span className="zh-tour-modal-icon">🤙</span>
        <span className="zh-tour-modal-mark">Alles klar</span>
        <h2 className="zh-tour-modal-title">Bereit<br />loszulegen.</h2>
        <p className="zh-tour-modal-text">Jetzt Profil anlegen und die erste Ausfahrt eintragen.</p>
        <div className="zh-tour-modal-actions">
          <Link href={`/profile/${user.id}`} className="zh-btn" onClick={finish}>Profil anlegen →</Link>
          <Link href="/events" className="zh-btn zh-btn-outline" onClick={finish}>Termine ansehen →</Link>
        </div>
        <button onClick={finish} className="zh-tour-skip-link">Jetzt nicht</button>
      </div>
    </div>
  )

  return null
}
