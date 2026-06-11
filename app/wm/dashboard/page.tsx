import { getSession } from '@/lib/wm-auth'
import { getLeaderboard, getUpcomingMatches, getTipsByUser, getAllMatches } from '@/lib/wm-db'
import Link from 'next/link'
import { formatMatchDate, tendencyLabel } from '../wm-utils'
import { LiveMatchWidget } from './LiveMatchWidget'

export const metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const [leaderboard, upcoming, myTips, allMatches] = await Promise.all([
    getLeaderboard(),
    getUpcomingMatches(10),
    getTipsByUser(session.userId),
    getAllMatches(),
  ])

  const myRank = leaderboard.findIndex(e => e.user_id === session.userId) + 1
  const myEntry = leaderboard.find(e => e.user_id === session.userId)

  // My recent tips with match info
  const matchMap = new Map(allMatches.map(m => [m.match_id, m]))
  const recentTips = myTips.slice(0, 8)

  // Tips I've already submitted (for upcoming matches)
  const tippedMatchIds = new Set(myTips.map(t => t.match_id))

  return (
    <div className="wm-page">
      <div className="wm-page-inner">
        <div className="wm-page-header">
          <h1 className="wm-page-title">Dashboard</h1>
          <p className="wm-page-sub">Willkommen zurück, <strong>@{session.username}</strong></p>
        </div>

        <LiveMatchWidget currentUsername={session.username} />

        {/* My rank strip */}
        {myEntry && (
          <div className="wm-rank-strip zh-card-sm">
            <div className="wm-rank-strip-rank">#{myRank}</div>
            <div className="wm-rank-strip-info">
              <span className="wm-rank-strip-name">@{myEntry.username}</span>
              <span className="wm-rank-strip-sub">{myEntry.tip_count} Tipps abgegeben</span>
            </div>
            <div className="wm-rank-strip-pts">
              <span className="wm-pts-big">{myEntry.total_points}</span>
              <span className="wm-pts-label">Punkte</span>
            </div>
          </div>
        )}

        <div className="wm-dashboard-grid">
          {/* Leaderboard */}
          <section>
            <div className="wm-section-head">
              <h2 className="wm-section-title">Tabelle</h2>
              <Link href="/wm/leaderboard" className="wm-section-more">Alle →</Link>
            </div>
            <div className="zh-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="wm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Spieler</th>
                    <th>Tipps</th>
                    <th>Punkte</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 8).map((entry, i) => (
                    <tr key={entry.user_id} className={entry.user_id === session.userId ? 'wm-table-me' : ''}>
                      <td className="wm-table-rank">{i + 1}</td>
                      <td className="wm-table-name">@{entry.username}</td>
                      <td className="wm-table-num">{entry.tip_count}</td>
                      <td className="wm-table-pts">{entry.total_points}</td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr><td colSpan={4} className="wm-table-empty">Noch keine Tipps</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="wm-dashboard-right">
            {/* Upcoming matches */}
            <section>
              <div className="wm-section-head">
                <h2 className="wm-section-title">Jetzt tippen</h2>
                <Link href="/wm/matches" className="wm-section-more">Alle Spiele →</Link>
              </div>
              <div className="wm-match-list">
                {upcoming.length === 0 && (
                  <div className="zh-card-sm wm-empty-state">Keine anstehenden Spiele</div>
                )}
                {upcoming.map(match => {
                  const tipped = tippedMatchIds.has(match.match_id)
                  const myTip = myTips.find(t => t.match_id === match.match_id)
                  return (
                    <Link key={match.match_id} href={`/wm/tip/${match.match_id}`} className="wm-match-card zh-card-sm">
                      <div className="wm-match-date">{formatMatchDate(match.utc_date)}</div>
                      <div className="wm-match-teams">
                        <span className="wm-team">
                          {match.home_team_flag} {match.home_team}
                        </span>
                        <span className="wm-vs">vs</span>
                        <span className="wm-team">
                          {match.away_team} {match.away_team_flag}
                        </span>
                      </div>
                      {tipped && myTip ? (
                        <div className="wm-match-my-tip">
                          Dein Tipp: <span className="wm-score">{myTip.home_goals} : {myTip.away_goals}</span>
                        </div>
                      ) : (
                        <div className="wm-match-cta">Jetzt tippen →</div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </section>

            {/* My recent tips */}
            {recentTips.length > 0 && (
              <section style={{ marginTop: 24 }}>
                <div className="wm-section-head">
                  <h2 className="wm-section-title">Meine Tipps</h2>
                </div>
                <div className="wm-match-list">
                  {recentTips.map(tip => {
                    const match = matchMap.get(tip.match_id)
                    if (!match) return null
                    return (
                      <div key={tip.id} className="wm-tip-row zh-card-sm">
                        <div className="wm-tip-teams">
                          <span>{match.home_team_flag} {match.home_team}</span>
                          <span className="wm-vs">vs</span>
                          <span>{match.away_team} {match.away_team_flag}</span>
                        </div>
                        <div className="wm-tip-scores">
                          <span className="wm-score">Tipp: {tip.home_goals}:{tip.away_goals}</span>
                          {match.status === 'FINISHED' && match.home_score !== null && (
                            <span className="wm-score wm-score-result">Ergebnis: {match.home_score}:{match.away_score}</span>
                          )}
                        </div>
                        {tip.points_awarded !== null && (
                          <div className={`wm-pts-badge wm-pts-${tip.points_awarded}`}>
                            {tip.points_awarded === 3 ? '🎯' : tip.points_awarded === 1 ? '✓' : '✗'} {tip.points_awarded} {tip.points_awarded === 1 ? 'Punkt' : 'Punkte'}
                            {tip.points_awarded > 0 && <span className="wm-pts-label-sm"> — {tendencyLabel(tip.points_awarded)}</span>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
