import { NextResponse } from 'next/server'
import { getSession } from '@/lib/wm-auth'
import { getLiveOrNextMatch, getTipsForMatch, getAllUsernames, getTipByUserAndMatch } from '@/lib/wm-db'

function calcPoints(tipH: number, tipA: number, mH: number | null, mA: number | null): number {
  if (mH === null || mA === null) return 0
  if (tipH === mH && tipA === mA) return 3
  if (Math.sign(tipH - tipA) === Math.sign(mH - mA)) return 1
  return 0
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })

  const match = await getLiveOrNextMatch()
  if (!match) return NextResponse.json({ match: null, tips: [], current_user_tip: null })

  // Resolve score: manual takes priority
  const resolvedHome = match.use_manual_score ? match.manual_home_score : match.home_score
  const resolvedAway = match.use_manual_score ? match.manual_away_score : match.away_score

  const isPostKickoff = ['IN_PLAY', 'PAUSED', 'FINISHED'].includes(match.status)

  let tips: { username: string; home_goals: number; away_goals: number; current_points: number }[] = []
  let currentUserTip: { home_goals: number; away_goals: number; current_points: number } | null = null

  if (isPostKickoff) {
    const [rawTips, users] = await Promise.all([
      getTipsForMatch(match.match_id),
      getAllUsernames(),
    ])
    const userMap = new Map(users.map(u => [u.id, u.username]))

    tips = rawTips
      .map(t => ({
        username: userMap.get(t.user_id) ?? 'Unbekannt',
        home_goals: t.home_goals,
        away_goals: t.away_goals,
        current_points: calcPoints(t.home_goals, t.away_goals, resolvedHome ?? null, resolvedAway ?? null),
      }))
      .sort((a, b) => b.current_points - a.current_points || a.username.localeCompare(b.username))

    const myTip = await getTipByUserAndMatch(session.userId, match.match_id)
    if (myTip) {
      currentUserTip = {
        home_goals: myTip.home_goals,
        away_goals: myTip.away_goals,
        current_points: calcPoints(myTip.home_goals, myTip.away_goals, resolvedHome ?? null, resolvedAway ?? null),
      }
    }
  }

  return NextResponse.json({
    match: {
      match_id: match.match_id,
      home_team: match.home_team,
      away_team: match.away_team,
      home_team_flag: match.home_team_flag,
      away_team_flag: match.away_team_flag,
      home_score: resolvedHome ?? null,
      away_score: resolvedAway ?? null,
      status: match.status,
      minute: match.minute ?? null,
      utc_date: match.utc_date,
      stage: match.stage ?? null,
      group_name: match.group_name ?? null,
      use_manual_score: match.use_manual_score,
    },
    tips,
    current_user_tip: currentUserTip,
  })
}
