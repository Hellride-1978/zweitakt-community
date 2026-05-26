import { createServerClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(request) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Nicht angemeldet' }, { status: 401 })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    await supabase.from('ride_participants').delete().eq('user_id', user.id)
    await supabase.from('vehicles').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)

    try {
      await admin.storage.from('avatars').remove([`avatars/${user.id}.jpg`])
    } catch {}

    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
