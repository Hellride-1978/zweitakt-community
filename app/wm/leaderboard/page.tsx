import { getSession } from '@/lib/wm-auth'
import { getLeaderboard } from '@/lib/wm-db'

export const metadata = { title: 'Tabelle' }
export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const session = await getSession()
  if (!session) return null

  const leaderboard = await getLeaderboard()

  return (
    <div className="wm-page">
      <div className="wm-page-inner">
        <div className="wm-page-header">
          <h1 className="wm-page-title">Tabelle</h1>
          <p className="wm-page-sub">{leaderboard.length} Teilnehmer</p>
        </div>

        <div className="zh-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="wm-table wm-table-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Spieler</th>
                <th title="Tipps insgesamt">Tipps</th>
                <th title="Exakte Treffer (3 Punkte)">🎯</th>
                <th title="Richtige Tendenz (1 Punkt)">✓</th>
                <th>Punkte</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr
                  key={entry.user_id}
                  className={[
                    entry.user_id === session.userId ? 'wm-table-me' : '',
                    i === 0 ? 'wm-table-first' : '',
                    i === 1 ? 'wm-table-second' : '',
                    i === 2 ? 'wm-table-third' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <td className="wm-table-rank">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="wm-table-name">@{entry.username}</td>
                  <td className="wm-table-num">{entry.tip_count}</td>
                  <td className="wm-table-num">{entry.exact_count}</td>
                  <td className="wm-table-num">{entry.tendency_count}</td>
                  <td className="wm-table-pts">{entry.total_points}</td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={6} className="wm-table-empty">Noch keine Tipps abgegeben.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="wm-scoring-legend zh-card-sm">
          <strong style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Punktesystem</strong>
          <div className="wm-scoring-row" style={{ marginTop: 10 }}>
            <span className="wm-scoring-pts">3P</span>
            <span>Exaktes Ergebnis</span>
          </div>
          <div className="wm-scoring-row">
            <span className="wm-scoring-pts">1P</span>
            <span>Richtige Tendenz (Sieg / Unentschieden / Niederlage)</span>
          </div>
          <div className="wm-scoring-row">
            <span className="wm-scoring-pts">0P</span>
            <span>Falsch getippt</span>
          </div>
        </div>
      </div>
    </div>
  )
}
