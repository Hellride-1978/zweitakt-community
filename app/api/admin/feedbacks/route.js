import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'martin@delavega.de'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.email !== ADMIN_EMAIL) return Response.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = supabaseAdmin
      .from('feedbacks')
      .select('*, profiles(id, name)')
      .order('created_at', { ascending: false })

    if (type && type !== 'all') query = query.eq('type', type)

    const { data, error: dbError } = await query
    if (dbError) throw dbError

    return Response.json({ data })
  } catch (err) {
    console.error('Admin feedbacks fetch failed:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
