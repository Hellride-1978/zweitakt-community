import { createClient } from '@supabase/supabase-js'
import { calculatePoints } from '@/lib/wm/points'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, opts: RequestInit = {}) => fetch(url, { ...opts, cache: 'no-store' }) } }
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WmUser {
  id: string
  email: string
  username: string
  password_hash: string
  is_admin: boolean
  created_at: string
}

export interface WmTip {
  id: string
  user_id: string
  match_id: number
  home_goals: number
  away_goals: number
  points_awarded: number | null
  created_at: string
}

export interface WmMatch {
  match_id: number
  home_team: string
  away_team: string
  home_team_flag: string | null
  away_team_flag: string | null
  utc_date: string
  status: string
  home_score: number | null
  away_score: number | null
  minute: number | null
  matchday: number | null
  stage: string | null
  group_name: string | null
  manual_home_score: number | null
  manual_away_score: number | null
  use_manual_score: boolean
  last_updated: string
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  total_points: number
  exact_count: number
  tendency_count: number
  tip_count: number
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<WmUser | null> {
  const { data } = await getClient()
    .from('wm_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()
  return data ?? null
}

export async function findUserByUsername(username: string): Promise<WmUser | null> {
  const { data } = await getClient()
    .from('wm_users')
    .select('*')
    .eq('username', username)
    .single()
  return data ?? null
}

export async function createUser(params: {
  email: string
  username: string
  password_hash: string
}): Promise<WmUser> {
  const { data, error } = await getClient()
    .from('wm_users')
    .insert({ ...params, email: params.email.toLowerCase() })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function getUpcomingMatches(limit = 10): Promise<WmMatch[]> {
  const { data } = await getClient()
    .from('wm_matches_cache')
    .select('*')
    .eq('status', 'SCHEDULED')
    .gt('utc_date', new Date().toISOString())
    .order('utc_date', { ascending: true })
    .limit(limit)
  return data ?? []
}

export async function getAllMatches(): Promise<WmMatch[]> {
  const { data } = await getClient()
    .from('wm_matches_cache')
    .select('*')
    .order('utc_date', { ascending: true })
  return data ?? []
}

export async function getMatchById(matchId: number): Promise<WmMatch | null> {
  const { data } = await getClient()
    .from('wm_matches_cache')
    .select('*')
    .eq('match_id', matchId)
    .single()
  return data ?? null
}

export async function upsertMatches(matches: Partial<WmMatch>[]) {
  const { error } = await getClient()
    .from('wm_matches_cache')
    .upsert(matches, { onConflict: 'match_id' })
  if (error) throw error
}

// Upsert non-score fields only (used when use_manual_score = true for a match)
export async function upsertMatchesBase(matches: Omit<Partial<WmMatch>, 'home_score' | 'away_score'>[]) {
  if (matches.length === 0) return
  const { error } = await getClient()
    .from('wm_matches_cache')
    .upsert(matches, { onConflict: 'match_id' })
  if (error) throw error
}

export async function getManualOverrideIds(): Promise<Set<number>> {
  const { data } = await getClient()
    .from('wm_matches_cache')
    .select('match_id')
    .eq('use_manual_score', true)
  return new Set((data ?? []).map((r: { match_id: number }) => r.match_id))
}

export async function setManualOverride(
  matchId: number,
  homeScore: number,
  awayScore: number
) {
  const { error } = await getClient()
    .from('wm_matches_cache')
    .update({
      manual_home_score: homeScore,
      manual_away_score: awayScore,
      use_manual_score: true,
      last_updated: new Date().toISOString(),
    })
    .eq('match_id', matchId)
  if (error) throw error
}

export async function clearManualOverride(matchId: number) {
  const { error } = await getClient()
    .from('wm_matches_cache')
    .update({
      manual_home_score: null,
      manual_away_score: null,
      use_manual_score: false,
      last_updated: new Date().toISOString(),
    })
    .eq('match_id', matchId)
  if (error) throw error
}

// ─── Tips ─────────────────────────────────────────────────────────────────────

export async function getTipByUserAndMatch(
  userId: string,
  matchId: number
): Promise<WmTip | null> {
  const { data } = await getClient()
    .from('wm_tips')
    .select('*')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .single()
  return data ?? null
}

export async function getTipsByUser(userId: string): Promise<WmTip[]> {
  const { data } = await getClient()
    .from('wm_tips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function upsertTip(params: {
  user_id: string
  match_id: number
  home_goals: number
  away_goals: number
}): Promise<WmTip> {
  const { data, error } = await getClient()
    .from('wm_tips')
    .upsert(params, { onConflict: 'user_id,match_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUnscoredTipsForMatch(matchId: number): Promise<WmTip[]> {
  const { data } = await getClient()
    .from('wm_tips')
    .select('*')
    .eq('match_id', matchId)
    .is('points_awarded', null)
  return data ?? []
}

export async function awardPoints(tipId: string, points: number) {
  const { error } = await getClient()
    .from('wm_tips')
    .update({ points_awarded: points })
    .eq('id', tipId)
  if (error) throw error
}

export async function awardPointsForAllTips(matchId: number, homeScore: number, awayScore: number): Promise<number> {
  const tips = await getTipsForMatch(matchId)
  for (const tip of tips) {
    await awardPoints(tip.id, calculatePoints(tip.home_goals, tip.away_goals, homeScore, awayScore))
  }
  return tips.length
}

export async function getFinishedMatches(): Promise<WmMatch[]> {
  const { data } = await getClient()
    .from('wm_matches_cache')
    .select('*')
    .eq('status', 'FINISHED')
    .order('utc_date', { ascending: false })
  return data ?? []
}

export async function getAllTips(): Promise<WmTip[]> {
  const { data } = await getClient()
    .from('wm_tips')
    .select('*')
  return data ?? []
}

export async function getLiveOrNextMatch(): Promise<WmMatch | null> {
  const client = getClient()

  // 1. Live match (API status)
  const { data: live } = await client
    .from('wm_matches_cache')
    .select('*')
    .in('status', ['IN_PLAY', 'PAUSED'])
    .order('utc_date', { ascending: true })
    .limit(1)
  if (live && live.length > 0) return live[0] as WmMatch

  // 2. Recently finished (up to 3h after kickoff)
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  const { data: finished } = await client
    .from('wm_matches_cache')
    .select('*')
    .eq('status', 'FINISHED')
    .gt('utc_date', threeHoursAgo)
    .order('utc_date', { ascending: false })
    .limit(1)
  if (finished && finished.length > 0) return finished[0] as WmMatch

  // 3. Next upcoming
  const { data: next } = await client
    .from('wm_matches_cache')
    .select('*')
    .eq('status', 'SCHEDULED')
    .gt('utc_date', new Date().toISOString())
    .order('utc_date', { ascending: true })
    .limit(1)
  return next && next.length > 0 ? (next[0] as WmMatch) : null
}

export async function getTipsForMatch(matchId: number): Promise<WmTip[]> {
  const { data } = await getClient()
    .from('wm_tips')
    .select('*')
    .eq('match_id', matchId)
  return data ?? []
}

export async function getAllUsernames(): Promise<{ id: string; username: string }[]> {
  const { data } = await getClient()
    .from('wm_users')
    .select('id, username')
  return data ?? []
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const client = getClient()

  // Get all tips with points
  const { data: tips } = await client
    .from('wm_tips')
    .select('user_id, points_awarded')
    .not('points_awarded', 'is', null)

  // Get all users
  const { data: users } = await client
    .from('wm_users')
    .select('id, username')

  if (!users) return []

  const statsMap = new Map<string, { total: number; exact: number; tendency: number; count: number }>()

  for (const user of users) {
    statsMap.set(user.id, { total: 0, exact: 0, tendency: 0, count: 0 })
  }

  // Get total tip counts (including unscored)
  const { data: allTips } = await client
    .from('wm_tips')
    .select('user_id')

  for (const tip of allTips ?? []) {
    const s = statsMap.get(tip.user_id)
    if (s) s.count++
  }

  for (const tip of tips ?? []) {
    const s = statsMap.get(tip.user_id)
    if (!s) continue
    const pts = tip.points_awarded ?? 0
    s.total += pts
    if (pts === 3) s.exact++
    if (pts === 1) s.tendency++
  }

  return users
    .map(u => {
      const s = statsMap.get(u.id) ?? { total: 0, exact: 0, tendency: 0, count: 0 }
      return {
        user_id: u.id,
        username: u.username,
        total_points: s.total,
        exact_count: s.exact,
        tendency_count: s.tendency,
        tip_count: s.count,
      }
    })
    .sort((a, b) => b.total_points - a.total_points || b.tip_count - a.tip_count)
}
