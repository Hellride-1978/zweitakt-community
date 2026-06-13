import { NextResponse } from 'next/server'
import { fetchWcGames, flagForName, localDateToUtc, mapStatus, mapStage } from '@/lib/worldcup-api'
import {
  upsertMatches,
  upsertMatchesBase,
  getManualOverrideIds,
  getUnscoredTipsForMatch,
  awardPoints,
  getTipsForMatch,
  getAllUsernames,
} from '@/lib/wm-db'
import { getSession } from '@/lib/wm-auth'
import { calculatePoints } from '@/lib/wm/points'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const xCron = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const isCron = secret && (
    xCron === secret ||
    authHeader === `Bearer ${secret}`
  )
  if (!isCron) {
    const session = await getSession()
    if (!session?.isAdmin) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }

  let games
  try {
    games = await fetchWcGames()
  } catch (err) {
    console.error('[wm/sync-matches] worldcup26.ir nicht erreichbar:', err)
    return NextResponse.json({ ok: false, error: 'API nicht erreichbar, Cache bleibt erhalten.' })
  }

  const manualIds = await getManualOverrideIds()

  // Skip knockout games where participants aren't determined yet (null team names)
  const rows = games.filter(g => g.home_team_name_en && g.away_team_name_en).map(g => {
    const { status, minute } = mapStatus(g)
    const homeScore = g.home_score != null && g.home_score !== 'null' ? parseInt(g.home_score) : null
    const awayScore = g.away_score != null && g.away_score !== 'null' ? parseInt(g.away_score) : null
    return {
      match_id: parseInt(g.id),
      home_team: g.home_team_name_en,
      away_team: g.away_team_name_en,
      home_team_flag: flagForName(g.home_team_name_en),
      away_team_flag: flagForName(g.away_team_name_en),
      utc_date: localDateToUtc(g.local_date),
      status,
      minute,
      home_score: homeScore,
      away_score: awayScore,
      stage: mapStage(g.type, g.group),
      group_name: g.group ?? null,
      matchday: g.matchday ? parseInt(g.matchday) : null,
      last_updated: new Date().toISOString(),
    }
  })

  // Rows with manual override: upsert everything except scores
  const baseRows = rows
    .filter(r => manualIds.has(r.match_id))
    .map(({ home_score, away_score, ...rest }) => rest)

  // Rows without manual override: upsert everything
  const fullRows = rows.filter(r => !manualIds.has(r.match_id))

  try {
    if (fullRows.length > 0) await upsertMatches(fullRows)
    if (baseRows.length > 0) await upsertMatchesBase(baseRows)
  } catch (err) {
    console.error('[wm/sync-matches] DB upsert fehlgeschlagen:', err)
    return NextResponse.json({ error: 'DB-Fehler' }, { status: 500 })
  }

  // Award points for finished matches (only where scores are set and not manual-overridden)
  const finished = fullRows.filter(
    r => r.status === 'FINISHED' && r.home_score !== null && r.away_score !== null
  )

  let scored = 0
  const usernames = finished.length > 0 ? await getAllUsernames() : []
  const usernameMap = new Map(usernames.map(u => [u.id, u.username]))

  for (const match of finished) {
    const tips = await getUnscoredTipsForMatch(match.match_id)
    for (const tip of tips) {
      const pts = calculatePoints(tip.home_goals, tip.away_goals, match.home_score!, match.away_score!)
      console.log(`[wm/points] ${usernameMap.get(tip.user_id) ?? tip.user_id} | ${match.home_team} vs ${match.away_team} | Tipp: ${tip.home_goals}:${tip.away_goals} | Ergebnis: ${match.home_score}:${match.away_score} | Punkte: ${pts}`)
      await awardPoints(tip.id, pts)
      scored++
    }
  }

  // Also score tips for manual-override finished matches (re-score all tips)
  const manualFinished = rows.filter(
    r => manualIds.has(r.match_id) && r.status === 'FINISHED'
  )
  for (const match of manualFinished) {
    // Manual score is not in `rows` (stripped), fetch from DB is done by override-score endpoint
    // Skip here — scoring is handled by the admin override endpoint
    void match
  }

  return NextResponse.json({ ok: true, synced: rows.length, finished: finished.length, scored })
}
