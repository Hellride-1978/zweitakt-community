import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const transporter = nodemailer.createTransport({
  host: process.env.NOTIFY_SMTP_HOST,
  port: Number(process.env.NOTIFY_SMTP_PORT) || 465,
  secure: true,
  auth: { user: process.env.NOTIFY_SMTP_USER, pass: process.env.NOTIFY_SMTP_PASS },
})

function buildHtml({ eventTitle, eventUrl }) {
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#e8e2d9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e2d9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">
        <tr><td style="background:#1a1108;border-radius:16px 16px 0 0;padding:28px 32px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a99bd4;">Zweitakthoden</p>
          <p style="margin:8px 0 0;font-family:Georgia,serif;font-size:26px;color:#faf7f2;line-height:1.2;">Termin <em>aktualisiert.</em></p>
        </td></tr>
        <tr><td style="background:#faf7f2;padding:32px;border-left:1.5px solid #1a1108;border-right:1.5px solid #1a1108;">
          <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#9e8e7e;">Dein Termin</p>
          <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:18px;color:#1a1108;line-height:1.5;">
            Der Termin <em>${eventTitle}</em>, für den du angemeldet bist, wurde vom Organisator aktualisiert.
          </p>
          <hr style="border:none;border-top:1px dashed #c8bfb0;margin:0 0 24px;">
          <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:13px;color:#5e5248;line-height:1.6;">
            Schau dir die aktuellen Details an — Datum, Uhrzeit oder Ort könnten sich geändert haben.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#1a1108;border-radius:8px;">
            <a href="${eventUrl}" style="display:inline-block;padding:13px 26px;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#faf7f2;text-decoration:none;">
              Termin ansehen →
            </a>
          </td></tr></table>
        </td></tr>
        <tr><td style="background:#1a1108;border-radius:0 0 16px 16px;padding:18px 32px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5e5248;">zweitakthoden.de — Die Community für Zweitakt-Schrauber</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function POST(request) {
  try {
    const { eventId, eventTitle, updaterId } = await request.json()
    if (!eventId || !eventTitle) {
      return Response.json({ ok: false, error: 'Fehlende Felder' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: participants } = await supabaseAdmin
      .from('ride_participants').select('user_id').eq('ride_id', eventId)

    const eventUrl = `https://zweitakthoden.de/events/${eventId}`
    const sends = []

    for (const p of participants ?? []) {
      if (p.user_id === updaterId) continue // Ersteller bekommt keine Mail an sich selbst
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(p.user_id)
      if (!user?.email) continue
      sends.push(transporter.sendMail({
        from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
        to: user.email,
        subject: `Termin aktualisiert: ${eventTitle} · Zweitakthoden`,
        html: buildHtml({ eventTitle, eventUrl }),
      }))
    }
    await Promise.all(sends)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Event update notification failed:', err)
    return Response.json({ ok: false, error: err.message }, { status: 500 })
  }
}
