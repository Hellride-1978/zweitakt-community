'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  matchId: number
  homeTeam: string
  awayTeam: string
  existingTip: { homeGoals: number; awayGoals: number } | null
}

export default function TipForm({ matchId, homeTeam, awayTeam, existingTip }: Props) {
  const router = useRouter()
  const [homeGoals, setHomeGoals] = useState(existingTip?.homeGoals ?? 0)
  const [awayGoals, setAwayGoals] = useState(existingTip?.awayGoals ?? 0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function clamp(val: number) {
    return Math.max(0, Math.min(20, Math.round(val)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/wm/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, homeGoals, awayGoals }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Fehler beim Speichern.')
        return
      }
      setSuccess(true)
      setTimeout(() => {
        router.push('/wm/matches')
        router.refresh()
      }, 1200)
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="wm-tip-success">
        <span className="wm-tip-success-icon">✓</span>
        <span>Tipp gespeichert!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="wm-tip-form">
      {error && <div className="zh-error">{error}</div>}
      {existingTip && (
        <p className="wm-tip-edit-note">Du hast bereits getippt — du kannst deinen Tipp noch ändern.</p>
      )}

      <div className="wm-score-inputs">
        <div className="wm-score-team">
          <span className="wm-score-team-name">{homeTeam}</span>
          <div className="wm-score-control">
            <button type="button" className="wm-score-btn" onClick={() => setHomeGoals(v => clamp(v - 1))}>−</button>
            <input
              type="number"
              className="wm-score-input"
              value={homeGoals}
              min={0}
              max={20}
              onChange={e => setHomeGoals(clamp(Number(e.target.value)))}
            />
            <button type="button" className="wm-score-btn" onClick={() => setHomeGoals(v => clamp(v + 1))}>+</button>
          </div>
        </div>

        <span className="wm-score-colon">:</span>

        <div className="wm-score-team wm-score-team-away">
          <span className="wm-score-team-name">{awayTeam}</span>
          <div className="wm-score-control">
            <button type="button" className="wm-score-btn" onClick={() => setAwayGoals(v => clamp(v - 1))}>−</button>
            <input
              type="number"
              className="wm-score-input"
              value={awayGoals}
              min={0}
              max={20}
              onChange={e => setAwayGoals(clamp(Number(e.target.value)))}
            />
            <button type="button" className="wm-score-btn" onClick={() => setAwayGoals(v => clamp(v + 1))}>+</button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="zh-btn"
        style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
        disabled={loading}
      >
        {loading ? 'Speichern…' : existingTip ? 'Tipp aktualisieren' : 'Tipp abgeben'}
      </button>
    </form>
  )
}
