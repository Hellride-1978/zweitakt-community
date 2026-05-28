import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const transporter = nodemailer.createTransport({
  host: process.env.NOTIFY_SMTP_HOST,
  port: Number(process.env.NOTIFY_SMTP_PORT) || 465,
  secure: true,
  auth: { user: process.env.NOTIFY_SMTP_USER, pass: process.env.NOTIFY_SMTP_PASS },
})

function buildHtml({ commenterName, targetType, targetTitle, targetUrl }) {
  const label = targetType === 'event' ? 'Termin' : 'Bike'
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#e8e2d9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e2d9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">
        <tr><td style="background:#1a1108;border-radius:16px 16px 0 0;padding:28px 32px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a99bd4;">Zweitakthoden</p>
          <p style="margin:8px 0 0;font-family:Georgia,serif;font-size:26px;color:#faf7f2;line-height:1.2;">Neuer <em>Kommentar.</em></p>
        </td></tr>
        <tr><td style="background:#faf7f2;padding:32px;border-left:1.5px solid #1a1108;border-right:1.5px solid #1a1108;">
          <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#9e8e7e;">${label}</p>
          <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:18px;color:#1a1108;line-height:1.5;">
            <strong>${commenterName}</strong> hat einen Kommentar${targetTitle ? ` bei <em>${targetTitle}</em>` : ''} hinterlassen.
          </p>
          <hr style="border:none;border-top:1px dashed #c8bfb0;margin:0 0 24px;">
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#1a1108;border-radius:8px;">
            <a href="${targetUrl}" style="display:inline-block;padding:13px 26px;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#faf7f2;text-decoration:none;">
              Kommentar ansehen →
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

async function getEmail(supabaseAdmin, userId) {
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
  return user?.email || null
}

export async function POST(request) {
  try {
    const { targetType, targetId, commenterName, commenterId } = await request.json()
    if (!targetType || !targetId || !commenterName) {
      return Response.json({ ok: false, error: 'Fehlende Felder' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const recipients = new Set() // user_ids die eine Mail bekommen

    if (targetType === 'vehicle') {
      const { data: vehicle } = await supabaseAdmin
        .from('vehicles').select('user_id, make, model').eq('id', targetId).single()
      if (vehicle && vehicle.user_id !== commenterId) {
        recipients.add({ userId: vehicle.user_id, title: `${vehicle.make} ${vehicle.model}` })
      }
    } else if (targetType === 'event') {
      const { data: event } = await supabaseAdmin
        .from('rides').select('creator_id, title').eq('id', targetId).single()
      const { data: participants } = await supabaseAdmin
        .from('ride_participants').select('user_id').eq('ride_id', targetId)

      const notifyIds = new Map()
      if (event) {
        if (event.creator_id !== commenterId) notifyIds.set(event.creator_id, event.title)
        for (const p of participants ?? []) {
          if (p.user_id !== commenterId) notifyIds.set(p.user_id, event.title)
        }
      }
      for (const [userId, title] of notifyIds) {
        recipients.add({ userId, title })
      }
    }

    const baseUrl = 'https://zweitakthoden.de'
    const targetUrl = targetType === 'event'
      ? `${baseUrl}/events/${targetId}`
      : `${baseUrl}/vehicles/${targetId}`

    const sends = []
    for (const { userId, title } of recipients) {
      const email = await getEmail(supabaseAdmin, userId)
      if (!email) continue
      sends.push(transporter.sendMail({
        from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
        to: email,
        subject: `Neuer Kommentar von ${commenterName} · Zweitakthoden`,
        html: buildHtml({ commenterName, targetType, targetTitle: title, targetUrl }),
      }))
    }
    await Promise.all(sends)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Comment notification failed:', err)
    return Response.json({ ok: false, error: err.message }, { status: 500 })
  }
}
