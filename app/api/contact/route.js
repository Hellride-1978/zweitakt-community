import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { name, email, message } = await request.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json({ error: 'Alle Felder sind Pflicht.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 })
    }

    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    })
    if (error) throw error

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Fehler beim Senden. Bitte versuch es später nochmal.' }, { status: 500 })
  }
}
