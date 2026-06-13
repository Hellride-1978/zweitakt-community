import { getSession } from '@/lib/wm-auth'
import { getFinishedMatches, getAllTips, getAllUsernames } from '@/lib/wm-db'
import { calculatePoints } from '@/lib/wm/points'
import { formatMatchDate, stageLabel } from '../wm-utils'

export const metadata = { title: 'Spielhistorie' }
export const dynamic = 'force-dynamic'

function pointsLabel(pts: number): string {
  if (pts === 3) return 'Exaktes Ergebnis'
  if (pts === 1) return 'Tendenz'
  return 'Daneben'
}

export default async function HistoryPage() {
  const session = await getSession()
  if (!session) return null

  const [matches, allTips, users] = await Promise.all([
    getFinishedMatches(),
    getAllTips(),
    getAllUsernames(),
  ])

  const userMap = new Map(users.map(u => [u.id, u.username]))

  const tipsByMatch = new Map<number, typeof allTips>()
  for (const tip of allTips) {
    if (!tipsByMatch.has(tip.match_id)) tipsByMatch.set(tip.match_id, [])
    tipsByMatch.get(tip.match_id)!.push(tip)
  }

  return (
    <div className="wm-page">
      <div className="wm-page-inner">
        <div className="wm-page-header">
          <h1 className="wm-page-title">Spielhistorie</h1>
          <p className="wm-page-sub">{matches.length} abgeschlossene Spiele · {users.length} Teilnehmer</p>
        </div>

        {matches.length === 0 && (
          <div className="zh-card wm-empty-state">Noch keine abgeschlossenen Spiele.</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {matches.map(match => {
            const resolvedHome = match.use_manual_score ? match.manual_home_score : match.home_score
            const resolvedAway = match.use_manual_score ? match.manual_away_score : match.away_score

            const matchTips = tipsByMatch.get(match.match_id) ?? []
            const tippedUserIds = new Set(matchTips.map(t => t.user_id))

            const tipsWithPoints = matchTips.map(tip => ({
              userId: tip.user_id,
              username: userMap.get(tip.user_id) ?? 'Unbekannt',
              home_goals: tip.home_goals,
              away_goals: tip.away_goals,
              points: tip.points_awarded ?? (
                resolvedHome != null && resolvedAway != null
                  ? calculatePoints(tip.home_goals, tip.away_goals, resolvedHome, resolvedAway)
                  : 0
              ),
            })).sort((a, b) => b.points - a.points || a.username.localeCompare(b.username))

            const nonTippers = users.filter(u => !tippedUserIds.has(u.id))

            const stageInfo = stageLabel(match.stage)

            return (
              <div key={match.match_id} className="zh-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1.5px solid var(--hairline)', background: 'var(--cream-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className="wm-match-date">{formatMatchDate(match.utc_date)}</span>
                    {stageInfo && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                        · {stageInfo}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span className="wm-team">{match.home_team_flag} {match.home_team}</span>
                    <span className="wm-score wm-score-result" style={{ fontSize: 22 }}>
                      {resolvedHome} : {resolvedAway}
                    </span>
                    <span className="wm-team">{match.away_team} {match.away_team_flag}</span>
                  </div>
                </div>

                <table className="wm-table">
                  <thead>
                    <tr>
                      <th>Spieler</th>
                      <th style={{ textAlign: 'center' }}>Tipp</th>
                      <th style={{ textAlign: 'center' }}>Punkte</th>
                      <th>Begründung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tipsWithPoints.map(t => (
                      <tr
                        key={t.userId}
                        className={t.userId === session.userId ? 'wm-table-me' : ''}
                      >
                        <td className="wm-table-name">
                          @{t.username}{t.userId === session.userId ? ' (du)' : ''}
                        </td>
                        <td className="wm-live-tip-score">{t.home_goals} : {t.away_goals}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`wm-pts-badge wm-pts-${t.points}`}>{t.points}</span>
                        </td>
                        <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                          {pointsLabel(t.points)}
                        </td>
                      </tr>
                    ))}
                    {nonTippers.map(u => (
                      <tr key={u.id} style={{ opacity: 0.45 }}>
                        <td className="wm-table-name">@{u.username}</td>
                        <td className="wm-live-tip-score" style={{ color: 'var(--ink-muted)' }}>–</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-muted)' }}>–</span>
                        </td>
                        <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>Kein Tipp</td>
                      </tr>
                    ))}
                    {tipsWithPoints.length === 0 && nonTippers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="wm-table-empty">Keine Teilnehmer.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
