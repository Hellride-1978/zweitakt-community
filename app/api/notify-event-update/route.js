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
<body style="margin:0;padding:0;background:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;border:1.5px solid #1a1108;box-shadow:5px 5px 0 #1a1108;overflow:hidden;">
        <tr>
          <td style="background:#1a1108;padding:24px 32px;">
            <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#9bc3d6;">Zweitakthoden</p>
            <p style="margin:8px 0 0;font-family:Arial,system-ui,sans-serif;font-size:30px;color:#ffffff;line-height:1.15;font-weight:800;">Termin <em>aktualisiert.</em></p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 32px 32px;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#5e5248;font-family:ui-monospace,'Courier New',monospace;">Dein Termin</p>
            <p style="margin:0 0 24px;font-family:Arial,system-ui,sans-serif;font-size:20px;color:#1a1108;line-height:1.4;">
              Der Termin <em>${eventTitle}</em>, für den du angemeldet bist, wurde vom Organisator aktualisiert.
            </p>
            <div style="height:1px;background:rgba(26,17,8,0.15);margin:0 0 24px;"></div>
            <p style="margin:0 0 32px;font-size:14px;color:#5e5248;line-height:1.65;font-family:Arial,system-ui,sans-serif;">
              Schau dir die aktuellen Details an — Datum, Uhrzeit oder Ort könnten sich geändert haben.
            </p>
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#1a1108;border-radius:100px;">
                <a href="${eventUrl}" style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                  Termin ansehen →
                </a>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:0 32px;"><div style="height:1px;background:rgba(26,17,8,0.15);"></div></td></tr>
        <tr>
          <td style="padding:18px 32px 24px;">
            <p style="margin:0;font-size:11px;color:#5e5248;letter-spacing:1.5px;text-transform:uppercase;font-family:ui-monospace,'Courier New',monospace;">zweitakthoden.de — Die Community für Zweitakt-Schrauber</p>
          </td>
        </tr>
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
