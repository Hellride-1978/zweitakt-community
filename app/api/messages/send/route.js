import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const transporter = nodemailer.createTransport({
  host: process.env.NOTIFY_SMTP_HOST,
  port: Number(process.env.NOTIFY_SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.NOTIFY_SMTP_USER,
    pass: process.env.NOTIFY_SMTP_PASS,
  },
})

function buildHtml(senderName) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;border:1.5px solid #1a1108;box-shadow:5px 5px 0 #1a1108;overflow:hidden;">
        <tr>
          <td style="background:#1a1108;padding:24px 32px;">
            <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#9bc3d6;">Zweitakthoden</p>
            <p style="margin:8px 0 0;font-family:Arial,system-ui,sans-serif;font-size:30px;color:#ffffff;line-height:1.15;font-weight:800;">Neue <em>Nachricht.</em></p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 32px 32px;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#5e5248;font-family:ui-monospace,'Courier New',monospace;">Eingang</p>
            <p style="margin:0 0 24px;font-family:Arial,system-ui,sans-serif;font-size:20px;color:#1a1108;line-height:1.4;">
              <strong>${senderName}</strong> hat dir eine Nachricht geschickt.
            </p>
            <div style="height:1px;background:rgba(26,17,8,0.15);margin:0 0 24px;"></div>
            <p style="margin:0 0 32px;font-size:14px;color:#5e5248;line-height:1.65;font-family:Arial,system-ui,sans-serif;">
              Aus Datenschutzgründen zeigen wir den Inhalt der Nachricht hier nicht an.
              Meld dich an um die Nachricht zu lesen.
            </p>
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#1a1108;border-radius:100px;">
                <a href="https://zweitakthoden.de/messages"
                   style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                  Zur Inbox →
                </a>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:0 32px;"><div style="height:1px;background:rgba(26,17,8,0.15);"></div></td></tr>
        <tr>
          <td style="padding:18px 32px 24px;">
            <p style="margin:0;font-size:11px;color:#5e5248;letter-spacing:1.5px;text-transform:uppercase;font-family:ui-monospace,'Courier New',monospace;">
              zweitakthoden.de — Die Community für Zweitakt-Schrauber
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

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

    await transporter.sendMail({
      from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
      to: user.email,
      subject: `Neue Nachricht von ${senderName} · Zweitakthoden`,
      html: buildHtml(senderName),
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Message notification failed:', err)
    return Response.json({ ok: false, error: err.message }, { status: 500 })
  }
}
