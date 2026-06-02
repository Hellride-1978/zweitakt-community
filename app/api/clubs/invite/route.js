import nodemailer from 'nodemailer'

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
    const { clubName, clubSlug, email } = await request.json()
    if (!email || !clubName || !clubSlug) {
      return Response.json({ error: 'Fehlende Parameter.' }, { status: 400 })
    }

    const joinUrl = `https://zweitakthoden.de/clubs/${clubSlug}`
    const registerUrl = `https://zweitakthoden.de/auth/register`

    await transporter.sendMail({
      from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
      to: email,
      subject: `Du wurdest zu ${clubName} eingeladen`,
      html: `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;border:1.5px solid #1a1108;box-shadow:5px 5px 0 #1a1108;overflow:hidden;">
        <tr>
          <td style="background:#1a1108;padding:24px 32px;">
            <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#9bc3d6;">Zweitakthoden</p>
            <p style="margin:8px 0 0;font-family:Arial,system-ui,sans-serif;font-size:30px;color:#ffffff;line-height:1.15;font-weight:800;">Klub-<em>Einladung.</em></p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 32px 32px;">
            <p style="margin:0 0 16px;font-family:Arial,system-ui,sans-serif;font-size:16px;color:#1a1108;line-height:1.6;">
              Du wurdest zum Klub <strong>${clubName}</strong> auf Zweitakthoden eingeladen.
            </p>
            <p style="margin:0 0 24px;font-family:Arial,system-ui,sans-serif;font-size:14px;color:#5e5248;line-height:1.6;">
              Melde dich an oder registriere dich – danach wirst du automatisch als Mitglied aufgenommen.
            </p>
            <div style="height:1px;background:rgba(26,17,8,0.15);margin:0 0 24px;"></div>
            <table cellpadding="0" cellspacing="0" style="width:100%;">
              <tr>
                <td style="padding-right:10px;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="background:#1a1108;border-radius:100px;">
                      <a href="${registerUrl}" style="display:inline-block;padding:13px 24px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                        Jetzt registrieren →
                      </a>
                    </td>
                  </tr></table>
                </td>
                <td>
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="border:1.5px solid #1a1108;border-radius:100px;">
                      <a href="${joinUrl}" style="display:inline-block;padding:11px 22px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#1a1108;text-decoration:none;">
                        Klub ansehen
                      </a>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
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
    console.error('Club invite email failed:', err)
    return Response.json({ ok: false, error: err.message }, { status: 500 })
  }
}
