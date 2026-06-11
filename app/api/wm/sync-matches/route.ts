import { NextResponse } from 'next/server'
import { fetchWcMatches, flagForTla } from '@/lib/football-api'
import { upsertMatches, getUnscoredTipsForMatch, awardPoints } from '@/lib/wm-db'
import { getSession } from '@/lib/wm-auth'

function calcPoints(
  tipHome: number, tipAway: number,
  matchHome: number, matchAway: number
): number {
  if (tipHome === matchHome && tipAway === matchAway) return 3
  const tipTendency = Math.sign(tipHome - tipAway)
  const matchTendency = Math.sign(matchHome - matchAway)
  if (tipTendency === matchTendency) return 1
  return 0
}

export async function GET(request: Request) {
  // Auth: cron secret header OR admin session
  const cronSecret = request.headers.get('x-cron-secret')
  const isCron = cronSecret && cronSecret === process.env.CRON_SECRET

  if (!isCron) {
    const session = await getSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
    }
  }

  try {
    const apiMatches = await fetchWcMatches()

    const rows = apiMatches.map(m => {
      const homeId = m.homeTeam.id
      let homeYellow = 0, awayYellow = 0, homeRed = 0, awayRed = 0
      for (const b of m.bookings ?? []) {
        const isHome = b.team.id === homeId
        if (b.card === 'YELLOW') { isHome ? homeYellow++ : awayYellow++ }
        else if (b.card === 'RED' || b.card === 'YELLOW_RED') { isHome ? homeRed++ : awayRed++ }
      }
      return {
        match_id: m.id,
        home_team: m.homeTeam.name,
        away_team: m.awayTeam.name,
        home_team_flag: flagForTla(m.homeTeam.tla),
        away_team_flag: flagForTla(m.awayTeam.tla),
        utc_date: m.utcDate,
        status: m.status,
        home_score: m.score.fullTime.home ?? null,
        away_score: m.score.fullTime.away ?? null,
        minute: m.minute ?? null,
        home_yellow_cards: homeYellow,
        away_yellow_cards: awayYellow,
        home_red_cards: homeRed,
        away_red_cards: awayRed,
        matchday: m.matchday ?? null,
        stage: m.stage ?? null,
        last_updated: new Date().toISOString(),
      }
    })

    await upsertMatches(rows)

    // Score tips for finished matches
    const finished = rows.filter(
      r => r.status === 'FINISHED' && r.home_score !== null && r.away_score !== null
    )

    let scored = 0
    for (const match of finished) {
      const tips = await getUnscoredTipsForMatch(match.match_id)
      for (const tip of tips) {
        const points = calcPoints(
          tip.home_goals, tip.away_goals,
          match.home_score!, match.away_score!
        )
        await awardPoints(tip.id, points)
        scored++
      }
    }

    return NextResponse.json({
      ok: true,
      synced: rows.length,
      finished: finished.length,
      scored,
    })
  } catch (err: unknown) {
    console.error('[wm/sync-matches]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync fehlgeschlagen.' },
      { status: 500 }
    )
  }
}
