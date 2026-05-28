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
<body style="margin:0;padding:0;background:#e8e2d9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e2d9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">

        <!-- Header -->
        <tr>
          <td style="background:#1a1108;border-radius:16px 16px 0 0;padding:28px 32px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a99bd4;">Zweitakthoden</p>
            <p style="margin:8px 0 0;font-family:Georgia,serif;font-size:26px;color:#faf7f2;line-height:1.2;">
              Neue <em>Nachricht.</em>
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#faf7f2;padding:32px;border-left:1.5px solid #1a1108;border-right:1.5px solid #1a1108;">

            <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#9e8e7e;">
              Eingang
            </p>
            <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:18px;color:#1a1108;line-height:1.5;">
              <strong>${senderName}</strong> hat dir eine Nachricht geschickt.
            </p>

            <hr style="border:none;border-top:1px dashed #c8bfb0;margin:0 0 24px;">

            <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:13px;color:#5e5248;line-height:1.6;">
              Aus Datenschutzgründen zeigen wir den Inhalt der Nachricht hier nicht an.
              Meld dich an um die Nachricht zu lesen.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a1108;border-radius:8px;">
                  <a href="https://zweitakthoden.de/messages"
                     style="display:inline-block;padding:13px 26px;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#faf7f2;text-decoration:none;">
                    Zur Inbox →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1a1108;border-radius:0 0 16px 16px;padding:18px 32px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5e5248;">
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
