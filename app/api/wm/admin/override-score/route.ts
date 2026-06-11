import { NextResponse } from 'next/server'
import { getSession } from '@/lib/wm-auth'
import { setManualOverride, clearManualOverride, awardPointsForAllTips } from '@/lib/wm-db'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })

  const body = await request.json()
  const { match_id, home_score, away_score, use_manual } = body

  if (typeof match_id !== 'number') {
    return NextResponse.json({ error: 'match_id fehlt.' }, { status: 400 })
  }

  if (use_manual) {
    if (typeof home_score !== 'number' || typeof away_score !== 'number') {
      return NextResponse.json({ error: 'home_score und away_score erforderlich.' }, { status: 400 })
    }
    await setManualOverride(match_id, home_score, away_score)
    const scored = await awardPointsForAllTips(match_id, home_score, away_score)
    return NextResponse.json({ ok: true, scored })
  } else {
    await clearManualOverride(match_id)
    return NextResponse.json({ ok: true, scored: 0 })
  }
}
