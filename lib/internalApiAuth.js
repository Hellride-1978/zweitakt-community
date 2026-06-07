import { createClient } from '@supabase/supabase-js'

// Prüft ob der Request vom eigenen Server kommt (Server Actions → interne Routes)
export function requireInternalSecret(request) {
  const secret = request.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// Prüft ob ein eingeloggter User den Request stellt (Client → interne Routes)
export async function requireBearerAuth(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return { error: Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) return { error: Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }
  return { user }
}

// In-Memory Rate Limiter (pro Serverless-Instance, besser als gar nichts)
const rateLimitStore = new Map()

export function rateLimit(key, maxRequests = 5, windowMs = 60_000) {
  const now = Date.now()
  const entry = rateLimitStore.get(key) ?? { count: 0, reset: now + windowMs }

  if (now > entry.reset) {
    entry.count = 0
    entry.reset = now + windowMs
  }

  entry.count++
  rateLimitStore.set(key, entry)

  if (entry.count > maxRequests) {
    return Response.json({ ok: false, error: 'Zu viele Anfragen. Bitte warte kurz.' }, { status: 429 })
  }
  return null
}

export function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
