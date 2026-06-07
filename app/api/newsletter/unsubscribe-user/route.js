import { createClient } from '@supabase/supabase-js'
import { requireBearerAuth } from '@/lib/internalApiAuth'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(request) {
  try {
    const auth = await requireBearerAuth(request)
    if (auth.error) return auth.error

    const { userId } = await request.json()
    if (!userId) return Response.json({ error: 'Fehlende User-ID.' }, { status: 400 })

    // Darf nur die eigene Abmeldung auslösen
    if (auth.user.id !== userId) {
      return Response.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    }

    const admin = adminClient()

    const { error } = await admin
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .in('status', ['confirmed', 'pending'])

    if (error) {
      console.error('Unsubscribe-user error:', error)
      return Response.json({ error: 'Abmeldung fehlgeschlagen.' }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Unsubscribe-user error:', err)
    return Response.json({ error: 'Interner Fehler.' }, { status: 500 })
  }
}
