import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { recipientId, senderName } = await request.json()
    if (!recipientId || !senderName) {
      return Response.json({ ok: false, error: 'Fehlende Felder' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(recipientId)
    if (userError || !user?.email) {
      return Response.json({ ok: false }, { status: 404 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Zweitakthoden <info@zweitakthoden.de>',
      to: user.email,
      subject: `Neue Nachricht von ${senderName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #faf7f2; border-radius: 12px;">
          <h2 style="font-size: 22px; margin: 0 0 16px; color: #1a1108;">Neue Nachricht</h2>
          <p style="margin: 0 0 12px; color: #3a3028;">
            <strong>${senderName}</strong> hat dir eine Nachricht auf Zweitakthoden geschickt.
          </p>
          <p style="margin: 0 0 24px; color: #5e5248; font-size: 14px;">
            Aus Datenschutzgründen zeigen wir den Inhalt hier nicht an.
          </p>
          <a href="https://zweitakthoden.de/messages"
             style="display: inline-block; padding: 12px 22px; background: #1a1108; color: #faf7f2; border-radius: 8px; text-decoration: none; font-size: 14px;">
            Zur Inbox →
          </a>
        </div>
      `,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Message notification failed:', err)
    return Response.json({ ok: false }, { status: 500 })
  }
}
