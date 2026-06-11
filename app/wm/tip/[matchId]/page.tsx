import { getSession } from '@/lib/wm-auth'
import { getMatchById, getTipByUserAndMatch } from '@/lib/wm-db'
import { notFound } from 'next/navigation'
import TipForm from './TipForm'
import { formatMatchDate, stageLabel } from '../../wm-utils'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params
  const match = await getMatchById(Number(matchId))
  if (!match) return { title: 'Tipp' }
  return { title: `${match.home_team} vs ${match.away_team}` }
}

export default async function TipPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params
  const session = await getSession()
  if (!session) return null

  const matchIdNum = Number(matchId)
  if (isNaN(matchIdNum)) return notFound()

  const [match, existingTip] = await Promise.all([
    getMatchById(matchIdNum),
    getTipByUserAndMatch(session.userId, matchIdNum),
  ])

  if (!match) return notFound()

  const now = new Date()
  const matchDate = new Date(match.utc_date)
  const hasStarted = matchDate <= now

  return (
    <div className="wm-page">
      <div className="wm-page-inner wm-page-inner-narrow">
        <div className="wm-page-header">
          <div className="wm-tip-stage">{stageLabel(match.stage)}</div>
          <div className="wm-match-date" style={{ marginTop: 8 }}>{formatMatchDate(match.utc_date)}</div>
        </div>

        <div className="zh-card wm-tip-card">
          <div className="wm-tip-matchup">
            <div className="wm-tip-team">
              <span className="wm-tip-flag">{match.home_team_flag}</span>
              <span className="wm-tip-teamname">{match.home_team}</span>
            </div>
            <span className="wm-tip-separator">–</span>
            <div className="wm-tip-team wm-tip-team-away">
              <span className="wm-tip-flag">{match.away_team_flag}</span>
              <span className="wm-tip-teamname">{match.away_team}</span>
            </div>
          </div>

          {match.status === 'FINISHED' && match.home_score !== null && (
            <div className="wm-tip-result">
              Endergebnis: <span className="wm-score">{match.home_score} : {match.away_score}</span>
            </div>
          )}

          {hasStarted ? (
            <div className="wm-tip-closed">
              <span className="wm-tip-closed-icon">🔒</span>
              <span>Tippen nicht mehr möglich — das Spiel hat bereits begonnen.</span>
              {existingTip && (
                <div className="wm-tip-existing">
                  Dein Tipp: <span className="wm-score">{existingTip.home_goals} : {existingTip.away_goals}</span>
                  {existingTip.points_awarded !== null && (
                    <span className={`wm-pts-chip wm-pts-${existingTip.points_awarded}`} style={{ marginLeft: 12 }}>
                      {existingTip.points_awarded} {existingTip.points_awarded === 1 ? 'Punkt' : 'Punkte'}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <TipForm
              matchId={matchIdNum}
              homeTeam={match.home_team}
              awayTeam={match.away_team}
              existingTip={existingTip ? {
                homeGoals: existingTip.home_goals,
                awayGoals: existingTip.away_goals,
              } : null}
            />
          )}
        </div>

        <div className="wm-tip-scoring-info zh-card-sm">
          <div className="wm-scoring-row">
            <span className="wm-scoring-pts">3 Punkte</span>
            <span>Exaktes Ergebnis (z.B. 2:1 → 2:1)</span>
          </div>
          <div className="wm-scoring-row">
            <span className="wm-scoring-pts">1 Punkt</span>
            <span>Richtige Tendenz (Sieg / Unentschieden / Niederlage)</span>
          </div>
          <div className="wm-scoring-row">
            <span className="wm-scoring-pts">0 Punkte</span>
            <span>Falsch getippt</span>
          </div>
        </div>
      </div>
    </div>
  )
}
