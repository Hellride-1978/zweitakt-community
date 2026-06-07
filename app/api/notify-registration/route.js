import nodemailer from 'nodemailer'
import { rateLimit, getClientIp } from '@/lib/internalApiAuth'

const transporter = nodemailer.createTransport({
  host: process.env.NOTIFY_SMTP_HOST,
  port: Number(process.env.NOTIFY_SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.NOTIFY_SMTP_USER,
    pass: process.env.NOTIFY_SMTP_PASS,
  },
})

export async function POST(request) {
  try {
    const ip = getClientIp(request)
    const rateLimitError = rateLimit(`register:${ip}`, 3, 60_000)
    if (rateLimitError) return rateLimitError

    const { name, email } = await request.json()

    await transporter.sendMail({
      from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
      to: process.env.NOTIFY_SMTP_USER,
      subject: `Neues Mitglied: ${name || email}`,
      html: `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;border:1.5px solid #1a1108;box-shadow:5px 5px 0 #1a1108;overflow:hidden;">
        <tr>
          <td style="background:#1a1108;padding:24px 32px;">
            <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#9bc3d6;">Zweitakthoden</p>
            <p style="margin:8px 0 0;font-family:Arial,system-ui,sans-serif;font-size:30px;color:#ffffff;line-height:1.15;font-weight:800;">Neues <em>Mitglied.</em></p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 32px 32px;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#5e5248;font-family:ui-monospace,'Courier New',monospace;">Registrierung</p>
            <p style="margin:0 0 6px;font-size:15px;color:#1a1108;font-family:Arial,system-ui,sans-serif;"><strong>Name:</strong> ${name || '—'}</p>
            <p style="margin:0 0 24px;font-size:15px;color:#1a1108;font-family:Arial,system-ui,sans-serif;"><strong>E-Mail:</strong> ${email}</p>
            <div style="height:1px;background:rgba(26,17,8,0.15);margin:0 0 24px;"></div>
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#1a1108;border-radius:100px;">
                <a href="https://zweitakthoden.de/profiles" style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                  Profil ansehen →
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
</body></html>`,
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Notification email failed:', err)
    return Response.json({ ok: false, error: 'Benachrichtigung fehlgeschlagen' }, { status: 500 })
  }
}
