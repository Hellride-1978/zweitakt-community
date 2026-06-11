'use client'

import { useState } from 'react'
import { WmMatch } from '@/lib/wm-db'
import { formatMatchDate, stageLabel } from '../wm-utils'

export function AdminClient({ matches }: { matches: WmMatch[] }) {
  const [saving, setSaving] = useState<number | null>(null)
  const [messages, setMessages] = useState<Record<number, string>>({})
  const [scores, setScores] = useState<Record<number, { home: string; away: string; manual: boolean }>>(() => {
    const init: Record<number, { home: string; away: string; manual: boolean }> = {}
    for (const m of matches) {
      const h = m.use_manual_score ? (m.manual_home_score ?? m.home_score) : m.home_score
      const a = m.use_manual_score ? (m.manual_away_score ?? m.away_score) : m.away_score
      init[m.match_id] = {
        home: h != null ? String(h) : '',
        away: a != null ? String(a) : '',
        manual: m.use_manual_score,
      }
    }
    return init
  })

  async function save(matchId: number) {
    const s = scores[matchId]
    setSaving(matchId)
    setMessages(prev => ({ ...prev, [matchId]: '' }))
    try {
      const res = await fetch('/api/wm/admin/override-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: matchId,
          home_score: s.manual ? parseInt(s.home) : undefined,
          away_score: s.manual ? parseInt(s.away) : undefined,
          use_manual: s.manual,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => ({
          ...prev,
          [matchId]: s.manual
            ? `✓ Gespeichert — ${data.scored} Tipps bewertet`
            : '✓ Manuelle Überschreibung entfernt',
        }))
      } else {
        setMessages(prev => ({ ...prev, [matchId]: `Fehler: ${data.error}` }))
      }
    } finally {
      setSaving(null)
    }
  }

  const pastMatches = [...matches]
    .filter(m => new Date(m.utc_date) <= new Date())
    .sort((a, b) => new Date(b.utc_date).getTime() - new Date(a.utc_date).getTime())

  const upcomingMatches = [...matches]
    .filter(m => new Date(m.utc_date) > new Date())
    .sort((a, b) => new Date(a.utc_date).getTime() - new Date(b.utc_date).getTime())
    .slice(0, 5)

  function renderMatch(m: WmMatch) {
    const s = scores[m.match_id] ?? { home: '', away: '', manual: false }
    const msg = messages[m.match_id]
    const isSaving = saving === m.match_id
    const isManualActive = m.use_manual_score

    return (
      <div key={m.match_id} className={`zh-card-sm wm-admin-match${isManualActive ? ' wm-admin-match--manual' : ''}`}>
        <div className="wm-admin-match-head">
          <div>
            <span className="wm-admin-match-date">{formatMatchDate(m.utc_date)}</span>
            <span className="wm-admin-match-stage">{stageLabel(m.stage)}{m.group_name ? ` · Gruppe ${m.group_name}` : ''}</span>
          </div>
          <div className="wm-admin-match-badges">
            <span className={`wm-admin-status wm-admin-status--${m.status.toLowerCase()}`}>{m.status}</span>
            {isManualActive && <span className="wm-admin-badge-manual">Manuell</span>}
          </div>
        </div>

        <div className="wm-admin-match-teams">
          <span>{m.home_team_flag} {m.home_team}</span>
          <span className="wm-admin-current-score">
            {m.home_score ?? '?'} : {m.away_score ?? '?'}
            {isManualActive && m.manual_home_score != null && (
              <span className="wm-admin-manual-score"> (manuell: {m.manual_home_score}:{m.manual_away_score})</span>
            )}
          </span>
          <span>{m.away_team} {m.away_team_flag}</span>
        </div>

        <div className="wm-admin-controls">
          <label className="wm-admin-toggle">
            <input
              type="checkbox"
              checked={s.manual}
              onChange={e => setScores(prev => ({ ...prev, [m.match_id]: { ...s, manual: e.target.checked } }))}
            />
            Manuell überschreiben
          </label>

          {s.manual && (
            <div className="wm-admin-score-inputs">
              <div className="wm-admin-score-field">
                <label>{m.home_team}</label>
                <input
                  type="number" min="0" max="20"
                  value={s.home}
                  onChange={e => setScores(prev => ({ ...prev, [m.match_id]: { ...s, home: e.target.value } }))}
                  className="wm-admin-input"
                />
              </div>
              <span className="wm-admin-score-sep">:</span>
              <div className="wm-admin-score-field">
                <label>{m.away_team}</label>
                <input
                  type="number" min="0" max="20"
                  value={s.away}
                  onChange={e => setScores(prev => ({ ...prev, [m.match_id]: { ...s, away: e.target.value } }))}
                  className="wm-admin-input"
                />
              </div>
            </div>
          )}

          <button
            className="wm-admin-save-btn"
            onClick={() => save(m.match_id)}
            disabled={isSaving || (s.manual && (s.home === '' || s.away === ''))}
          >
            {isSaving ? 'Speichern…' : s.manual ? 'Speichern & Punkte vergeben' : 'Überschreibung entfernen'}
          </button>

          {msg && (
            <p className={`wm-admin-msg${msg.startsWith('✓') ? ' wm-admin-msg--ok' : ' wm-admin-msg--err'}`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="wm-admin-wrap">
      <section>
        <div className="wm-section-head">
          <h2 className="wm-section-title">Vergangene Spiele</h2>
        </div>
        {pastMatches.length === 0
          ? <p className="wm-table-empty">Keine vergangenen Spiele</p>
          : pastMatches.map(renderMatch)}
      </section>

      {upcomingMatches.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <div className="wm-section-head">
            <h2 className="wm-section-title">Nächste Spiele</h2>
          </div>
          {upcomingMatches.map(renderMatch)}
        </section>
      )}
    </div>
  )
}
