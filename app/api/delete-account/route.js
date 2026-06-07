import { createClient } from '@supabase/supabase-js'

export async function DELETE(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'Nicht angemeldet' }, { status: 401 })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'Nicht angemeldet' }, { status: 401 })

    await admin.from('ride_participants').delete().eq('user_id', user.id)
    await admin.from('vehicles').delete().eq('user_id', user.id)
    await admin.from('profiles').delete().eq('id', user.id)

    try {
      await admin.storage.from('avatars').remove([`avatars/${user.id}.jpg`])
    } catch {}

    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) {
      console.error('delete-account: deleteUser failed', error)
      return Response.json({ error: 'Account konnte nicht gelöscht werden.' }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('delete-account error:', err)
    return Response.json({ error: 'Interner Fehler.' }, { status: 500 })
  }
}
