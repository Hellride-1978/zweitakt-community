'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { WmMatch, WmTip } from '@/lib/wm-db'
import { formatMatchDate, stageLabel, tendencyLabel } from '../wm-utils'

type Filter = 'all' | 'group' | 'knockout' | 'my'

interface Props {
  matches: WmMatch[]
  myTips: WmTip[]
  userId: string
}

export default function MatchesClient({ matches, myTips, userId: _userId }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const tipMap = new Map(myTips.map(t => [t.match_id, t]))
  const now = new Date()

  const filtered = matches.filter(m => {
    if (filter === 'group') return m.stage === 'GROUP_STAGE'
    if (filter === 'knockout') return m.stage !== 'GROUP_STAGE' && m.stage !== null
    if (filter === 'my') return tipMap.has(m.match_id)
    return true
  })

  // Group by stage then matchday
  const grouped = new Map<string, Map<number | null, WmMatch[]>>()
  const stageOrder = ['GROUP_STAGE', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']

  for (const m of filtered) {
    const stage = m.stage ?? 'OTHER'
    if (!grouped.has(stage)) grouped.set(stage, new Map())
    const dayMap = grouped.get(stage)!
    const day = m.matchday ?? null
    if (!dayMap.has(day)) dayMap.set(day, [])
    dayMap.get(day)!.push(m)
  }

  const sortedStages = [...grouped.keys()].sort((a, b) => {
    const ai = stageOrder.indexOf(a)
    const bi = stageOrder.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Alle' },
    { key: 'group', label: 'Gruppenphase' },
    { key: 'knockout', label: 'K.O.-Runde' },
    { key: 'my', label: 'Meine Tipps' },
  ]

  return (
    <div className="wm-page">
      <div className="wm-page-inner">
        <div className="wm-page-header">
          <h1 className="wm-page-title">Alle Spiele</h1>
        </div>

        <div className="wm-filter-bar">
          {filters.map(f => (
            <button
              key={f.key}
              className={`zh-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="wm-empty-state zh-card-sm">
            {filter === 'my' ? 'Du hast noch keine Tipps abgegeben.' : 'Keine Spiele gefunden.'}
          </div>
        )}

        {sortedStages.map(stage => {
          const dayMap = grouped.get(stage)!
          const sortedDays = [...dayMap.keys()].sort((a, b) => (a ?? 99) - (b ?? 99))
          return (
            <div key={stage} className="wm-stage-group">
              <h2 className="wm-stage-label">{stageLabel(stage)}</h2>
              {sortedDays.map(day => {
                const dayMatches = dayMap.get(day)!
                return (
                  <div key={day ?? 'null'} className="wm-matchday-group">
                    {day !== null && (
                      <div className="wm-matchday-label">Spieltag {day}</div>
                    )}
                    <div className="wm-match-list">
                      {dayMatches.map(match => {
                        const tip = tipMap.get(match.match_id)
                        const started = new Date(match.utc_date) <= now
                        const finished = match.status === 'FINISHED'
                        return (
                          <div key={match.match_id} className="wm-match-row zh-card-sm">
                            <div className="wm-match-row-main">
                              <div className="wm-match-date">{formatMatchDate(match.utc_date)}</div>
                              <div className="wm-match-teams">
                                <span className="wm-team">{match.home_team_flag} {match.home_team}</span>
                                <div className="wm-match-scores-col">
                                  {finished && match.home_score !== null ? (
                                    <span className="wm-score wm-score-result">
                                      {match.home_score} : {match.away_score}
                                    </span>
                                  ) : (
                                    <span className="wm-vs">vs</span>
                                  )}
                                </div>
                                <span className="wm-team wm-team-away">{match.away_team} {match.away_team_flag}</span>
                              </div>
                            </div>

                            <div className="wm-match-row-tip">
                              {tip ? (
                                <div className="wm-tip-inline">
                                  <span className="wm-score">Tipp: {tip.home_goals}:{tip.away_goals}</span>
                                  {tip.points_awarded !== null && (
                                    <span className={`wm-pts-chip wm-pts-${tip.points_awarded}`}>
                                      {tip.points_awarded === 3 ? '🎯' : tip.points_awarded === 1 ? '✓' : '✗'} {tip.points_awarded}P — {tendencyLabel(tip.points_awarded)}
                                    </span>
                                  )}
                                  {!started && (
                                    <Link href={`/wm/tip/${match.match_id}`} className="wm-edit-link">bearbeiten</Link>
                                  )}
                                </div>
                              ) : started ? (
                                <span className="wm-no-tip">Nicht getippt</span>
                              ) : (
                                <Link href={`/wm/tip/${match.match_id}`} className="zh-btn" style={{ fontSize: 14, padding: '8px 18px' }}>
                                  Tippen
                                </Link>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
