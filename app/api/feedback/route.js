import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const TYPE_LABELS = { lob: '👍 Lob', bug: '🐛 Bug melden', idee: '💡 Idee / Wunsch' }

const transporter = nodemailer.createTransport({
  host: process.env.NOTIFY_SMTP_HOST,
  port: Number(process.env.NOTIFY_SMTP_PORT) || 465,
  secure: true,
  auth: { user: process.env.NOTIFY_SMTP_USER, pass: process.env.NOTIFY_SMTP_PASS },
})

function buildHtml({ typeLabel, message, url, senderLabel }) {
  const urlRow = url
    ? `<p style="margin:0 0 6px;font-size:14px;color:#5e5248;font-family:Arial,system-ui,sans-serif;"><strong style="color:#1a1108;">Seite:</strong> ${url}</p>`
    : ''
  const senderRow = senderLabel
    ? `<p style="margin:0 0 16px;font-size:14px;color:#5e5248;font-family:Arial,system-ui,sans-serif;"><strong style="color:#1a1108;">Von:</strong> ${senderLabel}</p>`
    : ''
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;border:1.5px solid #1a1108;box-shadow:5px 5px 0 #1a1108;overflow:hidden;">
        <tr>
          <td style="background:#1a1108;padding:24px 32px;">
            <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#9bc3d6;">Zweitakthoden</p>
            <p style="margin:8px 0 0;font-family:Arial,system-ui,sans-serif;font-size:30px;font-weight:800;color:#ffffff;line-height:1.15;">Neues Feedback.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 32px 32px;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#5e5248;font-family:ui-monospace,'Courier New',monospace;">Typ</p>
            <p style="margin:0 0 20px;font-family:Arial,system-ui,sans-serif;font-size:18px;font-weight:700;color:#1a1108;">${typeLabel}</p>
            <div style="height:1px;background:rgba(26,17,8,0.15);margin:0 0 20px;"></div>
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#5e5248;font-family:ui-monospace,'Courier New',monospace;">Nachricht</p>
            <p style="margin:0 0 24px;font-family:Arial,system-ui,sans-serif;font-size:15px;color:#1a1108;line-height:1.6;white-space:pre-wrap;">${message}</p>
            <div style="height:1px;background:rgba(26,17,8,0.15);margin:0 0 20px;"></div>
            ${senderRow}${urlRow}
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
    const { type, message, url, email, userId } = await request.json()

    if (!type || !message || message.length < 10 || message.length > 1000) {
      return Response.json({ ok: false, error: 'Ungültige Eingabe' }, { status: 400 })
    }
    if (!['lob', 'bug', 'idee'].includes(type)) {
      return Response.json({ ok: false, error: 'Ungültiger Typ' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    let senderLabel = email || null

    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single()
      if (profile?.name) senderLabel = profile.name
    }

    await supabaseAdmin.from('feedbacks').insert({
      type,
      message,
      url: url || null,
      email: email || null,
      user_id: userId || null,
    })

    const typeLabel = TYPE_LABELS[type] || type
    await transporter.sendMail({
      from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
      to: 'info@zweitakthoden.de',
      subject: `${typeLabel}: ${message.slice(0, 60)}${message.length > 60 ? '…' : ''}`,
      html: buildHtml({ typeLabel, message, url: url || null, senderLabel }),
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Feedback submission failed:', err)
    return Response.json({ ok: false, error: err.message }, { status: 500 })
  }
}
