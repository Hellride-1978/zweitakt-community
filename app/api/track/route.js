import { createClient } from '@supabase/supabase-js'

const IGNORED_PREFIXES = ['/api', '/admin', '/_next', '/styleguide', '/auth']

function detectDevice(ua) {
  if (!ua) return 'desktop'
  const u = ua.toLowerCase()
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/.test(u)) return 'tablet'
  if (/(mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini)/.test(u)) return 'mobile'
  return 'desktop'
}

export async function POST(request) {
  try {
    const { path } = await request.json()
    if (!path || typeof path !== 'string') return new Response(null, { status: 204 })
    if (IGNORED_PREFIXES.some(p => path.startsWith(p))) return new Response(null, { status: 204 })

    const ua = request.headers.get('user-agent') ?? ''
    const device = detectDevice(ua)
    const country = request.headers.get('x-vercel-ip-country') ?? null

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    await admin.from('page_views').insert({ path, device, country })
    return new Response(null, { status: 204 })
  } catch {
    return new Response(null, { status: 204 })
  }
}
