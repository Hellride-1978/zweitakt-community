'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatMatchDate, stageLabel } from '../wm-utils'

interface MatchData {
  match_id: number
  home_team: string
  away_team: string
  home_team_flag: string | null
  away_team_flag: string | null
  home_score: number | null
  away_score: number | null
  minute: number | null
  status: string
  utc_date: string
  stage: string | null
  group_name: string | null
  use_manual_score: boolean
}

interface TipRow {
  username: string
  home_goals: number
  away_goals: number
  current_points: number
}

interface LiveData {
  match: MatchData | null
  tips: TipRow[]
  current_user_tip: { home_goals: number; away_goals: number; current_points: number } | null
}

function StatusBadge({ match }: { match: MatchData }) {
  if (match.status === 'IN_PLAY') {
    const label = match.minute != null ? `${match.minute}'` : 'Live'
    return (
      <span className="wm-live-badge wm-live-badge--live">
        <span className="wm-live-dot" />
        {label}
      </span>
    )
  }
  if (match.status === 'PAUSED') {
    return <span className="wm-live-badge wm-live-badge--paused">Halbzeit</span>
  }
  if (match.status === 'FINISHED') {
    return <span className="wm-live-badge wm-live-badge--finished">Beendet</span>
  }
  return (
    <span className="wm-live-badge wm-live-badge--upcoming">
      {formatMatchDate(match.utc_date)}
    </span>
  )
}

export function LiveMatchWidget({ currentUsername }: { currentUsername: string }) {
  const [data, setData] = useState<LiveData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/wm/live-match')
      if (res.ok) setData(await res.json())
    } catch {
      // Netzwerkfehler — nächster Poll-Tick versucht es erneut
    } finally {
      setRefreshing(false)
      setInitialLoad(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!data?.match) return
    const { status } = data.match
    if (status === 'IN_PLAY' || status === 'PAUSED') {
      const interval = setInterval(fetchData, 60_000)
      return () => clearInterval(interval)
    }
  }, [data, fetchData])

  if (initialLoad) return <div className="wm-live-skeleton zh-card" aria-hidden="true" />
  if (!data?.match) return null

  const { match, tips, current_user_tip } = data
  const isPostKickoff = ['IN_PLAY', 'PAUSED', 'FINISHED'].includes(match.status)
  const isScheduled = match.status === 'SCHEDULED'

  const stageText = match.stage
    ? match.group_name
      ? `${stageLabel(match.stage)} · Gruppe ${match.group_name}`
      : stageLabel(match.stage)
    : null

  return (
    <div className="wm-live-widget zh-card">
      <div className="wm-live-header">
        <StatusBadge match={match} />
        {refreshing && !initialLoad && (
          <span className="wm-live-refreshing">Wird aktualisiert…</span>
        )}
      </div>

      {stageText && (
        <div className="wm-live-stage">{stageText}</div>
      )}

      <div className="wm-live-matchup">
        <div className="wm-live-team wm-live-team--home">
          <span className="wm-live-flag">{match.home_team_flag}</span>
          <span className="wm-live-teamname">{match.home_team}</span>
        </div>

        <div className="wm-live-center">
          {isScheduled ? (
            <span className="wm-live-vs">vs</span>
          ) : (
            <span className="wm-live-score">
              {match.home_score ?? '?'} : {match.away_score ?? '?'}
            </span>
          )}
        </div>

        <div className="wm-live-team wm-live-team--away">
          <span className="wm-live-teamname">{match.away_team}</span>
          <span className="wm-live-flag">{match.away_team_flag}</span>
        </div>
      </div>

      {isPostKickoff && (
        <div className="wm-live-tips">
          <h3 className="wm-live-tips-title">Tipps</h3>
          {tips.length === 0 ? (
            <p className="wm-table-empty">Keine Tipps abgegeben</p>
          ) : (
            <table className="wm-table wm-live-tips-table">
              <thead>
                <tr>
                  <th>Spieler</th>
                  <th>Tipp</th>
                  <th>Punkte</th>
                </tr>
              </thead>
              <tbody>
                {tips.map(tip => (
                  <tr key={tip.username} className={tip.username === currentUsername ? 'wm-table-me' : ''}>
                    <td className="wm-table-name">@{tip.username}</td>
                    <td className="wm-table-num">{tip.home_goals}:{tip.away_goals}</td>
                    <td className="wm-table-pts">{tip.current_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {current_user_tip === null && (
            <p className="wm-live-no-tip">Du hast für dieses Spiel keinen Tipp abgegeben.</p>
          )}
        </div>
      )}
    </div>
  )
}
