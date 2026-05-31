import { supabase } from '@/lib/supabase'

const BASE = 'https://zweitakthoden.de'

export default async function sitemap() {
  const now = new Date()

  const statics = [
    { url: BASE,                  lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/events`,      lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/vehicles`,    lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/profiles`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/impressum`,   lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${BASE}/datenschutz`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
  ]

  const [{ data: events }, { data: vehicles }, { data: profiles }] = await Promise.all([
    supabase.from('rides').select('id').gte('start_date', now.toISOString()),
    supabase.from('vehicles').select('id, created_at'),
    supabase.from('profiles').select('id, created_at'),
  ])

  const eventUrls = (events || []).map(e => ({
    url: `${BASE}/events/${e.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const vehicleUrls = (vehicles || []).map(v => ({
    url: `${BASE}/vehicles/${v.id}`,
    lastModified: v.created_at ? new Date(v.created_at) : now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const profileUrls = (profiles || []).map(p => ({
    url: `${BASE}/profile/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [...statics, ...eventUrls, ...vehicleUrls, ...profileUrls]
}
