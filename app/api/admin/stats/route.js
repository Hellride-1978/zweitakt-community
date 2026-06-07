import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'martin@delavega.de'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function last30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function groupByDay(rows, dateField) {
  const map = {}
  for (const row of rows ?? []) {
    const day = row[dateField]?.slice(0, 10)
    if (day) map[day] = (map[day] ?? 0) + 1
  }
  return map
}

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const authDb = adminClient()
    const { data: { user }, error: authError } = await authDb.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.email !== ADMIN_EMAIL) return Response.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const pvMonth = searchParams.get('pvMonth') // z.B. '2026-06'

    const admin = adminClient()

    // Monats-Detailansicht
    if (pvMonth) {
      const start = `${pvMonth}-01`
      const nextMonth = new Date(`${pvMonth}-01`)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const end = nextMonth.toISOString().slice(0, 10)
      const daysInMonth = new Date(nextMonth - 1).getDate()
      const { data: rows } = await admin.from('page_views').select('viewed_at').gte('viewed_at', start).lt('viewed_at', end)
      const map = {}
      for (const r of rows ?? []) {
        const day = r.viewed_at?.slice(0, 10)
        if (day) map[day] = (map[day] ?? 0) + 1
      }
      const chart = Array.from({ length: daysInMonth }, (_, i) => {
        const day = `${pvMonth}-${String(i + 1).padStart(2, '0')}`
        return { day, views: map[day] ?? 0 }
      })
      return Response.json({ pvMonthChart: chart, total: rows?.length ?? 0 })
    }

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 29)
    const cutoffIso = cutoff.toISOString()

    const [
      { count: nlConfirmed,    error: e1 },
      { count: nlUnsubscribed, error: e2 },
      { count: nlPending,      error: e3 },
      { data: nlRecentSubs,    error: e4 },
      { data: nlRecentUnsubs,  error: e5 },
      { count: forumPosts,     error: e6 },
      { count: forumReplies,   error: e7 },
      { count: feedbackCount,  error: e8 },
      { count: memberCount,    error: e9 },
      { data: pvRecent,        error: e10 },
      { data: pvDetails,       error: e11 },
      { count: pvToday,        error: e12 },
      { count: pvWeek,         error: e13 },
      { data: pvTodayRows,     error: e14 },
    ] = await Promise.all([
      admin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
      admin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'unsubscribed'),
      admin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('newsletter_subscribers').select('opt_in_at').gte('opt_in_at', cutoffIso).eq('status', 'confirmed'),
      admin.from('newsletter_subscribers').select('unsubscribed_at').gte('unsubscribed_at', cutoffIso).eq('status', 'unsubscribed'),
      admin.from('forum_posts').select('id', { count: 'exact', head: true }),
      admin.from('forum_replies').select('id', { count: 'exact', head: true }),
      admin.from('feedbacks').select('id', { count: 'exact', head: true }),
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('page_views').select('viewed_at').gte('viewed_at', cutoffIso),
      admin.from('page_views').select('path, device, country'),
      admin.from('page_views').select('id', { count: 'exact', head: true }).gte('viewed_at', new Date().toISOString().slice(0, 10)),
      admin.from('page_views').select('id', { count: 'exact', head: true }).gte('viewed_at', (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10) })()),
      admin.from('page_views').select('viewed_at').gte('viewed_at', new Date().toISOString().slice(0, 10)),
    ])

    const dbError = e1 || e2 || e3 || e4 || e5 || e6 || e7 || e8 || e9 || e10 || e11 || e12 || e13 || e14
    if (dbError) throw dbError

    const days = last30Days()
    const subsMap = groupByDay(nlRecentSubs, 'opt_in_at')
    const unsubsMap = groupByDay(nlRecentUnsubs, 'unsubscribed_at')
    const pvMap = groupByDay(pvRecent, 'viewed_at')

    // Top-Seiten aggregieren
    const pathCounts = {}
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
    const countryCounts = {}
    for (const row of pvDetails ?? []) {
      pathCounts[row.path] = (pathCounts[row.path] ?? 0) + 1
      if (row.device) deviceCounts[row.device] = (deviceCounts[row.device] ?? 0) + 1
      if (row.country) countryCounts[row.country] = (countryCounts[row.country] ?? 0) + 1
    }
    const topPages = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }))

    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, views]) => ({ country, views }))

    const nlChart = days.map(day => ({
      day,
      subs: subsMap[day] ?? 0,
      unsubs: unsubsMap[day] ?? 0,
    }))

    const pvChart = days.map(day => ({
      day,
      views: pvMap[day] ?? 0,
    }))

    const hourMap = {}
    for (const row of pvTodayRows ?? []) {
      const hour = row.viewed_at?.slice(11, 13)
      if (hour) hourMap[hour] = (hourMap[hour] ?? 0) + 1
    }
    const pvChartHourly = Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, '0')
      return { hour, views: hourMap[hour] ?? 0 }
    })

    return Response.json({
      newsletter: {
        confirmed: nlConfirmed ?? 0,
        unsubscribed: nlUnsubscribed ?? 0,
        pending: nlPending ?? 0,
        chart: nlChart,
      },
      community: {
        members: memberCount ?? 0,
        forumPosts: forumPosts ?? 0,
        forumReplies: forumReplies ?? 0,
        feedbacks: feedbackCount ?? 0,
      },
      pageViews: {
        today: pvToday ?? 0,
        week: pvWeek ?? 0,
        total: pvRecent?.length ?? 0,
        chart: pvChart,
        chartHourly: pvChartHourly,
        topPages,
        devices: deviceCounts,
        topCountries,
      },
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return Response.json({ error: 'Interner Fehler.' }, { status: 500 })
  }
}
