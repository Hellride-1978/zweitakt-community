'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatMatchDate } from '../wm-utils'

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
  home_yellow_cards: number
  away_yellow_cards: number
  home_red_cards: number
  away_red_cards: number
  utc_date: string
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
}

function StatusBadge({ match }: { match: MatchData }) {
  if (match.status === 'IN_PLAY') {
    return (
      <span className="wm-live-badge wm-live-badge--live">
        <span className="wm-live-dot" />
        {match.minute != null ? `${match.minute}'` : 'Live'}
      </span>
    )
  }
  if (match.status === 'PAUSED') {
    return <span className="wm-live-badge wm-live-badge--paused">Halbzeit</span>
  }
  if (match.status === 'FINISHED') {
    return <span className="wm-live-badge wm-live-badge--finished">Ende</span>
  }
  return <span className="wm-live-badge wm-live-badge--upcoming">{formatMatchDate(match.utc_date)}</span>
}

function Cards({ yellow, red }: { yellow: number; red: number }) {
  if (yellow === 0 && red === 0) return null
  return (
    <span className="wm-live-cards">
      {Array.from({ length: yellow }).map((_, i) => (
        <span key={`y${i}`} className="wm-live-card wm-live-card--yellow" aria-label="Gelbe Karte" />
      ))}
      {Array.from({ length: red }).map((_, i) => (
        <span key={`r${i}`} className="wm-live-card wm-live-card--red" aria-label="Rote Karte" />
      ))}
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
    } finally {
      setRefreshing(false)
      setInitialLoad(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!data?.match) return
    const { status } = data.match
    if (status === 'IN_PLAY' || status === 'PAUSED') {
      const interval = setInterval(fetchData, 60_000)
      return () => clearInterval(interval)
    }
  }, [data, fetchData])

  if (initialLoad) {
    return <div className="wm-live-skeleton zh-card" aria-hidden="true" />
  }

  if (!data?.match) return null

  const { match, tips } = data
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isPostKickoff = isLive || match.status === 'FINISHED'
  const isScheduled = match.status === 'SCHEDULED'

  return (
    <div className="wm-live-widget zh-card">
      <div className="wm-live-header">
        <StatusBadge match={match} />
        {!initialLoad && refreshing && (
          <span className="wm-live-refreshing">Aktualisiert…</span>
        )}
      </div>

      <div className="wm-live-matchup">
        <div className="wm-live-team wm-live-team--home">
          <span className="wm-live-flag">{match.home_team_flag}</span>
          <span className="wm-live-teamname">{match.home_team}</span>
          <Cards yellow={match.home_yellow_cards} red={match.home_red_cards} />
        </div>

        <div className="wm-live-center">
          {isScheduled ? (
            <span className="wm-live-vs">vs</span>
          ) : (
            <span className="wm-live-score">
              {match.home_score ?? 0} : {match.away_score ?? 0}
            </span>
          )}
        </div>

        <div className="wm-live-team wm-live-team--away">
          <Cards yellow={match.away_yellow_cards} red={match.away_red_cards} />
          <span className="wm-live-teamname">{match.away_team}</span>
          <span className="wm-live-flag">{match.away_team_flag}</span>
        </div>
      </div>

      {isPostKickoff && tips.length > 0 && (
        <div className="wm-live-tips">
          <h3 className="wm-live-tips-title">Tipps</h3>
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
                <tr
                  key={tip.username}
                  className={tip.username === currentUsername ? 'wm-table-me' : ''}
                >
                  <td className="wm-table-name">@{tip.username}</td>
                  <td className="wm-table-num wm-live-tip-score">
                    {tip.home_goals}:{tip.away_goals}
                  </td>
                  <td className="wm-table-pts">{tip.current_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isPostKickoff && tips.length === 0 && (
        <div className="wm-live-tips">
          <h3 className="wm-live-tips-title">Tipps</h3>
          <p className="wm-table-empty">Noch keine Tipps für dieses Spiel</p>
        </div>
      )}
    </div>
  )
}
