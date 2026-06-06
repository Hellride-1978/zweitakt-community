import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const ADMIN_EMAIL = 'martin@delavega.de'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function mailer() {
  return nodemailer.createTransport({
    host: process.env.NOTIFY_SMTP_HOST,
    port: Number(process.env.NOTIFY_SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.NOTIFY_SMTP_USER, pass: process.env.NOTIFY_SMTP_PASS },
  })
}

function buildHtml({ headline, body, ctaLabel, ctaUrl, unsubscribeUrl }) {
  const cta = ctaLabel && ctaUrl ? `
    <table cellpadding="0" cellspacing="0" style="margin-top: 24px;"><tr>
      <td style="background:#1a1108;border-radius:100px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:13px 28px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">${ctaLabel} →</a>
      </td>
    </tr></table>` : ''

  const bodyHtml = body
    .split('\n\n')
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 16px;font-family:Arial,system-ui,sans-serif;font-size:16px;color:#1a1108;line-height:1.7;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e8e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:48px 16px 64px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;border:1.5px solid #1a1108;box-shadow:5px 5px 0 #1a1108;overflow:hidden;">
        <tr>
          <td style="background:#1a1108;padding:24px 32px;">
            <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9bc3d6;">Zweitakthoden</p>
            <p style="margin:8px 0 0;font-family:Arial,system-ui,sans-serif;font-size:30px;color:#ffffff;line-height:1.15;font-weight:800;">${headline}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px 32px;">
            ${bodyHtml}
            ${cta}
          </td>
        </tr>
        <tr><td style="padding:0 32px;"><div style="height:1px;background:rgba(26,17,8,0.15);"></div></td></tr>
        <tr>
          <td style="padding:18px 32px 24px;">
            <p style="margin:0 0 6px;font-size:11px;color:#5e5248;letter-spacing:1.5px;text-transform:uppercase;font-family:ui-monospace,'Courier New',monospace;">zweitakthoden.de — Die Community für Zweitakt-Schrauber</p>
            <p style="margin:0;font-size:11px;color:#8a7a6e;font-family:ui-monospace,'Courier New',monospace;">
              <a href="${unsubscribeUrl}" style="color:#1a6080;text-decoration:underline;">Newsletter abmelden</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function POST(request) {
  try {
    const { subject, headline, body, ctaLabel, ctaUrl, adminEmail, preview } = await request.json()

    if (adminEmail !== ADMIN_EMAIL) {
      return Response.json({ error: 'Keine Berechtigung.' }, { status: 403 })
    }
    if (!subject?.trim() || !headline?.trim() || !body?.trim()) {
      return Response.json({ error: 'Betreff, Headline und Text sind erforderlich.' }, { status: 400 })
    }

    // Preview-Modus: nur an Admin senden
    if (preview) {
      const transport = mailer()
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zweitakthoden.de'
      const html = buildHtml({ headline, body, ctaLabel, ctaUrl, unsubscribeUrl: `${baseUrl}/newsletter/abgemeldet` })
      await transport.sendMail({
        from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `[VORSCHAU] ${subject}`,
        html,
      })
      return Response.json({ ok: true, sent: 1, preview: true })
    }

    // Alle bestätigten Abonnenten laden
    const admin = adminClient()
    const { data: subscribers, error } = await admin
      .from('newsletter_subscribers')
      .select('email, unsubscribe_token')
      .eq('status', 'confirmed')

    if (error) return Response.json({ error: 'Fehler beim Laden der Abonnenten.' }, { status: 500 })
    if (!subscribers?.length) return Response.json({ ok: true, sent: 0 })

    const transport = mailer()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zweitakthoden.de'

    let sent = 0
    let failed = 0

    for (const sub of subscribers) {
      try {
        const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`
        const html = buildHtml({ headline, body, ctaLabel, ctaUrl, unsubscribeUrl })
        await transport.sendMail({
          from: `"Zweitakthoden" <${process.env.NOTIFY_SMTP_USER}>`,
          to: sub.email,
          subject,
          html,
        })
        sent++
      } catch {
        failed++
      }
    }

    return Response.json({ ok: true, sent, failed })
  } catch (err) {
    console.error('Newsletter send error:', err)
    return Response.json({ error: 'Interner Fehler.' }, { status: 500 })
  }
}
